/* Art direction (premium/studio): one deck-level design pass before the slides are designed — the way the reference decks
   were built (a bespoke effects/design layer per deck, then 20–60 slides on top of it). Produces a DeckDirection with a
   deck CSS/JS layer, per-section accents, motifs, photo strategy (which slides get an image and what), and motion language. */
import { chat } from './provider.ts';
import { parseRich, sanitizeRich } from './rich.ts';
import { HOUSE_STYLE } from './house.ts';
import type { Brief, Plan, PipelineOptions } from './pipeline.ts';
import type { DeckDirection, Accent } from '../renderer/types.ts';
import { sanitizeDeckCss } from '../renderer/util.ts';

export interface ImagePlan { id: string; role: 'backdrop' | 'side' | 'mock' | 'illustration'; prompt: string; ratio?: '16:9' | '1:1' | '3:4' | '4:3' }
export interface Direction extends DeckDirection { images?: ImagePlan[]; darkSections?: string[] }

export const DIRECT_SYSTEM = `당신은 Qpresen 스튜디오 덱의 아트 디렉터이자 프런트엔드 리드다. 장을 그리기 전에, 이 덱 하나만을 위한 시각 언어를 정한다 — 레퍼런스 덱들이 그랬듯 덱 전용 디자인 레이어(CSS/JS)를 먼저 만들고 그 위에 모든 장을 올린다.

[입력] 브리프, 덱 플랜(섹션·장별 제목·kind·signature), 테마 토큰.
[출력 — 정확히 세 구간]
===JSON===
{
 "mood": "한 줄 무드 — 이 덱의 주제에서 끌어낸 고유한 표현(형식 예시: '깊은 바다의 남청색 위에 형광 라임 포인트, 연구 노트의 정밀함')",
 "concept": "이 덱만의 시각 언어 3~5문장: 색의 역할, 형태(각진/둥근), 선·면의 비중, 사진의 쓰임, 숫자의 표현, 여백의 리듬",
 "motifs": ["반복 모티프 3~5개 — 주제에서 유래한 것(형식 예시: 등고선, 눈금자 라벨, 현미경 원형 프레임)"],
 "brandStops": ["#1F3B8A","#1E88D9","#06B6D4"],  // 이 덱의 브랜드 그라데이션 3색(hex, 어두운→밝은 또는 색상 전환). 제목 강조·대형 숫자·알약·레일에 쓰인다(--qg/--q1~3). 주제에서 끌어낸 선명한 채도의 색 — 브리프에 브랜드 색이 있으면 그 색을 첫 스톱으로
 "brand": "#1E5BD8",                              // 기본 강조색(--brand: 아이콘 원·링크·활성 상태). 밝은 무대에서 흰 글자가 읽히는 중간 명도
 "sectionAccents": {"s1":"azure","s2":"teal"},   // 섹션 id → brand|azure|violet|teal|amber|rose|navy|ok|danger (섹션마다 다르게, 전체 2~4색)
 "darkSections": [],                              // 시네마틱 다크 무대(.stage.cine)로 그릴 섹션 id (0~1개 권장; 임팩트 장면·클라이맥스)
 "scenes": {"cover":"terrain","section":"network","closing":"fireflies"}, // cine 표지·간지·마무리 위에 깔 3D 배경 장면(terrain 지형 파도 점 | network 별자리 | cubes | fireflies | none). 슬라이드 id로 개별 지정도 가능
 "photoStrategy": "none|backdrops|side|mixed",
 "images": [ {"id":"p03","role":"backdrop|side|mock|illustration","prompt":"장면 묘사(한국어, 구체적·사실적)","ratio":"16:9|1:1|3:4|4:3"} ],  // 최대 imageBudget 장. cover/section/image-hero 제외(엔진이 따로 생성)
 "motion": "모션 언어 2~3문장(등장 리듬·강조 방식·인터랙션 톤)",
 "fx": ["aurora","rail","tilt","3d-in"],         // 덱 전체 효과: aurora(배경 오로라 블롭) rail(푸터 섹션 레일) tilt(카드 3D 틸트) 3d-in(블러+회전 등장). 기본값 모두 켬 — 뺄 이유가 분명할 때만 제외
 "helpers": [ {"class":"d-…","purpose":"…"} ],  // 아래 CSS에서 정의한 helper 클래스 3~8개(이름·용도는 이 덱의 모티프에서)
 "typography": "제목·숫자·라벨 처리 메모 1~2문장",
 "notes": "장 설계자에게 주는 지시 2~4문장(해야 할 것/하지 말 것)"
}
===CSS===
(덱 레이어 CSS, 2~6KB. 모든 장에 베이스 CSS 다음에 삽입된다.
 - helper 클래스는 반드시 d- 접두사(.d-stamp .d-wire …). 토큰(var(--f) 등)으로 색을 쓴다.
 - 전역 미세 조정은 최대 5개 규칙(예: .head h1 em 그라데이션, .card 그림자 톤, .eyebrow 스타일). .stage/.stage.cine 의 background 는 덮어쓰지 말 것 — 질감은 .stage::after 같은 투명 오버레이로. cine에서는 --ink/--text가 밝은 글자색으로, --bg/--card가 어두운 색으로 반전된다(어두운 면은 var(--bg)·var(--card)로). 레이아웃을 깨는 전역 변경 금지(.body/.stage 크기·padding 변경 금지).
 - @import·url(http…)·웹폰트 금지. @keyframes 이름은 d- 접두사.)
===JS===
(선택. 덱 레이어 JS 0~3KB — 여러 장이 공유할 작은 유틸(예: window.DeckFX = { ripple(el), countUpAll() })을 deck:ready 이벤트 뒤에 노출. 없으면 비워 둔다. gsap 사용 가능(쓰면 자동 포함).)

[디자인 시스템 요약] 토큰: --ink --text --muted --faint --line --line-2 --bg --card --card-2 --card-3 --f(강조) --f-100 --f-50 --f-ink --q1 --q2 --q3(그라데이션 스톱) --qg(그라데이션) --r --r-sm --shadow --shadow-lg --ease --ease-out --ease-spring. 무대 1920×1080, 본문 박스 1728×~680.
컴포넌트: .card(.tint .solid .glass .lift .edge) .pill .tag .chip(어두운 바탕용) .icon-circle .ic-sq .bullets .bar .tbl .callout .band .kpi .mega .big .num-g .gtext, 포토 백드롭 .backdrop(.kb .fade-r .fade-b .soft .dim)+.credit, 시네마틱 .stage.cine, 앱 목업 키트 .app(.chrome .app-side .app-top .msg .composer .amenu), 가이드 클릭 엔진 [data-guide].

[하우스 스타일 — 반드시 이 안에서 변주한다]
${HOUSE_STYLE}

[원칙]
- 주제·청중·목적에 맞는 '하나의' 강한 아이디어를 하우스 스타일 위에 얹는다: 모티프·색 배분·장치의 선택으로 덱의 개성을 만들되, 밝고 화사하며 살아 움직이는 결은 유지한다. 회색 톤의 '얇은 선 리포트', 작은 색인 라벨, 어둡게 누른 사진 위의 작은 글자 같은 '무겁고 정적인' 방향은 어떤 주제에서도 택하지 않는다.
- 색: 브랜드 그라데이션을 주인공으로 두고 섹션별 강조색(2~4색)을 배분한다. 시네마틱 다크 섹션은 최대 1개(임팩트 장면).
- 사진: 메시지를 강화하는 장에만(현장·제품·사람·공간) — 밝은 무대에서는 측면 포토 카드 또는 흰색으로 페이드되는 백드롭. imageBudget 안에서.
- 모션: 덱 전체 효과(fx)는 기본 네 가지를 모두 켠다(aurora·rail·tilt·3d-in). 모션 언어는 '리듬·살아있는 요소·상호작용'을 구체적으로 지시한다(예: "숫자는 카운트업 후 팝, 단계 체인은 400ms 간격 연쇄, 각 장에 순환 강조 1개, 카드 호버 틸트").
- JSON은 compact하게, 설명 문장은 짧게. 구분선 밖에 다른 텍스트 금지.`;

