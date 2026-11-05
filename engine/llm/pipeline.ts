/* Deck pipeline: brief → plan → fill → spec → render. Runtime-agnostic (Node/Deno). */
import { chat, extractJson, type ProviderConfig } from './provider.ts';
import { PLAN_SYSTEM, FILL_SYSTEM, FIX_SYSTEM, REVIEW_SYSTEM, DISTILL_SYSTEM, rulesBlock } from './prompts.ts';
import { PLAN_PREMIUM_ADDON, fillSlideRich, isRichTarget } from './rich.ts';
import type { DeckSpec, Slide, Purpose, ThemeName } from '../renderer/types.ts';
import { validateSpec } from '../renderer/validate.ts';

export interface Brief {
  topic: string;                 // 주제/제목 요청
  purpose?: Purpose;
  audience?: string;
  durationMin?: number;
  slideCount?: number;
  tone?: 'formal' | 'friendly' | 'bold' | 'academic';
  theme?: ThemeName;
  lang?: string;
  presenter?: { name: string; org?: string };
  event?: string; date?: string; place?: string;
  materials?: string;            // 붙여넣은 자료/메모 (최대 ~40K자)
  extra?: string;                // 추가 지시
  brand?: string;                // #hex
}

export interface Rule { scope: 'plan' | 'fill' | 'render' | 'all'; text: string; weight?: number }

export interface PlanSlide { id: string; section?: string | null; type: string; title: string; sub?: string; intent?: string; content_hints?: string[]; visual_hint?: string; t?: number; kind?: string; signature?: string }
export interface Plan { meta: DeckSpec['meta']; sections: DeckSpec['sections']; slides: PlanSlide[] }

export interface PipelineOptions {
  provider: ProviderConfig;
  rules?: Rule[];
  batchSize?: number;            // slides per fill call
  concurrency?: number;
  onProgress?: (e: { stage: string; done?: number; total?: number; msg?: string }) => void;
  log?: (m: string) => void;
  premium?: boolean;             // premium: plan asks for kind/signature; content slides are designed one by one (rich HTML)
  richProvider?: ProviderConfig; // model used for rich slides (defaults to provider)
  richConcurrency?: number;
}

function briefText(b: Brief): string {
  const lines = [
    `주제/요청: ${b.topic}`,
    b.purpose ? `목적(purpose): ${b.purpose}` : '', b.audience ? `청중: ${b.audience}` : '',
    b.durationMin ? `발표 시간: ${b.durationMin}분` : '', b.slideCount ? `요청 장수: ${b.slideCount}장 (반드시 이 장수)` : '',
    b.tone ? `톤: ${b.tone}` : '', b.theme ? `테마: ${b.theme}` : '', b.lang ? `언어: ${b.lang}` : '언어: ko',
    b.presenter ? `발표자: ${b.presenter.name}${b.presenter.org ? ' (' + b.presenter.org + ')' : ''}` : '',
    b.event ? `행사: ${b.event}` : '', b.date ? `일자: ${b.date}` : '', b.place ? `장소: ${b.place}` : '',
    b.extra ? `추가 지시: ${b.extra}` : '',
  ].filter(Boolean);
  let t = lines.join('\n');
  if (b.materials) t += `\n\n[참고 자료 — 사실·수치는 여기서만 가져올 것]\n${b.materials.slice(0, 60000)}`;
  return t;
}

export async function planDeck(brief: Brief, opt: PipelineOptions): Promise<Plan> {
  opt.onProgress?.({ stage: 'plan', msg: '덱 구조 설계 중' });
  const system = PLAN_SYSTEM + (opt.premium ? PLAN_PREMIUM_ADDON : '') + rulesBlock(opt.rules || [], 'plan');
  const r = await chat(opt.provider, { system, messages: [{ role: 'user', content: briefText(brief) + '\n\n위 브리프로 덱 플랜 JSON을 작성하라.' }], maxTokens: 12000, temperature: 0.5 });
  opt.log?.(`[plan] ${r.model} ${r.ms}ms`);
  const plan = extractJson<Plan>(r.text);
  if (!plan.slides?.length) throw new Error('plan has no slides');
  plan.slides.forEach((s, i) => { if (!s.id) s.id = 'p' + String(i + 1).padStart(2, '0'); });
  plan.sections = plan.sections || [];
  if (brief.theme) plan.meta.theme = brief.theme;
  if (brief.brand) (plan.meta as any).brand = brief.brand;
  if (brief.presenter && !plan.meta.presenter) plan.meta.presenter = brief.presenter;
  if (brief.slideCount && plan.slides.length !== brief.slideCount) opt.log?.(`[plan] requested ${brief.slideCount} got ${plan.slides.length}`);
  return plan;
}

