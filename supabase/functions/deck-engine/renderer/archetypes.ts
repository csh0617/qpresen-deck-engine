import type { Slide, Body, Accent, Visual, MockSpec, DiagramNode, DiagramEdge } from './types.ts';
import { esc, rich, plain, imageHtml, artSvg, qrPlaceholder, fclass, cycleAccent, pad, fmtNum, hash } from './util.ts';
import { iconSvg } from './icons.ts';
import { chartSvg, legendHtml } from './charts.ts';

export interface Ctx {
  n: number; total: number; accent: Accent; theme: string;
  qr?: (text: string) => string;      // returns <svg> markup
  warnings: string[];
}
export interface BodyOut { html: string; stageClass?: string; noHead?: boolean; css?: string; js?: string; useTopbar?: boolean }

const rv = (i: number, kind = '', step = 90, base = 250) => `data-reveal="${kind}" data-delay="${base + i * step}"`;
const ic = (name?: string, cls = 'ic') => iconSvg(name, cls);
function kpiValue(v: number | string, unit?: string, prefix?: string, decimals?: number, delay = 400, cls = 'v'): string {
  if (typeof v === 'number') {
    const dec = decimals ?? (Number.isInteger(v) ? 0 : 1);
    return `<div class="${cls}">${prefix ? `<span class="pre">${esc(prefix)}</span>` : ''}<span data-count="${v}" data-decimals="${dec}" data-delay="${delay}">${fmtNum(v, dec)}</span>${unit ? `<small>${esc(unit)}</small>` : ''}</div>`;
  }
  return `<div class="${cls}">${prefix ? `<span class="pre">${esc(prefix)}</span>` : ''}<span>${esc(v)}</span>${unit ? `<small>${esc(unit)}</small>` : ''}</div>`;
}
function qrHtml(ctx: Ctx, url: string, label?: string): string {
  if (ctx.qr) return `<div class="qr">${ctx.qr(url)}<span>${esc(label || url)}</span></div>`;
  return qrPlaceholder(url, label);
}

function visualHtml(v: Visual | undefined, ctx: Ctx, seed: string): string {
  if (!v) return imageHtml(undefined, '', seed);
  switch (v.kind) {
    case 'image': return imageHtml(v.image, '', seed);
    case 'art': return `<div class="art">${artSvg(v.seed || seed, 800, 600, v.label)}</div>`;
    case 'svg': return `<figure class="svgbox" ${rv(2, 'scale')}>${v.html}</figure>${v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : ''}`;
    case 'chart': return `<div class="svgbox" ${rv(2, 'scale')}>${chartSvg(v.chart, { w: 900, h: 560, delay: 500, accent: ctx.accent })}</div>`;
    case 'stat': return `<div class="stat" ${rv(2, 'scale')}>${kpiValue(v.value, v.unit, undefined, undefined, 600)}<div class="l">${esc(v.label)}</div>${v.sub ? `<div class="s">${esc(v.sub)}</div>` : ''}</div>`;
    case 'icons': return `<div class="icons">${v.items.map((it, i) => `<div class="${fclass(it.accent || cycleAccent(i))}" ${rv(i + 2, 'scale')}><span class="ic-sq lg">${ic(it.icon)}</span>${esc(it.label)}</div>`).join('')}</div>`;
    case 'mockup': return mockDevice(v.mock, ctx, 'full');
  }
  return imageHtml(undefined, '', seed);
}

/* ---------------- mockup device ---------------- */
function mockDevice(m: MockSpec, ctx: Ctx, mode: 'full' | 'side' = 'side'): string {
  const steps = m.steps || [];
  let t = 500; const items: string[] = [];
  const cursor = `<div class="cursor"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 3l14 8-6 2-3 6z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`;
  if (m.app === 'dashboard') {
    const ws = steps.map((s, i) => { const at = s.at ?? (t += 650); const wide = s.type === 'show' && i === 0; return `<div class="w ${wide ? 'wide' : ''}" data-at="${at}"><div class="k">${esc(s.type === 'note' ? 'NOTE' : 'WIDGET ' + (i + 1))}</div><div class="v">${esc(s.text)}</div>${wide ? '<div class="bars">' + [40, 65, 50, 80, 60, 90, 75, 95].map(h => `<i style="height:${h}%"></i>`).join('') + '</div>' : ''}</div>`; }).join('');
    return `<div class="dev" data-mock data-loop="4000">${bar(m)}<div class="scr"><div class="dash">${ws}</div></div></div>`;
  }
  steps.forEach((s) => {
    const at = s.at ?? (t += s.type === 'reply' ? 1400 : 900);
    if (s.type === 'type') { items.push(`<div class="m u" data-at="${at}"><span data-type-text="${esc(s.text)}" data-speed="24"></span></div>`); t = at + s.text.length * 24 + 300; }
    else if (s.type === 'reply') items.push(`<div class="m a" data-at="${at}">${rich(s.text)}</div>`);
    else if (s.type === 'click') items.push(`<div class="m c" data-at="${at}" data-click>${ic('arrow-right')} ${esc(s.text)}</div>`);
    else if (s.type === 'note') items.push(`<div class="m n" data-at="${at}">${esc(s.text)}</div>`);
    else items.push(`<div class="m a" data-at="${at}">${rich(s.text)}</div>`);
  });
  const composer = m.app === 'chat' || m.app === 'phone' ? `<div class="composer">${esc('메시지를 입력하세요…')}<span class="send">${ic('arrow-up-right')}</span></div>` : '';
  return `<div class="dev" data-mock data-loop="5000">${bar(m)}<div class="scr"><div class="chat">${items.join('')}</div>${composer}${cursor}</div></div>`;
  function bar(mm: MockSpec) { return `<div class="bar"><i></i><i></i><i></i><span class="url">${esc(mm.url || mm.title || (mm.app === 'chat' ? 'chat.example.com' : 'app.example.com'))}</span></div>`; }
}

