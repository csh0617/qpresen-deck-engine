/* Qpresen Deck Engine — Supabase Edge Function
   actions: models | plan | fill | render | build | status | feedback | rules | distill
   env: DECK_LLM_API_KEY (preferred) or BIZROUTER_API_KEY / ANTHROPIC_API_KEY, LLM_KIND=openai|anthropic, LLM_BASE_URL, LLM_MODEL, LLM_FALLBACKS */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import qrcode from 'npm:qrcode-generator@1.4.4';
import { renderDeck, qpresenBundle, firstSlidePayload } from './renderer/index.ts';
import { planDeck, fillSlides, buildSpec, fixSlide, distillRules, type Brief, type Rule, type Plan } from './llm/pipeline.ts';
import { fillSlideRich, fixSlideRich, isRichTarget, warmRichCache } from './llm/rich.ts';
import { directDeck, applyDirection } from './llm/direct.ts';
import { writeDossier } from './llm/dossier.ts';
import { reviewSlide } from './llm/pipeline.ts';
import { generateImages } from './llm/images.ts';
import { listModels, type ProviderConfig } from './llm/provider.ts';
import { validateSpec } from './renderer/validate.ts';

const ORIGINS = ['https://qpresen.com', 'https://www.qpresen.com', 'https://readdy.ai', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' } });

function provider(): ProviderConfig {
  const kind = (Deno.env.get('LLM_KIND') || 'openai') as 'openai' | 'anthropic';
  // DECK_LLM_API_KEY (deck-engine specific) takes precedence over the shared BIZROUTER_API_KEY / ANTHROPIC_API_KEY
  const apiKey = Deno.env.get('DECK_LLM_API_KEY') || (kind === 'anthropic' ? (Deno.env.get('ANTHROPIC_API_KEY') || '') : (Deno.env.get('BIZROUTER_API_KEY') || ''));
  return { kind, apiKey, baseUrl: Deno.env.get('LLM_BASE_URL') || (kind === 'anthropic' ? 'https://api.anthropic.com' : 'https://bizrouter.ai/api/v1'), model: Deno.env.get('LLM_MODEL') || (kind === 'anthropic' ? 'claude-sonnet-5-5' : 'anthropic/claude-sonnet-5.5'), fallbackModels: (Deno.env.get('LLM_FALLBACKS') || (kind === 'anthropic' ? '' : 'anthropic/claude-opus-5.5,anthropic/claude-haiku-5.5')).split(',').map(s => s.trim()).filter(Boolean), timeoutMs: 120000, maxRetries: 1 };
}
/* Premium ("rich") slides are designed one by one by the top-tier model. DECK_RICH_MODEL / DECK_RICH_FALLBACKS override the defaults. */
/* Measured 2026-11-05 (BizRouter): fable-5.1 designs a slide in 60~100s (5~9K output tokens, ≈₩450~1,000 with prompt cache);
   opus-5.5 in 30~40s but with weaker layouts. Planning uses opus (fable needs ~145s for a 20-slide plan — over the function limit).
   No model fallback inside one request: a failed/slow slide returns an error fast and the studio retries with a fresh request. */
function richProvider(base: ProviderConfig): ProviderConfig {
  return { ...base, model: Deno.env.get('DECK_RICH_MODEL') || (base.kind === 'anthropic' ? 'claude-fable-5-1' : 'anthropic/claude-fable-5.1'), fallbackModels: [], timeoutMs: 135000, maxRetries: 0 };
}
function premiumPlanProvider(base: ProviderConfig): ProviderConfig {
  return { ...base, model: Deno.env.get('DECK_PREMIUM_PLAN_MODEL') || (base.kind === 'anthropic' ? 'claude-opus-5-5' : 'anthropic/claude-opus-5.5'), fallbackModels: [base.model], timeoutMs: 120000, maxRetries: 0 };
}
function qrSvg(text: string): string {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(); const cell = 4; const size = n * cell; let path = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c * cell} ${r * cell}h${cell}v${cell}h-${cell}z`;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#0A1633"/></svg>`;
}
/* Font: fetched once per isolate (subset woff2 → base64). Order: DECK_FONT_URL → Storage public bucket → jsDelivr (full Pretendard Variable). */
let FONT_CACHE: string | null | undefined;
async function getFontBase64(): Promise<string | undefined> {
  if (FONT_CACHE !== undefined) return FONT_CACHE || undefined;
  const urls = [Deno.env.get('DECK_FONT_URL') || '', `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/deck-assets/PretendardVariable-ko-subset.woff2`, 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2'].filter(Boolean);
  for (const u of urls) {
    try { const r = await fetch(u); if (!r.ok) continue; const buf = new Uint8Array(await r.arrayBuffer()); if (buf.length < 10000) continue; let bin = ''; const CH = 0x8000; for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CH))); FONT_CACHE = btoa(bin); console.log(`[deck-engine] font loaded from ${u} (${buf.length} bytes)`); return FONT_CACHE; } catch (e) { console.log('[deck-engine] font fetch failed ' + u); }
  }
  FONT_CACHE = null; return undefined;
}
const safeName = (s: string) => (s || 'deck').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').trim().slice(0, 80) || 'deck';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const allow = ORIGINS.includes(origin) ? origin : '*';
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405, allow);
  let body: any; try { body = await req.json(); } catch { return json({ error: 'INVALID_JSON' }, 400, allow); }
  const action = String(body.action || '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!; const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  let userId: string | null = null;
  if (token) { const { data } = await db.auth.getUser(token); userId = data?.user?.id || null; }
  if (!userId) return json({ error: 'AUTH_REQUIRED' }, 401, allow);
  const prov = provider();
  if (!prov.apiKey && ['plan', 'fill', 'build', 'fix', 'distill', 'models'].includes(action)) return json({ error: 'LLM_NOT_CONFIGURED' }, 503, allow);
  const log = (m: string) => console.log(`[deck-engine] ${m}`);
  const loadRules = async (): Promise<Rule[]> => { const { data } = await db.from('deck_rules').select('scope,text,weight').eq('active', true); return (data || []) as Rule[]; };
  const touch = async (id: string, patch: Record<string, unknown>) => { await db.from('deck_jobs').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId); };

  try {
    if (action === 'models') { const models = await listModels(prov); return json({ provider: prov.kind, model: prov.model, models }, 200, allow); }
    if (action === 'rules') { return json({ rules: await loadRules() }, 200, allow); }

    if (action === 'plan') {
      const brief = body.brief as Brief; if (!brief?.topic) return json({ error: 'TOPIC_REQUIRED' }, 400, allow);
      const premium = body.quality === 'premium' || body.quality === 'studio' || (brief as any).quality === 'premium' || (brief as any).quality === 'studio';
      if (premium) (brief as any).quality = 'premium';
      const planProv = premium ? premiumPlanProvider(prov) : prov;
      const rules = await loadRules();
      const { data: job, error } = await db.from('deck_jobs').insert({ user_id: userId, status: 'planning', brief, model: planProv.model }).select('id').single();
      if (error) return json({ error: 'DB:' + error.message }, 500, allow);
      try {
        // premium: thin briefs get a research dossier first (facts, figures, named examples) so slides are concrete, not generic
        let dossier: string | undefined;
        if (premium && body.dossier !== false && String(brief.materials || '').length < 1500) {
          try { dossier = await writeDossier(brief, { provider: planProv, log }); brief.materials = `[자료집 — 모델이 정리한 공개 사실·수치(출처·연도 명시, 추정 표기)]\n${dossier}\n\n${brief.materials || ''}`.trim(); (brief as any).dossier = true; await touch(job.id, { brief }); } catch (e: any) { log('[dossier] failed: ' + e.message); }
        }
        const plan = await planDeck(brief, { provider: planProv, rules, log, premium });
        (plan.meta as any).quality = premium ? 'premium' : 'standard';
        await touch(job.id, { status: premium ? 'directing' : 'filling', plan, progress: { done: 0, total: plan.slides.length } });
        return json({ jobId: job.id, plan, dossier: !!dossier }, 200, allow);
      } catch (e: any) { await touch(job.id, { status: 'failed', error: String(e.message) }); throw e; }
    }

    if (action === 'direct') {
      // premium: deck-level art direction (design layer + section accents + photo plan), then warm the per-kind prompt caches
      const { jobId } = body; if (!jobId) return json({ error: 'JOB_REQUIRED' }, 400, allow);
      const { data: job } = await db.from('deck_jobs').select('brief,plan').eq('id', jobId).eq('user_id', userId).single();
      if (!job?.plan) return json({ error: 'JOB_NOT_FOUND' }, 404, allow);
      const plan = job.plan as Plan; const rules = await loadRules();
      const direction = await directDeck(job.brief as Brief, plan, { provider: richProvider(prov), rules, log, imageBudget: Math.max(0, Math.min(8, Number(body.imageBudget ?? 6))) });
      applyDirection(plan, direction);
      await touch(jobId, { status: 'filling', plan });
      const n = await warmRichCache(plan, { provider: richProvider(prov), rules, log }); log(`[direct] cache warmed: ${n} prompts`);
      const { deckCss, deckJs, ...summary } = direction as any;
      return json({ jobId, direction: { ...summary, deckCssBytes: (deckCss || '').length, deckJsBytes: (deckJs || '').length } }, 200, allow);
    }

    if (action === 'review') {
      // premium QA: vision review of one slide (screenshot from the player) — returns the verdict; the studio decides whether to call fix
      const { jobId, slideId, image, lint } = body; if (!jobId || !slideId || !image) return json({ error: 'JOB_SLIDE_IMAGE_REQUIRED' }, 400, allow);
      const { data: job } = await db.from('deck_jobs').select('spec').eq('id', jobId).eq('user_id', userId).single();
      if (!job?.spec) return json({ error: 'JOB_NOT_FOUND' }, 404, allow);
      const spec = job.spec as any; const slide = spec.slides.find((x: any) => x.id === slideId); if (!slide) return json({ error: 'SLIDE_NOT_FOUND' }, 404, allow);
      const dir = spec.meta?.direction; const dirText = dir ? `${dir.mood || ''} / ${dir.concept || ''}` : undefined;
      const review = await reviewSlide(String(image), slide, { provider: richProvider(prov), log }, { lint: Array.isArray(lint) ? lint : undefined, direction: dirText });
      await db.from('deck_feedback').insert({ job_id: jobId, user_id: userId, slide_id: slideId, slide_type: slide.body?.type, source: 'vision', rating: typeof review?.score === 'number' ? Math.round(review.score) : null, comment: review?.upgrade || null, data: { review } });
      return json({ review }, 200, allow);
    }

    if (action === 'fill') {
      const { jobId, ids } = body; if (!jobId || !Array.isArray(ids) || !ids.length) return json({ error: 'JOB_AND_IDS_REQUIRED' }, 400, allow);
      const { data: job } = await db.from('deck_jobs').select('brief,plan,spec,progress').eq('id', jobId).eq('user_id', userId).single();
      if (!job?.plan) return json({ error: 'JOB_NOT_FOUND' }, 404, allow);
      const rules = await loadRules();
      const premium = (job.brief as any)?.quality === 'premium';
      let slides: any[];
      if (premium) {
        // premium: content slides are designed individually (rich HTML, ≤2 per call to stay inside the function's time budget);
        // structural slides (cover/section/agenda/closing/quote/image-hero) use the standard fill with the top model.
        const planSlides = (job.plan as Plan).slides; const want = ids.slice(0, 6).filter((id: string) => planSlides.some(p => p.id === id));
        const richIds = want.filter((id: string) => isRichTarget(planSlides.find(p => p.id === id)!)).slice(0, 2);
        const stdIds = want.filter((id: string) => !richIds.includes(id) && !isRichTarget(planSlides.find(p => p.id === id)!));
        const rp = richProvider(prov), sp = premiumPlanProvider(prov);
        const richRes = await Promise.all(richIds.map(async (id: string) => { const p = planSlides.find(x => x.id === id)!;
          if (body.mode === 'standard') { const [s] = await fillSlides(job.brief as Brief, job.plan as Plan, [id], { provider: sp, rules, log }); return s; }
          return await fillSlideRich(job.brief as Brief, job.plan as Plan, p, { provider: rp, rules, log }); }));
        const stdRes = stdIds.length ? await fillSlides(job.brief as Brief, job.plan as Plan, stdIds, { provider: sp, rules, log }) : [];
        slides = [...richRes, ...stdRes];
      } else {
        slides = await fillSlides(job.brief as Brief, job.plan as Plan, ids.slice(0, 6), { provider: prov, rules, log });
      }
      // Merge into job.spec.slides by id — fill batches run concurrently, so use optimistic concurrency:
      // re-read, merge, and write only if the row's revision stamp is unchanged; retry otherwise.
      const plan = job.plan as Plan; const total = plan.slides.length;
      let done = 0;
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: cur } = await db.from('deck_jobs').select('spec,progress').eq('id', jobId).single();
        const spec = (cur?.spec as any) || { meta: plan.meta, sections: plan.sections, slides: [] };
        const prevRev = (cur?.progress as any)?.rev ?? null;
        const map = new Map<string, any>((spec.slides || []).map((s: any) => [s.id, s]));
        slides.forEach(s => map.set(s.id!, s));
        spec.slides = plan.slides.map(p => map.get(p.id)).filter(Boolean);
        done = spec.slides.length;
        const rev = crypto.randomUUID();
        let q = db.from('deck_jobs').update({ spec, progress: { done, total, rev }, status: done >= total ? 'rendering' : 'filling', updated_at: new Date().toISOString() }).eq('id', jobId).eq('user_id', userId);
        q = prevRev ? q.eq('progress->>rev', prevRev) : q.is('progress->>rev', null);
        const { data: upd, error } = await q.select('id');
        if (error) { log('fill merge error: ' + error.message); break; }
        if (upd && upd.length) break; // committed
        await new Promise(r => setTimeout(r, 60 + Math.random() * 140)); // lost the race → retry with fresh state
      }
      return json({ slides, progress: { done, total } }, 200, allow);
    }

    if (action === 'render' || action === 'build') {
      let spec: any; let jobId: string | null = body.jobId || null; let plan: Plan | undefined;
      if (action === 'build') {
        const brief = body.brief as Brief; if (!brief?.topic) return json({ error: 'TOPIC_REQUIRED' }, 400, allow);
        const rules = await loadRules();
        const { data: job } = await db.from('deck_jobs').insert({ user_id: userId, status: 'planning', brief, model: prov.model }).select('id').single();
        jobId = job?.id || null;
        const r = await buildSpec(brief, { provider: prov, rules, log, batchSize: 3, concurrency: 6, onProgress: e => { if (jobId) touch(jobId, { status: e.stage === 'plan' ? 'planning' : 'filling', progress: { done: e.done || 0, total: e.total || 0 } }); } });
        spec = r.spec; plan = r.plan;
      } else if (jobId) {
        const { data: job } = await db.from('deck_jobs').select('spec,plan').eq('id', jobId).eq('user_id', userId).single();
        if (!job?.spec) return json({ error: 'SPEC_NOT_READY' }, 409, allow);
        spec = job.spec; plan = job.plan as Plan;
      } else if (body.spec) { spec = body.spec; } else return json({ error: 'JOB_OR_SPEC_REQUIRED' }, 400, allow);
      // order slides by plan, drop missing
      if (plan) { const map = new Map<string, any>((spec.slides || []).map((s: any) => [s.id, s])); spec.slides = plan.slides.map(p => map.get(p.id)).filter(Boolean); }
      const { spec: valid, warnings } = validateSpec(spec);
      // image stage: real pictures for cover/hero/section slides (idempotent — cached in the job spec as data URLs)
      let images: { generated: number; failed: string[] } | null = null;
      if (body.images !== false && prov.apiKey) {
        if (jobId) await touch(jobId, { status: 'imaging' });
        const isPremiumSpec = (valid.meta as any)?.quality === 'premium' || !!(valid.meta as any)?.direction;
        images = await generateImages(valid, prov, { max: Math.max(0, Math.min(12, Number(body.maxImages ?? (isPremiumSpec ? 10 : 4)))), quality: body.imageQuality || 'low', log, onProgress: (e: { done: number; total: number }) => { if (jobId) touch(jobId, { progress: { stage: 'images', done: e.done, total: e.total } }); } });
      }
      // Qpresen-native bundle (slides concatenated with slide-title/SLIDE BREAK markers, CDN font) is what gets stored & registered;
      // the offline single-file player (embedded font) is returned for download when requested.
      const wantPlayer = body.includeHtml !== false;
      const res = renderDeck(valid, { fontBase64: wantPlayer ? await getFontBase64() : undefined, qr: qrSvg, partsFontMode: 'cdn', partsOnly: !wantPlayer });
      const bundle = qpresenBundle(res.parts);
      const title = safeName(valid.meta.title);
      const path = `${userId}/deck-engine/${jobId || Date.now()}.html`;
      const bytes = new TextEncoder().encode(bundle);
      const up = await db.storage.from('pdfs').upload(path, bytes, { contentType: 'text/html; charset=utf-8', upsert: true });
      let signedUrl: string | null = null;
      if (!up.error) { const s = await db.storage.from('pdfs').createSignedUrl(path, 60 * 60 * 24); signedUrl = s.data?.signedUrl || null; }
      let fileId: string | null = null;
      if (body.register !== false) {
        const ins = await db.from('pdf_files').insert({ user_id: userId, name: title, file_name: `${title}.html`, file_path: path, file_type: 'html', page_count: res.parts.length, file_size: bytes.length, current_page: 1, auto_fullscreen: false, first_slide: firstSlidePayload(res.parts[0], res.titles[0]) }).select('id').single();
        if (!ins.error) fileId = ins.data.id; else log('pdf_files insert failed: ' + ins.error.message);
      }
      if (jobId) await touch(jobId, { status: 'done', spec: valid, storage_path: path, page_count: res.parts.length, file_id: fileId, lint: { warnings } });
      const includeHtml = wantPlayer && res.html.length < 9_000_000;
      return json({ jobId, fileId, path, signedUrl, pageCount: res.parts.length, titles: res.titles, sections: res.sections, warnings, images, bytes: bytes.length, html: includeHtml ? res.html : undefined, qpresenHtml: bytes.length < 6_000_000 ? bundle : undefined, spec: valid }, 200, allow);
    }

    if (action === 'status') {
      const { data: job } = await db.from('deck_jobs').select('id,status,progress,page_count,file_id,storage_path,error,created_at').eq('id', body.jobId).eq('user_id', userId).single();
      return job ? json(job, 200, allow) : json({ error: 'JOB_NOT_FOUND' }, 404, allow);
    }

    if (action === 'fix') {
      const { jobId, slideId, issues } = body;
      const { data: job } = await db.from('deck_jobs').select('spec').eq('id', jobId).eq('user_id', userId).single();
      if (!job?.spec) return json({ error: 'JOB_NOT_FOUND' }, 404, allow);
      const spec = job.spec as any; const idx = spec.slides.findIndex((s: any) => s.id === slideId); if (idx < 0) return json({ error: 'SLIDE_NOT_FOUND' }, 404, allow);
      const issueList = Array.isArray(issues) ? issues : [{ what: String(body.comment || '개선') }];
      const isRich = spec.slides[idx]?.body?.type === 'custom' && spec.slides[idx]?.body?.rich;
      const fixed = isRich ? await fixSlideRich(spec.slides[idx], issueList, { provider: richProvider(prov), log }, spec.meta) : await fixSlide(spec.slides[idx], issueList, { provider: (spec.meta as any)?.quality === 'premium' ? premiumPlanProvider(prov) : prov, log }, spec.meta);
      spec.slides[idx] = fixed; await touch(jobId, { spec });
      await db.from('deck_feedback').insert({ job_id: jobId, user_id: userId, slide_id: slideId, slide_type: fixed.body?.type, source: body.source === 'lint' ? 'lint' : 'author', comment: body.comment || null, data: { issues: issueList, rich: !!isRich } });
      return json({ slide: fixed }, 200, allow);
    }

    if (action === 'feedback') {
      const { jobId, slideId, rating, comment, source, data } = body;
      const { error } = await db.from('deck_feedback').insert({ job_id: jobId || null, user_id: userId, slide_id: slideId || null, slide_type: body.slideType || null, source: source || 'user', rating: rating ?? null, comment: comment || null, data: data || null });
      return error ? json({ error: 'DB:' + error.message }, 500, allow) : json({ ok: true }, 200, allow);
    }

    if (action === 'distill') {
      const { data: fb } = await db.from('deck_feedback').select('id,slide_type,source,rating,comment,data').eq('distilled', false).limit(200);
      if (!fb?.length) return json({ added: 0 }, 200, allow);
      const existing = await loadRules();
      const rules = await distillRules(fb, existing, { provider: prov, log });
      if (rules.length) await db.from('deck_rules').insert(rules.map(r => ({ scope: r.scope, text: r.text, weight: r.weight || 1, source: 'distill', evidence: (r as any).evidence || null })));
      await db.from('deck_feedback').update({ distilled: true }).in('id', fb.map((f: any) => f.id));
      return json({ added: rules.length, rules }, 200, allow);
    }

    return json({ error: 'UNKNOWN_ACTION' }, 400, allow);
  } catch (e: any) {
    log('error: ' + (e?.stack || e?.message || e));
    return json({ error: String(e?.message || e) }, 500, allow);
  }
});
