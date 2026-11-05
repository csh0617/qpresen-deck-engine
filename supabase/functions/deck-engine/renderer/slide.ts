import type { DeckSpec, Slide, Section, Accent } from './types.ts';
import { themeCss } from './theme.ts';
import { BASE_CSS } from './baseCss.ts';
import { BASE_JS } from './baseJs.ts';
import { renderBody, type Ctx } from './archetypes.ts';
import { esc, rich, plain, pad, cycleAccent, fclass, artSvg, sanitizeDeckCss } from './util.ts';
import { GSAP_JS, THREE_JS } from '../assets/libs.ts';

export const FONT_PLACEHOLDER = '__QP_FONT__';
const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ'];

export interface SlideRenderInput { spec: DeckSpec; index: number; qr?: (text: string) => string; warnings: string[]; sections?: [string, number, number][] }

/** <img data-image="prompt"> placeholders (premium slides) that were not generated get a themed art placeholder so layouts hold. */
export function withImagePlaceholders(html: string, seed: string): string {
  let k = 0;
  return html.replace(/<img\b([^>]*)>/gi, (m, attrs) => {
    if (!/data-image=/.test(attrs) || /\ssrc=/.test(attrs)) return m;
    const svg = artSvg(seed + ':' + (k++), 800, 600);
    return `<img${attrs} src="data:image/svg+xml;utf8,${encodeURIComponent(svg)}">`;
  });
}
/** Third-party libraries are inlined only when the slide (or deck layer) actually uses them. */
export function libsFor(js: string): string {
  let out = '';
  if (/\bgsap\b/.test(js)) out += `<script>${GSAP_JS}</script>\n`;
  if (/\bTHREE\b/.test(js)) out += `<script>${THREE_JS}</script>\n`;
  return out;
}

export function sectionOf(spec: DeckSpec, s: Slide): { sec?: Section; idx: number } {
  const secs = spec.sections || [];
  const idx = secs.findIndex(x => x.id === s.section);
  return { sec: idx >= 0 ? secs[idx] : undefined, idx };
}

export function slideAccent(spec: DeckSpec, s: Slide): Accent {
  if (s.accent) return s.accent;
  const { sec, idx } = sectionOf(spec, s);
  if (sec && sec.accent) return sec.accent;
  if (idx >= 0) return cycleAccent(idx);
  return 'brand';
}

export function footerText(spec: DeckSpec): string {
  const m = spec.meta;
  if (m.footer) return m.footer;
  return [m.title, m.presenter ? `${m.presenter.name}${m.presenter.org ? '(' + m.presenter.org + ')' : ''}` : '', m.date || ''].filter(Boolean).join(' · ');
}

export function renderSlideDoc(inp: SlideRenderInput): string {
  const { spec, index } = inp;
  const s = spec.slides[index]; const n = index + 1; const total = spec.slides.length;
  const theme = spec.meta.theme || 'signature-white';
  const accent = slideAccent(spec, s);
  const ctx: Ctx = { n, total, accent, theme, qr: inp.qr, warnings: inp.warnings };
  const out = renderBody(s, ctx);
  if ((s.body as any).type === 'custom') out.html = withImagePlaceholders(out.html, s.id || String(n));
  const dir = spec.meta.direction; const fx = (spec.meta.fx || dir?.fx || []).map(f => 'qfx-' + f).join(' ');
  const deckCss = dir?.deckCss ? `\n/* deck layer */\n${sanitizeDeckCss(dir.deckCss)}` : '';
  const deckJs = dir?.deckJs ? `<script>${dir.deckJs}</script>\n` : '';
  const libs = libsFor((dir?.deckJs || '') + '\n' + (out.js || ''));
  const { sec, idx } = sectionOf(spec, s);
  const eyebrow = s.eyebrow || (sec ? `${sec.numeral || ROMAN[idx] || ''} · ${sec.label}` : (spec.meta.event || ''));
  const head = out.noHead ? '' : `<header class="head" data-reveal data-delay="0"><div class="eyebrow"><span class="no">${pad(n)}</span>${esc(eyebrow)}<span class="ln"></span></div><h1>${rich(s.title)}</h1>${s.sub ? `<p class="sub">${rich(s.sub)}</p>` : ''}</header>`;
  const topbar = out.useTopbar === false ? '' : `<div class="topbar"><div class="lg">${spec.meta.logo ? `<img src="${esc(spec.meta.logo)}" alt="">` : '<i></i>'}${esc(spec.meta.title)}</div><div class="rt">${esc(spec.meta.event || spec.meta.audience || '')}<i></i><b>${esc(spec.meta.date || '')}</b></div></div>`;
  const source = s.source ? `<div class="source">${esc(s.source)}</div>` : '';
  const cine = (s.body as any).type === 'custom' && (!!(s.body as any).cine || !!(s.section && (dir as any)?.darkSections?.includes(s.section)));
  const stageCls = ['stage', fclass(accent), out.stageClass || '', s.dark ? 'dark' : '', cine ? 'cine' : '', theme === 'signature-white' || theme === 'dark-stage' ? 'theme-grad' : ''].filter(Boolean).join(' ');
  const title = `${pad(n)} · ${plain(s.title)}`;
  const deck = { n, total, footer: footerText(spec), sections: inp.sections || [] };
  return `<!doctype html>
<html lang="${spec.meta.lang || 'ko'}"${fx ? ` class="${fx}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="qp-standalone-part" content="1">
<meta name="qp-deck-engine" content="1.0">
<title>${esc(title)}</title>
<script>document.documentElement.classList.add('js');if(/[?&]static=1/.test(location.search)||document.documentElement.hasAttribute('data-static')||(function(){try{return window.parent!==window&&window.parent.QPDeck&&window.parent.QPDeck.isStatic}catch(e){return false}})())document.documentElement.classList.add('static');try{if(localStorage.getItem('deck-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
${FONT_PLACEHOLDER}
<style>${themeCss(theme, spec.meta.brand, spec.meta.stops)}
${BASE_CSS}${deckCss}
${out.css || ''}</style>
</head>
<body>
<main class="${stageCls}">
${topbar}
${head}
<section class="body">${out.html}</section>
${source}
</main>
<script>window.DECK=${JSON.stringify(deck)};</script>
<script>${BASE_JS}</script>
${libs}${deckJs}${out.js ? `<script>${out.js}</script>` : ''}
</body>
</html>`;
}
