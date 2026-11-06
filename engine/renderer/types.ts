/* Qpresen Deck Engine — Deck Spec types (single source of truth for plan → fill → render) */

export type ThemeName = 'signature-white' | 'editorial-navy' | 'vivid-photo' | 'dark-stage';
export type Accent = 'brand' | 'azure' | 'violet' | 'teal' | 'amber' | 'rose' | 'navy' | 'ok' | 'danger';
export type Purpose = 'lecture' | 'ir' | 'report' | 'seminar' | 'proposal' | 'product' | 'keynote';

export interface DeckMeta {
  title: string;            // 덱 제목
  subtitle?: string;        // 부제
  event?: string;           // 행사명 · 날짜 · 장소 (푸터/표지 메타)
  date?: string;
  place?: string;
  presenter?: { name: string; org?: string; role?: string; initial?: string };
  audience?: string;
  purpose?: Purpose;
  lang?: 'ko' | 'en' | 'ja' | 'zh';
  theme?: ThemeName;
  brand?: string;           // optional brand hex (#RRGGBB) → overrides --brand
  stops?: [string, string, string]; // optional brand gradient stops (--q1/--q2/--q3, --qg) chosen by the art director
  footer?: string;          // footer brand line (default: title · presenter · date)
  durationMin?: number;
  logo?: string;            // data URI or URL (shown on cover/top bar)
  quality?: 'standard' | 'premium' | 'studio';
  fx?: ('aurora' | 'rail' | 'tilt' | '3d-in')[];   // deck-wide effects (html classes fx-*)
  direction?: DeckDirection; // premium/studio art direction (deck-level design layer)
}

/** Art direction produced once per deck before the slides are designed (premium/studio). */
export interface DeckDirection {
  mood?: string;              // 한 줄 무드
  concept?: string;           // 디자인 컨셉 설명(장 설계자에게 전달)
  motifs?: string[];          // 반복 모티프
  palette?: { sectionAccents?: Record<string, Accent>; notes?: string; stops?: [string, string, string]; brand?: string };
  photoStrategy?: 'none' | 'backdrops' | 'side' | 'mixed';
  imageBudget?: number;
  motion?: string;            // 모션 언어
  fx?: ('aurora' | 'rail' | 'tilt' | '3d-in')[];
  deckCss?: string;           // injected into every slide after the base CSS
  deckJs?: string;            // injected into every slide after the base JS
  helpers?: string[];         // class names deckCss defines (for the slide designer)
  scenes?: Record<string, string>; // default 3D scene per structural kind (cover/section/closing) or slide id: terrain | network | cubes | fireflies
}

export interface Section { id: string; label: string; numeral?: string; accent?: Accent }

export interface Notes { t?: number; s: string }

export interface ImageRef { src?: string; prompt?: string; alt?: string; caption?: string; fit?: 'cover' | 'contain' }

export interface ChartSpec {
  kind: 'bar' | 'hbar' | 'line' | 'area' | 'donut' | 'stacked' | 'pie';
  title?: string;
  unit?: string;
  labels: string[];
  series: { name: string; values: number[]; accent?: Accent }[];
  highlight?: number;        // index of label to emphasize
  yMax?: number;
  showValues?: boolean;
  annotations?: { x: number; text: string }[];
}

export type Visual =
  | { kind: 'image'; image: ImageRef }
  | { kind: 'svg'; html: string; caption?: string }
  | { kind: 'chart'; chart: ChartSpec }
  | { kind: 'stat'; value: string | number; unit?: string; label: string; sub?: string }
  | { kind: 'icons'; items: { icon: string; label: string; accent?: Accent }[] }
  | { kind: 'mockup'; mock: MockSpec }
  | { kind: 'art'; seed?: string; label?: string };

export interface MockSpec {
  app: 'chat' | 'browser' | 'phone' | 'dashboard';
  title?: string;
  url?: string;
  steps: { type: 'type' | 'reply' | 'click' | 'show' | 'note'; text: string; at?: number }[];
}

export interface BulletItem { icon?: string; title: string; desc?: string; accent?: Accent }
export interface CardItem { icon?: string; tag?: string; title: string; desc?: string; points?: string[]; accent?: Accent; value?: string; label?: string }
export interface KpiItem { value: number | string; unit?: string; prefix?: string; label: string; sub?: string; delta?: { dir: 'up' | 'down' | 'flat'; text: string }; bar?: number; icon?: string; accent?: Accent; decimals?: number }
export interface TimelineItem { date: string; title: string; desc?: string; accent?: Accent; icon?: string; tag?: string }
export interface ProcessStep { title: string; desc?: string; icon?: string; accent?: Accent }
export interface Hotspot { x: number; y: number; label: string; desc?: string; accent?: Accent }
export interface DiagramNode { id: string; label: string; desc?: string; icon?: string; accent?: Accent }
export interface DiagramEdge { from: string; to: string; label?: string }

