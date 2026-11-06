import type { Accent, ImageRef } from './types.ts';

export function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Rich text: escapes HTML, then allows **강조** → <em>, *x* → <b>, \n → <br>. Pre-existing <em>/<b>/<br> tags are preserved. */
export function rich(s: unknown): string {
  let t = String(s ?? '');
  // protect allowed tags
  t = t.replace(/<(\/?)(em|b|strong|br|small|i|u)\s*\/?>/gi, (_m, sl, tag) => `\u0001${sl}${tag.toLowerCase()}\u0002`);
  t = esc(t);
  t = t.replace(/\u0001(\/?)(\w+)\u0002/g, (_m, sl, tag) => tag === 'br' ? '<br>' : `<${sl}${tag}>`);
  t = t.replace(/\*\*(.+?)\*\*/g, '<em>$1</em>').replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<b>$2</b>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

export function plain(s: unknown): string {
  return String(s ?? '').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ');
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function rng(seed: number) {
  let s = seed || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export const ACCENTS: Accent[] = ['brand', 'teal', 'amber', 'violet', 'rose', 'azure'];
export function fclass(a?: Accent): string { return a ? `f-${a}` : ''; }
export function cycleAccent(i: number): Accent { return ACCENTS[i % ACCENTS.length]; }

export function pad(n: number): string { return (n < 10 ? '0' : '') + n; }

export function fmtNum(v: number, decimals = 0): string {
  const s = v.toFixed(decimals);
  const p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.');
}

/** Procedural abstract art (SVG) used when an image has only a prompt. Deterministic from seed; uses theme CSS variables so it always matches the deck palette. */
export function artSvg(seed: string, w = 800, h = 600, label?: string): string {
  const r = rng(hash(seed) || 7);
  const id = 'a' + (hash(seed) % 100000);
  const cols = ['var(--azure)', 'var(--violet)', 'var(--teal)', 'var(--brand)', 'var(--amber)'];
  const k = Math.floor(r() * 3);
  const orbs: string[] = [];
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const cx = (0.1 + r() * 0.8) * w, cy = (0.1 + r() * 0.8) * h, rad = (0.22 + r() * 0.3) * Math.min(w, h);
    orbs.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="${cols[(k + i) % cols.length]}" opacity="${(0.45 + r() * 0.35).toFixed(2)}" filter="url(#${id}b)"/>`);
  }
  // concentric rings + dot grid + diagonal streak for a designed, technical feel
  const rx = (0.55 + r() * 0.3) * w, ry = (0.3 + r() * 0.4) * h;
  let rings = '';
  for (let i = 1; i <= 4; i++) rings += `<circle cx="${rx.toFixed(0)}" cy="${ry.toFixed(0)}" r="${(i * Math.min(w, h) * 0.11).toFixed(0)}" fill="none" stroke="#fff" stroke-opacity="${(0.22 - i * 0.04).toFixed(2)}" stroke-width="1.5"${i === 2 ? ' stroke-dasharray="3 9"' : ''}/>`;
  const step = Math.round(Math.min(w, h) / 14);
  let dots = '';
  for (let x = step; x < w; x += step) for (let y = step; y < h; y += step) dots += `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff" fill-opacity=".16"/>`;
  const streak = `<path d="M${(w * 0.15).toFixed(0)} ${h} L${(w * 0.62).toFixed(0)} 0" stroke="#fff" stroke-opacity=".18" stroke-width="80" filter="url(#${id}b)"/>`;
  const lab = label ? `<div class="lab">${esc(label)}</div>` : '';
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1B3A"/><stop offset="1" stop-color="#1B2A5E"/></linearGradient><filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) / 9)}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>${orbs.join('')}${streak}${dots}${rings}<rect width="${w}" height="${h}" fill="#0B1B3A" opacity=".12"/></svg>${lab}`;
}

/** Renders an image reference: real image if src, else procedural art. Returns markup for a .img or .art container. */
export function imageHtml(img: ImageRef | undefined, cls = '', seedHint = ''): string {
  if (img && img.src) {
    const cap = img.caption ? `<div class="cap">${esc(img.caption)}</div>` : '';
    return `<figure class="img ${cls}"><img src="${esc(img.src)}" alt="${esc(img.alt || '')}" style="object-fit:${img.fit || 'cover'}">${cap}</figure>`;
  }
  const seed = (img && (img.prompt || img.alt)) || seedHint || 'art';
  const label = img && (img.caption || img.alt) ? (img.caption || img.alt) : undefined;
  return `<div class="art ${cls}" data-art="${esc((img && img.prompt) || '')}">${artSvg(seed, 800, 600, label)}</div>`;
}

/** Minimal inline QR placeholder (real QR injected via options.qr) */
export function qrPlaceholder(url: string, label?: string): string {
  return `<div class="qr"><svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#fff"/><rect x="8" y="8" width="26" height="26" fill="#0A1633"/><rect x="14" y="14" width="14" height="14" fill="#fff"/><rect x="18" y="18" width="6" height="6" fill="#0A1633"/><rect x="66" y="8" width="26" height="26" fill="#0A1633"/><rect x="72" y="14" width="14" height="14" fill="#fff"/><rect x="76" y="18" width="6" height="6" fill="#0A1633"/><rect x="8" y="66" width="26" height="26" fill="#0A1633"/><rect x="14" y="72" width="14" height="14" fill="#fff"/><rect x="18" y="76" width="6" height="6" fill="#0A1633"/><rect x="42" y="10" width="6" height="6" fill="#0A1633"/><rect x="52" y="10" width="6" height="6" fill="#0A1633"/><rect x="42" y="22" width="6" height="6" fill="#0A1633"/><rect x="42" y="42" width="16" height="16" fill="#0A1633"/><rect x="66" y="42" width="6" height="6" fill="#0A1633"/><rect x="78" y="42" width="12" height="6" fill="#0A1633"/><rect x="66" y="56" width="6" height="12" fill="#0A1633"/><rect x="78" y="56" width="6" height="6" fill="#0A1633"/><rect x="42" y="66" width="6" height="6" fill="#0A1633"/><rect x="54" y="66" width="6" height="12" fill="#0A1633"/><rect x="42" y="84" width="12" height="6" fill="#0A1633"/><rect x="66" y="78" width="6" height="12" fill="#0A1633"/><rect x="84" y="78" width="6" height="12" fill="#0A1633"/><rect x="78" y="66" width="12" height="6" fill="#0A1633"/></svg><span>${esc(label || url)}</span></div>`;
}

export function clamp(n: number, a: number, b: number): number { return Math.max(a, Math.min(b, n)); }

/** The deck layer may add texture overlays but must not repaint .stage/.stage.cine (the engine paints them; in cine --ink is the light text color). */
export function sanitizeDeckCss(css: string): string {
  return (css || '').replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel: string, body: string) => {
    const targetsStage = sel.split(',').some(x => /^\s*(?:html\s+|body\s+)?\.stage(?:\.[\w-]+)*(?:::?before|::?after)?\s*$/.test(x) && !/::?(before|after)/.test(x));
    if (!targetsStage) return m;
    const cleaned = body.split(';').filter(d => !/^\s*background(?:-color|-image)?\s*:/i.test(d)).join(';');
    return `${sel}{${cleaned}}`;
  });
}

/** Precision hardening for model-written CSS (slide + deck layer).
    LLM CSS often scopes styles with bare tag selectors — `.card span{display:block}`, `.orb svg{position:absolute;inset:0}` —
    which silently capture engine components (span.icon-circle, svg.ic icons, span.pill) and knock icons off-centre or on top of text.
    Rewrites such compounds to exclude engine components via :where(:not(…)) (zero extra specificity, so cascade order is unchanged). */
const ENGINE_SPANS = '.icon-circle,.ic-sq,.pill,.tag,.chip,.badge,.num,.dot,.kbd,.sec-num,.numeral,.d-hub,.ic';
export function hardenCss(css: string): string {
  if (!css) return css;
  const rx = /(^|[\s>+~,(])(span|svg|i)(?=$|[\s>+~,:)\]])/g;
  const fixSel = (prelude: string) => prelude.replace(rx, (_m, pre: string, tag: string) => pre + tag + (tag === 'span' ? `:where(:not(${ENGINE_SPANS}))` : ':where(:not(.ic))'));
  let out = ''; let i = 0; const n = css.length;
  while (i < n) {
    const open = css.indexOf('{', i); if (open < 0) { out += css.slice(i); break; }
    const prelude = css.slice(i, open); const trimmed = prelude.trim();
    // matching close brace (handles nested blocks inside at-rules)
    let depth = 1, j = open + 1; while (j < n && depth > 0) { const ch = css[j]; if (ch === '{') depth++; else if (ch === '}') depth--; j++; }
    const inner = css.slice(open + 1, j - 1);
    if (trimmed.startsWith('@')) {
      const nested = /^@(media|supports|container|layer|scope|document)\b/i.test(trimmed);
      out += prelude + '{' + (nested ? hardenCss(inner) : inner) + '}';
    } else if (/^(?:from|to|[\d.]+%)(?:\s*,\s*(?:from|to|[\d.]+%))*$/.test(trimmed)) { out += prelude + '{' + inner + '}'; }
    else { out += fixSel(prelude) + '{' + inner + '}'; }
    i = j;
  }
  return out;
}
