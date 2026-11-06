/* Qpresen 동적 슬라이드 생성 — 대시보드 콘텐츠 컴포넌트 (/dashboard/deck-studio).
   대시보드 레이아웃(상단 헤더·사이드바) 안에 그대로 넣습니다. 정보를 입력하고 버튼 하나를 누르면 작업 대기열에 들어가 순서대로 완성되고, 내 자료에 저장됩니다.
   진행 상황은 deckJobs(싱글톤)에 있어 다른 탭에 갔다 와도 그대로 보이고, 언제든 중지할 수 있으며, 여러 건을 연달아 등록할 수 있습니다. */
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Brief, Quality, RefFile, Theme, PURPOSES, TONES, THEMES, defaultSlideCount, estimateMinutes, extractReference, mergeMaterials } from './deckStudioEngine';
import { deckJobs } from './deckJobs';
import DeckJobPanel from './DeckJobPanel';

const card = 'bg-white rounded-2xl border border-background-200 shadow-sm';
const input = 'w-full rounded-xl border border-background-200 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition';
const Eyebrow = ({ n, text }: { n: string; text: string }) => <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-foreground-400 uppercase"><span className="text-primary-500">{n}</span>{text}</div>;
const Label = ({ children, opt }: { children: React.ReactNode; opt?: boolean }) => <div className="mb-1.5 text-[13px] font-semibold text-foreground-700">{children}{opt && <span className="ml-1 text-foreground-400 font-normal">(선택)</span>}</div>;

export default function DeckStudio() {
  const [b, setB] = useState<Brief>({ topic: '', purpose: 'lecture', tone: 'formal', audience: '', materials: '', extra: '' });
  const [quality, setQuality] = useState<Quality>('standard');
  const [count, setCount] = useState<number | ''>('');
  const [refs, setRefs] = useState<RefFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const up = (p: Partial<Brief>) => setB(v => ({ ...v, ...p }));
  const jobs = useSyncExternalStore(deckJobs.subscribe, deckJobs.getSnapshot, deckJobs.getSnapshot);
  const active = jobs.find(j => j.status === 'running' || j.status === 'qa'); const queued = jobs.filter(j => j.status === 'queued').length;
  const sel = jobs.find(j => j.id === selectedId) ? selectedId : (active?.id || jobs[0]?.id || null);

  useEffect(() => { if (!active && !queued) return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [!!active, queued]);

  const n = count || defaultSlideCount(b.purpose);
  const [tMin, tMax] = useMemo(() => estimateMinutes(n, quality), [n, quality]);
  const canRun = !!b.topic.trim() && !refs.some(r => r.status === 'uploading' || r.status === 'extracting');

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

  function run() {
    const brief: Brief = { ...b, slideCount: n, theme: b.theme || undefined, materials: mergeMaterials(b.materials || '', refs), presenter: b.presenter?.name ? b.presenter : undefined };
    const job = deckJobs.add(brief, quality); if (!active) setSelectedId(job.id); // 진행 중인 작업이 있으면 그 진행 화면을 유지하고, 새 작업은 목록에 줄을 섭니다
    up({ topic: '' }); // 다음 작업을 바로 이어서 등록할 수 있게 주제만 비움 (목적·톤·발표 정보는 유지)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground-900 flex items-center gap-2.5"><span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-sm"><i className="ri-sparkling-2-line text-lg" /></span>동적 슬라이드 생성</h1>
          <p className="mt-1.5 text-sm text-foreground-500">주제와 자료만 넣으세요. 구성 → 디자인 → 이미지 → 검수까지 한 번에 끝나고, 완성본은 <b className="text-foreground-700">내 자료</b>에 바로 저장됩니다.</p>
        </div>
        {(active || queued > 0) && <div className="text-[13px] text-foreground-500 flex items-center gap-2 rounded-xl bg-white border border-background-200 px-3 py-2"><i className="ri-loader-4-line animate-spin text-primary-500" />{active ? `진행 중 1건` : ''}{active && queued ? ' · ' : ''}{queued ? `대기 ${queued}건` : ''}<span className="text-foreground-300">·</span><span className="text-foreground-400">다른 탭으로 이동해도 계속됩니다</span></div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-5 items-start">
        {/* ───── 입력 ───── */}
        <section className={`${card} p-5 sm:p-6 space-y-6`}>
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

          <button disabled={!canRun} onClick={run} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 text-[15px] shadow-md shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"><i className="ri-magic-line text-lg" />{active || queued ? '대기열에 추가 — 순서대로 만들기' : '발표자료 만들기'}</button>
          {(active || queued > 0) && <p className="text-[12px] text-foreground-400 text-center -mt-3">작업은 등록한 순서대로 하나씩 처리됩니다 (개수 제한 없음)</p>}
        </section>

        {/* ───── 작업 목록 · 진행 · 결과 ───── */}
        <section className="space-y-5 min-w-0">
          {jobs.length === 0 && <div className={`${card} p-6 sm:p-8`}>
            <div className="text-[11px] font-bold tracking-wider text-foreground-400 uppercase">이렇게 만들어집니다</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['ri-compasses-2-line', '구성 설계', '자료를 읽고 발표의 흐름과 장별 역할을 설계'], ['ri-palette-line', '디자인', '덱 전용 디자인 레이어 — 색·타이포·모션 (프리미엄은 장마다 맞춤 설계)'], ['ri-image-add-line', '이미지', '표지·히어로처럼 사진이 필요한 장에만 AI 이미지를 생성'], ['ri-shield-check-line', '검수', '모든 장을 자동 점검하고, 프리미엄은 디자인 디렉터가 채점·수정']].map(([ic, t, d]) => <div key={t} className="rounded-xl border border-background-200 bg-background-50 p-4"><i className={`${ic} text-xl text-primary-500`} /><div className="mt-2 font-bold text-sm text-foreground-900">{t}</div><div className="mt-1 text-[12px] leading-relaxed text-foreground-500">{d}</div></div>)}
            </div>
            <div className="mt-5 rounded-xl bg-primary-50/70 border border-primary-100 px-4 py-3 text-[13px] text-primary-700 flex gap-2"><i className="ri-lightbulb-line mt-0.5" /><span>완성본은 <b>내 자료</b>에 자동 저장됩니다. 여러 건을 연달아 등록하면 순서대로 만들고, 다른 탭에 다녀와도 진행 상황이 그대로 보입니다.</span></div>
          </div>}
          <DeckJobPanel jobs={jobs} selectedId={sel} onSelect={setSelectedId} />
        </section>
      </div>
    </div>
  );
}
