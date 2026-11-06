/* 사이드바 '동적 슬라이드 생성' 메뉴 옆 상태 점 — 작업 대기열(deckJobs)을 구독해 색으로 상태를 보여줍니다.
   만드는 중: 노란색 깜빡임 · 완성됐는데 아직 안 봄: 초록 깜빡임 · 오류(안 봄): 빨강 · 쉴 때: 회색 고정 */
import React, { useSyncExternalStore } from 'react';
import { deckJobs } from './deckJobs';

export default function DeckStatusDot({ className = '' }: { className?: string }) {
  const jobs = useSyncExternalStore(deckJobs.subscribe, deckJobs.getSnapshot, deckJobs.getSnapshot);
  const running = jobs.some(j => j.status === 'running' || j.status === 'qa');
  const queued = jobs.some(j => j.status === 'queued');
  const unseenDone = jobs.some(j => j.status === 'done' && !j.seen);
  const unseenErr = jobs.some(j => j.status === 'error' && !j.seen);
  const [cls, title] = running || queued ? ['bg-amber-400 animate-pulse shadow-[0_0_0_3px_rgba(251,191,36,0.35)]', '발표자료 만드는 중'] : unseenDone ? ['bg-green-400 animate-pulse shadow-[0_0_0_3px_rgba(74,222,128,0.35)]', '완성된 발표자료가 있어요'] : unseenErr ? ['bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.35)]', '오류가 난 작업이 있어요'] : ['bg-slate-300/70', '대기 중'];
  return <span title={title} className={`ml-auto flex items-center justify-center w-4 h-4 flex-shrink-0 ${className}`}><span className={`w-2 h-2 rounded-full transition-colors duration-500 ${cls}`} /></span>;
}
