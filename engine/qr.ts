/* QR SVG via qrcode-generator (pure JS, works in Node and Deno via npm:) */
// @ts-ignore
import qrcode from 'qrcode-generator';
export function qrSvg(text: string): string {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(); const cell = 4; const size = n * cell;
  let path = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c * cell} ${r * cell}h${cell}v${cell}h-${cell}z`;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#0A1633"/></svg>`;
}
