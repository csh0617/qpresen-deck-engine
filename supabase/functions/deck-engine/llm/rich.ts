/* Premium ("rich") slides: a top-tier model designs each slide's body HTML/CSS/JS directly inside the Qpresen
   design system — the way the reference decks were hand-built — instead of filling an archetype template.
   Output is a `custom` body (bare: true) that the renderer drops straight into <section class="body">. */
import { chat, type ProviderConfig } from './provider.ts';
import { ICON_NAMES, rulesBlock } from './prompts.ts';
import { exemplarsFor } from '../knowledge/exemplars.ts';
import { directionBlock } from './direct.ts';
import { HOUSE_STYLE } from './house.ts';
export { HOUSE_STYLE } from './house.ts';
import type { Brief, Plan, PlanSlide, PipelineOptions } from './pipeline.ts';
import type { Slide, DeckSpec } from '../renderer/types.ts';

export const RICH_KINDS = ['numbers', 'chart', 'compare', 'process', 'concept', 'demo', 'story', 'list', 'cover', 'section', 'closing', 'agenda'] as const;
export type RichKind = typeof RICH_KINDS[number];
/** Structural pages: in premium 2.0 they are designed too (full stage, no engine header), with their own exemplars. */
export const STRUCTURAL_TYPES = new Set(['cover', 'section', 'agenda', 'closing', 'quote', 'image-hero']);
export const FULL_STAGE_KINDS = new Set(['cover', 'section', 'closing', 'agenda']);

/** Premium 2.0: every slide is designed (structural pages included). Kept as a function for the callers' sake. */
export function isRichTarget(_p: { type?: string }): boolean { return true; }

/** Map an archetype (from a standard plan) to a rich kind, when the plan has no explicit kind. */
export function kindForType(type?: string, hint?: string): RichKind {
  const t = String(type || ''); const h = String(hint || '');
  if (t === 'cover') return 'cover';
  if (t === 'section') return 'section';
  if (t === 'closing') return 'closing';
  if (t === 'agenda') return 'agenda';
  if (/kpi|big-number/.test(t)) return 'numbers';
  if (/chart|table/.test(t)) return 'chart';
  if (/comparison|matrix|pricing/.test(t)) return 'compare';
  if (/process|timeline|checklist/.test(t)) return 'process';
  if (/mockup|annotated/.test(t)) return 'demo';
  if (/diagram|bullets|summary|team|cards/.test(t)) return /사례|스토리|이야기/.test(h) ? 'story' : 'concept';
  return 'story';
}

