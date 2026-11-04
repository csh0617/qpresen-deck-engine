/* CLI: tsx engine/cli.ts <spec.json> <outdir> [--no-font] [--thumbs] */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { renderDeck, qpresenBundle } from './renderer/index.ts';
import { FONT_BASE64 } from './assets/font.ts';
import { qrSvg } from './qr.ts';

const [, , specPath, outDir = 'out', ...flags] = process.argv;
if (!specPath) { console.error('usage: tsx engine/cli.ts spec.json outdir'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
let thumbs: string[] | undefined;
const thumbsPath = join(outDir, 'thumbs.json');
if (flags.includes('--thumbs') && existsSync(thumbsPath)) thumbs = JSON.parse(readFileSync(thumbsPath, 'utf8'));
const res = renderDeck(spec, { fontBase64: flags.includes('--no-font') ? undefined : FONT_BASE64, thumbs, qr: qrSvg, partsFontMode: flags.includes('--parts-cdn') ? 'cdn' : flags.includes('--parts-embed') ? 'embed' : 'cdn' });
mkdirSync(join(outDir, 'parts'), { recursive: true });
writeFileSync(join(outDir, 'deck.html'), res.html);
res.parts.forEach((p, i) => writeFileSync(join(outDir, 'parts', `slide-${String(i + 1).padStart(2, '0')}.html`), p));
writeFileSync(join(outDir, 'spec.normalized.json'), JSON.stringify(spec, null, 2));
writeFileSync(join(outDir, 'deck.qpresen.html'), qpresenBundle(res.parts));
console.log(`deck.html ${(res.html.length / 1024 / 1024).toFixed(2)}MB, ${res.parts.length} slides, warnings: ${res.warnings.length}`);
res.warnings.forEach(w => console.log('  ! ' + w));
