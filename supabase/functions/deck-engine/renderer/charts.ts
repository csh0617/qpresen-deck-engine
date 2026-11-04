import type { ChartSpec, Accent } from './types.ts';
import { esc, fmtNum } from './util.ts';

const PALETTE: Accent[] = ['brand', 'navy', 'amber', 'violet', 'rose', 'azure', 'teal'];
let AVOID: Accent | undefined;
function seriesColor(i: number, accent?: Accent): string {
  if (accent && !(i > 0 && accent === AVOID)) return `var(--${accent})`;
  if (i === 0) return 'var(--f)';
  const list = PALETTE.filter(a => a !== AVOID && a !== 'brand');
  return `var(--${list[(i - 1) % list.length]})`;
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 6 ? 6 : n <= 8 ? 8 : 10;
  return m * p;
}
function fmtV(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e8) return fmtNum(v / 1e8, abs / 1e8 >= 10 ? 0 : 1) + '억';
  if (abs >= 1e4 && abs < 1e8 && Number.isInteger(v) && v % 1e4 === 0) return fmtNum(v / 1e4, 0) + '만';
  if (abs >= 1000) return fmtNum(v, 0);
  if (Number.isInteger(v)) return String(v);
  return fmtNum(v, abs < 10 ? 1 : 0);
}

