/* 동적 슬라이드 생성 — 작업 목록 + 선택한 작업의 진행/결과 카드. 상태는 deckJobs(싱글톤)에서 오므로 탭을 옮겨도 이어서 보입니다. */
import React, { useEffect, useRef, useState } from 'react';
import { DeckJob, deckJobs } from './deckJobs';
import { Quality, callEngine, downloadHtml, estimateMinutes, defaultSlideCount } from './deckStudioEngine';

const card = 'bg-white rounded-2xl border border-background-200 shadow-sm';
const input = 'w-full rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition';
const STATUS: Record<string, [string, string]> = { queued: ['대기', 'bg-background-200 text-foreground-600'], running: ['진행 중', 'bg-primary-50 text-primary-700'], qa: ['검수 중', 'bg-accent-50 text-accent-600'], done: ['완료', 'bg-green-50 text-green-700'], error: ['오류', 'bg-red-50 text-red-700'], cancelled: ['중지됨', 'bg-background-200 text-foreground-500'] };
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const qaText = (qa?: DeckJob['qa']) => !qa ? '' : qa.stage === 'lint' ? `레이아웃 검수 ${qa.done ?? 0}/${qa.total ?? 0}${qa.round && qa.round > 1 ? ` (${qa.round}차)` : ''}` : qa.stage === 'review' ? `디자인 디렉터 검수 ${qa.done}/${qa.total}${qa.avg ? ` · 평균 ${qa.avg}점` : ''}` : qa.stage === 'fix' ? `${qa.round === 2 ? '디렉터 지시로' : '레이아웃 오류'} ${qa.total}장 수정 중 ${qa.done}/${qa.total}` : qa.stage === 'done' ? (qa.skipped ? '검수 생략' : `검수 완료${qa.avg ? ` · 디렉터 평균 ${qa.avg}점` : ''}${qa.fixed ? ` · ${qa.fixed}장 수정` : ' · 문제 없음'}`) : '';

