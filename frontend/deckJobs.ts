/* 동적 슬라이드 생성 — 작업 대기열(화면과 분리된 싱글톤).
   화면(DeckStudio)이 다른 탭으로 갔다가 돌아와도 진행 상황이 그대로 보이고, 작업은 등록된 순서대로 하나씩 처리되며, 언제든 중지할 수 있습니다.
   검수(QA)는 화면이 아니라 이 모듈이 띄우는 숨김 iframe 안에서 돌아가므로 탭을 옮겨도 계속됩니다. 목록은 localStorage에 남겨 새로고침 뒤에도 보입니다. */
import { Brief, Progress, QaState, Quality, generateDeck, runQa, reloadDeck, isAbort } from './deckStudioEngine';

export type JobStatus = 'queued' | 'running' | 'qa' | 'done' | 'error' | 'cancelled';
export interface DeckJob {
  id: string; brief: Brief; quality: Quality; status: JobStatus; title: string;
  prog?: Progress; qa?: QaState; result?: any; loading?: boolean;
  jobId?: string; pageCount?: number; fileId?: string | null; images?: number; error?: string; note?: string; seen?: boolean;
  createdAt: number; startedAt?: number; finishedAt?: number;
}
const LS_KEY = 'qp-deck-jobs';
const KEEP_HTML = 3; // 메모리에 결과 HTML을 보관하는 완료 작업 수(나머지는 열 때 다시 불러옴)

class DeckJobStore {
  private jobs: DeckJob[] = [];
  private snapshot: DeckJob[] = [];
  private subs = new Set<() => void>();
  private ctrls = new Map<string, AbortController>();
  private pumping = false;

  constructor() { this.load(); if (typeof window !== 'undefined') setTimeout(() => this.pump(), 0); }
  subscribe = (fn: () => void) => { this.subs.add(fn); return () => { this.subs.delete(fn); }; };
  getSnapshot = () => this.snapshot;
  get(id: string) { return this.jobs.find(j => j.id === id); }
  get active() { return this.jobs.find(j => j.status === 'running' || j.status === 'qa'); }
  get queuedCount() { return this.jobs.filter(j => j.status === 'queued').length; }

