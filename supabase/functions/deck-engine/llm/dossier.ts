/* Content dossier (premium/studio): when the brief carries little or no material, write a compact fact sheet first —
   facts, figures (with source and year, marked 추정 when uncertain), named examples, terms — so every slide designer
   works from the same concrete material instead of generalities. */
import { chat } from './provider.ts';
import type { Brief, PipelineOptions } from './pipeline.ts';

export const DOSSIER_SYSTEM = `당신은 발표 자료를 위한 리서치 에디터다. 브리프(주제·청중·목적)를 읽고, 장을 설계하는 사람들이 바로 쓸 수 있는 '자료집'을 한국어로 쓴다.
구성(총 3,000~5,000자, 마크다운 소제목):
1) 핵심 메시지 3개(한 줄씩) 2) 사실·수치 12~20개 — 각 항목: 수치, 단위, 기준연도, 출처 기관(공개된 사실만, 불확실하면 '약' 또는 '(추정)'), 한 줄 의미 3) 고유명사·사례 8~12개(기관·기업·제품·정책·사업명 + 한 줄 설명) 4) 비교·대조 포인트 3~5개(전/후, 국내/해외, 선택지) 5) 전문 용어 6~10개(짧은 풀이) 6) 청중이 물을 법한 질문 3개와 답.
규칙: 지어내지 않는다 — 모르는 수치는 범위나 정성 표현. 널리 알려진 공개 통계·공시·보도 수준의 사실만. 출처는 기관명+연도. 문장은 짧게. 마크다운만 출력.`;

export async function writeDossier(brief: Brief, opt: PipelineOptions): Promise<string> {
  const user = `주제/요청: ${brief.topic}\n목적: ${brief.purpose || ''} / 청중: ${brief.audience || ''} / 발표 시간: ${brief.durationMin || ''}분\n${brief.extra ? '추가 지시: ' + brief.extra + '\n' : ''}${brief.materials ? '[이미 있는 자료 — 보완만]\n' + brief.materials.slice(0, 4000) + '\n' : ''}\n위 브리프의 자료집을 작성하라.`;
  const r = await chat(opt.provider, { system: DOSSIER_SYSTEM, messages: [{ role: 'user', content: user }], maxTokens: 4500, temperature: 0.3, json: false });
  opt.log?.(`[dossier] ${r.model} ${r.ms}ms out=${r.usage?.output ?? '?'} cost=${r.usage?.cost ?? '?'}`);
  return r.text.trim();
}
