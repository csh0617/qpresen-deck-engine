# 배포 가이드 — Qpresen Deck Engine

## 0. 준비물
- Supabase 프로젝트: `rpnknnsplgomznlqlmlh` (큐프리젠 사이트 개발)
- 시크릿: `BIZROUTER_API_KEY` (이미 있음). 선택: `LLM_MODEL`(기본 `anthropic/claude-sonnet-5`), `LLM_FALLBACKS`(예 `anthropic/claude-opus-5.5,anthropic/claude-haiku-5.5`), `LLM_KIND=anthropic`로 바꾸면 `ANTHROPIC_API_KEY` 사용
- (권장) GitHub 공개 저장소 `csh0617/qpresen-deck-engine` — Edge Function이 엔진 소스를 원격 import

## 1. DB
`supabase/migrations/20261105_deck_engine_tables.sql` 실행 (SQL Editor 또는 MCP apply_migration).
- `deck_jobs`(작업/플랜/스펙), `deck_feedback`(사람·린트·비전 피드백), `deck_rules`(증류된 규칙, 시드 8개)
- RLS: 본인 행만 접근, 규칙은 모두 읽기

## 2. 폰트(선택, 권장)
Storage 공개 버킷 `deck-assets` 생성 후 `engine/assets/PretendardVariable-ko-subset.woff2` 업로드 (493KB, KS X 1001 2,350자).
없으면 jsDelivr의 전체 Pretendard Variable(2MB)로 자동 대체 → 덱 파일이 2.5MB 커짐.

## 3. Edge Function `deck-engine`
### 방법 A — 원격 import (가벼움, 권장)
`supabase/functions/deck-engine/index.ts` 상단의 상대 import 4줄을 GitHub 주소로 바꾼다:
```ts
import { renderDeck } from 'https://cdn.jsdelivr.net/gh/csh0617/qpresen-deck-engine@<commit>/engine/renderer/index.ts';
import { validateSpec } from 'https://cdn.jsdelivr.net/gh/csh0617/qpresen-deck-engine@<commit>/engine/renderer/validate.ts';
import { planDeck, fillSlides, buildSpec, fixSlide, distillRules } from 'https://cdn.jsdelivr.net/gh/csh0617/qpresen-deck-engine@<commit>/engine/llm/pipeline.ts';
import { listModels } from 'https://cdn.jsdelivr.net/gh/csh0617/qpresen-deck-engine@<commit>/engine/llm/provider.ts';
```
그리고 `index.ts` 한 파일만 배포. 엔진을 고치면 커밋 SHA만 바꿔 재배포(15초).

### 방법 B — 동봉 배포
`scripts/sync-function.sh` → `supabase functions deploy deck-engine --no-verify-jwt` (16개 파일, 257KB)

### 호출 규약
```
POST /functions/v1/deck-engine   Authorization: Bearer <user JWT>
{ action: "plan",   brief }                  → { jobId, plan }
{ action: "fill",   jobId, ids: ["p01","p02","p03"] } → { slides, progress }
{ action: "render", jobId, register?: true } → { fileId, path, signedUrl, pageCount, titles, html, spec }
{ action: "build",  brief }                  → 위 셋을 한 번에 (≤ 12장 권장, 150s 제한)
{ action: "fix",    jobId, slideId, comment, issues? } → { slide }
{ action: "feedback", jobId, slideId, rating, comment } → { ok }
{ action: "rules" } / { action: "models" } / { action: "status", jobId } / { action: "distill" }
```
`render`는 Storage `pdfs/<uid>/deck-engine/<jobId>.html`에 저장하고 `pdf_files`에 `file_type='html'` 행을 만든다(register=false면 생략).
**주의**: Qpresen 뷰어가 업로드 HTML을 분할하는 방식과 100% 같은지 확인되기 전까지는, 프런트에서 `html`을 `File`로 만들어 **기존 업로드 경로**로 올리는 것이 가장 안전하다(DeckStudio의 download 함수 참고).

## 4. 프런트 (Readdy)
1. `frontend/DeckStudio.tsx`를 `src/pages/dashboard/slide-generator/` (또는 새 라우트 `/dashboard/deck-studio`)에 추가
2. `import { supabase } from '../lib/supabase'` 경로를 프로젝트에 맞게 수정
3. router/config.tsx에 라우트 등록, 대시보드 메뉴에 "AI 슬라이드 스튜디오" 링크 추가
4. (선택) 결과 `html`을 기존 HTML 업로드 핸들러에 `new File([html], name+'.html', {type:'text/html'})`로 넘기는 버튼 추가

Readdy AI에게 줄 지시문 예시:
> `frontend/DeckStudio.tsx` 파일을 그대로 추가하고 `/dashboard/slide-generator` 라우트를 이 컴포넌트로 교체해줘. supabase import 경로만 프로젝트 것으로 맞추고, 나머지 코드는 수정하지 마.

## 5. 운영 루프
- 주 1회 `{action:"distill"}` 호출(관리자) → 새 규칙 확인 후 부적절한 것은 `deck_rules.active=false`
- `render` 스코프 규칙은 렌더러 백로그 → 엔진 저장소에 반영 → 재배포