export const DESIGN_SYSTEM = `${HOUSE_STYLE}

[무대 규격]
- 엔진이 <main class="stage f-{accent}"> 안에 상단 바와 <header class="head">(eyebrow + h1 제목 + p.sub)를 그려 준다. 당신은 <section class="body"> 안에 들어갈 내용만 쓴다.
- .body 박스: 가로 1728px × 세로 약 680px (sub가 없으면 약 730px). 모든 내용은 이 박스 안에 들어가야 하고 넘치면 안 된다. 스크롤 금지, 박스 밖 절대 배치 금지.
- .body 기본값: display:flex; flex-direction:column; flex:1; min-height:0. CSS에서 .body{display:grid;grid-template-columns:…;grid-template-rows:minmax(0,1fr) auto;gap:…;min-height:0} 처럼 직접 바꿔 써도 된다(권장).
- 그리드/플렉스 자식에는 min-height:0; min-width:0 을 넣어 넘침을 막는다. 높이는 1fr / flex:1 로 나누고 고정 px 높이는 작은 요소에만 쓴다. 긴 텍스트 요소에는 overflow:hidden 을 걸어 둔다.
- 글자 크기 하한: 본문 18px, 캡션·태그 15px(절대 최소 14px). 카드 제목 24~28px, 큰 숫자 60~120px(단위는 22~28px 분리), 결론 문장 22~27px. h1 제목은 엔진이 58px로 그린다. 한 장에 15px 이하 글자는 6개 이하.
- 열 폭: 카드가 들어가는 열은 420px 이상, 카드 2열 영역은 760px 이상. 한글 단어가 세로로 쪼개질 만큼 좁은 칸을 만들지 않는다(라벨에 word-break:keep-all). 내용이 많은 쪽에 더 넓은 열을 준다.
- 숫자·값은 HTML에 최종값을 적어 둔다(data-count 요소의 텍스트 = 최종값, JS가 갱신하는 값도 초기 표기값 필수). 정적 모드(썸네일·인쇄)에서 빈칸이 보이면 안 된다.

[디자인 토큰 — 색은 반드시 var()로 쓴다]
--ink(제목 글자) --text(본문) --muted(보조) --faint(아주 연함) --line / --line-2(테두리) --bg --card / --card-2 / --card-3(면 단계)
--f(이 장의 강조색: 섹션별 자동) --f-100(연한 강조면) --f-50 --f-ink(글자용 진한 강조색 — 강조 글자·숫자에 사용; --f는 면·아이콘·막대에)
--brand --azure --violet --teal --amber --rose --navy --ok --danger --gold (+ 각각 -100 연한 면, -ink 글자용)
--qg(브랜드 그라데이션) --q1 --q2 --q3(그라데이션 스톱 색) --r(24px) --r-sm(16px) --r-xs(11px) --shadow --shadow-lg --ease
요소에 class="f-azure | f-violet | f-teal | f-amber | f-rose | f-navy | f-ok | f-danger" 를 주면 그 하위의 --f / --f-100 / --f-ink 가 바뀐다(카드별 색 구분).
다크 테마에서도 토큰이 자동 반전된다. 고정색(#fff 등)은 그라데이션·solid 면 위의 흰 글자에만 쓴다.

[컴포넌트 클래스 — 베이스 CSS가 제공한다. 정확한 뜻대로만 쓸 것(다른 뜻으로 쓰면 스타일이 꼬인다)]
.card(흰 카드: --card 바탕·테두리·그림자·radius 24px·padding 28px 30px) 변형 .card.tint(--f-50 연한 바탕) .card.solid(--f-ink 바탕·흰 글자) .card.flat(그림자 없음) .card.glass(유리) .card.lift(hover 상승) .card.dark(짙은 남색) · .gborder(그라데이션 테두리 카드) · .card-title(카드 제목 줄)
숫자: .mega(120px) .big(64px) — 둘 다 --ink 색 굵은 숫자. 그라데이션 글자는 .gtext / .num-g. ※ .num 은 숫자 값이 아니라 '번호 원 배지'(44px 원, 흰 글자)다 — 값 표시에 쓰지 말 것.
아이콘 틀: .icon-circle(56px 원, --f-100 바탕 --f 아이콘) .ic-sq(52px 사각, .ic-sq.lg 64px, .ic-sq.g 그라데이션) .avatar(64px 원, 그라데이션, 이니셜)
라벨류: .k-eyebrow(15px 대문자 자간 라벨, --f-ink) .label(17px 굵은 --f-ink) .tag(15px, --card-3 바탕 --muted 글자) .pill(16px 둥근 알약, --f-100 바탕 --f-ink 글자; .pill.g 그라데이션 흰 글자, .pill.o 아웃라인) .delta(.up 녹색 / .down 빨강 / .flat 회색 작은 알약) .note(16px --faint — 중요한 글엔 쓰지 말 것) .legend(15px --muted 가로 범례)
※ .chip 은 어두운 바탕용 반투명 흰 칩이다. 밝은 카드 위에서는 .pill 이나 .tag 를 쓴다.
박스류: .callout(--f-50 바탕 21px 결론 박스, flex) .band(가로 띠, 21px) .meta-bar(가로 메타 줄 19px) .kpi(세로 flex 묶음) .bullets>li(21px 불릿, 점은 --f) .tbl(표: th --card-3 바탕, td 18px) .divider / .hair(1px 선)
막대: <div class="bar" data-bar="42"><i></i></div> (높이 10px 트랙, 안의 i가 --f 색으로 42%까지 참)
그리드: .grid-2 .grid-3 .grid-4 .grid-5 .grid-6 (gap 24px, 세로 꽉 채움)
컨트롤: .seg>button(.on)(세그먼트 토글; .seg.g) input.rng(슬라이더; style="--p:62%" 로 채움 표시) .toggle(.on) .btn(.btn.ghost) .kbd .tap(탭 효과 원)
※ 예약된 이름(베이스가 전역으로 정의) — 다른 뜻으로 재사용 금지: num, chip, bar, grid, label, note, legend, img, art, source, float, pulse, caret, orb, wm, hair, kbd, seg, tap, toggle, btn, avatar, band, callout, delta, tag, pill, kpi, k-title, k-small, k-body. 새 클래스는 이 목록과 겹치지 않는 이름으로(예: .mapbox, .tile5, .x-gauge).
아이콘: <i data-icon="이름"></i> 가 24px 선형 SVG 아이콘으로 치환된다(크기는 부모의 .ic{width;height} 규칙으로). 이모지 금지. 이름은 다음 중에서만:
${ICON_NAMES}

[모션 — 베이스 JS가 data-속성을 처리한다. JS 없이도 동작]
- data-reveal="" | "up" | "left" | "right" | "scale" | "fade" + data-delay="ms": 등장 애니메이션(지정 없으면 70ms 간격 자동). 요소 10~25개에 리듬 있게 나눠 준다.
- data-count="12345" (+ data-decimals data-prefix data-suffix data-duration): 숫자 카운트업. 요소 안 텍스트는 최종값(예: 12,345).
- data-type (+ data-speed): 타자 효과. 내부 태그 없는 순수 텍스트 요소에만.
- .bar data-bar="42" 안의 <i></i> 가 42%까지 차오름. svg path data-draw: 선 그리기. data-grow: 자라남.
- 부모 data-cycle="2800" 안의 [data-step] 요소를 차례로 .on 처리(자동 하이라이트, mouseenter로 선택). 순환 강조는 색·글로우·테두리·살짝 커짐만 바꾼다 — 내용을 접었다 펴는 아코디언/탭 전환(.on 아닌 카드의 본문 숨김, 패널 1개만 표시)은 금지: 정적 화면(썸네일·인쇄·검수)에서 빈 카드·빈 패널로 보인다. 모든 카드·패널은 항상 내용이 채워진 상태로 보여야 한다.
- [data-mock] 안의 [data-at="ms"] 요소가 시간차로 나타남(채팅·화면 시연). data-click 이면 .cursor 가 그 위치로 이동, data-type-text 는 타이핑, 부모 data-loop="ms" 면 반복.
- <canvas data-particles="60"></canvas>: 파티클 배경.
- 살아있는 요소 만들기: 순환 강조 <div data-cycle="2600"><article data-step>…</article>…</div>(.on 에 스타일), 흐르는 점선 <path class="flowline" data-draw> 또는 stroke-dasharray + @keyframes dashflow, 펄스 점 .pulse, 진행 바 .bar data-bar, 켄번즈 .backdrop.kb, 타자 data-type, 카운트업 data-count. 이 중 하나는 반드시 끝까지 움직인다(등장만 하고 멈추는 장 금지).
- 정적 모드(html.static: 썸네일·인쇄)에서는 모든 reveal이 즉시 완료 상태로 그려진다. JS도 e.detail.static 이면 최종 상태를 즉시 그리고 끝낸다.

- 연쇄 등장: data-after="#앞요소id" data-gap="ms" → 앞 요소의 타이핑/카운트/등장이 끝난 뒤 시작(레퍼런스 덱의 리듬). 긴 장면은 3~4단계로 연쇄.
- 사진 백드롭: <div class="backdrop kb"><img data-image="장면 묘사" style="--pos:50% 40%" alt=""><div class="credit">AI 생성 이미지</div></div> — .body 첫 요소로 두면 화면 전체(무대 가장자리까지) 사진이 깔리고, 기본(=.fade-l)은 왼쪽 ~45%가 무대 바탕색으로 페이드되어 글자 영역이 된다(글 왼쪽 · 사진 오른쪽). 글을 오른쪽에 두려면 .fade-r(오른쪽이 바탕색 · 사진 왼쪽), 글을 위에 두려면 .fade-b, 아래에 두려면 .fade-t. 규칙: 글과 사진은 반드시 반대편 — 페이드되지 않은 사진 위에 본문 글자를 올리지 말 것(카드/유리 안에 넣는 것은 가능). kb=켄번즈. 밝은 무대(light)에서는 dim/soft를 쓰지 말 것(글자가 묻힌다) — 사진을 어둡게 누르고 싶으면 META.stage="cine". 아트 디렉션이 이 장에 사진을 허용할 때만.
- 사진 카드: <figure class="photo card"><img data-image="…" alt=""><figcaption class="cap">캡션</figcaption></figure> (side 사진). 이미지는 엔진이 생성·치환한다(src 쓰지 말 것).
- 앱 화면 목업 키트: <div class="app claude|gpt v2"> 안에 .chrome(브라우저 상단바: .tl 신호등, .url 주소) .app-row > .app-side(사이드바 .it 항목) + .app-main(.app-top, .msg.user/.msg, .composer(.inp, .send)) · 드롭다운 .amenu(.open) · 아티팩트 .art-card · 사이드 패널 .app-panel. 실제 SaaS 화면을 재현할 때.
- 가이드 클릭 엔진: 목업 루트에 data-guide='[{"at":600,"do":"click","sel":"#btn","call":"여기를 누르면","num":1,"pos":"r"},{"at":1800,"do":"type","sel":"#inp","text":"입력할 문장","speed":22,"call":"질문 입력","num":2},{"at":4200,"do":"show","show":".reply"},{"at":4500,"do":"point","sel":".reply","call":"답이 이렇게","num":3,"pos":"l"}]' 를 주면 커서가 움직이며 번호 콜아웃·링·타이핑을 자동 시연한다. do: click|type|point|show|hide|clear|call, 옵션 open/close(메뉴 .open), step(우측 단계 목록 [data-step] 강조), hold. 정적 모드는 최종 상태+콜아웃만.
- 덱 전체 효과(아트 디렉션이 켬): 오로라 블롭, 푸터 섹션 레일, 카드 3D 틸트(hover), 블러+회전 등장 — 자동. 카드에 data-notilt 로 틸트 제외.
- 시네마틱 다크 무대: 아트 디렉션이 지정한 섹션은 .stage.cine(어두운 배경, 유리 카드, 흰 글자)으로 렌더된다 — 그 장은 어두운 바탕에 맞게 설계. cine에서는 토큰이 반전된다: --bg/--card/--line은 어두운 색, --ink/--text는 밝은 글자색 (즉 --ink는 '남색'이 아니라 '글자색'). 배경을 어둡게 칠하려고 var(--ink)를 쓰지 말고 var(--bg)·var(--card)를 쓴다. .stage.cine 의 background 는 엔진이 칠하므로 덮어쓰지 말 것.
- 라이브러리: gsap 3 전역 사용 가능(gsap.timeline / gsap.to / stagger — 쓰면 자동 포함, 20~50줄의 안무에 권장). THREE(three.js r152) 전역 사용 가능 — 3D가 메시지의 핵심일 때만(부품 구조·공간·흐름), 100줄 이내, 캔버스는 .body 안 컨테이너에 append, STATIC이면 한 프레임만 렌더. 그 외 외부 라이브러리 금지.

[무대 전체 장 — kind가 cover / section / closing / agenda 일 때]
- META.head="none": 엔진 헤더가 없으므로 제목·부제·메타를 HTML 안에 직접 쓴다. 무대 패딩(위 104 · 좌우 96 · 아래 100px) 안쪽이 .body(1728×876)이고, <div class="backdrop …"> 는 absolute라 무대 전체(1920×1080)를 채운다.
- 표지(cover): 사진 백드롭(.backdrop.kb — 글 왼쪽·사진 오른쪽, 또는 cine 무대) + 큰 제목 64~88px(.hero-title, em 강조) + 부제 + 메타 줄(.meta-line: 일시·장소·청중) + 발표자 배지(.speaker) + 키워드 칩 + 오른쪽/아래에 목차 또는 KPI 띠. 참고 슬라이드 ir-01(제품 목업형)·gochang-01(시네마틱형).
- 간지(section): 로마숫자 거대 타이포(.sec-num) + 섹션명(.hero-title) + 이 섹션에서 다룰 3~4개(칩/목록) + 섹션 진행 표시(.secs). cine 권장. 참고 gochang-07.
- 마무리(closing): 핵심 메시지 한 문장(60~80px) + 오늘의 숫자 3개 + 다음 행동/연락처(.contact) + '질문·토론' 안내. QR은 엔진이 제공하지 않으므로 넣지 않는다. 참고 ir-20·gochang-60.
- 목차(agenda): 섹션 3~6개를 번호·제목·한 줄·분량(장수/분)으로, 왼쪽 큰 번호 타이포 + 오른쪽 설명 카드, 또는 세로 스텝. 각 항목 등장 리듬 120ms.
- 이 장들에도 시그니처(사진·목업·거대 타이포)를 두되 글자 수는 적게. 발표자 이름·소속·행사·일시는 덱 메타에서 가져온다(없으면 생략).

[JS 규칙]
- 전부 document.addEventListener('deck:ready', function(e){ var STATIC=e.detail.static; … }) 안에 쓴다. 전역 변수 금지(window.DeckFX 등 덱 레이어가 제공한 것은 사용 가능).
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
{"title":"결론형 제목(**강조**)","sub":"근거 한 문장","source":"출처·기준연도(없으면 빈 문자열)","notes":{"t":45,"s":"발표 대본(구어체 존댓말, 80~220자)"},"signature":"이 장의 시그니처 비주얼 한 줄(≤ 40자)","head":"engine|none","stage":"light|cine"}
 - head: engine = 엔진이 상단에 번호·eyebrow·h1 제목·sub를 그린다(콘텐츠 장 기본). none = 표지·간지·마무리·목차처럼 무대 전체를 직접 구성(제목도 HTML 안에 직접).
 - stage: cine = 시네마틱 다크 무대(토큰 전체가 다크로 반전; 표지·간지·클라이맥스에 권장), light = 기본.
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
  if (/<(iframe|video|audio|source|object|embed)\b/i.test(html)) { html = html.replace(/<(iframe|video|audio|source|object|embed)\b[^>]*>(?:<\/\1>)?/gi, ''); problems.push('external-media'); }
  if (/<img\b[^>]*\ssrc="(?!data:)/i.test(html)) { html = html.replace(/<img\b([^>]*)\ssrc="(?!data:)[^"]*"([^>]*)>/gi, '<img$1$2>'); problems.push('img-src'); } // images come from data-image prompts only (data: = carried-over generated image)
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
    body: { type: 'custom', bare: true, rich: true, html: parts.html, css: parts.css || undefined, js: parts.js || undefined, kind: (p as any).kind, signature: m.signature || (p as any).signature, description: m.signature ? String(m.signature) : undefined,
      noHead: m.head ? m.head === 'none' : FULL_STAGE_KINDS.has(String((p as any).kind || '')), cine: m.stage === 'cine' },
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
  const { direction, ...metaNoDir } = plan.meta as any;
  const user = `${briefTextShort(brief, opt.materialsMax)}\n\n[덱 메타] ${JSON.stringify({ ...metaNoDir, sections: plan.sections })}${directionBlock(direction, { ...slide, kind })}\n[덱 개요 — 다른 장과 레이아웃·시그니처가 겹치지 않게]\n${JSON.stringify(outline)}\n\n[이번에 설계할 장: ${idx + 1}/${plan.slides.length}장, kind=${kind}]\n${JSON.stringify(slide, null, 1)}\n\n위 장의 META/HTML/CSS/JS 를 출력 형식대로 작성하라.`;
  const r = await chat(opt.provider, { system, messages: [{ role: 'user', content: user }], maxTokens: opt.maxTokens || 14000, temperature: opt.temperature ?? 0.5, json: false, nudge: '(출력이 잘렸다. 같은 설계를 더 간결하게 다시 출력하라: CSS는 꼭 필요한 규칙만, JS는 120줄 이내, 네 구간 모두.)' });
  opt.log?.(`[rich ${slide.id}/${kind}] ${r.model} ${r.ms}ms in=${r.usage?.input ?? '?'} cacheRead=${r.usage?.cacheRead ?? 0} out=${r.usage?.output ?? '?'} cost=${r.usage?.cost ?? '?'}${r.truncated ? ' TRUNCATED' : ''}`);
  if (r.truncated) throw new Error('rich: output truncated');
  const { parts, problems } = sanitizeRich(parseRich(r.text));
  if (problems.length) opt.log?.(`[rich ${slide.id}] sanitized: ${problems.join(',')}`);
  if (parts.html.length < 400) throw new Error('rich: html too short');
  return richSlideFromParts({ ...slide, kind } as any, parts, r.model);
}

export const RICH_FIX_SYSTEM = `당신은 Qpresen 프리미엄 덱의 슬라이드 수정자다. 린트·검수에서 지적된 문제를 해결하도록 한 장의 HTML/CSS/JS를 최소한으로 고친다. 레이아웃 컨셉과 내용은 유지한다.
- OVERFLOW_X(가로 넘침): 부모 폭이 좁은 것이 원인이면(부모 < 300px인데 카드·제목이 들어감) 그리드 열 폭을 바꿔 그 영역을 넓힌다(열 교체·2열→1열·사이드 패널 축소). 말줄임(text-overflow:ellipsis)·nowrap으로 잘라 숨기는 것은 해결이 아니다 — 글자가 다 보여야 한다. 짧은 라벨이면 줄바꿈 허용(white-space:normal; word-break:keep-all).
- OVERFLOW_Y(세로 넘침)/OUTSIDE_STAGE: 박스(1728×~680px)를 넘친 것 — 항목 수 축소, 글자 수 축소, 행 높이 min-height:0 + flex:1 로 분배, padding·gap 축소, 글자 크기 1~2px 축소 순으로.
- SMALL_FONT: 14px 미만 글자를 키운다(캡션 15px 이상). LOW_CONTRAST: --muted/--faint 대신 --text/--ink, 면 위 글자는 -ink 토큰.
- OVERLAP: 겹치는 요소의 간격·그리드 정의를 고친다. EMPTY/SPARSE: 내용을 보강하거나 요소를 키워 여백을 채운다. DENSE: 여백·간격을 늘리고 덜 중요한 요소를 뺀다.
- 숫자가 비어 보이면(정적 모드) HTML에 최종값을 써 넣는다.
- 카드/패널 하단이 비어 보이면: 순환(.on)으로 한 카드만 펼치는 구조를 '모든 카드가 항상 채워진 구조'로 바꾸고(아이콘 원·제목·수치·설명·태그 세트), 순환은 강조만 담당하게 한다. 카드 높이에 맞게 내용을 보강한다.
- MOTION_LOW / 정적으로 보임: 등장 연쇄를 14개 이상으로 늘리고(data-reveal 변형과 data-delay 리듬), 숫자에 data-count, 살아있는 요소(data-cycle·flowline·pulse·bar·kb) 1개와 상호작용(hover/클릭/토글/슬라이더/자동 데모) 1개를 추가한다. 필요하면 gsap 타임라인으로 안무.
- STYLE_OFF(하우스 스타일 이탈: 회색 리포트 룩·작은 라벨 다발·무거운 사진): 그라데이션 숫자·틴트/유리 카드·아이콘 원·칩으로 바꾸고 글자를 키운다.
- TEXT_ON_PHOTO(페이드되지 않은 사진 위의 글자): 글과 사진은 반대편이어야 한다. 기본 .backdrop(=.fade-l)은 왼쪽이 바탕색·사진 오른쪽 → 글은 왼쪽 열에, .fade-r는 오른쪽이 바탕색·사진 왼쪽 → 글은 오른쪽 열에. 글이 왼쪽인데 .fade-r가 붙어 있으면 .fade-r를 뺀다. 사진 쪽에 남는 글은 .card/.glass 안에 넣거나 사진 반대편으로 옮기고, 빈 사진 쪽은 사진이 채우는 것이 정상(억지로 채우지 않는다).
- CINE_BG_LIGHT: cine 무대에서 var(--ink)는 밝은 글자색이다. .stage.cine 의 background 덮어쓰기를 지우고, 어두운 면이 필요하면 var(--bg)·var(--card).
- 사용자 코멘트는 그 지시를 따른다.
${DESIGN_SYSTEM}