function themeSummary(plan: Plan): string {
  const m = plan.meta; return `theme=${m.theme || 'signature-white'} purpose=${m.purpose || ''} audience=${m.audience || ''}`;
}

export async function directDeck(brief: Brief, plan: Plan, opt: PipelineOptions & { imageBudget?: number }): Promise<Direction> {
  const budget = opt.imageBudget ?? 6;
  const outline = plan.slides.map(s => ({ id: s.id, section: s.section, type: s.type, kind: (s as any).kind, title: s.title, signature: (s as any).signature }));
  const user = `[브리프]\n주제: ${brief.topic}\n목적: ${brief.purpose || ''} / 청중: ${brief.audience || ''} / 톤: ${brief.tone || ''}\n${brief.extra ? '추가 지시: ' + brief.extra + '\n' : ''}[테마] ${themeSummary(plan)}\n[섹션] ${JSON.stringify(plan.sections)}\n[장 개요] ${JSON.stringify(outline)}\n[이미지 예산] imageBudget=${budget} (cover/section/image-hero/closing 제외한 콘텐츠 장 중에서 고른다)\n\n위 덱의 아트 디렉션을 출력 형식대로 작성하라.`;
  const r = await chat(opt.provider, { system: DIRECT_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: 7000, temperature: 0.6, json: false, nudge: '(출력이 잘렸다. 같은 디렉션을 더 간결하게 — CSS는 핵심 helper만, 세 구간 모두 — 다시 출력하라.)' });
  opt.log?.(`[direct] ${r.model} ${r.ms}ms out=${r.usage?.output ?? '?'} cost=${r.usage?.cost ?? '?'}`);
  const text = r.text.replace(/===\s*JSON\s*===/, '===META===');
  const parsed = parseRich(text.includes('===HTML===') ? text : text.replace('===CSS===', '===HTML===\n(none)\n===CSS==='));
  const { parts } = sanitizeRich({ meta: parsed.meta, html: '', css: parsed.css, js: parsed.js });
  const m: any = parsed.meta || {};
  const accents = ['brand', 'azure', 'violet', 'teal', 'amber', 'rose', 'navy', 'ok', 'danger'];
  const sectionAccents: Record<string, Accent> = {};
  for (const [k, v] of Object.entries(m.sectionAccents || {})) if (accents.includes(String(v))) sectionAccents[k] = v as Accent;
  const fxAll = ['aurora', 'rail', 'tilt', '3d-in'];
  const dir: Direction = {
    mood: String(m.mood || ''), concept: String(m.concept || ''), motifs: Array.isArray(m.motifs) ? m.motifs.map(String).slice(0, 6) : [],
    palette: { sectionAccents, notes: m.typography ? String(m.typography) : undefined, stops: (Array.isArray(m.brandStops) && m.brandStops.length === 3 && m.brandStops.every((x: any) => /^#[0-9a-fA-F]{6}$/.test(String(x)))) ? m.brandStops.map(String) as [string, string, string] : undefined, brand: /^#[0-9a-fA-F]{6}$/.test(String(m.brand || '')) ? String(m.brand) : undefined },
    photoStrategy: ['none', 'backdrops', 'side', 'mixed'].includes(m.photoStrategy) ? m.photoStrategy : 'mixed',
    imageBudget: budget, motion: String(m.motion || ''),
    fx: (Array.isArray(m.fx) && m.fx.length ? m.fx.filter((f: string) => fxAll.includes(f)) : fxAll) as any,
    deckCss: sanitizeDeckCss(parts.css.slice(0, 12000)) || undefined, deckJs: parts.js.slice(0, 6000) || undefined,
    helpers: Array.isArray(m.helpers) ? m.helpers.map((h: any) => typeof h === 'string' ? h : `${h.class} — ${h.purpose || ''}`).slice(0, 10) : [],
    scenes: (m.scenes && typeof m.scenes === 'object') ? Object.fromEntries(Object.entries(m.scenes).filter(([, v]) => ['terrain', 'network', 'cubes', 'fireflies', 'none'].includes(String(v))).map(([k, v]) => [String(k), String(v)])) : undefined,
    images: (Array.isArray(m.images) ? m.images : []).filter((x: any) => x && x.id && x.prompt).slice(0, budget).map((x: any) => ({ id: String(x.id), role: ['backdrop', 'side', 'mock', 'illustration'].includes(x.role) ? x.role : 'side', prompt: String(x.prompt), ratio: ['16:9', '1:1', '3:4', '4:3'].includes(x.ratio) ? x.ratio : undefined })),
    darkSections: Array.isArray(m.darkSections) ? m.darkSections.map(String).slice(0, 2) : [],
  };
  (dir as any).notes = m.notes ? String(m.notes) : undefined;
  return dir;
}

/** Apply a direction to the plan/spec meta: section accents, fx flags, dark (cinematic) sections. */
export function applyDirection(plan: Plan, dir: Direction): void {
  if (dir.deckCss) dir.deckCss = sanitizeDeckCss(dir.deckCss);
  if (dir.palette?.stops) plan.meta.stops = dir.palette.stops;
  if (dir.palette?.brand && !plan.meta.brand) plan.meta.brand = dir.palette.brand;
  plan.meta.direction = dir; plan.meta.fx = dir.fx;
  const acc = dir.palette?.sectionAccents || {};
  (plan.sections || []).forEach(s => { if (acc[s.id]) s.accent = acc[s.id]; });
}

/** Compact art-direction block for the slide designer prompt. */
export function directionBlock(dir: Direction | undefined, slide: { id: string; section?: string | null; type?: string; kind?: string }): string {
  if (!dir) return '';
  const img = (dir.images || []).find(i => i.id === slide.id);
  const dark = slide.section && (dir.darkSections || []).includes(slide.section);
  const structural = /^(cover|section|closing)$/.test(String(slide.kind || slide.type || ''));
  if (!img && structural && dir.photoStrategy !== 'none') {
    const base = `\n[아트 디렉션 — 이 덱의 시각 언어, 반드시 따른다]\n무드: ${dir.mood}\n컨셉: ${dir.concept}\n모티프: ${(dir.motifs || []).join(' · ')}\n모션: ${dir.motion}\n${dir.palette?.stops ? '브랜드 그라데이션(--qg · --q1/--q2/--q3): ' + dir.palette.stops.join(' → ') + (dir.palette.brand ? ' · 강조색(--brand) ' + dir.palette.brand : '') + ' — 색은 토큰으로만 쓴다\n' : ''}${dir.palette?.notes ? '타이포: ' + dir.palette.notes + '\n' : ''}${(dir as any).notes ? '지시: ' + (dir as any).notes + '\n' : ''}덱 레이어 helper 클래스(이미 정의됨, 그대로 사용): ${(dir.helpers || []).join(' / ') || '(없음)'}\n`;
    return base + `이 장(${slide.kind || slide.type})은 무대 전체 구성이다: 주제를 상징하는 사진 백드롭을 넣어라 — <div class="backdrop kb"><img data-image="(한국어로 구체적인 장면 묘사)" alt="" style="--pos:50% 45%"><div class="credit">AI 생성 이미지</div></div> 를 첫 요소로. 기본 백드롭은 왼쪽이 바탕색으로 페이드되므로 글은 왼쪽, 사진은 오른쪽(글을 오른쪽에 두려면 .fade-r). 시네마틱 무대(cine)면 어두운 사진 위 흰 글자. 이미지는 엔진이 생성해 채운다.\n`;
  }
  return `\n[아트 디렉션 — 이 덱의 시각 언어, 반드시 따른다]\n무드: ${dir.mood}\n컨셉: ${dir.concept}\n모티프: ${(dir.motifs || []).join(' · ')}\n모션: ${dir.motion}\n${dir.palette?.stops ? '브랜드 그라데이션(--qg · --q1/--q2/--q3): ' + dir.palette.stops.join(' → ') + (dir.palette.brand ? ' · 강조색(--brand) ' + dir.palette.brand : '') + ' — 색은 토큰으로만 쓴다\n' : ''}${dir.palette?.notes ? '타이포: ' + dir.palette.notes + '\n' : ''}${(dir as any).notes ? '지시: ' + (dir as any).notes + '\n' : ''}덱 레이어 helper 클래스(이미 정의됨, 그대로 사용): ${(dir.helpers || []).join(' / ') || '(없음)'}\n${dark ? '이 장은 시네마틱 다크 무대다: 엔진이 .stage.cine 을 적용하므로 어두운 바탕 위 밝은 글자·유리 카드로 설계한다(토큰은 자동 반전).\n' : ''}${img ? `이 장은 사진을 쓴다 (role=${img.role}, ratio=${img.ratio || (img.role === 'backdrop' ? '16:9' : '4:3')}): 레이아웃에 <img data-image="${img.prompt.replace(/"/g, "'")}" alt="…" class="…"> 를 넣어라. backdrop이면 <div class="backdrop kb fade-r"><img data-image=… style="--pos:50% 40%"></div> 를 .body 첫 요소로 두고 글은 왼쪽에, side면 오른쪽 열(≥560px)에 .photo 카드로. 이미지는 엔진이 생성해 채운다(지금은 플레이스홀더).\n` : '이 장에는 사진을 넣지 않는다(다이어그램·SVG·숫자로 표현).\n'}`;
}
