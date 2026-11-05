/* Premium ("rich") slides: a top-tier model designs each slide's body HTML/CSS/JS directly inside the Qpresen
   design system — the way the reference decks were hand-built — instead of filling an archetype template.
   Output is a `custom` body (bare: true) that the renderer drops straight into <section class="body">. */
import { chat, type ProviderConfig } from './provider.ts';
import { ICON_NAMES, rulesBlock } from './prompts.ts';
import { exemplarsFor } from '../knowledge/exemplars.ts';
import type { Brief, Plan, PlanSlide, PipelineOptions } from './pipeline.ts';
import type { Slide, DeckSpec } from '../renderer/types.ts';

export const RICH_KINDS = ['numbers', 'chart', 'compare', 'process', 'concept', 'demo', 'story', 'list'] as const;
export type RichKind = typeof RICH_KINDS[number];
/** Archetypes that stay on the deterministic renderer even in premium mode (structural pages). */
export const STRUCTURAL_TYPES = new Set(['cover', 'section', 'agenda', 'closing', 'quote', 'image-hero']);

export function isRichTarget(p: { type?: string }): boolean { return !STRUCTURAL_TYPES.has(String(p.type || '')); }

/** Map an archetype (from a standard plan) to a rich kind, when the plan has no explicit kind. */
export function kindForType(type?: string, hint?: string): RichKind {
  const t = String(type || ''); const h = String(hint || '');
  if (/kpi|big-number/.test(t)) return 'numbers';
  if (/chart|table/.test(t)) return 'chart';
  if (/comparison|matrix|pricing/.test(t)) return 'compare';
  if (/process|timeline|checklist/.test(t)) return 'process';
  if (/mockup|annotated/.test(t)) return 'demo';
  if (/diagram|bullets|summary|team|cards/.test(t)) return /사례|스토리|이야기/.test(h) ? 'story' : 'concept';
  return 'story';
}