export function legendHtml(c: ChartSpec): string {
  if (c.series.length < 2) return '';
  return `<div class="legend">${c.series.map((s, i) => `<span><i style="background:${seriesColor(i, s.accent)}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}

export function chartSvg(c: ChartSpec, opts: { w?: number; h?: number; delay?: number; accent?: Accent } = {}): string {
  const W = opts.w || 1000, H = opts.h || 560, d0 = opts.delay || 300; AVOID = opts.accent;
  const kind = c.kind;
  if (kind === 'donut' || kind === 'pie') return donutSvg(c, W, H, d0);
  if (kind === 'hbar') return hbarSvg(c, W, H, d0);
  const padL = 72, padR = 24, padT = 36, padB = 56;
  const pw = W - padL - padR, ph = H - padT - padB;
  const n = c.labels.length;
  const stacked = kind === 'stacked';
  let maxV = 0;
  if (stacked) { for (let i = 0; i < n; i++) { let t = 0; c.series.forEach(s => t += (s.values[i] || 0)); maxV = Math.max(maxV, t); } }
  else c.series.forEach(s => s.values.forEach(v => maxV = Math.max(maxV, v || 0)));
  const yMax = c.yMax || niceMax(maxV * 1.12);
  const y = (v: number) => padT + ph - (v / yMax) * ph;
  const xc = (i: number) => padL + (i + 0.5) * (pw / n);
  let out = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(c.title || 'chart')}">`;
  // grid
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const v = yMax * t / ticks; const yy = y(v);
    out += `<line class="${t === 0 ? 'ax' : 'gl'}" x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}"/>`;
    out += `<text x="${padL - 12}" y="${(yy + 5).toFixed(1)}" text-anchor="end">${fmtV(v)}</text>`;
  }
  if (c.unit) out += `<text x="${padL - 12}" y="${padT - 14}" text-anchor="end" style="font-size:13px">(${esc(c.unit)})</text>`;
  // x labels
  c.labels.forEach((l, i) => { out += `<text class="xl${c.highlight === i ? ' hl' : ''}" x="${xc(i).toFixed(1)}" y="${H - padB + 30}" text-anchor="middle">${esc(l)}</text>`; });
  const showValues = c.showValues !== false && n * c.series.length <= 16;
  if (kind === 'bar' || stacked) {
    const groupW = pw / n; const sN = stacked ? 1 : c.series.length;
    const bw = Math.min(stacked ? groupW * 0.5 : (groupW * 0.72) / sN, 110);
    for (let i = 0; i < n; i++) {
      let acc = 0;
      c.series.forEach((s, si) => {
        const v = s.values[i] || 0;
        const x0 = stacked ? xc(i) - bw / 2 : xc(i) - (bw * sN) / 2 + si * bw + bw * 0.08;
        const w = stacked ? bw : bw * 0.84;
        const y1 = stacked ? y(acc + v) : y(v); const hh = (stacked ? y(acc) : y(0)) - y1;
        const hl = c.highlight === i;
        const col = seriesColor(si, s.accent);
        out += `<rect class="${hl ? 'bar-hl' : ''}" x="${x0.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, hh).toFixed(1)}" rx="${Math.min(10, w / 4).toFixed(1)}" fill="${col}" opacity="${hl || c.highlight == null ? 1 : 0.55}" data-grow data-delay="${d0 + i * 90 + si * 40}" style="transform-box:fill-box;transform-origin:bottom"/>`;
        if (showValues && v) {
          const ty = stacked ? y1 + hh / 2 + 6 : y1 - 10;
          out += `<text class="vl" x="${(x0 + w / 2).toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" ${stacked ? 'fill="#fff"' : ''} data-reveal="fade" data-delay="${d0 + 500 + i * 90}">${fmtV(v)}${!stacked && c.unit && c.unit.length <= 2 ? esc(c.unit) : ''}</text>`;
        }
        acc += v;
      });
    }
  } else { // line / area
    c.series.forEach((s, si) => {
      const col = seriesColor(si, s.accent);
      const pts = s.values.map((v, i) => [xc(i), y(v || 0)] as [number, number]);
      const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      if (kind === 'area') {
        out += `<path d="${path} L${pts[pts.length - 1][0].toFixed(1)} ${y(0).toFixed(1)} L${pts[0][0].toFixed(1)} ${y(0).toFixed(1)} Z" fill="${col}" opacity=".12" data-reveal="fade" data-delay="${d0 + 600}"/>`;
      }
      out += `<path d="${path}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" data-draw data-delay="${d0 + si * 200}"/>`;
      pts.forEach((p, i) => {
        const hl = c.highlight === i;
        out += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${hl ? 9 : 6}" fill="var(--card)" stroke="${col}" stroke-width="${hl ? 5 : 3.5}" data-reveal="scale" data-delay="${d0 + 300 + i * 80 + si * 200}" style="transform-box:fill-box;transform-origin:center"/>`;
        if (showValues) out += `<text class="vl" x="${p[0].toFixed(1)}" y="${(p[1] - 16).toFixed(1)}" text-anchor="middle" data-reveal="fade" data-delay="${d0 + 500 + i * 80}">${fmtV(s.values[i] || 0)}</text>`;
      });
    });
  }
  (c.annotations || []).forEach(a => {
    const x = xc(a.x); out += `<line x1="${x.toFixed(1)}" y1="${padT}" x2="${x.toFixed(1)}" y2="${(padT + ph).toFixed(1)}" stroke="var(--f)" stroke-dasharray="4 6" opacity=".6"/><text x="${(x + 8).toFixed(1)}" y="${padT + 14}" style="fill:var(--f);font-weight:800;font-size:14px">${esc(a.text)}</text>`;
  });
  out += '</svg>';
  return out;
}