${RICH_OUTPUT}
수정된 전체(META/HTML/CSS/JS 네 구간 모두)를 출력한다. 바뀌지 않은 구간도 전부 다시 쓴다.`;

/** Generated images live inline as data URLs; they are stripped before a slide goes back to the model (prompt size) and carried over afterwards by their data-image prompt. */
export function stripImageSrcs(html: string): { html: string; srcs: Record<string, string> } {
  const srcs: Record<string, string> = {};
  const out = html.replace(/<img\b([^>]*)>/gi, (m, attrs: string) => {
    const prompt = (attrs.match(/data-image="([^"]*)"/) || [])[1]; const src = (attrs.match(/\ssrc="(data:[^"]*)"/) || [])[1];
    if (!prompt || !src) return m; srcs[prompt] = src; return `<img${attrs.replace(/\ssrc="data:[^"]*"/, '')}>`;
  });
  return { html: out, srcs };
}
export function carryImageSrcs(html: string, srcs: Record<string, string>): string {
  return html.replace(/<img\b([^>]*)>/gi, (m, attrs: string) => {
    if (/\ssrc=/.test(attrs)) return m; const prompt = (attrs.match(/data-image="([^"]*)"/) || [])[1];
    return prompt && srcs[prompt] ? `<img${attrs} src="${srcs[prompt]}">` : m;
  });
}