export const DESIGN_SYSTEM = `[무대 규격]
- 엔진이 <main class="stage f-{accent}"> 안에 상단 바와 <header class="head">(eyebrow + h1 제목 + p.sub)를 그려 준다. 당신은 <section class="body"> 안에 들어갈 내용만 쓴다.
- .body 박스: 가로 1728px × 세로 약 680px (sub가 없으면 약 730px). 모든 내용은 이 박스 안에 들어가야 하고 넘치면 안 된다. 스크롤 금지, 박스 밖 절대 배치 금지.
- .body 기본값: display:flex; flex-direction:column; flex:1; min-height:0. CSS에서 .body{display:grid;grid-template-columns:…;grid-template-rows:minmax(0,1fr) auto;gap:…;min-height:0} 처럼 직접 바꿔 써도 된다(권장).
- 그리드/플렉스 자식에는 min-height:0; min-width:0 을 넣어 넘침을 막는다. 높이는 1fr / flex:1 로 나누고 고정 px 높이는 작은 요소에만 쓴다. 긴 텍스트 요소에는 overflow:hidden 을 걸어 둔다.
- 글자 크기 하한: 본문 17px, 캡션·태그 15px(절대 최소 14px). 카드 제목 22~28px, 큰 숫자 46~72px, 결론 문장 22~27px. h1 제목은 엔진이 58px로 그린다.

[디자인 토큰 — 색은 반드시 var()로 쓴다]
--ink(제목 글자) --text(본문) --muted(보조) --faint(아주 연함) --line / --line-2(테두리) --bg --card / --card-2 / --card-3(면 단계)
--f(이 장의 강조색: 섹션별 자동) --f-100(연한 강조면) --f-50 --f-ink(글자용 진한 강조색 — 강조 글자·숫자에 사용; --f는 면·아이콘·막대에)
--brand --azure --violet --teal --amber --rose --navy --ok --danger --gold (+ 각각 -100 연한 면, -ink 글자용)
--qg(브랜드 그라데이션) --q1 --q2 --q3(그라데이션 스톱 색) --r(24px) --r-sm(16px) --r-xs(11px) --shadow --shadow-lg --ease
요소에 class="f-azure | f-violet | f-teal | f-amber | f-rose | f-navy | f-ok | f-danger" 를 주면 그 하위의 --f / --f-100 / --f-ink 가 바뀐다(카드별 색 구분).
다크 테마에서도 토큰이 자동 반전된다. 고정색(#fff 등)은 그라데이션·solid 면 위의 흰 글자에만 쓴다.

[컴포넌트 클래스 — 베이스 CSS가 제공한다. 그대로 쓰면 덱 전체의 일관성이 생긴다]
.card(흰 카드: 테두리·그림자·radius) 변형 .card.tint(--f-100 바탕) .card.solid(--f 바탕·흰 글자) .card.edge(왼쪽 색 띠) .card.glass(유리) .card.lift(hover 상승) .gborder(그라데이션 테두리) .card-title(카드 제목 줄)
.k-eyebrow(작은 대문자 라벨) .k-title .k-body .k-small · .mega(초대형 숫자) .big .num(숫자 글꼴) .num-g / .gtext(그라데이션 글자)
.icon-circle(원형 아이콘 배경 48px, 하위 .ic 24px) .ic-sq(사각 52px; .ic-sq.lg 64px; .ic-sq.g 그라데이션) · .chip .pill(.pill.g 그라데이션, .pill.o 아웃라인) .tag .label .kpi .delta(.up/.down)
.bullets>li(불릿) .bar>i(가로 막대, data-bar) .grid-2 .grid-3 .grid-4 .tbl(표) .callout(결론 박스) .band(가로 띠) .note .avatar .divider
.seg>button(.on)(세그먼트 토글, .seg.g) input.rng(슬라이더, --p 로 채움 표시) .toggle(.on) .btn(.btn.ghost) .kbd .tap(탭 효과 원)
아이콘: <i data-icon="이름"></i> 가 24px 선형 SVG 아이콘으로 치환된다(크기는 부모의 .ic{width;height} 규칙으로). 이모지 금지. 이름은 다음 중에서만:
${ICON_NAMES}

[모션 — 베이스 JS가 data-속성을 처리한다. JS 없이도 동작]
- data-reveal="" | "up" | "left" | "right" | "scale" | "fade" + data-delay="ms": 등장 애니메이션(지정 없으면 70ms 간격 자동). 요소 10~25개에 리듬 있게 나눠 준다.
- data-count="12345" (+ data-decimals data-prefix data-suffix data-duration): 숫자 카운트업. 요소 안 텍스트는 최종값(예: 12,345).
- data-type (+ data-speed): 타자 효과. 내부 태그 없는 순수 텍스트 요소에만.
- .bar data-bar="42" 안의 <i></i> 가 42%까지 차오름. svg path data-draw: 선 그리기. data-grow: 자라남.
- 부모 data-cycle="2800" 안의 [data-step] 요소를 차례로 .on 처리(자동 하이라이트, mouseenter로 선택).
- [data-mock] 안의 [data-at="ms"] 요소가 시간차로 나타남(채팅·화면 시연). data-click 이면 .cursor 가 그 위치로 이동, data-type-text 는 타이핑, 부모 data-loop="ms" 면 반복.
- <canvas data-particles="60"></canvas>: 파티클 배경.
- 정적 모드(html.static: 썸네일·인쇄)에서는 모든 reveal이 즉시 완료 상태로 그려진다. JS도 e.detail.static 이면 최종 상태를 즉시 그리고 끝낸다.

[JS 규칙]
- 전부 document.addEventListener('deck:ready', function(e){ var STATIC=e.detail.static; … }) 안에 쓴다. 전역 변수 금지.
- 자동 데모: 아무것도 누르지 않아도 2~6초 안에 움직임이 보이고, 사용자가 클릭·슬라이더·토글을 만지면 자동 데모를 멈춘다.
- 금지: alert/confirm/prompt, fetch/XHR, localStorage, location 변경, 키보드 단축키(발표자 키와 충돌), 외부 라이브러리, document.write, 끝없이 누적되는 타이머.
- 슬라이더·드래그 컨트롤에는 touchstart/touchend 에 stopPropagation (슬라이드 넘김 방지).
- SVG 차트는 직접 그린다(viewBox는 실제 px, 축·격자·값 라벨 포함). 150줄 안쪽.

[콘텐츠 규칙]
- 사실·수치는 브리프·자료·플랜의 content_hints 에 있는 것을 우선 쓴다. 자료가 없는 주제라면 널리 알려진 공개 사실·수치(기관·연도를 붙이고 불확실하면 '약'·'추정')를 써서 장을 구체적으로 만든다 — 막연한 일반론("중요하다", "필요하다")으로 채우지 않는다. 출처·기준연도는 META.source 에. 수치를 꾸며내진 않는다.
- 한 장 = 한 메시지. 제목은 플랜의 것을 쓰되 더 날카로운 결론형이면 다듬어도 된다(**강조** 1개, ≤ 28자). sub 는 근거 1문장(≤ 60자).
- 밀도: 참고 덱 수준으로 꽉 차되 숨 쉴 여백. 카드 desc ≤ 45자, 라벨 ≤ 22자, 결론 문장 ≤ 60자. 영어 약어엔 짧은 풀이.
- 이 장의 메시지에 맞는 '시그니처 비주얼' 하나를 중심에 둔다(큰 숫자 묶음 / 비교 / 흐름 / 차트 / 시연 / 구조도). 다른 장과 레이아웃이 겹치지 않게 한다(아래 덱 개요의 signature 참고).
- 텍스트는 한국어(브리프가 다른 언어면 그 언어).`;