/* ---------------- diagrams ---------------- */
function isChain(nodes: DiagramNode[], edges: DiagramEdge[]): boolean {
  if (edges.length !== nodes.length - 1 || nodes.length > 6) return false;
  for (let i = 0; i < edges.length; i++) if (edges[i].from !== nodes[i].id || edges[i].to !== nodes[i + 1].id) return false;
  return true;
}
function diagramSvg(kind: string, nodes: DiagramNode[], edges: DiagramEdge[], center?: { label: string; desc?: string; icon?: string }): string {
  const W = 1400, H = 640;
  let out = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-height:100%"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--f)"/></marker></defs>`;
  const pos: Record<string, { x: number; y: number; w: number; h: number }> = {};
  const nodeBox = (n: DiagramNode, x: number, y: number, w: number, h: number, i: number, accent?: Accent) => {
    pos[n.id] = { x, y, w, h };
    const col = accent || n.accent || cycleAccent(i);
    const iconM = n.icon ? `<g transform="translate(${x + 22},${y + 18}) scale(1.4)" style="color:var(--${col})"><foreignObject width="40" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="color:var(--${col});width:30px;height:30px">${ic(n.icon)}</div></foreignObject></g>` : '';
    const ty = n.icon ? y + h - 44 : y + h / 2 - (n.desc ? 8 : -8);
    return `<g data-reveal="scale" data-delay="${300 + i * 110}" style="transform-box:fill-box;transform-origin:center"><rect class="dg-node" x="${x}" y="${y}" width="${w}" height="${h}" rx="18" style="stroke:color-mix(in srgb,var(--${col}) 45%,var(--line-2))"/><rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="var(--${col})"/>${iconM}<text class="dg-text" x="${x + w / 2 + 3}" y="${ty}" text-anchor="middle">${esc(n.label)}</text>${n.desc ? `<text class="dg-desc" x="${x + w / 2 + 3}" y="${ty + 26}" text-anchor="middle">${esc(n.desc)}</text>` : ''}</g>`;
  };
  if (kind === 'hub') {
    const cx = W / 2, cy = H / 2, R = 236;
    const n = nodes.length; const bw = n <= 5 ? 290 : 240, bh = n <= 5 ? 112 : 96;
    nodes.forEach((nd, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; const x = cx + Math.cos(a) * (R + 170) - bw / 2, y = cy + Math.sin(a) * R - bh / 2; pos[nd.id] = { x, y, w: bw, h: bh }; });
    nodes.forEach((nd, i) => { const p = pos[nd.id]; const px = p.x + p.w / 2, py = p.y + p.h / 2; out += `<line class="dg-edge" x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="var(--line-2)" data-draw data-delay="${200 + i * 80}"/>`; });
    nodes.forEach((nd, i) => { const p = pos[nd.id]; out += nodeBox(nd, p.x, p.y, p.w, p.h, i); });
    out += `<g data-reveal="scale" data-delay="150" style="transform-box:fill-box;transform-origin:center"><circle cx="${cx}" cy="${cy}" r="128" fill="var(--f)" opacity=".12"/><circle cx="${cx}" cy="${cy}" r="102" fill="var(--f-ink)"/><text x="${cx}" y="${cy + (center?.desc ? 2 : 10)}" text-anchor="middle" style="fill:#fff;font-size:27px;font-weight:800;font-family:var(--font)">${esc(center?.label || '')}</text>${center?.desc ? `<text x="${cx}" y="${cy + 32}" text-anchor="middle" style="fill:rgba(255,255,255,.88);font-size:15px;font-weight:600;font-family:var(--font)">${esc(center.desc)}</text>` : ''}</g>`;
  } else if (kind === 'cycle') {
    const cx = W / 2, cy = H / 2, R = 215; const n = nodes.length;
    out += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line-2)" stroke-width="3" stroke-dasharray="4 10"/>`;
    for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.28, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - 0.3; const x0 = cx + Math.cos(a0) * R, y0 = cy + Math.sin(a0) * R, x1 = cx + Math.cos(a1) * R, y1 = cy + Math.sin(a1) * R; out += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" class="dg-edge f" marker-end="url(#arw)" data-draw data-delay="${300 + i * 120}"/>`; }
    nodes.forEach((nd, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; const x = cx + Math.cos(a) * R - 105, y = cy + Math.sin(a) * R - 44; out += nodeBox(nd, x, y, 210, 88, i); });
    if (center) out += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" style="fill:var(--ink);font-size:30px;font-weight:800;font-family:var(--font)">${esc(center.label)}</text>${center.desc ? `<text x="${cx}" y="${cy + 40}" text-anchor="middle" class="dg-desc" style="font-size:16px">${esc(center.desc)}</text>` : ''}`;
  } else { // flow with explicit edges: layered left→right
    // simple layering by BFS from sources
    const ids = nodes.map(n => n.id); const incoming: Record<string, number> = {}; ids.forEach(i => incoming[i] = 0); edges.forEach(e => { if (incoming[e.to] != null) incoming[e.to]++; });
    const level: Record<string, number> = {}; let frontier = ids.filter(i => incoming[i] === 0); if (!frontier.length) frontier = [ids[0]];
    let l = 0; const seen = new Set<string>();
    while (frontier.length && l < 10) { frontier.forEach(f => { if (!seen.has(f)) { level[f] = l; seen.add(f); } }); const next: string[] = []; edges.forEach(e => { if (frontier.includes(e.from) && !seen.has(e.to)) next.push(e.to); }); frontier = Array.from(new Set(next)); l++; }
    ids.forEach(i => { if (level[i] == null) level[i] = l; });
    const L = Math.max(...ids.map(i => level[i])) + 1; const cols: string[][] = Array.from({ length: L }, () => []); ids.forEach(i => cols[level[i]].push(i));
    const colW = W / L; const bw = Math.min(280, colW - 50), bh = 124;
    cols.forEach((col, ci) => { const rowH = H / col.length; col.forEach((id, ri) => { const nd = nodes.find(n => n.id === id)!; const x = ci * colW + (colW - bw) / 2, y = ri * rowH + (rowH - bh) / 2; pos[id] = { x, y, w: bw, h: bh }; }); });
    edges.forEach((e, i) => { const a = pos[e.from], b = pos[e.to]; if (!a || !b) return; const x0 = a.x + a.w, y0 = a.y + a.h / 2, x1 = b.x, y1 = b.y + b.h / 2; const mx = (x0 + x1) / 2; out += `<path class="dg-edge f" d="M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1 - 4} ${y1}" marker-end="url(#arw)" data-draw data-delay="${400 + i * 90}"/>`; if (e.label) out += `<text class="dg-lab" x="${mx}" y="${(y0 + y1) / 2 - 10}" text-anchor="middle" data-reveal="fade" data-delay="${600 + i * 90}">${esc(e.label)}</text>`; });
    nodes.forEach((nd, i) => { const p = pos[nd.id]; if (p) out += nodeBox(nd, p.x, p.y, p.w, p.h, i); });
  }
  out += '</svg>';
  return out;
}