  /** 작업 등록 — 진행 중인 작업이 있으면 그 뒤에 줄을 섭니다. */
  add(brief: Brief, quality: Quality): DeckJob {
    const job: DeckJob = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, brief, quality, status: 'queued', title: brief.topic.replace(/\s+/g, ' ').slice(0, 60), createdAt: Date.now() };
    this.jobs.unshift(job); this.emit(); this.pump(); return job;
  }
  /** 중지 — 대기 중이면 취소, 진행 중이면 요청을 끊고 멈춤(이미 저장된 파일은 남음). */
  cancel(id: string) {
    const j = this.get(id); if (!j) return;
    if (j.status === 'queued') { j.status = 'cancelled'; j.finishedAt = Date.now(); this.emit(); return; }
    if (j.status === 'running' || j.status === 'qa') this.ctrls.get(id)?.abort();
  }
  remove(id: string) { const j = this.get(id); if (!j) return; if (j.status === 'running' || j.status === 'qa') this.cancel(id); this.jobs = this.jobs.filter(x => x.id !== id); this.emit(); }
  retry(id: string) { const j = this.get(id); if (!j) return; this.jobs = this.jobs.filter(x => x.id !== id); this.add(j.brief, j.quality); }
  /** 사용자가 스튜디오 화면을 보고 있으면 끝난 작업은 '확인함'으로 — 사이드바 점이 초록 깜빡임에서 회색으로 돌아간다 */
  markAllSeen() { let changed = false; for (const j of this.jobs) if ((j.status === 'done' || j.status === 'error' || j.status === 'cancelled') && !j.seen) { j.seen = true; changed = true; } if (changed) this.emit(); }
  clearFinished() { this.jobs = this.jobs.filter(j => j.status === 'queued' || j.status === 'running' || j.status === 'qa'); this.emit(); }
  patch(id: string, p: Partial<DeckJob>) { const j = this.get(id); if (!j) return; Object.assign(j, p); this.emit(); }
  /** 완료 작업의 미리보기를 다시 불러옵니다(새로고침 뒤 등). */
  async openResult(id: string) {
    const j = this.get(id); if (!j || j.result?.html || !j.jobId || j.loading) return;
    j.loading = true; this.emit();
    try { const d = await reloadDeck(j.jobId); j.result = { ...d, fileId: j.fileId ?? d.fileId }; j.pageCount = d.pageCount; }
    catch (e: any) { j.note = '미리보기를 불러오지 못했습니다: ' + (e?.message || ''); }
    finally { j.loading = false; this.emit(); }
  }

  private emit() { this.snapshot = [...this.jobs]; this.subs.forEach(f => { try { f(); } catch { /* ignore */ } }); this.save(); }
  private async pump() {
    if (this.pumping) return; this.pumping = true;
    try { for (;;) { const next = [...this.jobs].reverse().find(j => j.status === 'queued'); if (!next) break; await this.run(next); } }
    finally { this.pumping = false; }
  }
  private async run(j: DeckJob) {
    const ctrl = new AbortController(); this.ctrls.set(j.id, ctrl);
    j.status = 'running'; j.startedAt = Date.now(); j.error = undefined; this.emit();
    let frame: HTMLIFrameElement | null = null;
    try {
      const { jobId, result } = await generateDeck(j.brief, j.quality, p => { j.prog = p; if (p.title) j.title = p.title; this.emit(); }, ctrl.signal);
      j.jobId = jobId; j.result = result; j.pageCount = result.pageCount; j.fileId = result.fileId ?? null; j.images = result.images?.generated ?? 0;
      j.title = result.spec?.meta?.title || j.title; j.status = 'qa'; j.qa = { stage: 'lint', done: 0, total: result.pageCount }; this.emit();
      frame = mountHiddenPlayer(result.html);
      await runQa(jobId, result, j.quality, {
        player: () => frame?.contentWindow,
        setQa: q => { j.qa = q; this.emit(); },
        setResult: r => { j.result = r; if (frame && r?.html) frame.srcdoc = r.html; this.emit(); },
      }, ctrl.signal);
      j.status = 'done';
    } catch (e: any) {
      if (isAbort(e) || ctrl.signal.aborted) { if (j.result) { j.status = 'done'; j.qa = { stage: 'done', skipped: true }; j.note = '검수를 중지했습니다 (파일은 내 자료에 저장됨)'; } else { j.status = 'cancelled'; j.note = '중지했습니다'; } }
      else { j.status = 'error'; j.error = e?.message || '알 수 없는 오류'; }
    } finally {
      frame?.remove(); this.ctrls.delete(j.id); j.finishedAt = Date.now(); this.trim(); this.emit();
    }
  }
  private trim() { let kept = 0; for (const j of this.jobs) { if (j.result?.html && j.status !== 'running' && j.status !== 'qa') { kept++; if (kept > KEEP_HTML) { j.result = { ...j.result, html: undefined, qpresenHtml: undefined, spec: undefined }; } } } }
  private save() {
    try {
      const slim = this.jobs.slice(0, 40).map(j => ({ ...j, result: undefined, loading: false, brief: { ...j.brief, materials: (j.brief.materials || '').slice(0, 2000) } }));
      localStorage.setItem(LS_KEY, JSON.stringify(slim));
    } catch { /* 저장 공간 부족 등은 무시 */ }
  }
  private load() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null; const arr: DeckJob[] = raw ? JSON.parse(raw) : [];
      this.jobs = arr.map(j => (j.status === 'running' || j.status === 'qa') ? { ...j, status: j.fileId ? 'done' : 'error', qa: j.fileId ? { stage: 'done', skipped: true } : j.qa, error: j.fileId ? undefined : '페이지가 새로고침되어 중단되었습니다 — 다시 만들기를 눌러 주세요', note: j.fileId ? '새로고침으로 검수가 중단됨 (파일은 저장됨)' : undefined, finishedAt: Date.now() } : j);
    } catch { this.jobs = []; }
    this.snapshot = [...this.jobs];
  }
}

/** 검수용 숨김 플레이어 — 화면 밖(opacity 0)에 두어 탭 이동과 무관하게 동작. display:none이면 레이아웃 계산이 안 되므로 쓰지 않습니다. */
function mountHiddenPlayer(html: string): HTMLIFrameElement {
  const f = document.createElement('iframe');
  f.setAttribute('aria-hidden', 'true'); f.title = 'deck-qa';
  f.style.cssText = 'position:fixed;left:-20000px;top:0;width:1280px;height:720px;border:0;opacity:0;pointer-events:none;z-index:-1';
  f.srcdoc = html; document.body.appendChild(f); return f;
}

export const deckJobs = new DeckJobStore();
