/* Qpresen 동적 슬라이드 생성 — 엔진 오케스트레이션 (UI와 분리). deck-engine Edge Function을 단계별로 호출해 한 번에 완성합니다.
   입력(브리프) → [자료집/개요/상세 계획] → [아트 디렉션(프리미엄)] → 장별 작성 → 이미지·렌더(내 자료 저장) → (UI에서) 검수 */
import { supabase } from '../lib/supabase'; // ← Readdy 프로젝트의 supabase 클라이언트 경로

export type Purpose = 'lecture' | 'ir' | 'report' | 'seminar' | 'proposal' | 'product' | 'keynote';
export type Tone = 'formal' | 'friendly' | 'bold' | 'academic';
export type Theme = 'signature-white' | 'editorial-navy' | 'vivid-photo' | 'dark-stage';
export type Quality = 'standard' | 'premium';
export interface Brief { topic: string; purpose: Purpose; audience?: string; durationMin?: number; slideCount?: number; tone: Tone; theme?: Theme; presenter?: { name: string; org?: string }; event?: string; date?: string; place?: string; materials?: string; extra?: string }
export interface RefFile { id: string; name: string; size: number; status: 'uploading' | 'extracting' | 'done' | 'error'; text?: string; chars?: number; truncated?: boolean; error?: string }
export interface QaState { stage: 'idle' | 'lint' | 'fix' | 'review' | 'done'; done?: number; total?: number; fixed?: number; avg?: number; round?: number; skipped?: boolean }
export type Step = 'dossier' | 'plan' | 'direct' | 'fill' | 'render' | 'done';
export interface Progress { step: Step; label: string; done?: number; total?: number; slides?: number; title?: string }

export const PURPOSES: [Purpose, string, string][] = [['lecture', '교육·특강', 'ri-presentation-line'], ['ir', 'IR·사업소개', 'ri-line-chart-line'], ['seminar', '세미나·학술', 'ri-book-open-line'], ['report', '보고·정책', 'ri-file-list-3-line'], ['proposal', '제안·기획', 'ri-lightbulb-flash-line'], ['product', '제품 소개', 'ri-box-3-line'], ['keynote', '키노트', 'ri-mic-line']];
export const TONES: [Tone, string][] = [['formal', '격식'], ['friendly', '친근'], ['bold', '강렬'], ['academic', '학술']];
export const THEMES: [Theme | '', string, string][] = [['', '자동', 'linear-gradient(135deg,#6366f1,#8b5cf6)'], ['signature-white', '화이트', 'linear-gradient(135deg,#ffffff 55%,#4f5bff)'], ['editorial-navy', '네이비', 'linear-gradient(135deg,#0a1633,#1a8cff)'], ['vivid-photo', '비비드', 'linear-gradient(135deg,#ff6a3d,#9b4dff)'], ['dark-stage', '다크', 'linear-gradient(135deg,#07101c,#5b63ff)']];
const SLIDES_PER_MIN: Record<Purpose, number> = { lecture: 1, ir: 0.8, seminar: 1.2, report: 0.9, proposal: 0.9, product: 0.8, keynote: 0.7 };
const MAX_MATERIALS = 40000;

