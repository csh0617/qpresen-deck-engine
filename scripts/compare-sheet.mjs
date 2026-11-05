/* Side-by-side comparison sheet: node scripts/compare-sheet.mjs <out.jpg> <leftLabel> <rightLabel> <pairs.json> [--title=…]
   pairs.json = [ { "label": "표지", "left": "out/a/shots/slide-01.static.jpg", "right": "out/b/shots/slide-01.static.jpg" }, … ] */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const [, , outFile, leftLabel, rightLabel, pairsFile, ...flags] = process.argv;
const title = (flags.find(f => f.startsWith('--title=')) || '').slice(8);
const pairs = JSON.parse(readFileSync(pairsFile, 'utf8'));
const W = 760, H = Math.round(W * 9 / 16);
const img = (p) => `data:image/jpeg;base64,${readFileSync(p).toString('base64')}`;
const html = `<body style="margin:0;background:#0b1020;font-family:sans-serif;color:#fff;padding:20px 24px">
${title ? `<div style="font-size:24px;font-weight:800;margin:0 0 14px">${title}</div>` : ''}
<div style="display:grid;grid-template-columns:150px ${W}px ${W}px;gap:14px;align-items:center">
<div></div><div style="font-size:18px;font-weight:700;opacity:.9;padding:4px 0">${leftLabel}</div><div style="font-size:18px;font-weight:700;color:#9be7ff;padding:4px 0">${rightLabel}</div>
${pairs.map(p => `<div style="font-size:16px;font-weight:700;opacity:.85;line-height:1.35">${p.label}</div><img src="${img(p.left)}" style="width:${W}px;height:${H}px;display:block;border-radius:6px;box-shadow:0 2px 10px #0008"><img src="${img(p.right)}" style="width:${W}px;height:${H}px;display:block;border-radius:6px;box-shadow:0 2px 10px #0008;outline:2px solid #4cc9f0">`).join('')}
</div></body>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 150 + W * 2 + 14 * 2 + 48, height: 600 }, deviceScaleFactor: 1 });
await page.setContent(html); await page.waitForTimeout(400);
await page.screenshot({ path: outFile, type: 'jpeg', quality: 84, fullPage: true });
await browser.close(); console.log('wrote', outFile, pairs.length, 'rows');
