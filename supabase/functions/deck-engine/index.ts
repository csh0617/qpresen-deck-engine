/* Qpresen Deck Engine — Supabase Edge Function
   actions: models | plan | fill | render | build | status | feedback | rules | distill
   env: BIZROUTER_API_KEY (or ANTHROPIC_API_KEY), LLM_KIND=openai|anthropic, LLM_BASE_URL, LLM_MODEL, LLM_FALLBACKS */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import qrcode from 'npm:qrcode-generator@1.4.4';
import { renderDeck, qpresenBundle, firstSlidePayload } from './renderer/index.ts';
import { planDeck, fillSlides, buildSpec, fixSlide, distillRules, type Brief, type Rule, type Plan } from './llm/pipeline.ts';
import { listModels, type ProviderConfig } from './llm/provider.ts';
import { validateSpec } from './renderer/validate.ts';

const ORIGINS = ['https://qpresen.com', 'https://www.qpresen.com', 'https://readdy.ai', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' } });

function provider(): ProviderConfig {
  const kind = (Deno.env.get('LLM_KIND') || 'openai') as 'openai' | 'anthropic';
  const apiKey = kind === 'anthropic' ? (Deno.env.get('ANTHROPIC_API_KEY') || '') : (Deno.env.get('BIZROUTER_API_KEY') || '');
  return { kind, apiKey, baseUrl: Deno.env.get('LLM_BASE_URL') || (kind === 'anthropic' ? 'https://api.anthropic.com' : 'https://bizrouter.ai/api/v1'), model: Deno.env.get('LLM_MODEL') || (kind === 'anthropic' ? 'claude-sonnet-5-5' : 'anthropic/claude-sonnet-5.5'), fallbackModels: (Deno.env.get('LLM_FALLBACKS') || (kind === 'anthropic' ? '' : 'anthropic/claude-opus-5.5,anthropic/claude-haiku-5.5')).split(',').map(s => s.trim()).filter(Boolean), timeoutMs: 120000, maxRetries: 1 };
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
      const rules = await loadRules();
      const { data: job, error } = await db.from('deck_jobs').insert({ user_id: userId, status: 'planning', brief, model: prov.model }).select('id').single();
      if (error) return json({ error: 'DB:' + error.message }, 500, allow);
      try {
        const plan = await planDeck(brief, { provider: prov, rules, log });
        await touch(job.id, { status: 'filling', plan, progress: { done: 0, total: plan.slides.length } });
        return json({ jobId: job.id, plan }, 200, allow);
      } catch (e: any) { await touch(job.id, { status: 'failed', error: String(e.message) }); throw e; }
    }

    if (action === 'fill') {
      const { jobId, ids } = body; if (!jobId || !Array.isArray(ids) || !ids.length) return json({ error: 'JOB_AND_IDS_REQUIRED' }, 400, allow);
      const { data: job } = await db.from('deck_jobs').select('brief,plan,spec,progress').eq('id', jobId).eq('user_id', userId).single();
      if (!job?.plan) return json({ error: 'JOB_NOT_FOUND' }, 404, allow);
      const rules = await loadRules();
      const slides = await fillSlides(job.brief as Brief, job.plan as Plan, ids.slice(0, 6), { provider: prov, rules, log });
      // merge into job.spec.slides by id
      const spec = (job.spec as any) || { meta: (job.plan as Plan).meta, sections: (job.plan as Plan).sections, slides: [] };
      const map = new Map<string, any>((spec.slides || []).map((s: any) => [s.id, s]));
      slides.forEach(s => map.set(s.id!, s));
      spec.slides = (job.plan as Plan).slides.map(p => map.get(p.id)).filter(Boolean);
      const done = spec.slides.length; const total = (job.plan as Plan).slides.length;
      await touch(jobId, { spec, progress: { done, total }, status: done >= total ? 'rendering' : 'filling' });
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
      return json({ jobId, fileId, path, signedUrl, pageCount: res.parts.length, titles: res.titles, sections: res.sections, warnings, bytes: bytes.length, html: includeHtml ? res.html : undefined, qpresenHtml: bytes.length < 6_000_000 ? bundle : undefined, spec: valid }, 200, allow);
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
      const fixed = await fixSlide(spec.slides[idx], Array.isArray(issues) ? issues : [{ what: String(body.comment || '개선') }], { provider: prov, log }, spec.meta);
      spec.slides[idx] = fixed; await touch(jobId, { spec });
      await db.from('deck_feedback').insert({ job_id: jobId, user_id: userId, slide_id: slideId, slide_type: fixed.body?.type, source: 'author', comment: body.comment || null, data: { issues } });
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
