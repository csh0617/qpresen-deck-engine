import type { DeckSpec, RenderOptions, RenderResult, Notes } from './types.ts';
import { renderSlideDoc, FONT_PLACEHOLDER } from './slide.ts';
import { renderPlayer } from './player.ts';
import { plain } from './util.ts';
import { validateSpec } from './validate.ts';

export * from './types.ts';
export { validateSpec } from './validate.ts';
export { FONT_PLACEHOLDER } from './slide.ts';

export function fontCss(base64?: string): string {
  if (!base64) return `<style>/* system fonts */</style>`;
  return `<style>@font-face{font-family:'Pretendard Variable';font-weight:45 920;font-style:normal;font-display:block;src:url(data:font/woff2;base64,${base64}) format('woff2')}</style>`;
}

export interface RenderDeckOptions extends RenderOptions { qr?: (text: string) => string }

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
  const parts = pages.map(p => p.replace(FONT_PLACEHOLDER, opts.embedFontInParts === false ? '<style></style>' : font));
  return { html, parts, titles, notes, sections, warnings };
}
