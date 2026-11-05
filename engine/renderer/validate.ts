import type { DeckSpec, Slide, Body } from './types.ts';

const CAPS: Record<string, [string, number][]> = {
  'kpi-grid': [['items', 6]], 'cards': [['items', 8]], 'timeline': [['items', 8]], 'process': [['steps', 6]], 'bullets-visual': [['bullets', 5]],
  'annotated-image': [['hotspots', 6]], 'pricing': [['plans', 4]], 'team': [['members', 6]], 'summary': [['takeaways', 4]], 'agenda': [['items', 10]],
  'checklist': [['items', 8]], 'comparison': [['columns', 3], ['rows', 7]], 'table': [['rows', 12], ['columns', 7]], 'question': [['options', 5]], 'matrix': [['points', 8], ['quadrants', 4]], 'diagram': [['nodes', 8]], 'big-number': [['compare', 3]], 'cover': [['tags', 6], ['agenda', 8], ['stats', 3]], 'closing': [['keywords', 8]], 'section': [['bullets', 4]],
};

function clampArr(obj: any, key: string, max: number, warnings: string[], where: string) {
  if (Array.isArray(obj[key]) && obj[key].length > max) { warnings.push(`${where}: ${key} ${obj[key].length} → ${max}개로 축약`); obj[key] = obj[key].slice(0, max); }
}

const BODY_KEYS = ['kicker', 'tagline', 'meta', 'tags', 'agenda', 'visual', 'image', 'qr', 'stats', 'numeral', 'label', 'bullets', 'dark', 'items', 'question', 'hint', 'options', 'value', 'unit', 'prefix', 'context', 'compare', 'visualSide', 'callout', 'columns', 'style', 'footer', 'rows', 'verdict', 'orientation', 'nowIndex', 'steps', 'result', 'chart', 'insight', 'callouts', 'layout', 'highlightRow', 'highlightCol', 'caption', 'dense', 'align', 'aside', 'xLabel', 'yLabel', 'quadrants', 'points', 'kind', 'nodes', 'edges', 'center', 'quote', 'by', 'role', 'overlay', 'heading', 'hotspots', 'side', 'intro', 'mock', 'plans', 'members', 'groups', 'takeaways', 'cta', 'nextTitle', 'contact', 'keywords', 'thanks', 'html', 'css', 'js'];
const TYPE_ALIASES: Record<string, string> = { title: 'cover', titleslide: 'cover', kpi: 'kpi-grid', stats: 'kpi-grid', numbers: 'kpi-grid', bignumber: 'big-number', 'big_number': 'big-number', bullets: 'bullets-visual', 'bullet-visual': 'bullets-visual', list: 'bullets-visual', grid: 'cards', card: 'cards', features: 'cards', compare: 'comparison', versus: 'comparison', roadmap: 'timeline', history: 'timeline', steps: 'process', flow: 'process', graph: 'chart', data: 'chart', tbl: 'table', quadrant: 'matrix', architecture: 'diagram', structure: 'diagram', hero: 'image-hero', image: 'image-hero', photo: 'image-hero', annotated: 'annotated-image', demo: 'mockup', plan: 'pricing', people: 'team', todo: 'checklist', recap: 'summary', conclusion: 'summary', end: 'closing', thanks: 'closing', qa: 'closing', divider: 'section', chapter: 'section', toc: 'agenda', outline: 'agenda' };

