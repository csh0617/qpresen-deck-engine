/* Render-lint: node engine/qa/lint.js <outdir> [--sheet] [--static] [--only=3,5]
   Renders every parts/slide-NN.html at 1920x1080, checks layout/typography/contrast/console, writes report + screenshots + contact sheet. */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readdirSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const outDir = process.argv[2] || 'out/showcase';
const flags = process.argv.slice(3);
const onlyArg = flags.find(f => f.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',').map(Number) : null;
const useStatic = flags.includes('--static');
const partsDir = join(outDir, 'parts');
const shotsDir = join(outDir, 'shots'); mkdirSync(shotsDir, { recursive: true });
const files = readdirSync(partsDir).filter(f => /^slide-\d+\.html$/.test(f)).sort();

const CHECK_JS = (() => { const src = readFileSync(new URL('../renderer/lintJs.ts', import.meta.url), 'utf8'); const m = src.match(/export const LINT_JS = `([\s\S]*?)`;/); if (!m) throw new Error('LINT_JS not found'); return new Function('return `' + m[1] + '`')(); })();

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const report = []; const shots = [];
  for (const f of files) {
    const n = parseInt(f.match(/\d+/)[0], 10); if (only && !only.includes(n)) continue;
    const page = await ctx.newPage(); const errs = []; const netErrs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 160)));
    page.on('console', m => { if (m.type() !== 'error') return; const t = m.text(); if (/Failed to load resource/.test(t)) { netErrs.push('resource: ' + t.slice(0, 120)); return; } errs.push('console: ' + t.slice(0, 160)); });
    const url = 'file://' + resolve(join(partsDir, f)) + (useStatic ? '?static=1' : '');
    let res = { issues: [], stats: {} };
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(useStatic ? 400 : 3300);
      res = await page.evaluate(CHECK_JS);
      const shot = join(shotsDir, f.replace('.html', useStatic ? '.static.jpg' : '.jpg'));
      await page.screenshot({ path: shot, type: 'jpeg', quality: 72 });
      shots.push({ n, shot, title: res.title });
    } catch (e) { errs.push('nav: ' + String(e.message).slice(0, 160)); }
    errs.forEach(e => res.issues.push({ sev: 'error', code: 'JS', el: e }));
    netErrs.forEach(e => res.issues.push({ sev: 'warn', code: 'RESOURCE', el: e }));
    const errors = res.issues.filter(i => i.sev === 'error').length, warns = res.issues.filter(i => i.sev === 'warn').length;
    report.push({ n, file: f, title: res.title, errors, warns, occupancy: res.occupancy, minFont: res.stats && res.stats.minFont, issues: res.issues });
    console.log(`${String(n).padStart(2, '0')} ${errors ? '✖' : warns ? '△' : '✓'} err=${errors} warn=${warns} occ=${res.occupancy ?? '-'}% minFont=${res.stats && res.stats.minFont !== undefined ? Math.round(res.stats.minFont) : '-'}  ${(res.title || '').slice(0, 50)}`);
    res.issues.slice(0, 8).forEach(i => console.log(`     ${i.sev === 'error' ? '!!' : ' ~'} ${i.code} ${i.el || ''} ${i.extra != null ? '(' + i.extra + ')' : ''} ${i.text ? '"' + i.text + '"' : ''}`));
    await page.close();
  }
  writeFileSync(join(outDir, useStatic ? 'lint.static.json' : 'lint.json'), JSON.stringify(report, null, 2));
  if (flags.includes('--thumbs') && shots.length) {
    const tp = await ctx.newPage(); await tp.setViewportSize({ width: 384, height: 216 }); const thumbs = [];
    for (const s of shots.sort((a, b) => a.n - b.n)) { await tp.setContent(`<body style="margin:0"><img src="data:image/jpeg;base64,${readFileSync(s.shot).toString('base64')}" style="width:384px;height:216px;display:block"></body>`); const buf = await tp.screenshot({ type: 'jpeg', quality: 58 }); thumbs[s.n - 1] = 'data:image/jpeg;base64,' + buf.toString('base64'); }
    writeFileSync(join(outDir, 'thumbs.json'), JSON.stringify(thumbs)); console.log('thumbs:', thumbs.filter(Boolean).length);
  }
  const totalErr = report.reduce((a, r) => a + r.errors, 0), totalWarn = report.reduce((a, r) => a + r.warns, 0);
  console.log(`\nTOTAL errors=${totalErr} warnings=${totalWarn} slides=${report.length}`);
  if (flags.includes('--sheet') && shots.length) {
    const p = await ctx.newPage(); const cols = 4, w = 480, h = 270; const rows = Math.ceil(shots.length / cols);
    await p.setViewportSize({ width: cols * w, height: rows * (h + 22) });
    const html = '<body style="margin:0;background:#1b1f2a;font:11px sans-serif;color:#fff">' + shots.map((s, i) => `<div style="position:absolute;left:${(i % cols) * w}px;top:${Math.floor(i / cols) * (h + 22)}px;width:${w}px"><div style="height:22px;line-height:22px;padding:0 6px;white-space:nowrap;overflow:hidden">${String(s.n).padStart(2, '0')} ${(report.find(r => r.n === s.n) || {}).errors ? '✖' : '✓'} ${(s.title || '').replace(/</g, '&lt;')}</div><img src="data:image/jpeg;base64,${readFileSync(s.shot).toString('base64')}" style="width:${w}px;height:${h}px;display:block"></div>`).join('') + '</body>';
    await p.setContent(html); const sheet = join(outDir, useStatic ? 'sheet.static.jpg' : 'sheet.jpg'); await p.screenshot({ path: sheet, type: 'jpeg', quality: 80, fullPage: true }); console.log('sheet:', sheet);
  }
  await browser.close();
})();
