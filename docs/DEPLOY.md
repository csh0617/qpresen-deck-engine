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
### 방법 A — 원격 import (가벼움, 권장 · 현재 운영 방식)
배포된 함수의 `index.ts`는 **한 줄**이다:
```ts
import 'https://raw.githubusercontent.com/csh0617/qpresen-deck-engine/<entry-commit>/supabase/functions/deck-engine/index.remote.ts';
```
`index.remote.ts`는 엔진 파일들을 **커밋 SHA로 고정된** raw URL로 import 한다(불변 URL → 번들러 캐시로 옛 코드가 섞일 일이 없다).
릴리스 절차는 `bash scripts/release.sh "메시지"` 한 번: 엔진 커밋 → `index.remote.ts`를 그 SHA로 재생성·커밋 → push → 대시보드에 붙여넣을 한 줄을 출력.
대시보드(Edge Functions → deck-engine → Code)에서 그 한 줄로 바꾸고 **Deploy updates**.

비밀(Secrets): `DECK_LLM_API_KEY`(BizRouter 키, 우선) 또는 `BIZROUTER_API_KEY`. 선택: `LLM_MODEL`(기본 anthropic/claude-sonnet-5.5), `LLM_FALLBACKS`.

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

## 4. 프런트 (Readdy) — 완료 2026-11-05
Readdy 채팅에 `frontend/DeckStudio.tsx`를 첨부하고 `Readdy_지시문.txt`를 보내면 된다. 적용 결과(Version 2160):
- `src/pages/dashboard/deck-studio/page.tsx` (첨부본 그대로, import 경로만 `@/lib/supabase`)
- `src/router/config.tsx`에 `/dashboard/deck-studio` 라우트, 대시보드 사이드바에 'AI 슬라이드 스튜디오(신)' 메뉴
- 실제 qpresen.com 반영은 Readdy **Publish** 필요(미발행 버전들이 함께 나가므로 운영자가 결정).
- 스튜디오 미리보기(iframe srcdoc)에서는 `history.replaceState`가 금지되므로 플레이어는 해시 갱신 실패를 무시한다(엔진 b53437d+).

## 5. 운영 루프
- 주 1회 `{action:"distill"}` 호출(관리자) → 새 규칙 확인 후 부적절한 것은 `deck_rules.active=false`
- `render` 스코프 규칙은 렌더러 백로그 → 엔진 저장소에 반영 → 재배포

## 6. 프리미엄 모드 (2026-11-05)
- 함수 env(선택): `DECK_RICH_MODEL`(기본 `anthropic/claude-fable-5.1`), `DECK_PREMIUM_PLAN_MODEL`(기본 `anthropic/claude-opus-5.5`). 키는 그대로 `DECK_LLM_API_KEY`.
- 요청: `plan`에 `quality:'premium'`(brief에도 저장) → `fill`은 장 1개씩(rich) / 구조장 묶음, `mode:'standard'`면 템플릿 폴백. `fix`는 rich 장이면 `fixSlideRich`.
- 시간 한도: rich 1장 60~100초(함수 timeout 135초). 실패 시 스튜디오가 재시도 → 그래도 실패하면 `mode:'standard'`.
- 스튜디오 자동 검수: 결과 플레이어의 `QPDeck.lintAll()` → `fix(source:'lint', issues)` → `render(register:false)`.
- 프리미엄 2.0 액션: `plan`(+자료집, `dossier:false`로 끔) → `direct`(아트 디렉션, `imageBudget`) → `fill` → `render`(`maxImages` 기본 10) → `review`(`image` dataURL + `lint`) → `fix`(`source:'vision'|'lint'`). 함수가 GitHub에서 `engine/assets/libs.ts`(730KB: GSAP·Three·modern-screenshot)를 함께 받으므로 콜드 스타트가 1~2초 늘어난다.
- **프리미엄 2.1 (2026-11-05 저녁, 릴리스 `5a5514b` / 엔진 `eef92fe`)**: `direct`가 덱의 브랜드 그라데이션(`brandStops`)·강조색을 고르고 `plan.meta.stops/brand`로 저장(렌더 토큰 `--qg/--q1~3/--brand`). `review`는 `motion`(플레이어 `lintAll()` 결과의 `motion` 필드)을 받아 `dynamics` 축을 채점하고, 어두운(cine) 장은 의도된 다크 무대로 평가. 린트 코드 추가: `MOTION_LOW`·`TEXT_ON_PHOTO`·`CINE_BG_LIGHT`. 스튜디오(DeckStudio.tsx)는 검수 요청에 `motion`을 같이 보내고 디렉션 카드에 그라데이션 스와치를 그린다. 배포 절차는 동일(편집기 한 줄 → Deploy updates).