function hbarSvg(c: ChartSpec, W: number, H: number, d0: number): string {
  const n = c.labels.length; const padL = 220, padR = 90, padT = 20, padB = 20;
  const pw = W - padL - padR, ph = H - padT - padB;
  let maxV = 0; c.series.forEach(s => s.values.forEach(v => maxV = Math.max(maxV, v || 0)));
  const xMax = c.yMax || niceMax(maxV * 1.05);
  const rowH = ph / n; const sN = c.series.length; const bh = Math.min(rowH * 0.62 / sN, 46);
  let out = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i < n; i++) {
    const yc = padT + (i + 0.5) * rowH; const hl = c.highlight === i;
    out += `<text class="xl${hl ? ' hl' : ''}" x="${padL - 18}" y="${(yc + 6).toFixed(1)}" text-anchor="end">${esc(c.labels[i])}</text>`;
    c.series.forEach((s, si) => {
      const v = s.values[i] || 0; const w = (v / xMax) * pw; const y0 = yc - (bh * sN) / 2 + si * bh;
      out += `<rect x="${padL}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${(bh * 0.86).toFixed(1)}" rx="${(bh * 0.3).toFixed(1)}" fill="${seriesColor(si, s.accent)}" opacity="${hl || c.highlight == null ? 1 : 0.55}" data-grow="x" data-delay="${d0 + i * 90}" style="transform-box:fill-box;transform-origin:left"/>`;
      out += `<text class="vl" x="${(padL + w + 12).toFixed(1)}" y="${(y0 + bh * 0.43 + 6).toFixed(1)}" data-reveal="fade" data-delay="${d0 + 500 + i * 90}">${fmtV(v)}${c.unit && c.unit.length <= 2 ? esc(c.unit) : ''}</text>`;
    });
  }
  out += '</svg>';
  return out;
}

function donutSvg(c: ChartSpec, W: number, H: number, d0: number): string {
  const s = c.series[0]; const vals = s.values.map(v => v || 0); const total = vals.reduce((a, b) => a + b, 0) || 1;
  const cx = H / 2 + 20, cy = H / 2, R = Math.min(H / 2 - 30, 230), stroke = c.kind === 'pie' ? R * 0.9 : 54;
  const r = c.kind === 'pie' ? R / 2 : R - stroke / 2;
  const circ = 2 * Math.PI * r;
  let out = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--card-3)" stroke-width="${stroke}"/>`;
  let off = 0;
  vals.forEach((v, i) => {
    const frac = v / total; const len = frac * circ;
    const col = seriesColor(i, undefined); const hl = c.highlight == null || c.highlight === i;
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" opacity="${hl ? 1 : 0.4}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" data-reveal="fade" data-delay="${d0 + i * 160}"/>`;
    off += len;
  });
  const hi = c.highlight != null ? c.highlight : -1;
  const centerV = hi >= 0 ? Math.round(vals[hi] / total * 100) + '%' : fmtV(total);
  const centerL = hi >= 0 ? c.labels[hi] : (c.unit ? `합계 (${c.unit})` : '합계');
  if (c.kind !== 'pie') out += `<text class="dn-c" x="${cx}" y="${cy + 14}" text-anchor="middle" data-reveal="scale" data-delay="${d0 + 700}">${esc(centerV)}</text><text class="dn-l" x="${cx}" y="${cy + 48}" text-anchor="middle">${esc(centerL)}</text>`;
  // legend list on the right
  const lx = cx + R + 70; const rowH = Math.min(58, (H - 60) / vals.length);
  const ly0 = cy - (rowH * vals.length) / 2 + rowH / 2;
  vals.forEach((v, i) => {
    const yy = ly0 + i * rowH; const col = seriesColor(i, undefined);
    out += `<g data-reveal="left" data-delay="${d0 + 200 + i * 100}"><rect x="${lx}" y="${(yy - 9).toFixed(1)}" width="18" height="18" rx="5" fill="${col}"/><text x="${lx + 30}" y="${(yy + 6).toFixed(1)}" style="fill:var(--ink);font-size:18px;font-weight:700">${esc(c.labels[i])}</text><text x="${W - 30}" y="${(yy + 6).toFixed(1)}" text-anchor="end" style="fill:var(--ink);font-size:20px;font-weight:800">${fmtV(v)}${c.unit && c.unit.length <= 2 ? esc(c.unit) : ''} <tspan style="fill:var(--muted);font-size:15px;font-weight:600">${Math.round(v / total * 100)}%</tspan></text></g>`;
  });
  out += '</svg>';
  return out;
}
