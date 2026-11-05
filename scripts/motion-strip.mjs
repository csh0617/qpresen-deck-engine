/* Motion strip: capture a slide at several moments of its entrance choreography and compose them into one image.
   node scripts/motion-strip.mjs <outdir> <out.jpg> [--only=1,4,9] [--times=200,700,1500,3200] [--label=…]
   Each row = one slide, columns = moments (ms after load). Shows what a static screenshot cannot: reveals, count-ups, living elements. */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const [, , outDir, outFile, ...flags] = process.argv;
const only = (flags.find(f => f.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean).map(Number);
const times = ((flags.find(f => f.startsWith('--times=')) || '--times=250,800,1600,3200').slice(8)).split(',').map(Number);
const label = (flags.find(f => f.startsWith('--label=')) || '').slice(8);
const W = 640, H = 360;
const files = readdirSync(join(outDir, 'parts')).filter(f => /^slide-\d+\.html$/.test(f)).sort();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const rows = [];
for (const f of files) {
  const n = Number(f.match(/\d+/)[0]); if (only.length && !only.includes(n)) continue;
  const frames = [];
  await page.goto('file://' + resolve(join(outDir, 'parts', f)));
  const t0 = Date.now();
  for (const t of times) { const wait = t - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait); frames.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64')); }
  const title = await page.title();
  rows.push({ n, title, frames });
}
const sheet = `<body style="margin:0;background:#0b1020;font-family:sans-serif;color:#fff;padding:18px 20px">
${label ? `<div style="font-size:22px;font-weight:700;margin:0 0 12px">${label}</div>` : ''}
<div style="display:flex;gap:12px;margin:0 0 6px 0;padding-left:0"><div style="width:${W}px"></div></div>
${rows.map(r => `<div style="margin:0 0 10px"><div style="font-size:15px;opacity:.85;margin:0 0 6px">${r.n}. ${r.title.replace(/^\d+ · /, '')}</div><div style="display:flex;gap:12px">${r.frames.map((b, i) => `<div><img src="data:image/jpeg;base64,${b}" style="width:${W}px;height:${H}px;display:block;border-radius:6px;box-shadow:0 2px 10px #0008"><div style="font-size:12px;opacity:.6;margin-top:3px">${times[i]}ms</div></div>`).join('')}</div></div>`).join('')}
</body>`;
const tp = await browser.newPage({ viewport: { width: 20 + 20 + times.length * (W + 12), height: 400 }, deviceScaleFactor: 1 });
await tp.setContent(sheet); await tp.waitForTimeout(300);
await tp.screenshot({ path: outFile, type: 'jpeg', quality: 82, fullPage: true });
await browser.close();
console.log('wrote', outFile, 'rows', rows.length);