export const RICH_OUTPUT = `[출력 형식 — 정확히 아래 4개 구분선, 그 밖의 설명·코드펜스 금지]
===META===
{"title":"결론형 제목(**강조**)","sub":"근거 한 문장","source":"출처·기준연도(없으면 빈 문자열)","notes":{"t":45,"s":"발표 대본(구어체 존댓말, 80~220자)"},"signature":"이 장의 시그니처 비주얼 한 줄(≤ 40자)"}
===HTML===
(section.body 안에 들어갈 HTML. <style>·<script> 태그 금지. 외부 리소스·이미지 URL·base64 금지. 아이콘은 <i data-icon="…"></i>)
===CSS===
(이 장만의 CSS. 베이스 클래스를 덮어써도 된다. @import · url(http…) 금지)
===JS===
(필요 없으면 비워 둔다)`;

export function richSystem(kind: string, rules: { scope: string; text: string; weight?: number }[] = []): string {
  const ex = exemplarsFor(kind);
  const exText = ex.map((e, i) => `--- 참고 슬라이드 ${i + 1}: ${e.title} ---\n${e.text}`).join('\n\n');
  return `당신은 Qpresen 프리미엄 덱의 슬라이드 디자이너이자 프런트엔드 엔지니어다. 템플릿을 채우는 것이 아니라, 아래 참고 슬라이드(실제 수작업 레퍼런스 덱에서 발췌)와 같은 수준으로 이 장 하나의 HTML·CSS·JS를 직접 설계한다. 디자인 시스템(토큰·클래스·모션)을 그대로 쓰되 레이아웃과 시각 장치는 이 장의 메시지에 맞춰 새로 짠다.

${DESIGN_SYSTEM}
${rulesBlock(rules, 'fill')}
[참고 슬라이드 — 품질 기준. 구조·밀도·모션 리듬을 배우되, 내용과 레이아웃을 복사하지 말 것]
${exText}

${RICH_OUTPUT}`;
}

export interface RichParts { meta: any; html: string; css: string; js: string }

