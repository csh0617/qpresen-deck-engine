import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { resolve } from 'node:path'; import { writeFileSync } from 'node:fs';
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto('file://' + resolve(process.argv[2])); await page.waitForTimeout(800);
const t0 = Date.now(); const r = await page.evaluate(n => window.QPDeck.snapshot(n), Number(process.argv[3] || 5));
console.log('snapshot ms', Date.now() - t0, r.title, r.image.length);
writeFileSync(process.argv[4] || 'snap.jpg', Buffer.from(r.image.split(',')[1], 'base64'));
await browser.close();
