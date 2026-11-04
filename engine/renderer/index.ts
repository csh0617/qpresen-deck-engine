import type { DeckSpec, RenderOptions, RenderResult, Notes } from './types.ts';
import { renderSlideDoc, FONT_PLACEHOLDER } from './slide.ts';
import { renderPlayer } from './player.ts';
import { plain } from './util.ts';
import { validateSpec } from './validate.ts';

export * from './types.ts';
export { validateSpec } from './validate.ts';
export { FONT_PLACEHOLDER } from './slide.ts';

export const PRETENDARD_CDN_CSS = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

/** Font block for a slide document. embed: base64 woff2 (offline). cdn: jsDelivr dynamic-subset css (online, tiny). none: system fonts. */
export function fontCss(base64?: string, mode: 'embed' | 'cdn' | 'none' = base64 ? 'embed' : 'none'): string {
  if (mode === 'cdn') return `<link rel="stylesheet" href="${PRETENDARD_CDN_CSS}"><style id="pretendard-embedded"></style>`;
  if (mode === 'none' || !base64) return `<style id="pretendard-embedded">/* system fonts */</style>`;
  return `<style id="pretendard-embedded">@font-face{font-family:'Pretendard Variable';font-weight:45 920;font-style:normal;font-display:block;src:url(data:font/woff2;base64,${base64}) format('woff2')}</style>`;
}

/** Qpresen upload format: full slide documents concatenated with slide-title / SLIDE BREAK markers (Qpresen splits and plays them itself). */
export function qpresenBundle(parts: string[]): string {
  return parts.map((p, i) => `<!-- slide-title: slide-${String(i + 1).padStart(2, '0')} -->\n${p.trim()}\n`).join('\n\n<!-- SLIDE BREAK -->\n\n');
}

/** first_slide payload the Qpresen dashboard stores (font style emptied to save space). */
export function firstSlidePayload(part: string, title: string): { title: string; css: string; html: string } {
  const html = part.replace(/<style id="pretendard-embedded">[\s\S]*?<\/style>/, '<style id="pretendard-embedded"></style>').replace(/<link rel="stylesheet" href="[^"]*pretendard[^"]*">/, '');
  return { title, css: '', html };
}

export interface RenderDeckOptions extends RenderOptions { qr?: (text: string) => string; partsFontMode?: 'embed' | 'cdn' | 'none' }

/** Spec → per-slide documents + single-file player */
export function renderDeck(specIn: DeckSpec, opts: RenderDeckOptions = {}): RenderResult {
  const { spec, warnings } = validateSpec(specIn);
  const N = spec.slides.length;
  const pages: string[] = []; const titles: string[] = []; const notes: Notes[] = [];
  for (let i = 0; i < N; i++) {
    pages.push(renderSlideDoc({ spec, index: i, qr: opts.qr, warnings }));
    titles.push(plain(spec.slides[i].title));
    notes.push(spec.slides[i].notes || { s: '' });
  }
  // sections → [label, start, end]
  const sections: [string, number, number][] = [];
  const secs = spec.sections || [];
  secs.forEach((sec, si) => {
    const idxs = spec.slides.map((s, i) => (s.section === sec.id ? i + 1 : 0)).filter(Boolean);
    if (idxs.length) sections.push([`${sec.numeral || ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'][si] || ''} · ${sec.label}`, Math.min(...idxs), Math.max(...idxs)]);
  });
  // include orphan slides (no section) in a leading/trailing group
  const orphans = spec.slides.map((s, i) => (!s.section || !secs.find(x => x.id === s.section) ? i + 1 : 0)).filter(Boolean);
  if (orphans.length && sections.length) {
    const lead = orphans.filter(n => n < sections[0][1]); const tail = orphans.filter(n => n > sections[sections.length - 1][2]);
    if (lead.length) sections.unshift(['시작', Math.min(...lead), Math.max(...lead)]);
    if (tail.length) sections.push(['마무리', Math.min(...tail), Math.max(...tail)]);
  }
  const font = fontCss(opts.fontBase64);
  const html = opts.partsOnly ? '' : renderPlayer({ spec, pages, titles, notes, sections, fontCss: font, thumbs: opts.thumbs });
  const partsFont = fontCss(opts.fontBase64, opts.partsFontMode || (opts.embedFontInParts === false ? 'none' : (opts.fontBase64 ? 'embed' : 'none')));
  const parts = pages.map(p => p.replace(FONT_PLACEHOLDER, partsFont));
  return { html, parts, titles, notes, sections, warnings };
}