/** Make LLM output resilient: move stray body keys into body, map type aliases, convert string lists into objects. */
function coerceSlide(s: any, warnings: string[], where: string) {
  if (!s.body || typeof s.body !== 'object') s.body = {};
  if (!s.body.type && s.type) { s.body.type = s.type; }
  if (s.body.type && TYPE_ALIASES[String(s.body.type).toLowerCase()]) s.body.type = TYPE_ALIASES[String(s.body.type).toLowerCase()];
  if (s.body.type) s.body.type = String(s.body.type).toLowerCase().replace(/_/g, '-');
  for (const k of BODY_KEYS) if (s[k] !== undefined && s.body[k] === undefined && !['title', 'sub', 'notes', 'source', 'section', 'id', 'accent', 'eyebrow', 'dark', 'motion'].includes(k)) { s.body[k] = s[k]; delete s[k]; }
  if (!s.title && s.body.heading && s.body.type !== 'closing' && s.body.type !== 'image-hero') s.title = s.body.heading;
  if (!s.title && s.heading) s.title = s.heading;
  if (s.subtitle && !s.sub) s.sub = s.subtitle;
  if (s.speakerNotes && !s.notes) s.notes = s.speakerNotes;
  if (typeof s.notes === 'string') s.notes = { s: s.notes };
  if (s.notes && s.notes.text && !s.notes.s) s.notes.s = s.notes.text;
  if (s.notes && s.notes.seconds && !s.notes.t) s.notes.t = s.notes.seconds;
  const b = s.body;
  const toObj = (arr: any[], key: string) => arr.map(x => (typeof x === 'string' ? { [key]: x } : x)).filter(Boolean);
  if (Array.isArray(b.bullets)) b.bullets = toObj(b.bullets, b.type === 'section' ? '_' : 'title').map((x: any) => (x._ !== undefined ? x._ : x));
  if (Array.isArray(b.items)) {
    if (b.type === 'cards' || b.type === 'agenda') b.items = toObj(b.items, b.type === 'agenda' ? 'label' : 'title');
    if (b.type === 'kpi-grid') b.items = b.items.map((x: any) => typeof x === 'string' ? { value: x, label: '' } : (x.title && !x.label ? { ...x, label: x.title } : x));
    if (b.type === 'timeline') b.items = b.items.map((x: any) => typeof x === 'string' ? { date: '', title: x } : ({ ...x, date: String(x.date ?? x.year ?? x.when ?? ''), title: x.title ?? x.label ?? '' }));
    if (b.type === 'checklist') { b.items = toObj(b.items, 'text'); if (Array.isArray(b.aside)) b.aside = { points: b.aside.map(String) }; if (b.aside && typeof b.aside === 'object' && !b.aside.points && !b.aside.title && !b.aside.text) b.aside = JSON.stringify(b.aside); }
  }
  if (Array.isArray(b.steps)) b.steps = toObj(b.steps, 'title');
  if (Array.isArray(b.takeaways)) b.takeaways = toObj(b.takeaways, 'title');
  if (Array.isArray(b.options)) b.options = b.options.map((o: any) => typeof o === 'string' ? o : (o.text || o.label || ''));
  if (Array.isArray(b.keywords)) b.keywords = b.keywords.map((o: any) => typeof o === 'string' ? o : (o.text || o.label || ''));
  if (Array.isArray(b.tags)) b.tags = b.tags.map((o: any) => typeof o === 'string' ? o : (o.text || o.label || ''));
  if (b.type === 'chart' && !b.chart && (b.labels || b.series)) { b.chart = { kind: b.kind || 'bar', labels: b.labels, series: b.series, unit: b.unit, title: b.chartTitle }; }
  if (b.type === 'chart' && b.chart) { const c = b.chart; if (!c.labels && c.categories) c.labels = c.categories; if (!c.series && c.data) c.series = Array.isArray(c.data) && typeof c.data[0] === 'number' ? [{ name: c.title || '값', values: c.data }] : c.data; if (Array.isArray(c.series)) c.series = c.series.map((x: any) => Array.isArray(x) ? { name: '값', values: x } : (x.values ? x : { name: x.name || '값', values: x.data || [] })); if (c.type && !c.kind) c.kind = c.type; }
  if (b.type === 'comparison' && Array.isArray(b.columns)) b.columns = b.columns.map((c: any) => typeof c === 'string' ? { label: c } : c);
  if (b.type === 'table' && Array.isArray(b.columns)) b.columns = b.columns.map((c: any) => typeof c === 'string' ? c : (c.label || c.title || ''));
  if (b.type === 'diagram' && Array.isArray(b.nodes)) b.nodes = b.nodes.map((n: any, i: number) => typeof n === 'string' ? { id: String(i + 1), label: n } : n);
  if (b.type === 'mockup' && !b.mock && b.steps) { b.mock = { app: b.app || 'chat', steps: b.steps }; delete b.steps; }
  if (b.type === 'quote' && !b.quote && b.text) b.quote = b.text;
  if (b.type === 'big-number' && b.value === undefined && b.number !== undefined) b.value = b.number;
  if (b.type === 'pricing' && Array.isArray(b.plans)) b.plans = b.plans.map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features.map((f: any) => typeof f === 'string' ? f : (f.text || '')) : [] }));
  void warnings; void where;
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
    coerceSlide(s as any, warnings, where);
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
    if (b.type === 'matrix') { while ((b.quadrants || (b.quadrants = [])).length < 4) b.quadrants.push({ title: '' }); (b.points || []).forEach((p: any) => { p.x = Math.max(6, Math.min(94, Number(p.x) || 50)); p.y = Math.max(7, Math.min(93, Number(p.y) || 50)); }); }
    if (b.type === 'annotated-image') (b.hotspots || []).forEach((h: any) => { h.x = Math.max(3, Math.min(97, Number(h.x) || 50)); h.y = Math.max(3, Math.min(97, Number(h.y) || 50)); });
    if (b.type === 'mockup') { b.mock = b.mock || { app: 'chat', steps: [] }; if (!['chat', 'browser', 'phone', 'dashboard'].includes(b.mock.app)) b.mock.app = 'chat'; b.mock.steps = (b.mock.steps || []).slice(0, 8); }
    if (b.type === 'custom' && typeof b.html !== 'string') { b.html = '<div class="callout">custom 슬라이드 내용 없음</div>'; warnings.push(`${where}: custom html 없음`); }
    if (s.notes && typeof s.notes === 'string') s.notes = { s: s.notes as unknown as string };
    if (s.notes && s.notes.t != null) s.notes.t = Math.max(5, Math.min(900, Number(s.notes.t) || 0));
  });
  return { spec, warnings };
}