/** Parse the 4-section output. Tolerates code fences inside sections and a missing JS section. */
export function parseRich(text: string): RichParts {
  const t = text.replace(/\r/g, '');
  const grab = (name: string, next: string[]) => {
    const re = new RegExp(`===\\s*${name}\\s*===\\s*\\n?([\\s\\S]*?)(?=\\n\\s*===\\s*(?:${next.join('|')})\\s*===|$)`);
    const m = t.match(re); if (!m) return '';
    return m[1].replace(/^\s*```[a-z]*\s*\n/i, '').replace(/\n\s*```\s*$/i, '').trim();
  };
  const metaRaw = grab('META', ['HTML', 'CSS', 'JS']); const html = grab('HTML', ['CSS', 'JS', 'META']); const css = grab('CSS', ['JS', 'META', 'HTML']); const js = grab('JS', ['META', 'HTML', 'CSS']);
  let meta: any = {};
  try { const s = metaRaw.indexOf('{'), e = metaRaw.lastIndexOf('}'); if (s >= 0 && e > s) meta = JSON.parse(metaRaw.slice(s, e + 1)); } catch { meta = {}; }
  if (!html) throw new Error('rich: HTML section missing (' + t.slice(0, 160).replace(/\n/g, ' ') + ')');
  return { meta, html, css, js };
}