const FN = 'deck-engine';
export async function callEngine(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다');
  const { data, error } = await supabase.functions.invoke(FN, { body, headers: { Authorization: `Bearer ${session.access_token}` } });
  if (error) {
    const status = (error as any)?.context?.status as number | undefined;
    let detail = ''; try { detail = await (error as any)?.context?.clone?.()?.text?.(); } catch { /* ignore */ }
    let j: any = null; try { j = detail ? JSON.parse(detail) : null; } catch { /* ignore */ }
    if (status === 504 || (/non-2xx/i.test(error.message || '') && !j?.error)) throw new Error(`엔진 응답 시간 초과 — ${String(body.action)} 단계가 150초를 넘겼습니다. 잠시 후 다시 시도해 주세요.`);
    throw new Error(j?.error ? `엔진 오류: ${j.error}` : (error.message || '엔진 호출 실패'));
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

/** 장수가 비어 있으면 목적별 기본값 (발표 시간 20분 기준). */
export function defaultSlideCount(purpose: Purpose) { return Math.round(20 * SLIDES_PER_MIN[purpose]); }
/** 예상 소요 시간(분) — 단계별 실측 평균. 프리미엄은 장마다 설계(장당 1~2분, 5장 병렬) + 디렉터 검수. */
export function estimateMinutes(n: number, quality: Quality): [number, number] {
  if (quality === 'standard') return [1 + Math.ceil(n / 12), 2 + Math.ceil(n / 8)];
  const fill = Math.ceil(n / 5); const plan = n > 24 ? 3 : 2; const qa = Math.ceil(n / 6) + 2;
  return [plan + fill + 1 + qa, plan + Math.ceil(fill * 1.8) + 2 + qa + 2];
}

/** 참고자료 파일: 텍스트 계열은 브라우저에서 바로 읽고, PDF·PPTX·DOCX·HWP는 스토리지에 올린 뒤 extract-file-content로 본문을 추출합니다. */
export async function extractReference(file: File, onStatus: (p: Partial<RefFile>) => void): Promise<{ text: string; truncated: boolean }> {
  if (/\.(txt|md|csv|json|html?)$/i.test(file.name) || /^text\//.test(file.type)) {
    const t = await file.text(); return { text: t.slice(0, 20000), truncated: t.length > 20000 };
  }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('로그인이 필요합니다');
  onStatus({ status: 'uploading' });
  const path = `${user.id}/deck-studio/refs/${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]+/g, '_')}`;
  const up = await supabase.storage.from('pdfs').upload(path, file, { upsert: true, contentType: file.type || 'application/octet-stream' });
  if (up.error) throw new Error('업로드 실패: ' + up.error.message);
  const { data: su, error: se } = await supabase.storage.from('pdfs').createSignedUrl(path, 3600);
  if (se || !su?.signedUrl) throw new Error('파일 주소 생성 실패');
  onStatus({ status: 'extracting' });
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('extract-file-content', { body: { fileUrl: su.signedUrl, fileName: file.name }, headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined });
  if (error) throw new Error('본문 추출 실패: ' + (error.message || ''));
  if (!data?.text) throw new Error('본문을 읽지 못했습니다 (스캔 이미지 PDF는 지원되지 않습니다)');
  return { text: String(data.text), truncated: !!data.truncated };
}

/** 붙여넣은 자료 + 추출된 파일 본문을 하나의 참고자료로 합칩니다 (엔진은 수치·사실을 여기서만 가져옵니다). */
export function mergeMaterials(pasted: string, files: RefFile[]): string {
  const parts = [pasted.trim()].filter(Boolean);
  for (const f of files) if (f.status === 'done' && f.text) parts.push(`[참고자료: ${f.name}]\n${f.text.trim()}`);
  const all = parts.join('\n\n');
  return all.length > MAX_MATERIALS ? all.slice(0, MAX_MATERIALS) + '\n…(이하 생략)' : all;
}

/** 한 번에 완성: 계획 → (아트 디렉션) → 장별 작성 → 이미지·렌더. 결과는 내 자료(pdf_files)에 저장됩니다. */
export async function generateDeck(brief: Brief, quality: Quality, onProgress: (p: Progress) => void): Promise<{ jobId: string; result: any; plan: any; direction: any }> {
  const n = brief.slideCount || defaultSlideCount(brief.purpose);
  const fullBrief = { ...brief, slideCount: n, durationMin: brief.durationMin || Math.max(5, Math.round(n / SLIDES_PER_MIN[brief.purpose])), quality };
  // 1) 계획 — 25장 이상은 자료집 → 개요 → 장별 상세(8장씩, 3병렬)로 나눠 한 요청이 150초를 넘기지 않게
  let d: any;
  if (n > 24) {
    onProgress({ step: 'dossier', label: '자료를 정리하고 있어요' }); const d0 = await callEngine({ action: 'plan', phase: 'dossier', brief: fullBrief, quality });
    onProgress({ step: 'plan', label: '발표의 큰 흐름을 잡고 있어요' }); const d1 = await callEngine({ action: 'plan', phase: 'outline', jobId: d0.jobId, quality });
    const ids: string[] = d1.plan.slides.map((s: any) => s.id); const chunks: string[][] = []; for (let i = 0; i < ids.length; i += 8) chunks.push(ids.slice(i, i + 8));
    let cursor = 0, doneChunks = 0; let last: any = d1;
    onProgress({ step: 'plan', label: '장별 내용을 설계하고 있어요', done: 0, total: chunks.length, slides: ids.length, title: d1.plan.meta?.title });
    const worker = async () => { while (cursor < chunks.length) { const c = chunks[cursor++]; last = await callEngine({ action: 'plan', phase: 'detail', jobId: d1.jobId, ids: c, quality }); doneChunks++; onProgress({ step: 'plan', label: '장별 내용을 설계하고 있어요', done: doneChunks, total: chunks.length, slides: ids.length, title: d1.plan.meta?.title }); } };
    await Promise.all([worker(), worker(), worker()]);
    d = { jobId: d1.jobId, plan: last.plan };
  } else {
    onProgress({ step: 'plan', label: quality === 'premium' ? '자료를 정리하고 발표 구성을 설계하고 있어요' : '발표 구성을 설계하고 있어요' });
    d = await callEngine({ action: 'plan', brief: fullBrief, quality });
  }
  const jobId: string = d.jobId; const plan = d.plan; const total = plan.slides.length;
  // 2) 아트 디렉션 (프리미엄) — 덱 전용 디자인 레이어·색·사진 계획
  let direction: any = null;
  if (quality === 'premium') {
    onProgress({ step: 'direct', label: '덱 전체의 디자인 방향을 정하고 있어요', slides: total, title: plan.meta?.title });
    try { direction = (await callEngine({ action: 'direct', jobId, imageBudget: 6 })).direction; } catch { /* 기본 디자인으로 진행 */ }
  }
  // 3) 장별 작성 — 프리미엄은 장마다 설계(1장 = 1요청, 5병렬), 표준은 3장씩
  const ids: string[] = plan.slides.map((s: any) => s.id); const batches: string[][] = [];
  if (quality === 'premium') ids.forEach(id => batches.push([id])); else for (let i = 0; i < ids.length; i += 3) batches.push(ids.slice(i, i + 3));
  let done = 0, cursor = 0; const failed: string[] = [];
  onProgress({ step: 'fill', label: quality === 'premium' ? '한 장 한 장 디자인하고 있어요' : '슬라이드를 작성하고 있어요', done: 0, total, slides: total, title: plan.meta?.title });
  const fillWorker = async () => { while (cursor < batches.length) { const b = batches[cursor++]; try { await callEngine({ action: 'fill', jobId, ids: b }); } catch { failed.push(...b); } done += b.length; onProgress({ step: 'fill', label: quality === 'premium' ? '한 장 한 장 디자인하고 있어요' : '슬라이드를 작성하고 있어요', done, total, slides: total, title: plan.meta?.title }); } };
  await Promise.all(Array.from({ length: Math.min(quality === 'premium' ? 5 : 4, batches.length) }, fillWorker));
  for (const id of failed) { try { await callEngine({ action: 'fill', jobId, ids: [id] }); } catch { try { await callEngine({ action: 'fill', jobId, ids: [id], mode: 'standard' }); } catch { /* 렌더러가 빠진 장을 건너뜀 */ } } }
  // 4) 이미지 + 렌더 — 사진이 필요한 장(표지·히어로 등)은 엔진이 계획에 따라 스스로 고릅니다
  onProgress({ step: 'render', label: '이미지를 만들고 발표자료를 완성하고 있어요', slides: total, title: plan.meta?.title });
  const result = await callEngine({ action: 'render', jobId, images: true, maxImages: quality === 'premium' ? 10 : 4 });
  onProgress({ step: 'done', label: '완성', slides: result.pageCount, title: plan.meta?.title });
  return { jobId, result, plan, direction };
}

/** 검수 후 다시 렌더 (내 자료 등록은 처음 한 번만). */
export async function rerenderDeck(jobId: string, quality: Quality) {
  return callEngine({ action: 'render', jobId, register: false, images: true, maxImages: quality === 'premium' ? 10 : 4 });
}

export function downloadHtml(result: any, kind: 'player' | 'qpresen' = 'player') {
  const html = kind === 'player' ? result?.html : result?.qpresenHtml; if (!html) return;
  const blob = new Blob([html], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${result.spec?.meta?.title || 'deck'}${kind === 'qpresen' ? '.qpresen' : ''}.html`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** 자동 검수 — 1차: 모든 장이 플레이어 안에서 레이아웃을 자가 점검(넘침·겹침·잘림), 오류 장은 한 번 수정.
    2차(프리미엄): 장마다 스크린샷을 디자인 디렉터(비전 모델)가 채점, 4점 미만이나 문제 장은 지시대로 수정 후 레이아웃 재점검. */
/** 자동 검수 — 1차: 모든 장이 플레이어 안에서 레이아웃을 자가 점검(넘침·겹침·잘림), 오류 장은 한 번 수정.
    2차(프리미엄): 장마다 스크린샷을 디자인 디렉터(비전 모델)가 채점, 4점 미만이나 문제 장은 지시대로 수정 후 레이아웃 재점검. */
export async function runQa(jid: string, d: any, quality: Quality, h: { player: () => any; setQa: (q: QaState) => void; setResult: (r: any) => void; setBusy: (b: boolean) => void }) {
  const { setQa, setResult, setBusy } = h;
  const waitPlayer = async (ms = 12000): Promise<any> => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const w: any = h.player(); if (w?.QPDeck?.lintAll) return w; await new Promise(r => setTimeout(r, 300)); } return null; };
  try {
    await new Promise(r => setTimeout(r, 600)); let w = await waitPlayer(); if (!w) { setQa({ stage: 'done', skipped: true }); return; }
    let curRes = d; let fixedTotal = 0;
    const rerender = async () => { const d2 = await rerenderDeck(jid, quality); setResult({ ...d2, fileId: d.fileId }); await new Promise(r => setTimeout(r, 600)); return d2; };
    const lintRound = async (round: number) => {
      setQa({ stage: 'lint', done: 0, total: curRes.pageCount, round });
      const res: any[] = await w.QPDeck.lintAll((k: number, N: number) => setQa({ stage: 'lint', done: k, total: N, round }));
      const bad = res.filter(r => (r.issues || []).some((i: any) => i.sev === 'error' && !/LINT_|NO_LINT/.test(i.code))).slice(0, 8);
      if (!bad.length) return res;
      setQa({ stage: 'fix', done: 0, total: bad.length, round }); setBusy(true); let k = 0;
      await Promise.all(bad.map(async r => { const s = curRes.spec?.slides?.[r.n - 1]; if (!s) return; try { await callEngine({ action: 'fix', jobId: jid, slideId: s.id, source: 'lint', issues: (r.issues || []).filter((i: any) => i.sev !== 'nit').slice(0, 10) }); fixedTotal++; } catch { /* keep */ } k++; setQa({ stage: 'fix', done: k, total: bad.length, round }); }));
      curRes = await rerender(); w = await waitPlayer(); return res;
    };
    const lintRes = await lintRound(1);
    if (quality === 'premium' && w) {
      const N = curRes.pageCount; const scores: number[] = []; const toFix: { slideId: string; issues: any[] }[] = []; let done = 0;
      setQa({ stage: 'review', done: 0, total: N, round: 2 });
      const queue = Array.from({ length: N }, (_, i) => i + 1);
      const runner = async () => { while (queue.length) { const k = queue.shift()!; const s = curRes.spec?.slides?.[k - 1]; if (!s) continue;
        try { const snap = await w.QPDeck.snapshot(k, { width: 1280, quality: 0.8 }); const lr = (lintRes || []).find((r: any) => r.n === k);
          const rv = (await callEngine({ action: 'review', jobId: jid, slideId: s.id, image: snap.image, lint: (lr?.issues || []).filter((i: any) => i.sev !== 'nit').slice(0, 6), motion: lr?.motion })).review || {};
          const score = Number(rv.score) || 0; scores.push(score);
          const issues = (rv.issues || []).filter((i: any) => i.sev === 'error' || i.sev === 'warn').slice(0, 8);
          if (score < 4 || issues.some((i: any) => i.sev === 'error')) toFix.push({ slideId: s.id, issues: [...issues, ...(rv.upgrade ? [{ sev: 'warn', code: 'UPGRADE', what: rv.upgrade, fix: rv.upgrade }] : [])] });
        } catch { /* best-effort */ }
        done++; setQa({ stage: 'review', done, total: N, round: 2, avg: scores.length ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length * 10) / 10 : undefined }); } };
      await Promise.all([runner(), runner(), runner()]);
      const avg = scores.length ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length * 10) / 10 : undefined;
      if (toFix.length) {
        setQa({ stage: 'fix', done: 0, total: toFix.length, round: 2, avg }); setBusy(true); let k = 0; const fq = [...toFix];
        const fixer = async () => { while (fq.length) { const f = fq.shift()!; try { await callEngine({ action: 'fix', jobId: jid, slideId: f.slideId, source: 'vision', issues: f.issues }); fixedTotal++; } catch { /* keep */ } k++; setQa({ stage: 'fix', done: k, total: toFix.length, round: 2, avg }); } };
        await Promise.all([fixer(), fixer(), fixer(), fixer()]);
        curRes = await rerender(); w = await waitPlayer(); if (w) await lintRound(3);
      }
      setQa({ stage: 'done', fixed: fixedTotal, avg }); return;
    }
    setQa({ stage: 'done', fixed: fixedTotal });
  } catch { setQa({ stage: 'done', skipped: true }); } finally { setBusy(false); }
}
