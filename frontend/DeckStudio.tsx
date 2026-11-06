/* Qpresen 동적 슬라이드 생성 — 대시보드 콘텐츠 컴포넌트 (/dashboard/deck-studio).
   대시보드 레이아웃(상단 헤더·사이드바) 안에 그대로 넣습니다. 정보를 입력하고 버튼 하나를 누르면 완성된 발표자료가 내 자료에 저장됩니다. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brief, Progress, Quality, QaState, RefFile, Theme, PURPOSES, TONES, THEMES, callEngine, defaultSlideCount, estimateMinutes, extractReference, mergeMaterials, generateDeck, runQa, downloadHtml } from './deckStudioEngine';

type Phase = 'idle' | 'running' | 'done';
const card = 'bg-white rounded-2xl border border-background-200 shadow-sm';
const input = 'w-full rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition';
const Eyebrow = ({ n, text }: { n: string; text: string }) => <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-foreground-400 uppercase"><span className="text-primary-500">{n}</span>{text}</div>;
const Label = ({ children, opt }: { children: React.ReactNode; opt?: boolean }) => <div className="mb-1.5 text-[13px] font-semibold text-foreground-700">{children}{opt && <span className="ml-1 text-foreground-400 font-normal">(선택)</span>}</div>;

export default function DeckStudio() {
  const [b, setB] = useState<Brief>({ topic: '', purpose: 'lecture', tone: 'formal', audience: '', materials: '', extra: '' });
  const [quality, setQuality] = useState<Quality>('standard');
  const [count, setCount] = useState<number | ''>('');
  const [refs, setRefs] = useState<RefFile[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [prog, setProg] = useState<Progress | null>(null);
  const [started, setStarted] = useState(0); const [now, setNow] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState(1);
  const [comment, setComment] = useState('');
  const [qa, setQa] = useState<QaState>({ stage: 'idle' });
  const frameRef = useRef<HTMLIFrameElement>(null); const fileRef = useRef<HTMLInputElement>(null);
  const up = (p: Partial<Brief>) => setB(v => ({ ...v, ...p }));

  useEffect(() => { const h = (e: MessageEvent) => { if (e.data?.qpDeck && e.data.kind === 'page') setCur(e.data.value); }; window.addEventListener('message', h); return () => window.removeEventListener('message', h); }, []);
  useEffect(() => { if (phase !== 'running') return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [phase]);
  useEffect(() => { if (phase !== 'running') return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [phase]);

  const n = count || defaultSlideCount(b.purpose);
  const [tMin, tMax] = useMemo(() => estimateMinutes(n, quality), [n, quality]);
  const elapsed = started ? Math.max(0, Math.round((now - started) / 1000)) : 0;
  const canRun = !!b.topic.trim() && !busy && !refs.some(r => r.status === 'uploading' || r.status === 'extracting');

  async function addFiles(list: FileList | null) {
    if (!list) return;
    for (const f of Array.from(list).slice(0, 5)) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setRefs(v => [...v, { id, name: f.name, size: f.size, status: 'uploading' }]);
      const patch = (p: Partial<RefFile>) => setRefs(v => v.map(r => r.id === id ? { ...r, ...p } : r));
      try { const r = await extractReference(f, patch); patch({ status: 'done', text: r.text, chars: r.text.length, truncated: r.truncated }); }
      catch (e: any) { patch({ status: 'error', error: e.message }); }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function run() {
    setErr(null); setResult(null); setQa({ stage: 'idle' }); setBusy(true); setPhase('running'); setStarted(Date.now()); setNow(Date.now()); setCur(1);
    const brief: Brief = { ...b, slideCount: n, theme: b.theme || undefined, materials: mergeMaterials(b.materials || '', refs), presenter: b.presenter?.name ? b.presenter : undefined };
    try {
      const { jobId: jid, result: r } = await generateDeck(brief, quality, setProg);
      setJobId(jid); setResult(r); setPhase('done'); setBusy(false);
      await runQa(jid, r, quality, { player: () => frameRef.current?.contentWindow, setQa, setResult, setBusy });
    } catch (e: any) { setErr(e.message); setPhase('idle'); setProg(null); } finally { setBusy(false); }
  }

  async function feedback(rating: number) { if (!result || !jobId) return; const s = result.spec?.slides?.[cur - 1]; try { await callEngine({ action: 'feedback', jobId, slideId: s?.id, slideType: s?.body?.type, rating, comment }); setComment(''); } catch (e: any) { setErr(e.message); } }
  async function fixCurrent() {
    if (!result || !jobId || !comment.trim()) return; const s = result.spec?.slides?.[cur - 1]; setBusy(true); setErr(null);
    try { await callEngine({ action: 'fix', jobId, slideId: s.id, comment, issues: [{ sev: 'warn', what: comment }] }); const d = await callEngine({ action: 'render', jobId, register: false }); setResult({ ...d, fileId: result.fileId }); setComment(''); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  function reset() { setPhase('idle'); setResult(null); setProg(null); setQa({ stage: 'idle' }); setErr(null); }

  const srcdoc = result?.html ? result.html.replace('<html lang=', `<html data-start="${cur}" lang=`) : '';
  const stepKeys = quality === 'premium' ? ['plan', 'direct', 'fill', 'render', 'qa'] : ['plan', 'fill', 'render', 'qa'];
  const stepMeta: Record<string, [string, string]> = { plan: ['구성 설계', 'ri-compasses-2-line'], direct: ['디자인 방향', 'ri-palette-line'], fill: [quality === 'premium' ? '장별 디자인' : '슬라이드 작성', 'ri-layout-masonry-line'], render: ['이미지·완성', 'ri-image-add-line'], qa: ['검수·저장', 'ri-shield-check-line'] };
  const steps = stepKeys.map(k => stepMeta[k]);
  const curStep = prog ? stepKeys.indexOf(({ dossier: 'plan', plan: 'plan', direct: 'direct', fill: 'fill', render: 'render', done: 'qa' } as Record<string, string>)[prog.step]) : -1;
  const qaText = qa.stage === 'lint' ? `레이아웃 검수 ${qa.done}/${qa.total}${qa.round && qa.round > 1 ? ` (${qa.round}차)` : ''}` : qa.stage === 'review' ? `디자인 디렉터 검수 ${qa.done}/${qa.total}${qa.avg ? ` · 평균 ${qa.avg}점` : ''}` : qa.stage === 'fix' ? `${qa.round === 2 ? '디렉터 지시로' : '레이아웃 오류'} ${qa.total}장 수정 중 ${qa.done}/${qa.total}` : qa.stage === 'done' ? (qa.skipped ? '검수 생략' : `검수 완료${qa.avg ? ` · 디렉터 평균 ${qa.avg}점` : ''}${qa.fixed ? ` · ${qa.fixed}장 수정` : ' · 문제 없음'}`) : '';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground-900 flex items-center gap-2.5"><span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-sm"><i className="ri-sparkling-2-line text-lg" /></span>동적 슬라이드 생성</h1>
          <p className="mt-1.5 text-sm text-foreground-500">주제와 자료만 넣으세요. 구성 → 디자인 → 이미지 → 검수까지 한 번에 끝나고, 완성본은 <b className="text-foreground-700">내 자료</b>에 바로 저장됩니다.</p>
        </div>
        {phase === 'done' && <button onClick={reset} className="px-4 py-2 rounded-xl border border-background-200 bg-white text-sm font-semibold text-foreground-700 hover:bg-background-100 transition"><i className="ri-add-line mr-1" />새로 만들기</button>}
      </div>
      {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2"><i className="ri-error-warning-line mt-0.5" /><span>{err}</span></div>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-5 items-start">
        {/* ───── 입력 ───── */}
        <section className={`${card} p-5 sm:p-6 space-y-6 ${phase === 'running' ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="space-y-4">
            <Eyebrow n="01" text="무엇을 발표하나요" />
            <div><Label>주제 · 요청</Label><textarea className={`${input} h-24 resize-none`} placeholder="예: 광주 광융합 반도체 첨단 패키징 특강 — 최신 동향, 핵심 공정 6단계, 지역 기업 적용 사례" value={b.topic} onChange={e => up({ topic: e.target.value })} /></div>
            <div><Label>목적</Label><div className="flex flex-wrap gap-1.5">{PURPOSES.map(([v, l, ic]) => <button key={v} type="button" onClick={() => up({ purpose: v })} className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition flex items-center gap-1.5 ${b.purpose === v ? 'bg-primary-500 border-primary-500 text-white shadow-sm' : 'bg-white border-background-200 text-foreground-600 hover:border-primary-300 hover:text-primary-600'}`}><i className={`${ic} text-sm`} />{l}</button>)}</div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>톤</Label><div className="grid grid-cols-4 rounded-xl border border-background-200 bg-background-50 p-1 gap-1">{TONES.map(([v, l]) => <button key={v} type="button" onClick={() => up({ tone: v })} className={`py-1.5 rounded-lg text-[13px] font-medium transition ${b.tone === v ? 'bg-white text-primary-600 shadow-sm border border-background-200' : 'text-foreground-500 hover:text-foreground-800'}`}>{l}</button>)}</div></div>
              <div><Label>발표 장수</Label><div className="flex items-center rounded-xl border border-background-200 bg-background-50 overflow-hidden"><button type="button" onClick={() => setCount(Math.max(3, n - 1))} className="px-3 py-2.5 text-foreground-500 hover:bg-background-200"><i className="ri-subtract-line" /></button><input type="number" min={3} className="flex-1 min-w-0 text-center bg-transparent py-2.5 text-sm font-semibold text-foreground-900 focus:outline-none" value={count} placeholder={`자동 ${n}`} onChange={e => setCount(e.target.value ? Math.max(1, +e.target.value) : '')} /><button type="button" onClick={() => setCount(n + 1)} className="px-3 py-2.5 text-foreground-500 hover:bg-background-200"><i className="ri-add-line" /></button></div></div>
            </div>
          </div>

          <div className="space-y-4">
            <Eyebrow n="02" text="스타일과 품질" />
            <div><Label>테마</Label><div className="grid grid-cols-5 gap-2">{THEMES.map(([v, l, g]) => <button key={v} type="button" onClick={() => up({ theme: (v || undefined) as Theme | undefined })} title={l} className={`rounded-xl border p-1.5 text-center transition ${(b.theme || '') === v ? 'border-primary-500 ring-2 ring-primary-100' : 'border-background-200 hover:border-primary-300'}`}><span className="block h-9 rounded-lg" style={{ background: g }} /><span className="block mt-1.5 text-[11px] leading-tight text-foreground-600 font-medium whitespace-nowrap">{l}</span></button>)}</div></div>
            <div><Label>품질</Label><div className="grid grid-cols-2 gap-2">
              {([['standard', '표준', '템플릿 기반 · 빠르게', 'ri-flashlight-line'], ['premium', '프리미엄', '장마다 맞춤 설계 · 디렉터 검수', 'ri-vip-crown-2-line']] as [Quality, string, string, string][]).map(([v, l, d, ic]) => <button key={v} type="button" onClick={() => setQuality(v)} className={`text-left rounded-xl border p-3 transition ${quality === v ? 'border-primary-500 bg-primary-50/60 ring-2 ring-primary-100' : 'border-background-200 hover:border-primary-300'}`}><div className="flex items-center gap-2 font-bold text-sm text-foreground-900"><i className={`${ic} ${v === 'premium' ? 'text-accent-500' : 'text-primary-500'}`} />{l}</div><div className="text-[12px] text-foreground-500 mt-0.5">{d}</div></button>)}
            </div>
              <p className="mt-2 text-[12px] text-foreground-500 flex items-center gap-1.5"><i className="ri-time-line" />{n}장 기준 약 {tMin}~{tMax}분{quality === 'premium' ? ' · 레퍼런스급 디자인 레이어와 장별 인터랙션(차트·시연·3D 장면)을 설계합니다' : ''}</p></div>
          </div>

          <div className="space-y-4">
            <Eyebrow n="03" text="발표 정보" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label opt>발표자</Label><input className={input} value={b.presenter?.name || ''} onChange={e => up({ presenter: { ...(b.presenter || { name: '' }), name: e.target.value } })} placeholder="홍길동" /></div>
              <div><Label opt>소속</Label><input className={input} value={b.presenter?.org || ''} onChange={e => up({ presenter: { ...(b.presenter || { name: '' }), org: e.target.value } })} placeholder="광주과학기술원" /></div>
              <div><Label opt>행사</Label><input className={input} value={b.event || ''} onChange={e => up({ event: e.target.value })} placeholder="2026 광산업 실무자 특강" /></div>
              <div><Label opt>일자</Label><input className={input} value={b.date || ''} onChange={e => up({ date: e.target.value })} placeholder="2026. 11. 20" /></div>
            </div>
            <div><Label opt>청중</Label><input className={input} value={b.audience || ''} onChange={e => up({ audience: e.target.value })} placeholder="예: 공무원 60명, AI 초심자" /></div>
          </div>

          <div className="space-y-4">
            <Eyebrow n="04" text="참고자료와 지시" />
            <div><Label opt>참고자료</Label>
              <textarea className={`${input} h-24 resize-none`} placeholder="수치·사실·인용은 여기 붙여넣은 내용에서만 가져옵니다. 보고서를 업로드하면 그 보고서 기반으로 발표자료를 만듭니다." value={b.materials || ''} onChange={e => up({ materials: e.target.value })} />
              <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.pptx,.docx,.hwp,.hwpx,.txt,.md" onChange={e => addFiles(e.target.files)} />
              <button type="button" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }} className="mt-2 w-full rounded-xl border border-dashed border-background-300 bg-background-50 hover:border-primary-400 hover:bg-primary-50/40 transition px-3 py-3 text-[13px] text-foreground-500 flex items-center justify-center gap-2"><i className="ri-upload-cloud-2-line text-base text-primary-500" />보고서 · PDF · PPT · 워드 · 한글 파일 올리기 <span className="text-foreground-400">(최대 5개)</span></button>
              {refs.length > 0 && <ul className="mt-2 space-y-1.5">{refs.map(r => <li key={r.id} className="flex items-center gap-2 rounded-lg bg-background-50 border border-background-200 px-3 py-2 text-[13px]"><i className={`${r.status === 'done' ? 'ri-file-text-line text-primary-500' : r.status === 'error' ? 'ri-error-warning-line text-red-500' : 'ri-loader-4-line animate-spin text-primary-500'}`} /><span className="truncate text-foreground-800 flex-1">{r.name}</span><span className="text-foreground-400 whitespace-nowrap">{r.status === 'uploading' ? '업로드 중' : r.status === 'extracting' ? '본문 추출 중' : r.status === 'error' ? r.error : `${(r.chars || 0).toLocaleString()}자${r.truncated ? ' (일부)' : ''}`}</span><button type="button" onClick={() => setRefs(v => v.filter(x => x.id !== r.id))} className="text-foreground-400 hover:text-red-500"><i className="ri-close-line" /></button></li>)}</ul>}
            </div>
            <div><Label opt>추가 지시</Label><input className={input} value={b.extra || ''} onChange={e => up({ extra: e.target.value })} placeholder="예: 사례 3개 꼭 포함, 마지막에 Q&A, 영문 용어는 병기" /></div>
          </div>

          <button disabled={!canRun} onClick={run} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 text-[15px] shadow-md shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"><i className="ri-magic-line text-lg" />{busy ? '만드는 중…' : '발표자료 만들기'}</button>
        </section>

        {/* ───── 진행 · 결과 ───── */}
        <section className={`space-y-5 min-w-0 ${phase !== 'done' ? 'xl:sticky xl:top-6' : ''}`}>
          {phase === 'idle' && <div className={`${card} p-6 sm:p-8`}>
            <div className="text-[11px] font-bold tracking-wider text-foreground-400 uppercase">이렇게 만들어집니다</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['ri-compasses-2-line', '구성 설계', '자료를 읽고 발표의 흐름과 장별 역할을 설계'], ['ri-palette-line', '디자인', '덱 전용 디자인 레이어 — 색·타이포·모션 (프리미엄은 장마다 맞춤 설계)'], ['ri-image-add-line', '이미지', '표지·히어로처럼 사진이 필요한 장에만 AI 이미지를 생성'], ['ri-shield-check-line', '검수', '모든 장을 자동 점검하고, 프리미엄은 디자인 디렉터가 채점·수정']].map(([ic, t, d]) => <div key={t} className="rounded-xl border border-background-200 bg-background-50 p-4"><i className={`${ic} text-xl text-primary-500`} /><div className="mt-2 font-bold text-sm text-foreground-900">{t}</div><div className="mt-1 text-[12px] leading-relaxed text-foreground-500">{d}</div></div>)}
            </div>
            <div className="mt-5 rounded-xl bg-primary-50/70 border border-primary-100 px-4 py-3 text-[13px] text-primary-700 flex gap-2"><i className="ri-lightbulb-line mt-0.5" /><span>완성된 발표자료는 <b>내 자료</b>에 자동 저장되어 바로 발표·편집·공유할 수 있습니다. 보고서를 올리면 그 내용을 근거로 만듭니다.</span></div>
          </div>}

          {phase === 'running' && prog && <div className={`${card} p-6 sm:p-8`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div><div className="text-[11px] font-bold tracking-wider text-primary-500 uppercase">만드는 중</div><div className="mt-1 text-lg font-bold text-foreground-900">{prog.title || b.topic.slice(0, 40)}</div><div className="mt-1 text-sm text-foreground-500">{prog.label}{prog.total ? ` · ${prog.done}/${prog.total}` : ''}{prog.slides ? ` · ${prog.slides}장` : ''}</div></div>
              <div className="text-right"><div className="text-2xl font-bold tabular-nums text-foreground-900">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div><div className="text-[12px] text-foreground-400">예상 {tMin}~{tMax}분</div></div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-background-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-700" style={{ width: `${Math.min(96, (curStep + (prog.total ? (prog.done || 0) / prog.total : 0.35)) / steps.length * 100)}%` }} /></div>
            <ol className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">{steps.map(([t, ic], i) => { const st = i < curStep ? 'done' : i === curStep ? 'now' : 'wait'; return <li key={t} className={`rounded-xl border px-3 py-2.5 flex items-center gap-2 text-[13px] whitespace-nowrap ${st === 'now' ? 'border-primary-300 bg-primary-50 text-primary-700 font-semibold' : st === 'done' ? 'border-background-200 bg-white text-foreground-600' : 'border-background-200 bg-background-50 text-foreground-400'}`}><i className={`${st === 'done' ? 'ri-checkbox-circle-fill text-primary-500' : st === 'now' ? 'ri-loader-4-line animate-spin' : ic}`} />{t}</li>; })}</ol>
            <p className="mt-4 text-[12px] text-foreground-400 flex items-center gap-1.5"><i className="ri-information-line" />완료될 때까지 이 화면을 열어 두세요. 장별 작성은 여러 장을 동시에 진행합니다.</p>
          </div>}

          {phase === 'done' && result && <div className={`${card} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0"><div className="font-bold text-foreground-900 truncate">{result.spec?.meta?.title || '발표자료'}</div><div className="text-[13px] text-foreground-500 flex items-center gap-2 flex-wrap mt-0.5"><span>{result.pageCount}장 · {(result.bytes / 1048576).toFixed(1)}MB</span>{result.fileId && <span className="inline-flex items-center gap-1 text-green-700"><i className="ri-checkbox-circle-fill" />내 자료에 저장됨</span>}{result.images?.generated > 0 && <span>이미지 {result.images.generated}장</span>}{qaText && <span className={qa.stage === 'done' ? 'text-foreground-500' : 'text-primary-600'}>{qa.stage !== 'done' && <i className="ri-loader-4-line animate-spin mr-1" />}{qaText}</span>}</div></div>
              <div className="flex gap-2"><button onClick={() => downloadHtml(result, 'player')} className="px-3 py-2 rounded-xl border border-background-200 bg-white text-sm font-medium text-foreground-700 hover:bg-background-100 transition"><i className="ri-download-line mr-1" />HTML 다운로드</button>{result.fileId ? <a href="/dashboard" className="px-4 py-2 rounded-xl bg-foreground-900 text-white text-sm font-bold hover:bg-foreground-800 transition no-underline"><i className="ri-play-circle-line mr-1" />내 자료에서 발표하기</a> : <button onClick={() => downloadHtml(result, 'qpresen')} className="px-4 py-2 rounded-xl bg-foreground-900 text-white text-sm font-bold">Qpresen용 HTML</button>}</div>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-background-200 bg-black"><iframe ref={frameRef} title="deck" className="w-full h-full" srcDoc={srcdoc} allow="fullscreen" /></div>
            <div className="flex items-center gap-2 flex-wrap text-[13px]"><span className="text-foreground-500">{cur}/{result.pageCount}장 · {result.titles?.[cur - 1]}</span><span className="text-foreground-300">·</span><span className="text-foreground-400">미리보기에서 ← → 로 넘기고, 더블클릭하면 전체 화면</span>
              <div className="ml-auto flex gap-1.5"><button onClick={() => feedback(5)} className="px-2.5 py-1.5 rounded-lg border border-background-200 bg-white hover:bg-background-100 transition">👍 좋아요</button><button onClick={() => feedback(2)} className="px-2.5 py-1.5 rounded-lg border border-background-200 bg-white hover:bg-background-100 transition">👎 별로</button></div></div>
            <div className="flex gap-2"><input className={`${input} flex-1`} placeholder="이 장을 어떻게 고칠까요? 예: 글이 많아요 — 카드 3개로 줄여줘" value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') fixCurrent(); }} /><button disabled={busy || !comment.trim()} onClick={fixCurrent} className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40 transition whitespace-nowrap">{busy ? '수정 중…' : '이 장 고치기'}</button></div>
          </div>}
        </section>
      </div>
    </div>
  );
}