/** Static safety pass: strip anything that loads external resources or escapes the stage. Returns problems for logging. */
export function sanitizeRich(p: RichParts): { parts: RichParts; problems: string[] } {
  const problems: string[] = [];
  let { html, css, js } = p;
  // inline <style>/<script> inside HTML → move to css/js (models sometimes do this despite the rule)
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, c) => { css += '\n' + c; problems.push('style-in-html'); return ''; });
  html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_m, c) => { js += '\n' + c; problems.push('script-in-html'); return ''; });
  if (/<link\b/i.test(html)) { html = html.replace(/<link\b[^>]*>/gi, ''); problems.push('link-tag'); }
  if (/<(img|iframe|video|audio|source|object|embed)\b/i.test(html)) { html = html.replace(/<(img|iframe|video|audio|source|object|embed)\b[^>]*>(?:<\/\1>)?/gi, ''); problems.push('external-media'); }
  if (/https?:\/\//i.test(html)) { html = html.replace(/\s(?:src|href)="https?:\/\/[^"]*"/gi, ''); problems.push('url-in-html'); }
  if (/@import/i.test(css)) { css = css.replace(/@import[^;]*;/gi, ''); problems.push('css-import'); }
  if (/url\(\s*['"]?https?:/i.test(css)) { css = css.replace(/url\(\s*['"]?https?:[^)]*\)/gi, 'none'); problems.push('css-url'); }
  if (/position\s*:\s*fixed/i.test(css)) { css = css.replace(/position\s*:\s*fixed/gi, 'position:absolute'); problems.push('position-fixed'); }
  if (/\d+(vh|vw)\b/.test(css)) problems.push('viewport-units');
  if (/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open|location\.(href|assign|replace))\b/.test(js)) { js = js.replace(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open)\s*\(/g, '(void 0)('); problems.push('js-forbidden-api'); }
  if (/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(js)) { js = js.replace(/\b(alert|confirm|prompt)\s*\(/g, 'console.log('); problems.push('js-dialog'); }
  if (/<script\s[^>]*src=/i.test(js)) problems.push('js-script-src');
  return { parts: { meta: p.meta, html: html.trim(), css: css.trim(), js: js.trim() }, problems };
}

function briefTextShort(b: Brief, materialsMax = 20000): string {
  const lines = [
    `주제/요청: ${b.topic}`, b.purpose ? `목적: ${b.purpose}` : '', b.audience ? `청중: ${b.audience}` : '', b.durationMin ? `발표 시간: ${b.durationMin}분` : '',
    b.tone ? `톤: ${b.tone}` : '', b.lang ? `언어: ${b.lang}` : '언어: ko', b.presenter ? `발표자: ${b.presenter.name}${b.presenter.org ? ' (' + b.presenter.org + ')' : ''}` : '', b.extra ? `추가 지시: ${b.extra}` : '',
  ].filter(Boolean);
  let t = lines.join('\n');
  if (b.materials) t += `\n\n[참고 자료 — 사실·수치는 여기서만]\n${b.materials.slice(0, materialsMax)}`;
  return t;
}

export function richSlideFromParts(p: PlanSlide, parts: RichParts, model?: string): Slide {
  const m = parts.meta || {};
  const notes = m.notes && typeof m.notes === 'object' ? { t: Number(m.notes.t) || p.t || 45, s: String(m.notes.s || '') } : { t: p.t || 45, s: typeof m.notes === 'string' ? m.notes : (p.intent || '') };
  return {
    id: p.id, section: p.section || undefined,
    title: String(m.title || p.title), sub: m.sub != null ? String(m.sub) : p.sub, source: m.source ? String(m.source) : undefined, notes,
    body: { type: 'custom', bare: true, rich: true, html: parts.html, css: parts.css || undefined, js: parts.js || undefined, kind: (p as any).kind, signature: m.signature || (p as any).signature, description: m.signature ? String(m.signature) : undefined },
    ...(model ? { _model: model } as any : {}),
  } as Slide;
}

export interface RichOptions extends PipelineOptions { materialsMax?: number; maxTokens?: number; temperature?: number }

/** Design one slide (premium). Throws on parse failure so the caller can fall back to the standard fill. */
export async function fillSlideRich(brief: Brief, plan: Plan, slide: PlanSlide, opt: RichOptions): Promise<Slide> {
  const kind = String((slide as any).kind || kindForType(slide.type, slide.visual_hint));
  const system = richSystem(kind, opt.rules || []);
  const outline = plan.slides.map(s => ({ id: s.id, type: s.type, title: s.title, signature: (s as any).signature || s.visual_hint || '' }));
  const idx = plan.slides.findIndex(s => s.id === slide.id);
  const user = `${briefTextShort(brief, opt.materialsMax)}\n\n[덱 메타] ${JSON.stringify({ ...plan.meta, sections: plan.sections })}\n[덱 개요 — 다른 장과 레이아웃·시그니처가 겹치지 않게]\n${JSON.stringify(outline)}\n\n[이번에 설계할 장: ${idx + 1}/${plan.slides.length}장, kind=${kind}]\n${JSON.stringify(slide, null, 1)}\n\n위 장의 META/HTML/CSS/JS 를 출력 형식대로 작성하라.`;
  const r = await chat(opt.provider, { system, messages: [{ role: 'user', content: user }], maxTokens: opt.maxTokens || 14000, temperature: opt.temperature ?? 0.5, json: false, nudge: '(출력이 잘렸다. 같은 설계를 더 간결하게 다시 출력하라: CSS는 꼭 필요한 규칙만, JS는 120줄 이내, 네 구간 모두.)' });
  opt.log?.(`[rich ${slide.id}/${kind}] ${r.model} ${r.ms}ms in=${r.usage?.input ?? '?'} cacheRead=${r.usage?.cacheRead ?? 0} out=${r.usage?.output ?? '?'} cost=${r.usage?.cost ?? '?'}${r.truncated ? ' TRUNCATED' : ''}`);
  if (r.truncated) throw new Error('rich: output truncated');
  const { parts, problems } = sanitizeRich(parseRich(r.text));
  if (problems.length) opt.log?.(`[rich ${slide.id}] sanitized: ${problems.join(',')}`);
  if (parts.html.length < 400) throw new Error('rich: html too short');
  return richSlideFromParts({ ...slide, kind } as any, parts, r.model);
}

export const RICH_FIX_SYSTEM = `당신은 Qpresen 프리미엄 덱의 슬라이드 수정자다. 린트·검수에서 지적된 문제를 해결하도록 한 장의 HTML/CSS/JS를 최소한으로 고친다. 레이아웃 컨셉과 내용은 유지한다.
- OVERFLOW/OUTSIDE_STAGE: 박스(1728×~680px)를 넘친 것 — 글자 수 축소, 항목 수 축소, 행 높이 min-height:0/overflow:hidden, 글자 크기 1~2px 축소 순으로.
- SMALL_FONT: 14px 미만 글자를 키운다(캡션 15px 이상). LOW_CONTRAST: --muted/--faint 대신 --text/--ink, 면 위 글자는 -ink 토큰.
- OVERLAP: 겹치는 요소의 간격·그리드 정의를 고친다. EMPTY/SPARSE: 내용을 보강하거나 요소를 키워 여백을 채운다.
- 사용자 코멘트는 그 지시를 따른다.
${DESIGN_SYSTEM}

${RICH_OUTPUT}
수정된 전체(META/HTML/CSS/JS 네 구간 모두)를 출력한다. 바뀌지 않은 구간도 전부 다시 쓴다.`;

export async function fixSlideRich(slide: Slide, issues: { code?: string; sev?: string; what?: string; extra?: any; el?: string; fix?: string }[], opt: RichOptions, specMeta?: DeckSpec['meta']): Promise<Slide> {
  const b: any = slide.body;
  const cur = `===META===\n${JSON.stringify({ title: slide.title, sub: slide.sub, source: slide.source, notes: slide.notes, signature: b.signature })}\n===HTML===\n${b.html}\n===CSS===\n${b.css || ''}\n===JS===\n${b.js || ''}`;
  const user = `[덱 메타] ${JSON.stringify(specMeta || {})}\n[현재 슬라이드]\n${cur}\n\n[지적 사항]\n${issues.map(i => `- ${i.sev || ''} ${i.code || ''} ${i.el || ''} ${i.extra != null ? '(' + JSON.stringify(i.extra).slice(0, 200) + ')' : ''} ${i.what || ''} ${i.fix ? '→ ' + i.fix : ''}`).join('\n')}\n\n수정된 네 구간을 출력 형식대로 작성하라.`;
  const r = await chat(opt.provider, { system: RICH_FIX_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: opt.maxTokens || 14000, temperature: 0.3, json: false, nudge: '(출력이 잘렸다. 네 구간을 더 간결하게 다시 출력하라.)' });
  opt.log?.(`[rich-fix ${slide.id}] ${r.model} ${r.ms}ms${r.truncated ? ' TRUNCATED' : ''}`);
  const { parts } = sanitizeRich(parseRich(r.text));
  if (parts.html.length < 400) return slide;
  const fixed = richSlideFromParts({ id: slide.id!, section: slide.section, type: 'custom', title: slide.title, sub: slide.sub, t: slide.notes?.t, kind: b.kind } as any, parts, r.model);
  if (!parts.meta?.title) { fixed.title = slide.title; fixed.sub = slide.sub; fixed.source = slide.source; fixed.notes = slide.notes; }
  return fixed;
}

/** Premium planning addendum: ask the planner for a rich kind + signature visual per slide. */
export const PLAN_PREMIUM_ADDON = `
[프리미엄 모드 — 추가 지시]
이 덱은 장마다 맞춤 설계(HTML 직접 작성)로 만들어진다. 각 slide 객체에 다음 두 필드를 더한다:
- "kind": "numbers"(숫자·현황) | "chart"(추세·분포 차트) | "compare"(비교·전후·선택지) | "process"(단계·흐름·공식) | "concept"(구조·원리·개념도) | "demo"(화면·대화 시연) | "story"(사례·이야기) | "list"(정리·체크리스트)
- "signature": 이 장의 시그니처 비주얼·인터랙션 한 줄(≤ 40자, 예: "연도 슬라이더로 움직이는 성장 막대차트", "전/후 토글 비교 카드 3장")
cover/section/agenda/closing/quote/image-hero 는 kind 없이 그대로 둔다. 연속된 장이 같은 kind·같은 signature 를 쓰지 않게 하고, 덱 전체에서 kind 가 5종 이상 섞이게 한다.
content_hints 는 4~6개까지 넉넉히: 자료가 있으면 자료의 수치·고유명사·예시를, 자료가 없으면 널리 알려진 공개 사실·수치(기관·연도 명시, 불확실하면 '약'·'추정')를 뽑아 장마다 구체적인 재료를 준다. 일반론만 있는 장은 만들지 않는다.`;