/* ============================================================
   Archetype renderers
   ============================================================ */
export function renderBody(s: Slide, ctx: Ctx): BodyOut {
  const b = s.body;
  const seed = plain(s.title) + ctx.n;
  switch (b.type) {
    case 'cover': {
      const metaHtml = (b.meta || []).map(m => `<span>${ic(m.icon || 'calendar')} ${rich(m.text)}</span>`).join('');
      const tags = (b.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
      const agenda = (b.agenda || []).map((a, i) => `<div class="st" ${rv(i, 'up', 70, 900)}><b>${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'][i] || i + 1}</b>${esc(a)}</div>`).join('');
      const stats = (b.stats || []).slice(0, 3).map((st, i) => `<div class="card" ${rv(i + 4, 'up')}><div class="v">${esc(st.value)}</div><div class="l">${esc(st.label)}</div></div>`).join('');
      const photo = b.visual === 'photo';
      const side = photo ? '' : `<div class="side">${b.image || b.visual !== 'none' ? `<div ${rv(3, 'scale')}>${imageHtml(b.image, '', seed)}</div>` : ''}${stats ? `<div class="stats">${stats}</div>` : ''}${b.qr ? `<div class="card" style="display:flex;align-items:center;gap:22px;padding:20px 24px" ${rv(6, 'up')}>${qrHtml(ctx, b.qr.url, b.qr.label)}<div><div class="k-eyebrow">SCAN</div><div class="k-title" style="margin-top:6px">${esc(b.qr.label || '지금 바로 체험')}</div><div class="k-small">${esc(b.qr.url)}</div></div></div>` : ''}</div>`;
      const hero = `<div class="hero">${b.kicker ? `<div class="kicker" ${rv(0)}>${rich(b.kicker)}</div>` : ''}<h1 ${rv(1, '', 90, 200)}>${rich(s.title)}</h1>${b.tagline || s.sub ? `<p class="tagline" ${rv(2)}>${rich(b.tagline || s.sub)}</p>` : ''}${metaHtml ? `<div class="meta" ${rv(3)}>${metaHtml}</div>` : ''}${tags ? `<div class="tags" ${rv(4)}>${tags}</div>` : ''}${agenda ? `<div class="agenda">${agenda}</div>` : ''}</div>`;
      const solo = !side;
      const amb = b.visual === 'particles' ? `<div class="amb"><canvas data-particles="46" data-alpha=".55" data-seed="${(hash(seed) % 90) + 3}"></canvas></div>` : (b.visual === 'orbs' || (!b.visual && !photo)) ? `<div class="amb"><i class="orb a"></i><i class="orb b"></i></div>` : '';
      const ph = photo ? `<div class="ph">${b.image && b.image.src ? `<img src="${esc(b.image.src)}" alt="${esc(b.image.alt || '')}">` : `<div class="art">${artSvg(seed, 1920, 1080)}</div>`}</div>` : '';
      return { noHead: true, stageClass: photo ? 'a-cover-photo' : '', html: `${amb}${ph}<div class="a-cover ${solo ? 'solo' : ''}">${hero}${side}</div>`, useTopbar: false };
    }
    case 'section': {
      const bul = (b.bullets || []).map((t, i) => `<li ${rv(i + 2, 'right')}><span class="num">${i + 1}</span><span>${rich(t)}</span></li>`).join('');
      const right = bul ? `<ul class="bul">${bul}</ul>` : b.image ? `<div ${rv(2, 'scale')}>${imageHtml(b.image, '', seed)}</div>` : `<div ${rv(2, 'scale')}><div class="art" style="aspect-ratio:4/3;border-radius:28px">${artSvg(seed, 800, 600)}</div></div>`;
      return { noHead: true, stageClass: b.dark ? 'dark' : '', html: `<div class="a-section"><div><div class="numeral" ${rv(0, 'fade')}>${esc(b.numeral || '')}</div><div class="lab" ${rv(1)}>${esc(b.label || b.kicker || 'SECTION')}</div><h2 ${rv(1, '', 90, 300)}>${rich(s.title)}</h2>${s.sub ? `<p class="k-body" style="font-size:24px;margin-top:22px;color:var(--muted);max-width:760px" ${rv(2)}>${rich(s.sub)}</p>` : ''}</div>${right}</div>` };
    }
    case 'agenda': {
      const n = b.items.length; const rail = n <= 5;
      const cols = n <= 6 ? 3 : n <= 8 ? 4 : 5;
      const R = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];
      const items = b.items.map((it, i) => rail
        ? `<div class="it ${fclass(cycleAccent(i))}" ${rv(i, 'right', 110)}><span class="rn">${esc(it.numeral || R[i] || String(i + 1))}</span><div><h3>${rich(it.label)}</h3>${it.desc ? `<p>${rich(it.desc)}</p>` : ''}</div>${it.minutes || it.pages ? `<div class="m">${ic('clock')} ${it.minutes ? esc(it.minutes) + '분' : ''}${it.pages ? ' · ' + esc(it.pages) : ''}</div>` : ''}</div>`
        : `<div class="it ${fclass(cycleAccent(i))}" ${rv(i, 'up', 80)}><span class="num">${esc(it.numeral || R[i] || String(i + 1))}</span><div><h3>${rich(it.label)}</h3>${it.desc ? `<p>${rich(it.desc)}</p>` : ''}${it.minutes || it.pages ? `<div class="m">${ic('clock')} ${it.minutes ? esc(it.minutes) + '분' : ''} ${it.pages ? '· ' + esc(it.pages) : ''}</div>` : ''}</div></div>`).join('');
      return { html: `<div class="a-agenda ${rail ? 'rail' : ''}" style="--cols:${cols}">${items}</div>` };
    }
    case 'question': {
      const opts = (b.options || []).map((o, i) => `<li ${rv(i + 2, 'right')}><span class="num">${String.fromCharCode(65 + i)}</span>${rich(o)}</li>`).join('');
      const right = opts ? `<ul class="opts n${(b.options || []).length}">${opts}</ul>` : b.image ? `<div ${rv(2, 'scale')}>${imageHtml(b.image, '', seed)}</div>` : '';
      return { noHead: true, html: `<div class="a-question ${right ? '' : 'solo'}" ${right ? '' : 'style="grid-template-columns:1fr"'}><div class="qmark" aria-hidden="true">?</div><div style="position:relative;z-index:1"><div class="k-eyebrow" ${rv(0)}>${esc(s.eyebrow || 'QUESTION')}</div><div class="q" style="margin-top:20px" ${rv(1, '', 90, 300)}>${rich(b.question || s.title)}</div>${b.hint ? `<p class="hint" ${rv(2)}>${rich(b.hint)}</p>` : ''}</div>${right}</div>` };
    }
    case 'kpi-grid': {
      const n = b.items.length; const cols = b.columns || (n <= 3 ? n : n === 4 ? 4 : n <= 6 ? 3 : 4);
      const items = b.items.map((k, i) => `<div class="card ${fclass(k.accent || cycleAccent(i))}" ${rv(i, 'up', 90)}><div class="top"><span class="k-eyebrow">${esc(k.label)}</span>${k.icon ? `<span class="ic-sq">${ic(k.icon)}</span>` : ''}</div><div class="kpi">${kpiValue(k.value, k.unit, k.prefix, k.decimals, 500 + i * 120)}${k.sub ? `<div class="s">${rich(k.sub)}</div>` : ''}${k.delta ? `<div><span class="delta ${k.delta.dir}">${k.delta.dir === 'up' ? '▲' : k.delta.dir === 'down' ? '▼' : '■'} ${esc(k.delta.text)}</span></div>` : ''}</div>${k.bar != null ? `<div class="bar" data-bar="${Math.max(0, Math.min(100, k.bar))}" data-delay="${700 + i * 120}"><i></i></div>` : ''}</div>`).join('');
      return { html: `<div class="a-kpi"><div class="grid grid-${cols}">${items}</div>${b.footer ? `<div class="foot" ${rv(n + 1, 'up')}>${ic('lightbulb', 'ic')} <span>${rich(b.footer)}</span></div>` : ''}</div>` };
    }
    case 'big-number': {
      const cmp = (b.compare || []).map((c, i) => `<li ${rv(i + 3, 'right')}><span>${esc(c.label)}</span><b>${esc(c.value)}</b></li>`).join('');
      return { html: `<div class="a-bignum ${cmp ? '' : 'solo'}" ${cmp ? '' : 'style="grid-template-columns:1fr"'}><div><div class="n" ${rv(1, 'scale', 90, 300)}>${typeof b.value === 'number' ? `${b.prefix ? `<span class="pre">${esc(b.prefix)}</span>` : ''}<span data-count="${b.value}" data-decimals="${b.decimals ?? (Number.isInteger(b.value) ? 0 : 1)}" data-delay="500">${fmtNum(b.value, b.decimals ?? (Number.isInteger(b.value) ? 0 : 1))}</span>` : `${b.prefix ? `<span class="pre">${esc(b.prefix)}</span>` : ''}<span>${esc(b.value)}</span>`}${b.unit ? `<small>${esc(b.unit)}</small>` : ''}</div><div class="lab" ${rv(2)}>${rich(b.label)}</div>${b.context ? `<p class="ctx" ${rv(3)}>${rich(b.context)}</p>` : ''}</div>${cmp ? `<ul class="cmp">${cmp}</ul>` : ''}</div>` };
    }
    case 'bullets-visual': {
      const list = b.bullets.map((it, i) => `<li class="${fclass(it.accent || cycleAccent(i))}" ${rv(i, b.visualSide === 'left' ? 'right' : 'left', 100)}><span class="ic-sq">${ic(it.icon || 'check')}</span><div><h3>${rich(it.title)}</h3>${it.desc ? `<p>${rich(it.desc)}</p>` : ''}</div></li>`).join('');
      const vis = visualHtml(b.visual, ctx, seed);
      return { html: `<div class="a-bv ${b.visualSide === 'left' ? 'v-left' : ''}"><div><ul class="list">${list}</ul>${b.callout ? `<div class="callout" ${rv(b.bullets.length, 'up')}>${ic('lightbulb', 'ic')}<span>${rich(b.callout)}</span></div>` : ''}</div><div class="vis" ${rv(1, 'scale', 0, 350)}>${vis}</div></div>` };
    }
    case 'cards': {
      const n = b.items.length; const cols = b.columns || (n <= 2 ? 2 : n === 3 ? 3 : n === 4 ? 4 : n <= 6 ? 3 : 4);
      const styleCls = b.style === 'tint' ? 'tint' : b.style === 'edge' ? 'edge' : b.style === 'solid' ? 'solid' : b.style === 'glass' ? 'glass' : '';
      const items = b.items.map((c, i) => `<div class="card lift ${styleCls} ${fclass(c.accent || cycleAccent(i))}" ${rv(i, 'up', 90)}>${b.style === 'number' ? `<span class="ghost">${pad(i + 1)}</span>` : ''}<div class="tp">${c.icon ? `<span class="ic-sq ${b.style === 'solid' ? '' : ''}">${ic(c.icon)}</span>` : b.style === 'number' ? `<span class="num sq">${i + 1}</span>` : ''}${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ''}</div><h3>${rich(c.title)}</h3>${c.desc ? `<p>${rich(c.desc)}</p>` : ''}${c.points && c.points.length ? `<ul class="pts">${c.points.map(p => `<li>${rich(p)}</li>`).join('')}</ul>` : ''}${c.value ? `<div class="val">${esc(c.value)}${c.label ? `<small>${esc(c.label)}</small>` : ''}</div>` : ''}</div>`).join('');
      const rows = Math.ceil(n / cols);
      return { html: `<div class="a-cards"><div class="grid grid-${cols} rows-${Math.min(rows, 3)}">${items}</div>${b.footer ? `<div class="foot" ${rv(n + 1, 'up')}>${ic('arrow-right', 'ic')} <span>${rich(b.footer)}</span></div>` : ''}</div>` };
    }
    case 'comparison': {
      const cols = b.columns.length;
      if (cols === 2 && b.rows.length <= 6 && b.rows.every(r => r.cells.every(c => c.length <= 40)) && !b.rows.some(r => !r.label)) {
        // vs layout
        const col = (ci: number) => `<div class="col ${b.columns[ci].highlight ? 'hl' : ''} ${fclass(b.columns[ci].accent || (ci ? 'teal' : 'brand'))}" ${rv(ci * 3, ci ? 'right' : 'left', 100, 250)}><h3>${rich(b.columns[ci].label)}</h3>${b.columns[ci].sub ? `<div class="k-small">${esc(b.columns[ci].sub)}</div>` : ''}<ul>${b.rows.map(r => `<li><b>${esc(r.label)}</b><span>${rich(r.cells[ci] || '')}</span></li>`).join('')}</ul></div>`;
        return { html: `<div class="a-compare wrap"><div class="a-compare vs">${col(0)}<div class="mid" ${rv(2, 'scale')}><span>VS</span></div>${col(1)}</div>${b.verdict ? `<div class="verdict" ${rv(5, 'up')}>${ic('check-circle', 'ic')}<span>${rich(b.verdict)}</span></div>` : ''}</div>` };
      }
      const cells: string[] = [];
      cells.push(`<div class="hd rl"></div>`);
      b.columns.forEach((c, i) => cells.push(`<div class="hd ${c.highlight ? 'hl' : ''} ${fclass(c.accent)}" ${rv(i, 'up')}>${rich(c.label)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</div>`));
      b.rows.forEach((r, ri) => { cells.push(`<div class="rl" ${rv(ri + 2, 'fade', 60)}>${rich(r.label)}</div>`); r.cells.forEach((c, ci) => { const t = c.trim(); const mark = /^(○|◎|✓|✔|O|예|가능|yes)$/i.test(t) ? `<span class="ok">✓ ${t}</span>` : /^(×|✕|✗|X|아니오|불가|no|-)$/i.test(t) ? `<span class="no">✕ ${t}</span>` : rich(c); cells.push(`<div class="${b.columns[ci]?.highlight ? 'hl' : ''}" ${rv(ri + 2, 'fade', 60)}>${mark}</div>`); }); });
      return { html: `<div class="a-compare"><div class="tb" style="--cols:${cols};--n:${cols + 1}">${cells.join('')}</div>${b.verdict ? `<div class="verdict" ${rv(b.rows.length + 3, 'up')}>${ic('check-circle', 'ic')}<span>${rich(b.verdict)}</span></div>` : ''}</div>` };
    }
    case 'timeline': {
      const n = b.items.length; const horiz = (b.orientation || (n <= 7 ? 'h' : 'v')) === 'h';
      if (horiz) {
        const items = b.items.map((it, i) => `<div class="it ${b.nowIndex === i ? 'now' : ''} ${fclass(it.accent || cycleAccent(i))}" ${rv(i, 'up', 120)}><span class="dot"></span><div class="card"><div class="d">${esc(it.date)}</div><h3>${rich(it.title)}</h3>${it.desc ? `<p>${rich(it.desc)}</p>` : ''}${it.tag ? `<div style="margin-top:10px"><span class="tag">${esc(it.tag)}</span></div>` : ''}</div></div>`).join('');
        const w = b.nowIndex != null ? ((b.nowIndex + 0.5) / n * 100).toFixed(1) : '100';
        return { html: `<div class="a-tl"><div class="h n${n}" style="--n:${n}"><div class="fill" data-bar="${w}" data-delay="300" style="--w:${w}%"></div>${items}</div>${b.footer ? `<div class="foot" ${rv(n + 1, 'up')}>${rich(b.footer)}</div>` : ''}</div>` };
      }
      const items = b.items.map((it, i) => `<div class="it ${fclass(it.accent || cycleAccent(i))}" ${rv(i, 'right', 90)}><div class="d">${esc(it.date)}</div><div><h3>${rich(it.title)}</h3>${it.desc ? `<p>${rich(it.desc)}</p>` : ''}</div></div>`).join('');
      return { html: `<div class="a-tl"><div class="v">${items}</div>${b.footer ? `<div class="foot" ${rv(n + 1, 'up')}>${rich(b.footer)}</div>` : ''}</div>` };
    }
    case 'process': {
      const n = b.steps.length; const style = b.style || 'arrows';
      const steps = b.steps.map((st, i) => `<div class="st ${fclass(st.accent || cycleAccent(i))}" ${rv(i, 'right', 140)}>${style === 'circles' ? `<span class="big-ic">${ic(st.icon || 'check')}</span>` : `<div class="no"><span class="num">${i + 1}</span>${st.icon ? `<span class="ic-sq">${ic(st.icon)}</span>` : ''}</div>`}<h3>${rich(st.title)}</h3>${st.desc ? `<p>${rich(st.desc)}</p>` : ''}</div>`).join('');
      return { html: `<div class="a-proc ${style === 'chevrons' ? 'chev' : style === 'circles' ? 'circ' : ''}"><div class="steps n${n}" style="--n:${n}">${steps}</div>${b.result ? `<div class="result" ${rv(n + 1, 'up')}>${ic('check-circle')}<span>${rich(b.result)}</span></div>` : ''}</div>` };
    }
    case 'chart': {
      const layout = b.layout || ((b.insight || (b.callouts && b.callouts.length)) ? 'chart-left' : 'chart-full');
      const side = layout === 'chart-full' ? '' : `<div class="side">${b.insight ? `<div class="ins" ${rv(2, 'right')}><div class="k-eyebrow" style="margin-bottom:10px">INSIGHT</div><h3>${rich(b.insight.title)}</h3><p>${rich(b.insight.text)}</p></div>` : ''}${(b.callouts || []).map((c, i) => `<div class="co ${fclass(c.accent || cycleAccent(i))}" ${rv(i + 3, 'right')}><div class="v">${esc(c.value)}</div><div><div class="l">${esc(c.label)}</div>${c.desc ? `<div class="d">${esc(c.desc)}</div>` : ''}</div></div>`).join('')}</div>`;
      const cls = layout === 'chart-full' ? 'cf' : layout === 'chart-right' ? 'cr' : 'cl';
      const svg = chartSvg(b.chart, { w: layout === 'chart-full' ? 1500 : 1000, h: layout === 'chart-full' ? 600 : 560, delay: 400, accent: ctx.accent });
      return { html: `<div class="a-chart ${cls}"><div class="ch" ${rv(0, 'scale', 0, 200)}><div class="t"><h3>${esc(b.chart.title || plain(s.title))}</h3>${b.chart.unit ? `<span>단위: ${esc(b.chart.unit)}</span>` : ''}</div>${legendHtml(b.chart)}<div class="plot">${svg}</div></div>${side}</div>` };
    }
    case 'table': {
      const al = b.align || [];
      const head = b.columns.map((c, i) => `<th class="${al[i] === 'r' ? 'r' : al[i] === 'c' ? 'c' : ''} ${b.highlightCol === i ? 'hl' : ''}">${rich(c)}</th>`).join('');
      const rows = b.rows.map((r, ri) => `<tr class="${b.highlightRow === ri ? 'hl' : ''}" ${rv(ri + 1, 'fade', 60)}>${r.map((c, ci) => `<td class="${al[ci] === 'r' ? 'r' : al[ci] === 'c' ? 'c' : ''} ${b.highlightCol === ci ? 'hl' : ''}">${rich(c)}</td>`).join('')}</tr>`).join('');
      const aside = b.aside ? `<div class="as" ${rv(3, 'right')}><h3>${rich(b.aside.title)}</h3><ul>${b.aside.points.map(p => `<li>${rich(p)}</li>`).join('')}</ul></div>` : '';
      return { html: `<div class="a-table ${aside ? 'aside' : ''}"><div><div class="wrap" ${rv(0, 'up')}><table class="tbl ${b.dense || b.rows.length > 7 ? 'dense' : b.rows.length <= 6 && b.columns.length <= 5 ? 'lg' : ''}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>${b.caption ? `<div class="cap">${esc(b.caption)}</div>` : ''}</div>${aside}</div>` };
    }
    case 'matrix': {
      const q = b.quadrants; const order = [1, 0, 3, 2]; // TL=0? keep spec: [TL,TR,BL,BR] → grid order TL,TR,BL,BR
      const quads = q.slice(0, 4).map((qq, i) => `<div class="q${i} ${fclass(qq.accent)}" ${rv(i, 'fade', 90)}><h4>${rich(qq.title)}</h4>${qq.desc ? `<p>${rich(qq.desc)}</p>` : ''}</div>`).join('');
      const pts = (b.points || []).map((p, i) => `<div class="pt ${p.x > 78 ? 'er' : p.x < 22 ? 'el' : ''} ${p.y < 14 ? 'eb' : ''} ${fclass(p.accent || cycleAccent(i))}" style="left:${p.x}%;top:${100 - p.y}%;--sz:${(p.size || 26)}px" ${rv(i + 4, 'scale', 110)}><i></i><b>${esc(p.label)}</b></div>`).join('');
      const side = q.map((qq, i) => `<div class="card ${fclass(qq.accent || cycleAccent(i))}" ${rv(i + 2, 'right', 90)}><span class="num">${['TL', 'TR', 'BL', 'BR'][i]}</span><div><h4>${rich(qq.title)}</h4>${qq.desc ? `<p>${rich(qq.desc)}</p>` : ''}</div></div>`).join('');
      void order;
      return { html: `<div class="a-matrix"><div class="mx"><div class="plane">${quads}${pts}</div><div class="xl"><span>${esc(b.xLow || '낮음')}</span><b>${esc(b.xLabel)} →</b><span>${esc(b.xHigh || '높음')}</span></div><div class="yl"><span>${esc(b.yHigh || '높음')}</span><b>${esc(b.yLabel)} →</b><span>${esc(b.yLow || '낮음')}</span></div></div><div class="side">${side}</div></div>` };
    }
    case 'diagram': {
      const aside = b.aside ? `<div class="as"><div class="card" ${rv(3, 'right')}><h3>${rich(b.aside.title)}</h3><ul>${b.aside.points.map(p => `<li>${rich(p)}</li>`).join('')}</ul></div></div>` : '';
      let inner = '';
      if (b.kind === 'layers') {
        inner = `<div class="layers">${b.nodes.map((nd, i) => `<div class="ly ${fclass(nd.accent || cycleAccent(i))}" ${rv(i, 'up', 110)}><h4>${nd.icon ? `<span class="ic-sq">${ic(nd.icon)}</span>` : `<span class="num sq">${i + 1}</span>`}${rich(nd.label)}</h4><div class="cells">${(nd.desc || '').split(/[·,、/]/).map(x => x.trim()).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('')}</div></div>`).join('')}</div>`;
      } else if (b.kind === 'funnel') {
        const n = b.nodes.length;
        inner = `<div class="funnel">${b.nodes.map((nd, i) => `<div class="fl ${fclass(nd.accent || cycleAccent(i))}" style="--w:${100 - i * (55 / Math.max(1, n - 1))}%" ${rv(i, 'up', 110)}><span>${rich(nd.label)}</span>${nd.desc ? `<small>${esc(nd.desc)}</small>` : ''}</div>`).join('')}</div>`;
      } else if (b.kind === 'flow' && (!b.edges || !b.edges.length || isChain(b.nodes, b.edges))) {
        inner = `<div class="flow">${b.nodes.map((nd, i) => `${i ? `<div class="ar" ${rv(i * 2, 'fade', 110)}>${ic('arrow-right')}</div>` : ''}<div class="fn ${fclass(nd.accent || cycleAccent(i))}" ${rv(i * 2 + 1, 'up', 110)}>${nd.icon ? `<span class="ic-sq lg">${ic(nd.icon)}</span>` : `<span class="num lg">${i + 1}</span>`}<h4>${rich(nd.label)}</h4>${nd.desc ? `<p>${rich(nd.desc)}</p>` : ''}</div>`).join('')}</div>`;
      } else {
        inner = diagramSvg(b.kind, b.nodes, b.edges || [], b.center);
      }
      const plain = b.kind === 'layers' || b.kind === 'funnel' || inner.startsWith('<div class="flow">');
      return { html: `<div class="a-diag ${aside ? 'aside' : ''}"><div class="cv ${plain ? 'plain' : ''}" ${rv(0, 'scale', 0, 150)}>${inner}</div>${aside}</div>` };
    }
    case 'quote': {
      const img = b.image ? `<div ${rv(3, 'scale')}>${imageHtml(b.image, '', seed)}</div>` : '';
      return { noHead: true, html: `<div class="a-quote ${img ? '' : 'solo'}"><div>${ic('quote', 'qm')}<blockquote ${rv(1, '', 90, 250)}>${rich(b.quote)}</blockquote>${b.by ? `<div class="by" ${rv(2)}><i></i><b>${esc(b.by)}</b>${b.role ? `<span>${esc(b.role)}</span>` : ''}</div>` : ''}${b.context ? `<p class="ctx" ${rv(3)}>${rich(b.context)}</p>` : ''}</div>${img}</div>` };
    }
    case 'image-hero': {
      const ov = b.overlay || 'dark';
      const stats = (b.stats || []).map((st, i) => `<div ${rv(i + 3, 'up')}><div class="v">${esc(st.value)}</div><div class="l">${esc(st.label)}</div></div>`).join('');
      const ph = `<div class="ph">${b.image && b.image.src ? `<img src="${esc(b.image.src)}" alt="${esc(b.image.alt || '')}">` : `<div class="art">${artSvg(seed, 1920, 1080)}</div>`}</div>`;
      return { noHead: true, stageClass: 'a-hero-stage', html: `<div class="a-hero ov-${ov} ${b.align === 'center' ? 'center' : ''}">${ph}<div class="tx">${s.eyebrow ? `<div class="eyebrow" ${rv(0)}>${esc(s.eyebrow)}</div>` : ''}<h1 ${rv(1, '', 90, 250)}>${rich(b.heading || s.title)}</h1>${b.caption || s.sub ? `<p class="cap" ${rv(2)}>${rich(b.caption || s.sub)}</p>` : ''}${stats ? `<div class="stats">${stats}</div>` : ''}</div><div class="foot-ov"><span>${esc(b.image?.caption || '')}</span><span>${pad(ctx.n)} / ${pad(ctx.total)}</span></div></div>`, useTopbar: false };
    }
    case 'annotated-image': {
      const hs = b.hotspots.map((h, i) => `<div class="hs ${h.x > 60 ? 'flip' : ''} ${fclass(h.accent || cycleAccent(i))}" style="left:${h.x}%;top:${h.y}%" ${rv(i + 2, 'scale', 160)}><i>${i + 1}</i><span>${esc(h.label)}</span></div>`).join('');
      const list = b.hotspots.map((h, i) => `<li class="${fclass(h.accent || cycleAccent(i))}" ${rv(i + 2, 'right', 160)}><span class="num">${i + 1}</span><div><h4>${rich(h.label)}</h4>${h.desc ? `<p>${rich(h.desc)}</p>` : ''}</div></li>`).join('');
      const img = b.image && b.image.src ? `<figure class="img" ${rv(0, 'scale', 0, 150)}><img src="${esc(b.image.src)}" alt="${esc(b.image.alt || '')}">${hs}${b.image.caption ? `<div class="cap">${esc(b.image.caption)}</div>` : ''}</figure>` : `<div class="art img" ${rv(0, 'scale', 0, 150)}>${artSvg(seed, 1200, 800, b.image?.caption || b.image?.alt)}${hs}</div>`;
      return { html: `<div class="a-annot ${b.side === 'left' ? 'left' : ''}">${img}<div class="list">${b.intro ? `<p class="intro">${rich(b.intro)}</p>` : ''}<ul>${list}</ul></div></div>` };
    }
    case 'mockup': {
      const aside = b.aside ? `<div class="side"><h3 ${rv(1, 'right')}>${rich(b.aside.title)}</h3><ul>${b.aside.points.map((p, i) => `<li ${rv(i + 2, 'right', 100)}><span class="num">${i + 1}</span><span>${rich(p)}</span></li>`).join('')}</ul>${b.aside.tip ? `<div class="tip" ${rv(b.aside.points.length + 2, 'right')}>${ic('lightbulb')} ${rich(b.aside.tip)}</div>` : ''}</div>` : '';
      return { html: `<div class="a-mock ${b.mock.app === 'phone' ? 'phone' : ''} ${aside ? '' : 'full'}"><div ${rv(0, 'scale', 0, 150)} style="min-height:0;display:flex;flex-direction:column">${mockDevice(b.mock, ctx)}</div>${aside}</div>` };
    }
    case 'pricing': {
      const n = b.plans.length;
      const plans = b.plans.map((p, i) => `<div class="pl ${p.highlight ? 'hl' : ''} ${fclass(p.accent || cycleAccent(i))}" ${rv(i, 'up', 110)}>${p.badge ? `<span class="bd">${esc(p.badge)}</span>` : ''}<h3>${esc(p.name)}</h3><div class="pr">${esc(p.price)}${p.period ? `<small>${esc(p.period)}</small>` : ''}</div>${p.desc ? `<p class="ds">${rich(p.desc)}</p>` : ''}<ul>${p.features.map(f => `<li>${ic('check')}<span>${rich(f)}</span></li>`).join('')}</ul></div>`).join('');
      return { html: `<div class="a-pricing" style="--n:${n}">${plans}</div>` };
    }
    case 'team': {
      const n = b.members.length;
      const mb = b.members.map((m, i) => `<div class="mb ${fclass(cycleAccent(i))}" ${rv(i, 'up', 110)}>${m.image && m.image.src ? `<figure class="img"><img src="${esc(m.image.src)}" alt="${esc(m.name)}"></figure>` : `<span class="avatar">${esc(m.initial || m.name.slice(0, 1))}</span>`}<h3>${esc(m.name)}</h3><div class="role">${esc(m.role)}</div>${m.desc ? `<p>${rich(m.desc)}</p>` : ''}${m.tags && m.tags.length ? `<div class="tags">${m.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}</div>`).join('');
      return { html: `<div class="a-team" style="--n:${Math.min(n, 5)}">${mb}</div>` };
    }
    case 'checklist': {
      const li = (items: { text: string; done?: boolean; note?: string }[], off = 0) => `<ul>${items.map((it, i) => `<li class="${it.done ? 'done' : ''}" ${rv(i + off, 'right', 80)}><span class="bx">${it.done ? ic('check') : ''}</span><div>${rich(it.text)}${it.note ? `<small>${rich(it.note)}</small>` : ''}</div></li>`).join('')}</ul>`;
      const groups = b.groups && b.groups.length ? `<div class="groups">${b.groups.map((g, gi) => `<div class="grp ${fclass(cycleAccent(gi))}"><h3 ${rv(gi * 4, 'fade')}>${rich(g.title)}</h3>${li(g.items, gi * 4 + 1)}</div>`).join('')}</div>` : li(b.items || []);
      const asideHtml = !b.aside ? '' : typeof b.aside === 'string' ? `<div class="as" ${rv(6, 'right')}>${rich(b.aside)}</div>`
        : `<div class="as" ${rv(6, 'right')}>${b.aside.title ? `<h3>${rich(b.aside.title)}</h3>` : ''}${b.aside.text ? `<p>${rich(b.aside.text)}</p>` : ''}${b.aside.points && b.aside.points.length ? `<ul>${b.aside.points.map((p, i) => `<li><span class="num">${i + 1}</span><span>${rich(p)}</span></li>`).join('')}</ul>` : ''}</div>`;
      return { html: `<div class="a-check ${b.aside ? 'aside' : ''} ${b.groups && b.groups.length === 2 ? 'g2' : ''}">${groups}${asideHtml}</div>` };
    }
    case 'summary': {
      const n = b.takeaways.length;
      const tk = b.takeaways.map((t, i) => `<div class="card lift ${fclass(cycleAccent(i))}" ${rv(i, 'up', 120)}>${t.icon ? `<span class="ic-sq lg">${ic(t.icon)}</span>` : `<span class="num">${i + 1}</span>`}<h3>${rich(t.title)}</h3>${t.desc ? `<p>${rich(t.desc)}</p>` : ''}</div>`).join('');
      return { html: `<div class="a-summary"><div class="tk" style="--n:${n}">${tk}</div>${b.cta ? `<div class="cta" ${rv(n + 1, 'up')}>${ic('arrow-right')}<span>${rich(b.cta)}</span></div>` : ''}${b.nextTitle ? `<div class="nx">${ic('chevrons-right')} 다음: ${esc(b.nextTitle)}</div>` : ''}</div>` };
    }
    case 'closing': {
      const c = b.contact || {};
      const lines = [c.email ? `<li>${ic('mail')}${esc(c.email)}</li>` : '', c.site ? `<li>${ic('globe')}${esc(c.site)}</li>` : '', c.phone ? `<li>${ic('phone')}${esc(c.phone)}</li>` : ''].join('');
      const card = (c.name || c.email || c.site || b.qr) ? `<div class="ct" ${rv(3, 'right')}>${c.name ? `<div class="nm">${esc(c.name)}</div>` : ''}${c.org ? `<div class="og">${esc(c.org)}</div>` : ''}${lines ? `<ul>${lines}</ul>` : ''}${b.qr ? `<div class="qr">${ctx.qr ? ctx.qr(b.qr.url) : qrPlaceholder(b.qr.url, b.qr.label).replace(/<div class="qr">|<\/div>$/g, '')}<div><div class="k-eyebrow">SCAN</div><div class="k-title" style="margin-top:6px">${esc(b.qr.label || '')}</div><div class="k-small">${esc(b.qr.url)}</div></div></div>` : ''}</div>` : '';
      const kw = (b.keywords || []).map((k, i) => `<span class="chip ${fclass(cycleAccent(i))}" ${rv(i + 4, 'up', 60)}>${esc(k)}</span>`).join('');
      return { noHead: true, html: `<div class="amb"><i class="orb a"></i><i class="orb b"></i></div><div class="a-closing ${card ? '' : 'solo'}" ${card ? '' : 'style="grid-template-columns:1fr"'}><div><h2 ${rv(1, '', 90, 200)}>${rich(b.heading || s.title)}</h2>${b.sub || s.sub ? `<p class="sub" ${rv(2)}>${rich(b.sub || s.sub)}</p>` : ''}${kw ? `<div class="kw">${kw}</div>` : ''}${b.thanks ? `<div class="thanks" ${rv(8)}>${esc(b.thanks)}</div>` : ''}</div>${card}</div>` };
    }
    case 'custom': {
      return { html: `<div class="a-custom">${b.html}</div>`, css: b.css, js: b.js };
    }
  }
  ctx.warnings.push(`unknown archetype on slide ${ctx.n}`);
  return { html: `<div class="callout">알 수 없는 슬라이드 유형</div>` };
}
