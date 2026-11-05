/* Qpresen Deck Studio — React page for /dashboard/slide-generator (or /dashboard/deck-studio)
   Requires: supabase client (adjust import path), Tailwind. Calls the `deck-engine` Edge Function.
   Flow: brief → plan → fill (parallel batches) → render → preview/feedback/fix → file registered in pdf_files. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase'; // ← Readdy 프로젝트의 supabase 클라이언트 경로로 수정

type Purpose = 'lecture' | 'ir' | 'report' | 'seminar' | 'proposal' | 'product' | 'keynote';
type Theme = 'signature-white' | 'editorial-navy' | 'vivid-photo' | 'dark-stage';
interface Brief { topic: string; purpose: Purpose; audience: string; durationMin: number; slideCount?: number; tone: 'formal' | 'friendly' | 'bold' | 'academic'; theme?: Theme; presenter?: { name: string; org?: string }; event?: string; date?: string; place?: string; materials?: string; extra?: string }
interface PlanSlide { id: string; section?: string | null; type: string; title: string; sub?: string; intent?: string; t?: number; kind?: string; signature?: string }
interface Plan { meta: any; sections: { id: string; label: string; numeral?: string }[]; slides: PlanSlide[] }

const FN = 'deck-engine';
async function callEngine(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다');
  const { data, error } = await supabase.functions.invoke(FN, { body, headers: { Authorization: `Bearer ${session.access_token}` } });
  if (error) throw new Error(error.message || '엔진 호출 실패');
  if (data?.error) throw new Error(data.error);
  return data;
}

const PURPOSES: [Purpose, string][] = [['lecture', '교육·특강'], ['ir', 'IR·사업소개'], ['seminar', '세미나·학술'], ['report', '보고·정책'], ['proposal', '제안·기획'], ['product', '제품 소개'], ['keynote', '키노트']];
const THEMES: [Theme, string][] = [['signature-white', '시그니처 화이트'], ['editorial-navy', '에디토리얼 네이비'], ['vivid-photo', '비비드 포토'], ['dark-stage', '다크 스테이지']];
const TYPE_LABEL: Record<string, string> = { cover: '표지', section: '간지', agenda: '목차', question: '질문', 'kpi-grid': 'KPI', 'big-number': '빅넘버', 'bullets-visual': '핵심+비주얼', cards: '카드', comparison: '비교', timeline: '타임라인', process: '프로세스', chart: '차트', table: '표', matrix: '매트릭스', diagram: '다이어그램', quote: '인용', 'image-hero': '이미지 히어로', 'annotated-image': '주석 이미지', mockup: '목업', pricing: '요금', team: '팀', checklist: '체크리스트', summary: '요약', closing: '마무리', custom: '커스텀' };

export default function DeckStudio() {
  const [brief, setBrief] = useState<Brief>({ topic: '', purpose: 'lecture', audience: '', durationMin: 20, tone: 'formal', theme: undefined, materials: '', extra: '' });
  const [stage, setStage] = useState<'brief' | 'plan' | 'fill' | 'render' | 'done'>('brief');
  const [jobId, setJobId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [model, setModel] = useState<string>('');
  const [cur, setCur] = useState(1);
  const [comment, setComment] = useState('');
  const [withImages, setWithImages] = useState(true);
  const [quality, setQuality] = useState<'standard' | 'premium'>('standard');
  const frameRef = useRef<HTMLIFrameElement>(null);
  /** Premium mode: these archetypes stay on the deterministic renderer; every other slide is designed individually (one request each). */
  const STRUCTURAL = ['cover', 'section', 'agenda', 'closing', 'quote', 'image-hero'];

  useEffect(() => { callEngine({ action: 'rules' }).then(() => {}).catch(() => {}); callEngine({ action: 'models' }).then(d => setModel(d.model)).catch(() => {}); }, []);
  useEffect(() => { const h = (e: MessageEvent) => { if (e.data?.qpDeck && e.data.kind === 'page') setCur(e.data.value); }; window.addEventListener('message', h); return () => window.removeEventListener('message', h); }, []);

  const slideCountGuide = useMemo(() => Math.round(brief.durationMin * ({ lecture: 1, ir: 0.8, seminar: 1.2, report: 0.9, proposal: 0.9, product: 0.8, keynote: 0.7 } as any)[brief.purpose]), [brief]);

  async function doPlan() {
    setErr(null); setBusy(true);
    try { const d = await callEngine({ action: 'plan', brief: { ...brief, quality }, quality }); setJobId(d.jobId); setPlan(d.plan); setStage('plan'); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  async function doFill() {
    if (!jobId || !plan) return; setErr(null); setBusy(true); setStage('fill');
    const ids = plan.slides.map(s => s.id); const batches: string[][] = [];
    if (quality === 'premium') {
      // rich slides one per request (each is a 60~120s design job); structural slides in batches of 3
      const rich = plan.slides.filter(s => !STRUCTURAL.includes(s.type)).map(s => s.id); const std = ids.filter(id => !rich.includes(id));
      rich.forEach(id => batches.push([id])); for (let i = 0; i < std.length; i += 3) batches.push(std.slice(i, i + 3));
    } else { for (let i = 0; i < ids.length; i += 3) batches.push(ids.slice(i, i + 3)); }
    let done = 0; setProgress({ done: 0, total: ids.length });
    let cursor = 0; const failed: string[] = [];
    const worker = async () => { while (cursor < batches.length) { const b = batches[cursor++]; try { await callEngine({ action: 'fill', jobId, ids: b }); } catch (e) { failed.push(...b); } done += b.length; setProgress({ done, total: ids.length }); } };
    await Promise.all(Array.from({ length: Math.min(quality === 'premium' ? 5 : 4, batches.length) }, worker));
    if (failed.length) { for (const id of failed) { try { await callEngine({ action: 'fill', jobId, ids: [id] }); } catch { /* fallback handled by renderer */ } } }
    try { setStage('render'); setProgress({ done: 0, total: 0 }); const d = await callEngine({ action: 'render', jobId, images: withImages, maxImages: 4 }); setResult(d); setStage('done'); } catch (e: any) { setErr(e.message); setStage('plan'); } finally { setBusy(false); }
  }
  async function doFeedback(rating: number) {
    if (!result) return; const s = result.spec?.slides?.[cur - 1]; try { await callEngine({ action: 'feedback', jobId, slideId: s?.id, slideType: s?.body?.type, rating, comment }); setComment(''); } catch (e: any) { setErr(e.message); }
  }
  async function doFix() {
    if (!result || !comment.trim()) return; const s = result.spec?.slides?.[cur - 1]; setBusy(true); setErr(null);
    try { await callEngine({ action: 'fix', jobId, slideId: s.id, comment, issues: [{ sev: 'warn', what: comment }] }); const d = await callEngine({ action: 'render', jobId, register: false }); setResult({ ...d, fileId: result.fileId }); setComment(''); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  function download(kind: 'player' | 'qpresen' = 'player') { const html = kind === 'player' ? result?.html : result?.qpresenHtml; if (!html) return; const blob = new Blob([html], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${result.spec?.meta?.title || 'deck'}${kind === 'qpresen' ? '.qpresen' : ''}.html`; a.click(); }
  /** Fallback: register through the normal upload path (same as drag&drop) if the engine could not insert into pdf_files. Wire `uploadHtmlFile` to the dashboard's existing upload handler. */
  async function uploadViaDashboard() { if (!result?.qpresenHtml) return; const file = new File([result.qpresenHtml], `${result.spec?.meta?.title || 'deck'}.html`, { type: 'text/html' }); const anyWin = window as any; if (typeof anyWin.qpresenUploadFile === 'function') { await anyWin.qpresenUploadFile(file); } else { download('qpresen'); } }
  const srcdoc = result?.html ? result.html.replace('<html lang=', `<html data-start="${cur}" lang=`) : '';

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0A1633]">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3"><span className="w-3 h-3 rounded bg-gradient-to-r from-[#1A8CFF] via-[#5B63FF] to-[#9B4DFF]" /><h1 className="font-extrabold text-lg">AI 슬라이드 스튜디오</h1><span className="text-xs text-gray-500">브리프 → 구조 → 작성 → 렌더 → 검수</span></div>
        <div className="text-xs text-gray-500">{model ? `모델: ${model}` : ''}</div>
      </header>
      {err && <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{err}</div>}
      <main className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 p-6">
        {/* ---- Brief form ---- */}
        <section className="bg-white rounded-2xl border p-5 space-y-4 h-fit">
          <h2 className="font-bold">1. 브리프</h2>
          <label className="block text-sm"><span className="text-gray-600">주제·요청 *</span><textarea className="mt-1 w-full border rounded-lg p-2 h-24" placeholder="예: 고창군 농업기술센터 공무원 대상 AI 활용 특강, 최신 동향·실전 도구·농업 적용 사례" value={brief.topic} onChange={e => setBrief({ ...brief, topic: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm"><span className="text-gray-600">목적</span><select className="mt-1 w-full border rounded-lg p-2" value={brief.purpose} onChange={e => setBrief({ ...brief, purpose: e.target.value as Purpose })}>{PURPOSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="text-sm"><span className="text-gray-600">톤</span><select className="mt-1 w-full border rounded-lg p-2" value={brief.tone} onChange={e => setBrief({ ...brief, tone: e.target.value as any })}><option value="formal">격식</option><option value="friendly">친근</option><option value="bold">강렬</option><option value="academic">학술</option></select></label>
            <label className="text-sm"><span className="text-gray-600">발표 시간(분)</span><input type="number" className="mt-1 w-full border rounded-lg p-2" value={brief.durationMin} onChange={e => setBrief({ ...brief, durationMin: +e.target.value })} /></label>
            <label className="text-sm"><span className="text-gray-600">장수 (비우면 자동 ≈{slideCountGuide})</span><input type="number" className="mt-1 w-full border rounded-lg p-2" value={brief.slideCount || ''} onChange={e => setBrief({ ...brief, slideCount: e.target.value ? +e.target.value : undefined })} /></label>
          </div>
          <label className="block text-sm"><span className="text-gray-600">청중</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.audience} onChange={e => setBrief({ ...brief, audience: e.target.value })} placeholder="예: 공무원 60명, AI 초심자" /></label>
          <label className="block text-sm"><span className="text-gray-600">테마</span><select className="mt-1 w-full border rounded-lg p-2" value={brief.theme || ''} onChange={e => setBrief({ ...brief, theme: (e.target.value || undefined) as Theme })}><option value="">목적에 맞게 자동</option>{THEMES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm"><span className="text-gray-600">발표자</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.presenter?.name || ''} onChange={e => setBrief({ ...brief, presenter: { ...(brief.presenter || { name: '' }), name: e.target.value } })} /></label>
            <label className="text-sm"><span className="text-gray-600">소속</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.presenter?.org || ''} onChange={e => setBrief({ ...brief, presenter: { ...(brief.presenter || { name: '' }), org: e.target.value } })} /></label>
            <label className="text-sm"><span className="text-gray-600">행사</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.event || ''} onChange={e => setBrief({ ...brief, event: e.target.value })} /></label>
            <label className="text-sm"><span className="text-gray-600">일자</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.date || ''} onChange={e => setBrief({ ...brief, date: e.target.value })} placeholder="2026. 11. 20" /></label>
          </div>
          <label className="block text-sm"><span className="text-gray-600">참고 자료 (텍스트 붙여넣기 — 수치·사실은 여기서만 사용)</span><textarea className="mt-1 w-full border rounded-lg p-2 h-28" value={brief.materials} onChange={e => setBrief({ ...brief, materials: e.target.value })} /></label>
          <label className="block text-sm"><span className="text-gray-600">추가 지시</span><input className="mt-1 w-full border rounded-lg p-2" value={brief.extra} onChange={e => setBrief({ ...brief, extra: e.target.value })} placeholder="예: 사례 3개 꼭 포함, 마지막에 Q&A" /></label>
          <label className="block text-sm"><span className="text-gray-600">품질</span><select className="mt-1 w-full border rounded-lg p-2" value={quality} onChange={e => setQuality(e.target.value as any)}><option value="standard">표준 — 템플릿 기반, 약 1분</option><option value="premium">프리미엄 — 장마다 맞춤 설계(최상위 모델), 3~6분</option></select>{quality === 'premium' && <p className="mt-1 text-xs text-gray-500">레퍼런스 덱처럼 장마다 고유한 레이아웃·인터랙션(차트·슬라이더·시연)을 직접 설계합니다. 비용은 표준의 약 10배입니다.</p>}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={withImages} onChange={e => setWithImages(e.target.checked)} /><span className="text-gray-700">AI 이미지 생성 (표지·히어로 등 최대 4장, 약 15초 추가)</span></label>
          <button disabled={busy || !brief.topic.trim()} onClick={doPlan} className="w-full rounded-xl bg-[#4F5BFF] text-white font-bold py-3 disabled:opacity-40">{busy && stage === 'brief' ? '구조 설계 중…' : '2. 덱 구조 설계'}</button>
        </section>

        {/* ---- Plan / progress / result ---- */}
        <section className="space-y-6">
          {plan && (
            <div className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between mb-3"><h2 className="font-bold">덱 구조 — {plan.meta?.title} <span className="text-gray-400 font-normal text-sm">({plan.slides.length}장 · {plan.meta?.theme})</span></h2>
                <div className="flex gap-2"><button disabled={busy} onClick={doPlan} className="px-3 py-2 rounded-lg border text-sm">다시 설계</button><button disabled={busy || stage !== 'plan'} onClick={doFill} className="px-4 py-2 rounded-lg bg-[#4F5BFF] text-white text-sm font-bold disabled:opacity-40">3. 슬라이드 작성 + 렌더</button></div></div>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {plan.slides.map((s, i) => <li key={s.id} className="flex gap-2 items-start border rounded-lg px-3 py-2"><span className="text-gray-400 w-6 text-right">{i + 1}</span><span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs whitespace-nowrap">{TYPE_LABEL[s.type] || s.type}</span><span className="font-medium">{s.title.replace(/\*\*/g, '')}{s.signature && <span className="block text-xs text-gray-400 font-normal">✦ {s.signature}</span>}</span></li>)}
              </ol>
              {(stage === 'fill' || stage === 'render') && <div className="mt-4"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>{stage === 'fill' ? (quality === 'premium' ? '프리미엄 설계 중 — 장마다 맞춤 HTML 작성 (장당 1~2분, 5장 병렬)' : '슬라이드 작성 중') : withImages ? 'AI 이미지 생성 + 렌더링 중 (15~25초)' : '렌더링 중'}</span><span>{progress.total ? `${progress.done}/${progress.total}` : ''}</span></div><div className="h-2 rounded bg-gray-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-[#1A8CFF] to-[#9B4DFF] transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 5}%` }} /></div></div>}
            </div>
          )}
          {result && (
            <div className="bg-white rounded-2xl border p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2"><h2 className="font-bold">결과 — {result.pageCount}장 · {(result.bytes / 1048576).toFixed(1)}MB {result.fileId && <span className="text-green-700 text-sm font-normal">· 내 자료에 저장됨</span>}{result.images && <span className="text-gray-400 text-sm font-normal"> · 이미지 {result.images.generated}장</span>}</h2>
                <div className="flex gap-2"><button onClick={() => download('player')} className="px-3 py-2 rounded-lg border text-sm">오프라인 HTML</button><button onClick={() => download('qpresen')} className="px-3 py-2 rounded-lg border text-sm">Qpresen용 HTML</button>{result.fileId ? <a href="/dashboard" className="px-3 py-2 rounded-lg bg-[#0A1633] text-white text-sm font-bold">발표하기 →</a> : <button onClick={uploadViaDashboard} className="px-3 py-2 rounded-lg bg-[#0A1633] text-white text-sm font-bold">내 자료에 올리기</button>}</div></div>
              <div className="aspect-video rounded-xl overflow-hidden border bg-black"><iframe ref={frameRef} title="deck" className="w-full h-full" srcDoc={srcdoc} allow="fullscreen" /></div>
              <div className="flex items-center gap-2 flex-wrap text-sm"><span className="text-gray-500">현재 {cur}/{result.pageCount}장 · {result.titles?.[cur - 1]}</span>
                <div className="ml-auto flex gap-2"><button onClick={() => doFeedback(5)} className="px-3 py-1.5 rounded-lg border">👍 좋아요</button><button onClick={() => doFeedback(2)} className="px-3 py-1.5 rounded-lg border">👎 별로</button></div></div>
              <div className="flex gap-2"><input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="이 장을 어떻게 고칠까요? 예: 글이 너무 많아요 — 카드 3개로 줄여줘" value={comment} onChange={e => setComment(e.target.value)} /><button disabled={busy || !comment.trim()} onClick={doFix} className="px-4 py-2 rounded-lg bg-[#4F5BFF] text-white text-sm font-bold disabled:opacity-40">{busy ? '수정 중…' : '이 장 고치기'}</button></div>
              {result.warnings?.length > 0 && <details className="text-xs text-gray-500"><summary>검증 메모 {result.warnings.length}</summary><ul className="list-disc ml-5">{result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></details>}
            </div>
          )}
          {!plan && <div className="bg-white rounded-2xl border p-8 text-center text-gray-500 text-sm">브리프를 입력하고 <b>덱 구조 설계</b>를 누르면, 엔진이 서사 구조와 장별 유형을 먼저 제안합니다. 확인 후 작성·렌더로 넘어갑니다.</div>}
        </section>
      </main>
    </div>
  );
}