/** Large decks (> ~24 slides) cannot be planned in one LLM call inside a 150s request: phase 1 writes the outline (sections + slide stubs), phase 2 fills details per chunk of slides (parallel requests). */
export const PLAN_OUTLINE_ADDON = `
[대형 덱 — 1단계: 개요만]
이 덱은 장수가 많아 두 단계로 설계한다. 지금은 meta, sections, 그리고 slides 의 각 항목에 id · section · type · title · intent (프리미엄이면 kind · signature 까지) 만 쓴다. sub · content_hints · visual_hint 는 쓰지 않는다(2단계에서 채운다). 제목은 결론형(**강조**)으로 완성해서 쓴다.`;

export const PLAN_DETAIL_SYSTEM = `당신은 Qpresen Deck Engine의 "덱 플래너"다. 이미 확정된 덱 개요(섹션·장 제목·유형)의 일부 장에 대해 상세 계획만 채운다. 디자인은 하지 않는다.
각 장에 대해: "sub"(근거 한 문장), "content_hints"(이 장에 넣을 사실·수치·예시 4~6개, 각 ≤ 40자 — 자료가 있으면 자료의 수치·고유명사·예시를, 없으면 널리 알려진 공개 사실·수치(기관·연도 명시, 불확실하면 '약'·'추정')), "visual_hint"(차트/다이어그램/이미지 장면 ≤ 30자). 프리미엄 덱이면 "signature"(시그니처 비주얼·인터랙션 한 줄 ≤ 40자, 앞뒤 장과 겹치지 않게)도 채운다. id · title · type · kind 는 바꾸지 않는다.
출력 JSON: { "slides": [ { "id", "sub", "content_hints": [], "visual_hint", "signature"? } ] } — 요청받은 장만, 요청 순서대로. JSON만 출력.`;

export async function planOutline(brief: Brief, opt: PipelineOptions): Promise<Plan> {
  opt.onProgress?.({ stage: 'plan', msg: '덱 개요 설계 중' });
  const system = PLAN_SYSTEM + (opt.premium ? PLAN_PREMIUM_ADDON : '') + PLAN_OUTLINE_ADDON + rulesBlock(opt.rules || [], 'plan');
  const r = await chat(opt.provider, { system, messages: [{ role: 'user', content: briefText(brief) + '\n\n위 브리프로 덱 플랜 JSON(1단계: 개요)을 작성하라.' }], maxTokens: 9000, temperature: 0.5 });
  opt.log?.(`[plan:outline] ${r.model} ${r.ms}ms`);
  const plan = extractJson<Plan>(r.text);
  if (!plan.slides?.length) throw new Error('plan has no slides');
  plan.slides.forEach((s, i) => { if (!s.id) s.id = 'p' + String(i + 1).padStart(2, '0'); });
  plan.sections = plan.sections || [];
  if (brief.theme) plan.meta.theme = brief.theme;
  if (brief.brand) (plan.meta as any).brand = brief.brand;
  if (brief.presenter && !plan.meta.presenter) plan.meta.presenter = brief.presenter;
  (plan as any).outlineOnly = true;
  return plan;
}

export async function planDetails(brief: Brief, plan: Plan, ids: string[], opt: PipelineOptions): Promise<PlanSlide[]> {
  const targets = plan.slides.filter(s => ids.includes(s.id));
  if (!targets.length) return [];
  const outline = plan.slides.map(s => ({ id: s.id, section: s.section, type: s.type, kind: (s as any).kind, title: s.title }));
  const user = `${briefText(brief)}\n\n[덱 개요]\n${JSON.stringify({ meta: plan.meta, sections: plan.sections, outline })}\n\n[이번에 상세를 채울 장]\n${JSON.stringify(targets.map(t => ({ id: t.id, section: t.section, type: t.type, kind: (t as any).kind, title: t.title, intent: t.intent })))}${opt.premium ? '\n(프리미엄 덱: signature 포함)' : ''}`;
  const r = await chat(opt.provider, { system: PLAN_DETAIL_SYSTEM + rulesBlock(opt.rules || [], 'plan'), messages: [{ role: 'user', content: user }], maxTokens: Math.min(9000, 700 * targets.length + 800), temperature: 0.5 });
  opt.log?.(`[plan:detail ${ids.join(',')}] ${r.model} ${r.ms}ms`);
  const out = extractJson<{ slides: Partial<PlanSlide>[] }>(r.text);
  const got = (out.slides || []).filter(Boolean);
  return targets.map(t => { const d: any = got.find(x => x.id === t.id) || {}; const m: any = { ...t }; if (d.sub) m.sub = String(d.sub); if (Array.isArray(d.content_hints)) m.content_hints = d.content_hints.map(String).slice(0, 6); if (d.visual_hint) m.visual_hint = String(d.visual_hint); if (d.signature) m.signature = String(d.signature); return m as PlanSlide; });
}

