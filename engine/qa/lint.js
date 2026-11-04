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

const CHECK_JS = `(() => {
  const stage = document.querySelector('.stage'); if (!stage) return { fatal: 'no .stage' };
  const s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  const sr = stage.getBoundingClientRect();
  const issues = []; const stats = { textNodes: 0, minFont: 999, overflow: 0, outside: 0, overlap: 0, lowContrast: 0 };
  const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const all = Array.from(stage.querySelectorAll('*')).filter(el => !['SCRIPT','STYLE','SVG','PATH','CIRCLE','RECT','LINE','G','DEFS','TEXT','TSPAN','POLYGON','POLYLINE','ELLIPSE','USE','CLIPPATH','MARKER','LINEARGRADIENT','RADIALGRADIENT','STOP','FILTER','FEGAUSSIANBLUR','FOREIGNOBJECT','MPATH','ANIMATEMOTION','CANVAS','BR'].includes(el.tagName.toUpperCase()));
  // 1) outside stage
  for (const el of all) { if (!vis(el)) continue; if (el.closest('.amb,.deck-nav,.deck-foot,.ph,.art')) continue; const r = el.getBoundingClientRect(); const pad = 2; if (r.left < sr.left - pad || r.right > sr.right + pad || r.top < sr.top - pad || r.bottom > sr.bottom + pad) { stats.outside++; if (stats.outside <= 5) issues.push({ sev: 'error', code: 'OUTSIDE_STAGE', el: desc(el), box: [Math.round((r.left - sr.left)/s), Math.round((r.top - sr.top)/s), Math.round(r.width/s), Math.round(r.height/s)] }); } }
  // 2) overflow (scrollable content clipped) & text clipping
  for (const el of all) { if (!vis(el)) continue; if (el.hasAttribute('data-allow-scroll') || el.closest('[data-allow-scroll],.amb,.ph,.art,.dev')) continue; const cs = getComputedStyle(el); if (el.scrollHeight - el.clientHeight > 4 && el.clientHeight > 0 && (cs.overflowY === 'hidden' || cs.overflowY === 'auto' || cs.overflowY === 'scroll' || el.classList.contains('stage'))) { stats.overflow++; if (stats.overflow <= 6) issues.push({ sev: 'error', code: 'OVERFLOW_Y', el: desc(el), extra: Math.round((el.scrollHeight - el.clientHeight)/s) }); } if (el.scrollWidth - el.clientWidth > 4 && el.clientWidth > 0 && (cs.overflowX === 'hidden' || cs.whiteSpace === 'nowrap' || cs.textOverflow === 'ellipsis')) { stats.overflow++; if (stats.overflow <= 6) issues.push({ sev: 'error', code: 'OVERFLOW_X', el: desc(el), extra: Math.round((el.scrollWidth - el.clientWidth)/s) }); } }
  // 3) min font size (text-bearing elements)
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  let tn; while ((tn = walker.nextNode())) { if (!tn.textContent.trim()) continue; const el = tn.parentElement; if (!el || !vis(el) || el.closest('svg,.deck-foot,.source,.topbar,.art .lab,.no,.bd,.num,.hs,.url,.tag,.ghost,.bar')) continue; stats.textNodes++; const fs = parseFloat(getComputedStyle(el).fontSize) / s; if (fs < stats.minFont) stats.minFont = fs; if (fs < 14) issues.push({ sev: fs < 12.5 ? 'error' : 'warn', code: 'SMALL_FONT', el: desc(el), extra: Math.round(fs*10)/10, text: tn.textContent.trim().slice(0, 30) }); }
  // 4) sibling overlap among cards/blocks
  const blocks = all.filter(el => vis(el) && /\\b(card|it|st|pl|mb|fn|ly|fl|co|w)\\b/.test(el.className) && !el.closest('svg'));
  const byParent = new Map(); blocks.forEach(b => { const p = b.parentElement; if (!byParent.has(p)) byParent.set(p, []); byParent.get(p).push(b); });
  for (const [, arr] of byParent) { for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) { const a = arr[i].getBoundingClientRect(), b = arr[j].getBoundingClientRect(); const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 6 && oy > 6) { stats.overlap++; if (stats.overlap <= 4) issues.push({ sev: 'error', code: 'OVERLAP', el: desc(arr[i]) + ' × ' + desc(arr[j]), extra: Math.round(Math.min(ox, oy)/s) }); } } }
  // 5) contrast (approx): text color vs nearest opaque background
  function parse(c) { let m = c.match(/rgba?\\(([^)]+)\\)/); if (m) { const p = m[1].split(/[\\s,\\/]+/).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; } m = c.match(/color\\(srgb\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*\\/\\s*([\\d.]+))?\\)/); if (m) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] != null ? +m[4] : 1 }; return null; }
  function lum(c) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); }
  function bgOf(el) { let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); const bg = parse(cs.backgroundColor); if (bg && bg.a > 0.9) return bg; if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient\\(.*transparent/.test(cs.backgroundImage)) return null; e = e.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; }
  const seen = new Set();
  const walker2 = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  while ((tn = walker2.nextNode())) { const t = tn.textContent.trim(); if (t.length < 2) continue; const el = tn.parentElement; if (!el || !vis(el) || seen.has(el) || el.closest('svg,.ph,.art,.amb,.topbar,.deck-foot,.ghost,.numeral,.qmark,.dev,.a-cover-photo,.a-hero')) continue; seen.add(el); const cs = getComputedStyle(el); const fg = parse(cs.color); const bg = bgOf(el); if (!fg || !bg) continue; const l1 = lum(fg), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); const fs = parseFloat(cs.fontSize) / s; const big = fs >= 24 || (fs >= 18.5 && parseInt(cs.fontWeight) >= 700); const need = big ? 3 : 4; if (ratio < need) { stats.lowContrast++; if (stats.lowContrast <= 5) issues.push({ sev: 'warn', code: 'LOW_CONTRAST', el: desc(el), extra: Math.round(ratio * 10) / 10, text: t.slice(0, 30) }); } }
  // 6) body occupancy
  const body = stage.querySelector('.body'); let occupancy = null;
  if (body) { const br = body.getBoundingClientRect(); let area = 0; const kids = Array.from(body.querySelectorAll('.card,.it,.st,.pl,.mb,.fn,.ly,.fl,.img,.art,.svgbox,.ch,.plane,.dev,.tb,.wrap,.n,.q,li,.stat,.icons,.cv,.layers,.funnel,.flow,blockquote,.hero,.side,.tx,.ct,h2')).filter(vis); const boxes = kids.map(k => k.getBoundingClientRect()); // union approx via grid sampling
    const gx = 48, gy = 27; let hit = 0; for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) { const x = br.left + (i + .5) * br.width / gx, y = br.top + (j + .5) * br.height / gy; if (boxes.some(b => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)) hit++; } occupancy = Math.round(hit / (gx * gy) * 100); if (occupancy < 35) issues.push({ sev: 'warn', code: 'SPARSE', extra: occupancy }); if (occupancy > 96) issues.push({ sev: 'warn', code: 'DENSE', extra: occupancy }); }
  // 7) images
  for (const img of stage.querySelectorAll('img')) { if (!img.complete || img.naturalWidth === 0) issues.push({ sev: 'error', code: 'BROKEN_IMAGE', el: desc(img) }); }
  // 8) hidden reveals after done
  const notIn = Array.from(stage.querySelectorAll('[data-reveal]')).filter(el => !el.classList.contains('in') && !document.documentElement.classList.contains('reveal-done'));
  if (notIn.length) issues.push({ sev: 'warn', code: 'REVEAL_PENDING', extra: notIn.length });
  return { issues, stats, occupancy, scale: s, title: document.title };
  function desc(el) { return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''); }
})()`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const report = []; const shots = [];
  for (const f of files) {
    const n = parseInt(f.match(/\d+/)[0], 10); if (only && !only.includes(n)) continue;
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
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
