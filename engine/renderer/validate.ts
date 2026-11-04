import type { DeckSpec, Slide, Body } from './types.ts';

const CAPS: Record<string, [string, number][]> = {
  'kpi-grid': [['items', 6]], 'cards': [['items', 8]], 'timeline': [['items', 8]], 'process': [['steps', 6]], 'bullets-visual': [['bullets', 5]],
  'annotated-image': [['hotspots', 6]], 'pricing': [['plans', 4]], 'team': [['members', 6]], 'summary': [['takeaways', 4]], 'agenda': [['items', 10]],
  'checklist': [['items', 8]], 'comparison': [['columns', 3], ['rows', 7]], 'table': [['rows', 12], ['columns', 7]], 'question': [['options', 5]], 'matrix': [['points', 8], ['quadrants', 4]], 'diagram': [['nodes', 8]], 'big-number': [['compare', 3]], 'cover': [['tags', 6], ['agenda', 8], ['stats', 3]], 'closing': [['keywords', 8]], 'section': [['bullets', 4]],
};

function clampArr(obj: any, key: string, max: number, warnings: string[], where: string) {
  if (Array.isArray(obj[key]) && obj[key].length > max) { warnings.push(`${where}: ${key} ${obj[key].length} → ${max}개로 축약`); obj[key] = obj[key].slice(0, max); }
}

export function validateSpec(input: DeckSpec): { spec: DeckSpec; warnings: string[] } {
  const warnings: string[] = [];
  const spec: DeckSpec = JSON.parse(JSON.stringify(input || {}));
  spec.meta = spec.meta || { title: '제목 없음' };
  if (!spec.meta.title) spec.meta.title = '제목 없음';
  spec.sections = Array.isArray(spec.sections) ? spec.sections : [];
  spec.slides = Array.isArray(spec.slides) ? spec.slides.filter(Boolean) : [];
  if (!spec.slides.length) { spec.slides.push({ title: spec.meta.title, body: { type: 'cover' } }); warnings.push('슬라이드가 없어 표지 1장을 생성'); }
  spec.slides.forEach((s: Slide, i) => {
    const where = `slide ${i + 1}`;
    if (!s.title) { s.title = `슬라이드 ${i + 1}`; warnings.push(`${where}: 제목 없음`); }
    if (!s.body || typeof s.body !== 'object' || !(s.body as any).type) { s.body = { type: 'bullets-visual', bullets: [{ title: s.sub || s.title }] } as Body; warnings.push(`${where}: body 없음 → bullets-visual`); }
    const b: any = s.body;
    (CAPS[b.type] || []).forEach(([k, max]) => clampArr(b, k, max, warnings, where));
    // per-type normalization
    if (b.type === 'table') { b.columns = (b.columns || []).map(String); b.rows = (b.rows || []).map((r: any[]) => (Array.isArray(r) ? r : [String(r)]).map(x => String(x ?? ''))); const cols = b.columns.length; b.rows.forEach((r: string[]) => { while (r.length < cols) r.push(''); if (r.length > cols) r.length = cols; }); }
    if (b.type === 'comparison') { const cols = (b.columns || []).length; b.rows = (b.rows || []).map((r: any) => ({ label: String(r.label ?? ''), cells: (r.cells || []).map((c: any) => String(c ?? '')) })); b.rows.forEach((r: any) => { while (r.cells.length < cols) r.cells.push(''); if (r.cells.length > cols) r.cells.length = cols; }); }
    if (b.type === 'chart') { const c = b.chart || {}; c.labels = (c.labels || []).map(String); c.series = (c.series || []).filter((x: any) => x && Array.isArray(x.values)); c.series.forEach((x: any) => { x.values = x.values.map((v: any) => Number(v) || 0); while (x.values.length < c.labels.length) x.values.push(0); }); if (!c.series.length) { c.series = [{ name: '값', values: c.labels.map(() => 0) }]; warnings.push(`${where}: 차트 시리즈 없음`); } if (!['bar', 'hbar', 'line', 'area', 'donut', 'stacked', 'pie'].includes(c.kind)) c.kind = 'bar'; if (c.labels.length > 12) { warnings.push(`${where}: 차트 라벨 ${c.labels.length}개 → 12개`); c.labels = c.labels.slice(0, 12); c.series.forEach((x: any) => x.values = x.values.slice(0, 12)); } b.chart = c; }
    if (b.type === 'kpi-grid') b.items = (b.items || []).map((k: any) => ({ ...k, value: typeof k.value === 'string' && /^-?[\d,]+(\.\d+)?$/.test(k.value.trim()) ? Number(k.value.replace(/,/g, '')) : k.value }));
    if (b.type === 'process' && (!b.steps || b.steps.length < 2)) warnings.push(`${where}: 프로세스 단계가 2개 미만`);
    if (b.type === 'diagram') { b.nodes = (b.nodes || []).map((n: any, j: number) => ({ ...n, id: String(n.id ?? j + 1), label: String(n.label ?? '') })); const ids = new Set(b.nodes.map((n: any) => n.id)); b.edges = (b.edges || []).filter((e: any) => ids.has(String(e.from)) && ids.has(String(e.to))).map((e: any) => ({ ...e, from: String(e.from), to: String(e.to) })); if (!['flow', 'hub', 'layers', 'cycle', 'funnel'].includes(b.kind)) b.kind = 'flow'; }
    if (b.type === 'matrix') { while ((b.quadrants || (b.quadrants = [])).length < 4) b.quadrants.push({ title: '' }); (b.points || []).forEach((p: any) => { p.x = Math.max(2, Math.min(98, Number(p.x) || 50)); p.y = Math.max(2, Math.min(98, Number(p.y) || 50)); }); }
    if (b.type === 'annotated-image') (b.hotspots || []).forEach((h: any) => { h.x = Math.max(3, Math.min(97, Number(h.x) || 50)); h.y = Math.max(3, Math.min(97, Number(h.y) || 50)); });
    if (b.type === 'mockup') { b.mock = b.mock || { app: 'chat', steps: [] }; if (!['chat', 'browser', 'phone', 'dashboard'].includes(b.mock.app)) b.mock.app = 'chat'; b.mock.steps = (b.mock.steps || []).slice(0, 8); }
    if (b.type === 'custom' && typeof b.html !== 'string') { b.html = '<div class="callout">custom 슬라이드 내용 없음</div>'; warnings.push(`${where}: custom html 없음`); }
    if (s.notes && typeof s.notes === 'string') s.notes = { s: s.notes as unknown as string };
    if (s.notes && s.notes.t != null) s.notes.t = Math.max(5, Math.min(900, Number(s.notes.t) || 0));
  });
  return { spec, warnings };
}