export async function fixSlideRich(slide: Slide, issues: { code?: string; sev?: string; what?: string; extra?: any; el?: string; fix?: string }[], opt: RichOptions, specMeta?: DeckSpec['meta']): Promise<Slide> {
  const b: any = slide.body;
  const { html: htmlNoImg, srcs } = stripImageSrcs(String(b.html || ''));
  const dirMeta: any = specMeta ? { ...specMeta } : {}; const direction = dirMeta.direction; delete dirMeta.direction;
  const cur = `===META===\n${JSON.stringify({ title: slide.title, sub: slide.sub, source: slide.source, notes: slide.notes, signature: b.signature, head: b.noHead ? 'none' : 'engine', stage: b.cine ? 'cine' : 'light' })}\n===HTML===\n${htmlNoImg}\n===CSS===\n${b.css || ''}\n===JS===\n${b.js || ''}`;
  const fmt = (i: any) => `- ${i.sev || ''} ${i.code || ''} ${i.el || ''}${i.extra != null ? ' (' + JSON.stringify(i.extra).slice(0, 120) + (/OVERFLOW/.test(i.code || '') ? 'px 넘침' : '') + ')' : ''}${i.box ? ' 요소크기=' + i.box[0] + '×' + i.box[1] + 'px' : ''}${i.parent ? ' 부모=' + i.parent : ''}${i.text ? ' 텍스트="' + String(i.text).slice(0, 40) + '"' : ''} ${i.what || ''} ${i.fix ? '→ ' + i.fix : ''}`;
  const user = `[덱 메타] ${JSON.stringify(dirMeta)}${directionBlock(direction, { id: slide.id!, section: slide.section, kind: b.kind })}\n[현재 슬라이드]\n${cur}\n\n[지적 사항]\n${issues.map(fmt).join('\n')}\n\n수정된 네 구간을 출력 형식대로 작성하라. (이미지는 <img data-image="…"> 태그를 같은 프롬프트로 유지하면 기존 생성 이미지가 그대로 쓰인다)`;
  const r = await chat(opt.provider, { system: RICH_FIX_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: opt.maxTokens || 14000, temperature: 0.3, json: false, nudge: '(출력이 잘렸다. 네 구간을 더 간결하게 다시 출력하라.)' });
  opt.log?.(`[rich-fix ${slide.id}] ${r.model} ${r.ms}ms${r.truncated ? ' TRUNCATED' : ''}`);
  const { parts } = sanitizeRich(parseRich(r.text));
  if (parts.html.length < 400) return slide;
  parts.html = carryImageSrcs(parts.html, srcs);
  const fixed = richSlideFromParts({ id: slide.id!, section: slide.section, type: 'custom', title: slide.title, sub: slide.sub, t: slide.notes?.t, kind: b.kind } as any, parts, r.model);
  if (!parts.meta?.title) { fixed.title = slide.title; fixed.sub = slide.sub; fixed.source = slide.source; fixed.notes = slide.notes; }
  const fb: any = fixed.body; if (!parts.meta?.head) fb.noHead = !!b.noHead; if (!parts.meta?.stage) fb.cine = !!b.cine;
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

/** Prompt-cache warm-up: the per-kind system prompts (≈19K tokens each) are cached for 1h by the gateway after the first call.
    Parallel slide requests that start together all miss the cache, so warm each distinct prompt once right after planning. */
export async function warmRichCache(plan: Plan, opt: PipelineOptions): Promise<number> {
  const keys = new Map<string, string>();
  for (const p of plan.slides) { if (!isRichTarget(p)) continue; const kind = String((p as any).kind || kindForType(p.type, p.visual_hint)); const key = exemplarsFor(kind).map(e => e.id).join('+'); if (!keys.has(key)) keys.set(key, kind); }
  await Promise.all([...keys.values()].map(async kind => { try { await chat(opt.provider, { system: richSystem(kind, opt.rules || []), messages: [{ role: 'user', content: 'OK' }], maxTokens: 5, json: false }); } catch (e: any) { opt.log?.(`[warm ${kind}] ${e.message}`); } }));
  return keys.size;
}