export async function fillSlides(brief: Brief, plan: Plan, ids: string[], opt: PipelineOptions): Promise<Slide[]> {
  const system = FILL_SYSTEM + rulesBlock(opt.rules || [], 'fill');
  const planText = JSON.stringify({ meta: plan.meta, sections: plan.sections, outline: plan.slides.map(s => ({ id: s.id, section: s.section, type: s.type, title: s.title })) });
  const targets = plan.slides.filter(s => ids.includes(s.id));
  const user = `${briefText(brief)}\n\n[덱 플랜 요약]\n${planText}\n\n[이번에 작성할 장 — 각 장의 완전한 스펙을 써라]\n${JSON.stringify(targets, null, 1)}`;
  const r = await chat(opt.provider, { system, messages: [{ role: 'user', content: user }], maxTokens: Math.min(16000, 2600 * targets.length + 1500), temperature: 0.4 });
  opt.log?.(`[fill ${ids.join(',')}] ${r.model} ${r.ms}ms`);
  const out = extractJson<{ slides: Slide[] }>(r.text);
  const slides = (out.slides || []).filter(Boolean);
  // ensure order + presence; fall back to a minimal slide from plan
  return ids.map(id => {
    const found = slides.find(s => s.id === id);
    if (found) return found;
    const p = targets.find(t => t.id === id)!;
    opt.log?.(`[fill] missing ${id}, using fallback`);
    return { id, section: p.section || undefined, title: p.title, sub: p.sub, notes: { t: p.t || 40, s: p.intent || '' }, body: { type: 'bullets-visual', bullets: (p.content_hints || [p.intent || p.title]).slice(0, 5).map(h => ({ title: h.slice(0, 40) })) } } as Slide;
  });
}

export async function buildSpec(brief: Brief, opt: PipelineOptions, existingPlan?: Plan): Promise<{ spec: DeckSpec; plan: Plan; warnings: string[] }> {
  const plan = existingPlan || await planDeck(brief, opt);
  const batch = opt.batchSize || 3, conc = opt.concurrency || 4;
  const results: Record<string, Slide> = {};
  let ids = plan.slides.map(s => s.id);
  if (opt.premium) {
    // premium: content slides are designed individually by the rich pipeline; structural slides go through the standard fill below
    const richIds = plan.slides.filter(isRichTarget).map(s => s.id);
    ids = ids.filter(id => !richIds.includes(id));
    let rdone = 0; let rc = 0; const rconc = opt.richConcurrency || 4;
    opt.onProgress?.({ stage: 'rich', done: 0, total: richIds.length });
    const rworker = async () => { while (rc < richIds.length) { const id = richIds[rc++]; const p = plan.slides.find(x => x.id === id)!; try { results[id] = await fillSlideRich(brief, plan, p, { ...opt, provider: opt.richProvider || opt.provider }); } catch (e: any) { opt.log?.(`[rich] ${id} failed: ${e.message} → standard fill`); ids.push(id); } rdone++; opt.onProgress?.({ stage: 'rich', done: rdone, total: richIds.length }); } };
    await Promise.all(Array.from({ length: Math.min(rconc, richIds.length) }, rworker));
    ids = plan.slides.map(s => s.id).filter(id => ids.includes(id));
  }
  const batches: string[][] = []; for (let i = 0; i < ids.length; i += batch) batches.push(ids.slice(i, i + batch));
  let done = 0;
  opt.onProgress?.({ stage: 'fill', done: 0, total: ids.length });
  let cursor = 0;
  const worker = async () => { while (cursor < batches.length) { const b = batches[cursor++]; try { const ss = await fillSlides(brief, plan, b, opt); ss.forEach(s => results[s.id!] = s); } catch (e: any) { opt.log?.(`[fill] batch ${b.join(',')} failed: ${e.message}`); b.forEach(id => { const p = plan.slides.find(x => x.id === id)!; results[id] = { id, section: p.section || undefined, title: p.title, sub: p.sub, notes: { t: p.t || 40, s: p.intent || '' }, body: { type: 'bullets-visual', bullets: (p.content_hints || [p.title]).slice(0, 5).map(h => ({ title: h.slice(0, 40) })) } } as Slide; }); } done += b.length; opt.onProgress?.({ stage: 'fill', done, total: ids.length }); } };
  await Promise.all(Array.from({ length: Math.min(conc, batches.length) }, worker));
  const slides = plan.slides.map(s => results[s.id]).filter(Boolean);
  // section ids: keep only valid
  const secIds = new Set((plan.sections || []).map(s => s.id));
  slides.forEach(s => { if (s.section && !secIds.has(s.section)) s.section = undefined; });
  const raw: DeckSpec = { meta: plan.meta, sections: plan.sections, slides };
  const { spec, warnings } = validateSpec(raw);
  return { spec, plan, warnings };
}

