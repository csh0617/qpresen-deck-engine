/* Art direction (premium/studio): one deck-level design pass before the slides are designed — the way the reference decks
   were built (a bespoke effects/design layer per deck, then 20–60 slides on top of it). Produces a DeckDirection with a
   deck CSS/JS layer, per-section accents, motifs, photo strategy (which slides get an image and what), and motion language. */
import { chat } from './provider.ts';
import { parseRich, sanitizeRich } from './rich.ts';
import type { Brief, Plan, PipelineOptions } from './pipeline.ts';
import type { DeckDirection, Accent } from '../renderer/types.ts';

export interface ImagePlan { id: string; role: 'backdrop' | 'side' | 'mock' | 'illustration'; prompt: string; ratio?: '16:9' | '1:1' | '3:4' | '4:3' }
export interface Direction extends DeckDirection { images?: ImagePlan[]; darkSections?: string[] }

export const DIRECT_SYSTEM = `당신은 Qpresen 스튜디오 덱의 아트 디렉터이자 프런트엔드 리드다. 장을 그리기 전에, 이 덱 하나만을 위한 시각 언어를 정한다 — 레퍼런스 덱들이 그랬듯 덱 전용 디자인 레이어(CSS/JS)를 먼저 만들고 그 위에 모든 장을 올린다.

[입력] 브리프, 덱 플랜(섹션·장별 제목·kind·signature), 테마 토큰.
[출력 — 정확히 세 구간]
===JSON===
{
 "mood": "한 줄 무드(예: 정밀한 산업 리포트, 차분한 남색 위에 전기차의 청록 전류)",
 "concept": "이 덱만의 시각 언어 3~5문장: 색의 역할, 형태(각진/둥근), 선·면의 비중, 사진의 쓰임, 숫자의 표현, 여백의 리듬",
 "motifs": ["반복 모티프 3~5개(예: 회로 라인, 전류 점선, 도장 스탬프 라벨)"],
 "sectionAccents": {"s1":"azure","s2":"teal"},   // 섹션 id → brand|azure|violet|teal|amber|rose|navy|ok|danger (섹션마다 다르게, 전체 2~4색)
 "darkSections": [],                              // 시네마틱 다크 무대(.stage.cine)로 그릴 섹션 id (0~1개 권장; 임팩트 장면·클라이맥스)
 "photoStrategy": "none|backdrops|side|mixed",
 "images": [ {"id":"p03","role":"backdrop|side|mock|illustration","prompt":"장면 묘사(한국어, 구체적·사실적)","ratio":"16:9|1:1|3:4|4:3"} ],  // 최대 imageBudget 장. cover/section/image-hero 제외(엔진이 따로 생성)
 "motion": "모션 언어 2~3문장(등장 리듬·강조 방식·인터랙션 톤)",
 "fx": ["aurora","rail","tilt","3d-in"],         // 덱 전체 효과: aurora(배경 오로라 블롭) rail(푸터 섹션 레일) tilt(카드 3D 틸트) 3d-in(블러+회전 등장). 격식 보고서는 aurora/3d-in 제외 가능
 "helpers": [ {"class":"d-stamp","purpose":"도장형 라벨"}, {"class":"d-wire","purpose":"회로 점선 구분선"} ],  // 아래 CSS에서 정의한 클래스 3~8개
 "typography": "제목·숫자·라벨 처리 메모 1~2문장",
 "notes": "장 설계자에게 주는 지시 2~4문장(해야 할 것/하지 말 것)"
}
===CSS===
(덱 레이어 CSS, 2~6KB. 모든 장에 베이스 CSS 다음에 삽입된다.
 - helper 클래스는 반드시 d- 접두사(.d-stamp .d-wire …). 토큰(var(--f) 등)으로 색을 쓴다.
 - 전역 미세 조정은 최대 5개 규칙(예: .head h1 em 그라데이션, .card 그림자 톤, .eyebrow 스타일, .stage.cine 변주). 레이아웃을 깨는 전역 변경 금지(.body/.stage 크기·padding 변경 금지).
 - @import·url(http…)·웹폰트 금지. @keyframes 이름은 d- 접두사.)
===JS===
(선택. 덱 레이어 JS 0~3KB — 여러 장이 공유할 작은 유틸(예: window.DeckFX = { ripple(el), countUpAll() })을 deck:ready 이벤트 뒤에 노출. 없으면 비워 둔다. gsap 사용 가능(쓰면 자동 포함).)

[디자인 시스템 요약] 토큰: --ink --text --muted --faint --line --line-2 --bg --card --card-2 --card-3 --f(강조) --f-100 --f-50 --f-ink --q1 --q2 --q3(그라데이션 스톱) --qg(그라데이션) --r --r-sm --shadow --shadow-lg --ease --ease-out --ease-spring. 무대 1920×1080, 본문 박스 1728×~680.
컴포넌트: .card(.tint .solid .glass .lift .edge) .pill .tag .chip(어두운 바탕용) .icon-circle .ic-sq .bullets .bar .tbl .callout .band .kpi .mega .big .num-g .gtext, 포토 백드롭 .backdrop(.kb .fade-r .fade-b .soft .dim)+.credit, 시네마틱 .stage.cine, 앱 목업 키트 .app(.chrome .app-side .app-top .msg .composer .amenu), 가이드 클릭 엔진 [data-guide].

[원칙]
- 주제·청중·목적에 맞는 '하나의' 강한 아이디어. 템플릿 기본값과 구별되는 덱 고유의 결(예: 산업 보고서=얇은 선·테이블 라벨·스탬프, 교육=둥근 카드·일러스트·대화 목업, IR=유리 카드·그라데이션·라이브 차트).
- 색: 테마 토큰 위에서 섹션별 강조색을 배분하고, 한 덱 안에 2~4색만. 무지개 금지.
- 사진: 메시지를 강화하는 장에만(현장·제품·사람·공간). 통계·구조 장에는 사진 대신 다이어그램. imageBudget 안에서.
- 모션: 과하지 않게. 등장은 150~250ms 간격 리듬, 강조는 1곳, 인터랙션은 장당 1개.
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
    palette: { sectionAccents, notes: m.typography ? String(m.typography) : undefined },
    photoStrategy: ['none', 'backdrops', 'side', 'mixed'].includes(m.photoStrategy) ? m.photoStrategy : 'mixed',
    imageBudget: budget, motion: String(m.motion || ''),
    fx: (Array.isArray(m.fx) ? m.fx.filter((f: string) => fxAll.includes(f)) : ['rail', 'tilt']) as any,
    deckCss: parts.css.slice(0, 12000) || undefined, deckJs: parts.js.slice(0, 6000) || undefined,
    helpers: Array.isArray(m.helpers) ? m.helpers.map((h: any) => typeof h === 'string' ? h : `${h.class} — ${h.purpose || ''}`).slice(0, 10) : [],
    images: (Array.isArray(m.images) ? m.images : []).filter((x: any) => x && x.id && x.prompt).slice(0, budget).map((x: any) => ({ id: String(x.id), role: ['backdrop', 'side', 'mock', 'illustration'].includes(x.role) ? x.role : 'side', prompt: String(x.prompt), ratio: ['16:9', '1:1', '3:4', '4:3'].includes(x.ratio) ? x.ratio : undefined })),
    darkSections: Array.isArray(m.darkSections) ? m.darkSections.map(String).slice(0, 2) : [],
  };
  (dir as any).notes = m.notes ? String(m.notes) : undefined;
  return dir;
}

/** Apply a direction to the plan/spec meta: section accents, fx flags, dark (cinematic) sections. */
export function applyDirection(plan: Plan, dir: Direction): void {
  plan.meta.direction = dir; plan.meta.fx = dir.fx;
  const acc = dir.palette?.sectionAccents || {};
  (plan.sections || []).forEach(s => { if (acc[s.id]) s.accent = acc[s.id]; });
}

/** Compact art-direction block for the slide designer prompt. */
export function directionBlock(dir: Direction | undefined, slide: { id: string; section?: string | null }): string {
  if (!dir) return '';
  const img = (dir.images || []).find(i => i.id === slide.id);
  const dark = slide.section && (dir.darkSections || []).includes(slide.section);
  return `\n[아트 디렉션 — 이 덱의 시각 언어, 반드시 따른다]\n무드: ${dir.mood}\n컨셉: ${dir.concept}\n모티프: ${(dir.motifs || []).join(' · ')}\n모션: ${dir.motion}\n${dir.palette?.notes ? '타이포: ' + dir.palette.notes + '\n' : ''}${(dir as any).notes ? '지시: ' + (dir as any).notes + '\n' : ''}덱 레이어 helper 클래스(이미 정의됨, 그대로 사용): ${(dir.helpers || []).join(' / ') || '(없음)'}\n${dark ? '이 장은 시네마틱 다크 무대다: 엔진이 .stage.cine 을 적용하므로 어두운 바탕 위 밝은 글자·유리 카드로 설계한다(토큰은 자동 반전).\n' : ''}${img ? `이 장은 사진을 쓴다 (role=${img.role}, ratio=${img.ratio || (img.role === 'backdrop' ? '16:9' : '4:3')}): 레이아웃에 <img data-image="${img.prompt.replace(/"/g, "'")}" alt="…" class="…"> 를 넣어라. backdrop이면 <div class="backdrop kb fade-r"><img data-image=… style="--pos:50% 40%"></div> 를 .body 첫 요소로 두고 글은 왼쪽에, side면 오른쪽 열(≥560px)에 .photo 카드로. 이미지는 엔진이 생성해 채운다(지금은 플레이스홀더).\n` : '이 장에는 사진을 넣지 않는다(다이어그램·SVG·숫자로 표현).\n'}`;
}