export type Body =
  | { type: 'cover'; kicker?: string; tagline?: string; meta?: { icon?: string; text: string }[]; tags?: string[]; agenda?: string[]; visual?: 'particles' | 'orbs' | 'photo' | 'art' | 'none'; image?: ImageRef; qr?: { url: string; label?: string }; stats?: { value: string; label: string }[] }
  | { type: 'section'; numeral?: string; label?: string; bullets?: string[]; dark?: boolean; image?: ImageRef; kicker?: string }
  | { type: 'agenda'; items: { numeral?: string; label: string; desc?: string; minutes?: number; pages?: string }[] }
  | { type: 'question'; question: string; hint?: string; options?: string[]; image?: ImageRef }
  | { type: 'kpi-grid'; items: KpiItem[]; footer?: string; columns?: 2 | 3 | 4 | 5 | 6 }
  | { type: 'big-number'; value: number | string; unit?: string; prefix?: string; label: string; context?: string; compare?: { label: string; value: string }[]; decimals?: number }
  | { type: 'bullets-visual'; bullets: BulletItem[]; visual?: Visual; visualSide?: 'left' | 'right'; callout?: string }
  | { type: 'cards'; columns?: 2 | 3 | 4; items: CardItem[]; style?: 'default' | 'tint' | 'edge' | 'solid' | 'glass' | 'number'; footer?: string }
  | { type: 'comparison'; columns: { label: string; accent?: Accent; highlight?: boolean; sub?: string }[]; rows: { label: string; cells: string[] }[]; verdict?: string }
  | { type: 'timeline'; orientation?: 'h' | 'v'; items: TimelineItem[]; nowIndex?: number; footer?: string }
  | { type: 'process'; steps: ProcessStep[]; style?: 'arrows' | 'chevrons' | 'circles'; result?: string }
  | { type: 'chart'; chart: ChartSpec; insight?: { title: string; text: string }; callouts?: { label: string; value: string; desc?: string; accent?: Accent }[]; layout?: 'chart-left' | 'chart-right' | 'chart-full' }
  | { type: 'table'; columns: string[]; rows: string[][]; highlightRow?: number; highlightCol?: number; caption?: string; dense?: boolean; align?: ('l' | 'c' | 'r')[]; aside?: { title: string; points: string[] } }
  | { type: 'matrix'; xLabel: string; yLabel: string; quadrants: { title: string; desc?: string; accent?: Accent }[]; points?: { label: string; x: number; y: number; size?: number; accent?: Accent }[]; xLow?: string; xHigh?: string; yLow?: string; yHigh?: string }
  | { type: 'diagram'; kind: 'flow' | 'hub' | 'layers' | 'cycle' | 'funnel'; nodes: DiagramNode[]; edges?: DiagramEdge[]; center?: { label: string; desc?: string; icon?: string }; aside?: { title: string; points: string[] } }
  | { type: 'quote'; quote: string; by?: string; role?: string; context?: string; image?: ImageRef }
  | { type: 'image-hero'; image: ImageRef; overlay?: 'dark' | 'light' | 'gradient'; heading?: string; caption?: string; stats?: { value: string; label: string }[]; align?: 'left' | 'center' }
  | { type: 'annotated-image'; image: ImageRef; hotspots: Hotspot[]; side?: 'left' | 'right'; intro?: string }
  | { type: 'mockup'; mock: MockSpec; aside?: { title: string; points: string[]; tip?: string } }
  | { type: 'pricing'; plans: { name: string; price: string; period?: string; desc?: string; features: string[]; highlight?: boolean; badge?: string; accent?: Accent }[] }
  | { type: 'team'; members: { name: string; role: string; desc?: string; initial?: string; image?: ImageRef; tags?: string[] }[] }
  | { type: 'checklist'; items: { text: string; done?: boolean; note?: string }[]; groups?: { title: string; items: { text: string; done?: boolean; note?: string }[] }[]; aside?: string | { title?: string; points?: string[]; text?: string } }
  | { type: 'summary'; takeaways: { title: string; desc?: string; icon?: string }[]; cta?: string; nextTitle?: string }
  | { type: 'closing'; heading: string; sub?: string; contact?: { name?: string; org?: string; email?: string; site?: string; phone?: string }; qr?: { url: string; label?: string }; thanks?: string; keywords?: string[] }
  | { type: 'custom'; html: string; css?: string; js?: string; description?: string; bare?: boolean; rich?: boolean; kind?: string; signature?: string; noHead?: boolean; cine?: boolean; scene?: string; sceneOpts?: Record<string, unknown> };

export type ArchetypeName = Body['type'];

export interface Slide {
  id?: string;
  section?: string;          // Section.id
  eyebrow?: string;          // overrides auto "Ⅱ · 섹션명"
  title: string;             // rich: **강조** or <em>, \n → <br>
  sub?: string;
  accent?: Accent;
  notes?: Notes;
  source?: string;
  body: Body;
  motion?: 'auto' | 'none';
  dark?: boolean;            // force dark surface for this slide
}

export interface DeckSpec {
  meta: DeckMeta;
  sections?: Section[];
  slides: Slide[];
}

export interface RenderOptions {
  fontBase64?: string;       // woff2 base64 (Pretendard subset). If omitted, system fonts.
  thumbs?: string[];         // optional per-slide thumbnail data URIs for the overview grid
  embedFontInParts?: boolean; // for standalone slide files
  partsOnly?: boolean;
}

export interface RenderResult {
  html: string;              // single-file deck (player + all slides)
  parts: string[];           // each slide as standalone HTML document (font placeholder resolved if embedFontInParts)
  titles: string[];
  notes: Notes[];
  sections: [string, number, number][];
  warnings: string[];
}