export async function fixSlide(slide: Slide, issues: { code?: string; sev?: string; what?: string; extra?: any; el?: string; fix?: string }[], opt: PipelineOptions, specMeta?: DeckSpec['meta']): Promise<Slide> {
  const user = `[덱 메타] ${JSON.stringify(specMeta || {})}\n[현재 슬라이드 스펙]\n${JSON.stringify(slide, null, 1)}\n\n[지적 사항]\n${issues.map(i => `- ${i.sev || ''} ${i.code || ''} ${i.el || ''} ${i.extra != null ? '(' + i.extra + ')' : ''} ${i.what || ''} ${i.fix ? '→ ' + i.fix : ''}`).join('\n')}\n\n수정된 슬라이드 JSON만 출력.`;
  const r = await chat(opt.provider, { system: FIX_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: 6000, temperature: 0.3 });
  opt.log?.(`[fix ${slide.id}] ${r.model} ${r.ms}ms`);
  const fixed = extractJson<Slide>(r.text);
  if (!fixed || !fixed.body) return slide;
  fixed.id = slide.id; return fixed;
}

export async function reviewSlide(image: string, slide: Slide, opt: PipelineOptions, extra?: { lint?: any[]; direction?: string; mime?: string; motion?: any; cine?: boolean }): Promise<any> {
  const m = image.match(/^data:(image\/[a-z]+);base64,(.*)$/s); const mime = m ? m[1] : (extra?.mime || 'image/jpeg'); const b64 = m ? m[2] : image;
  const b: any = slide.body;
  const mo = extra?.motion; const motionText = mo ? `등장 요소 ${mo.reveals}개 · 카운트업 ${mo.counters}/${mo.numbers}(숫자 수) · 살아있는 요소 ${(mo.living || []).join('+') || '없음'} · 상호작용 ${(mo.interactive || []).join('+') || '없음'} · 장 전용 스크립트 ${mo.scripts > 0 ? '있음' : '없음'}` : '(정보 없음)';
  const stageText = b.cine || extra?.cine ? '시네마틱 다크 무대(cine) — 아트 디렉션이 의도한 어두운 섹션이므로 다크 무대 기준(유리 카드·흰 글자·네온 포인트, 800조 덱처럼)으로 평가하고, 어둡다는 이유로 감점하지 말 것' : '밝은 무대(light)';
  const ctx = `슬라이드 ${slide.id} (${b.type}${b.kind ? '/' + b.kind : ''}) "${slide.title}"${b.signature ? ' — 시그니처: ' + b.signature : ''}${extra?.direction ? '\n[아트 디렉션] ' + extra.direction : ''}\n[무대] ${stageText}\n[모션 인벤토리] ${motionText}${extra?.lint?.length ? '\n[자동 린트가 찾은 문제] ' + JSON.stringify(extra.lint).slice(0, 1200) : ''}\n이 스크린샷(정적 모드: 애니메이션 완료 상태)을 평가하라.`;
  const r = await chat(opt.provider, { system: REVIEW_SYSTEM, messages: [{ role: 'user', content: [{ type: 'text', text: ctx }, { type: 'image', mime, base64: b64 }] }], maxTokens: 2500, temperature: 0.2 });
  opt.log?.(`[review ${slide.id}] ${r.model} ${r.ms}ms cost=${r.usage?.cost ?? '?'}`);
  return extractJson(r.text);
}

export async function distillRules(feedback: any[], existing: Rule[], opt: PipelineOptions): Promise<Rule[]> {
  const user = `[기존 규칙]\n${existing.map(r => `- (${r.scope}) ${r.text}`).join('\n') || '(없음)'}\n\n[누적 피드백]\n${JSON.stringify(feedback).slice(0, 60000)}\n\n새 규칙 JSON만 출력.`;
  const r = await chat(opt.provider, { system: DISTILL_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: 3000, temperature: 0.2 });
  const out = extractJson<{ rules: Rule[] }>(r.text);
  return (out.rules || []).filter(x => x && x.text);
}