export default function DeckJobPanel({ jobs, selectedId, onSelect }: { jobs: DeckJob[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [now, setNow] = useState(Date.now());
  const busy = jobs.some(j => j.status === 'running' || j.status === 'qa');
  useEffect(() => { if (!busy) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [busy]);
  const sel = jobs.find(j => j.id === selectedId) || null;
  const finished = jobs.filter(j => j.status === 'done' || j.status === 'error' || j.status === 'cancelled').length;
  const rank = (j: DeckJob) => j.status === 'running' || j.status === 'qa' ? 0 : j.status === 'queued' ? 1 : 2;
  const ordered = [...jobs].sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
  return (
    <div className="space-y-4">
      {jobs.length > 0 && <div className={`${card} p-4`}>
        <div className="flex items-center justify-between mb-2"><div className="text-[11px] font-bold tracking-wider text-foreground-400 uppercase">작업 목록 <span className="text-foreground-300">·</span> {jobs.length}건</div>{finished > 0 && <button onClick={() => deckJobs.clearFinished()} className="text-[12px] text-foreground-400 hover:text-foreground-700">끝난 작업 지우기</button>}</div>
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">{ordered.map((j, i) => { const [lbl, cls] = STATUS[j.status]; const ahead = j.status === 'queued' ? ordered.slice(0, i).filter(x => x.status === 'queued' || x.status === 'running' || x.status === 'qa').length : 0; const pct = j.status === 'running' && j.prog?.total ? Math.round((j.prog.done || 0) / j.prog.total * 100) : null;
          return <li key={j.id}><button onClick={() => onSelect(j.id)} className={`w-full text-left rounded-xl border px-3 py-2.5 transition flex items-center gap-3 ${j.id === selectedId ? 'border-primary-300 bg-primary-50/50' : 'border-background-200 hover:bg-background-100'}`}>
            <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{(j.status === 'running' || j.status === 'qa') && <i className="ri-loader-4-line animate-spin mr-1" />}{lbl}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-foreground-900">{j.title || j.brief.topic}</span><span className="block text-[11px] text-foreground-400 truncate">{j.quality === 'premium' ? '프리미엄' : '표준'} · {j.brief.slideCount || defaultSlideCount(j.brief.purpose)}장{j.status === 'running' && j.prog ? ` · ${j.prog.label}${pct !== null ? ` ${pct}%` : ''}` : ''}{j.status === 'qa' ? ` · ${qaText(j.qa)}` : ''}{j.status === 'queued' ? (ahead ? ` · 앞에 ${ahead}건` : ' · 곧 시작') : ''}{j.status === 'done' && j.fileId ? ' · 내 자료에 저장됨' : ''}{j.status === 'error' ? ` · ${j.error}` : ''}</span></span>
            {(j.status === 'running' || j.status === 'qa' || j.status === 'queued') ? <span onClick={e => { e.stopPropagation(); deckJobs.cancel(j.id); }} title="중지" className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-red-50 hover:text-red-600"><i className="ri-stop-circle-line text-base" /></span>
              : <span onClick={e => { e.stopPropagation(); deckJobs.remove(j.id); }} title="목록에서 지우기" className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-foreground-300 hover:bg-background-200 hover:text-foreground-700"><i className="ri-close-line text-base" /></span>}
          </button></li>; })}</ul>
      </div>}
      {sel && <JobDetail job={sel} now={now} />}
    </div>
  );
}

function JobDetail({ job: j, now }: { job: DeckJob; now: number }) {
  const [cur, setCur] = useState(1); const [comment, setComment] = useState(''); const [fixing, setFixing] = useState(false); const [err, setErr] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => { const h = (e: MessageEvent) => { if (e.data?.qpDeck && e.data.kind === 'page' && e.source === frameRef.current?.contentWindow) setCur(e.data.value); }; window.addEventListener('message', h); return () => window.removeEventListener('message', h); }, []);
  useEffect(() => { setCur(1); setErr(null); if (j.status === 'done' && !j.result?.html && j.jobId) deckJobs.openResult(j.id); }, [j.id, j.status]);
  const n = j.brief.slideCount || defaultSlideCount(j.brief.purpose); const [tMin, tMax] = estimateMinutes(n, j.quality as Quality);
  const elapsed = j.startedAt ? Math.max(0, Math.round(((j.finishedAt || now) - j.startedAt) / 1000)) : 0;
  const stepKeys = j.quality === 'premium' ? ['plan', 'direct', 'fill', 'render', 'qa'] : ['plan', 'fill', 'render', 'qa'];
  const meta: Record<string, [string, string]> = { plan: ['구성 설계', 'ri-compasses-2-line'], direct: ['디자인 방향', 'ri-palette-line'], fill: [j.quality === 'premium' ? '장별 디자인' : '슬라이드 작성', 'ri-layout-masonry-line'], render: ['이미지·완성', 'ri-image-add-line'], qa: ['검수·저장', 'ri-shield-check-line'] };
  const curKey = j.status === 'qa' ? 'qa' : j.prog ? ({ dossier: 'plan', plan: 'plan', direct: 'direct', fill: 'fill', render: 'render', done: 'qa' } as Record<string, string>)[j.prog.step] : 'plan';
  const curStep = stepKeys.indexOf(curKey);
  const pct = Math.min(96, (curStep + (j.status === 'qa' ? (j.qa?.total ? (j.qa.done || 0) / j.qa.total : 0.3) : j.prog?.total ? (j.prog.done || 0) / j.prog.total : 0.35)) / stepKeys.length * 100);
  const srcdoc = j.result?.html ? j.result.html.replace('<html lang=', `<html data-start="${cur}" lang=`) : '';

  async function feedback(rating: number) { if (!j.jobId) return; const s = j.result?.spec?.slides?.[cur - 1]; try { await callEngine({ action: 'feedback', jobId: j.jobId, slideId: s?.id, slideType: s?.body?.type, rating, comment }); setComment(''); } catch (e: any) { setErr(e.message); } }
  async function fixCurrent() {
    if (!j.jobId || !comment.trim()) return; const s = j.result?.spec?.slides?.[cur - 1]; if (!s) return; setFixing(true); setErr(null);
    try { await callEngine({ action: 'fix', jobId: j.jobId, slideId: s.id, comment, issues: [{ sev: 'warn', what: comment }] }); const d = await callEngine({ action: 'render', jobId: j.jobId, register: false, images: false }); deckJobs.patch(j.id, { result: { ...d, fileId: j.fileId } }); setComment(''); } catch (e: any) { setErr(e.message); } finally { setFixing(false); }
  }

  if (j.status === 'queued') return <div className={`${card} p-6`}><div className="text-[11px] font-bold tracking-wider text-foreground-400 uppercase">대기 중</div><div className="mt-1 text-lg font-bold text-foreground-900">{j.title}</div><p className="mt-2 text-sm text-foreground-500">앞 작업이 끝나면 자동으로 시작합니다 · 예상 {tMin}~{tMax}분</p><button onClick={() => deckJobs.cancel(j.id)} className="mt-4 px-3 py-2 rounded-xl border border-background-200 text-sm font-medium text-foreground-700 hover:bg-background-100"><i className="ri-close-line mr-1" />대기 취소</button></div>;
  if (j.status === 'cancelled' || j.status === 'error') return <div className={`${card} p-6`}><div className={`text-[11px] font-bold tracking-wider uppercase ${j.status === 'error' ? 'text-red-500' : 'text-foreground-400'}`}>{j.status === 'error' ? '오류' : '중지됨'}</div><div className="mt-1 text-lg font-bold text-foreground-900">{j.title}</div><p className="mt-2 text-sm text-foreground-600">{j.error || j.note}</p><div className="mt-4 flex gap-2"><button onClick={() => deckJobs.retry(j.id)} className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold"><i className="ri-restart-line mr-1" />같은 설정으로 다시 만들기</button><button onClick={() => deckJobs.remove(j.id)} className="px-3 py-2 rounded-xl border border-background-200 text-sm font-medium text-foreground-700 hover:bg-background-100">지우기</button></div></div>;
  if (j.status === 'running') return <div className={`${card} p-6 sm:p-8`}>
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0"><div className="text-[11px] font-bold tracking-wider text-primary-500 uppercase">만드는 중</div><div className="mt-1 text-lg font-bold text-foreground-900 truncate">{j.title}</div><div className="mt-1 text-sm text-foreground-500">{j.prog?.label || '준비 중'}{j.prog?.total ? ` · ${j.prog.done}/${j.prog.total}` : ''}{j.prog?.slides ? ` · ${j.prog.slides}장` : ''}</div></div>
      <div className="flex items-start gap-3"><div className="text-right"><div className="text-2xl font-bold tabular-nums text-foreground-900">{mmss(elapsed)}</div><div className="text-[12px] text-foreground-400">예상 {tMin}~{tMax}분</div></div><button onClick={() => deckJobs.cancel(j.id)} className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"><i className="ri-stop-fill mr-1" />중지</button></div>
    </div>
    <div className="mt-5 h-2 rounded-full bg-background-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-700" style={{ width: `${pct}%` }} /></div>
    <ol className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">{stepKeys.map((k, i) => { const [t, ic] = meta[k]; const st = i < curStep ? 'done' : i === curStep ? 'now' : 'wait'; return <li key={k} className={`rounded-xl border px-3 py-2.5 flex items-center gap-2 text-[13px] whitespace-nowrap ${st === 'now' ? 'border-primary-300 bg-primary-50 text-primary-700 font-semibold' : st === 'done' ? 'border-background-200 bg-white text-foreground-600' : 'border-background-200 bg-background-50 text-foreground-400'}`}><i className={st === 'done' ? 'ri-checkbox-circle-fill text-primary-500' : st === 'now' ? 'ri-loader-4-line animate-spin' : ic} />{t}</li>; })}</ol>
    <p className="mt-4 text-[12px] text-foreground-400 flex items-center gap-1.5"><i className="ri-information-line" />다른 탭으로 이동해도 계속 진행됩니다. 브라우저 탭을 닫거나 새로고침하면 중단됩니다.</p>
  </div>;
  // qa | done
  return <div className={`${card} p-5 sm:p-6 space-y-4`}>
    {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">{err}</div>}
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="min-w-0"><div className="font-bold text-foreground-900 truncate">{j.title}</div><div className="text-[13px] text-foreground-500 flex items-center gap-2 flex-wrap mt-0.5"><span>{j.pageCount}장{j.result?.bytes ? ` · ${(j.result.bytes / 1048576).toFixed(1)}MB` : ''}</span>{j.fileId && <span className="inline-flex items-center gap-1 text-green-700"><i className="ri-checkbox-circle-fill" />내 자료에 저장됨</span>}{!!j.images && <span>이미지 {j.images}장</span>}{j.status === 'qa' ? <span className="text-primary-600"><i className="ri-loader-4-line animate-spin mr-1" />{qaText(j.qa)}</span> : <span>{qaText(j.qa)}</span>}{j.note && <span className="text-amber-700">{j.note}</span>}{j.startedAt && <span className="text-foreground-400">소요 {mmss(elapsed)}</span>}</div></div>
      <div className="flex gap-2">{j.status === 'qa' && <button onClick={() => deckJobs.cancel(j.id)} className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100"><i className="ri-stop-fill mr-1" />검수 중지</button>}<button disabled={!j.result?.html} onClick={() => downloadHtml(j.result, 'player')} className="px-3 py-2 rounded-xl border border-background-200 bg-white text-sm font-medium text-foreground-700 hover:bg-background-100 disabled:opacity-40 transition"><i className="ri-download-line mr-1" />HTML 다운로드</button>{j.fileId ? <a href="/dashboard" className="px-4 py-2 rounded-xl bg-foreground-900 text-white text-sm font-bold hover:bg-foreground-800 transition no-underline"><i className="ri-play-circle-line mr-1" />내 자료에서 발표하기</a> : <button disabled={!j.result?.qpresenHtml} onClick={() => downloadHtml(j.result, 'qpresen')} className="px-4 py-2 rounded-xl bg-foreground-900 text-white text-sm font-bold disabled:opacity-40">Qpresen용 HTML</button>}</div>
    </div>
    <div className="aspect-video rounded-xl overflow-hidden border border-background-200 bg-black flex items-center justify-center">{srcdoc ? <iframe ref={frameRef} title="deck" className="w-full h-full" srcDoc={srcdoc} allow="fullscreen" /> : <div className="text-sm text-foreground-400">{j.loading ? <span><i className="ri-loader-4-line animate-spin mr-1" />미리보기 불러오는 중…</span> : <button onClick={() => deckJobs.openResult(j.id)} className="px-3 py-2 rounded-lg bg-white/10 text-white text-sm">미리보기 열기</button>}</div>}</div>
    {srcdoc && <>
      <div className="flex items-center gap-2 flex-wrap text-[13px]"><span className="text-foreground-500">{cur}/{j.pageCount}장 · {j.result?.titles?.[cur - 1]}</span><span className="text-foreground-300">·</span><span className="text-foreground-400">← → 로 넘기고, 더블클릭하면 전체 화면</span>
        <div className="ml-auto flex gap-1.5"><button onClick={() => feedback(5)} className="px-2.5 py-1.5 rounded-lg border border-background-200 bg-white hover:bg-background-100 transition">👍 좋아요</button><button onClick={() => feedback(2)} className="px-2.5 py-1.5 rounded-lg border border-background-200 bg-white hover:bg-background-100 transition">👎 별로</button></div></div>
      <div className="flex gap-2"><input className={`${input} flex-1`} placeholder="이 장을 어떻게 고칠까요? 예: 글이 많아요 — 카드 3개로 줄여줘" value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') fixCurrent(); }} /><button disabled={fixing || j.status === 'qa' || !comment.trim()} onClick={fixCurrent} className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40 transition whitespace-nowrap">{fixing ? '수정 중…' : '이 장 고치기'}</button></div>
    </>}
  </div>;
}
