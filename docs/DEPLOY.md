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
- **프리미엄 2.1 (2026-11-05 저녁, 릴리스 `d4d1b65` / 엔진 `cfc84c3`)**: `direct`가 덱의 브랜드 그라데이션(`brandStops`)·강조색을 고르고 `plan.meta.stops/brand`로 저장(렌더 토큰 `--qg/--q1~3/--brand`). `review`는 `motion`(플레이어 `lintAll()` 결과의 `motion` 필드)을 받아 `dynamics` 축을 채점하고, 어두운(cine) 장은 의도된 다크 무대로 평가. 린트 코드 추가: `MOTION_LOW`·`TEXT_ON_PHOTO`·`CINE_BG_LIGHT`. 스튜디오(DeckStudio.tsx)는 검수 요청에 `motion`을 같이 보내고 디렉션 카드에 그라데이션 스와치를 그린다. 배포 절차는 동일(편집기 한 줄 → Deploy updates).
- **대형 덱(25장 초과) 플랜 분할 (2026-11-05 16:50)**: 50장 프리미엄 요청이 플랜 단계에서 150초 한도(504)에 걸린 뒤 추가. `plan`에 `phase` 파라미터: `dossier`(자료집만, jobId 생성) → `outline`(개요: 섹션·장 제목·유형·kind) → `detail`(`ids` 묶음의 sub/content_hints/visual_hint/signature, 병렬 가능). 스튜디오는 예상 장수 > 24면 이 순서로 호출(상세는 8장씩 3병렬), 그 이하는 기존 단일 요청. 실측(50장·opus): 자료집 50초 → 개요 41초 → 상세 7묶음 각 17초(총 40초). 504는 스튜디오에서 "엔진 응답 시간 초과 — 장수를 줄이거나 재시도" 메시지로 바뀐다.

## 7. 2026-11-06 릴리스 (프리미엄 2.2 + 스튜디오 v3)
- 엔진 릴리스 `0da2bad`(엔진 커밋 `b17626e`): 장치 라이브러리, 브라우저 번들에 `renderDeck`/`LINT_JS` export. 편집기 한 줄:
  `import 'https://raw.githubusercontent.com/csh0617/qpresen-deck-engine/0da2bad9e04f2ef841be285481094b44afbdd984/supabase/functions/deck-engine/index.remote.ts';`
- 스튜디오 v3는 `direct`/`review`/`plan phase` 액션을 쓰므로 **함수 배포가 먼저**, Readdy 퍼블리시가 그 다음.
- 2026-11-06 03:36 UTC 기준 라이브: deck-engine **v10** (= 릴리스 0da2bad), Readdy **Live Version 2168** (스튜디오 v3.1: 대기열·중지·탭 이동 유지; 2167 = v3 + 대시보드 레이아웃 + 다운로드/공유 수정). 배포 직후 `action:'models'` 호출로 부팅 확인(401 AUTH_REQUIRED = 핸들러 정상 도달).
- 대시보드 버그(엔진과 무관, Readdy 앱): 내 슬라이드/교육자료 저장이 스토리지 업로드를 생략해 다운로드 400 · 공유 페이지에 html 뷰어 분기 없음 → Readdy 지시문 v3(`outputs/Readdy_지시문_v3.txt`)로 수정 요청.

## 8. 2026-11-06 정밀 레이어 2.3 릴리스 (`362445d` / 엔진 `bca75d8`)
- 편집기 한 줄:
  `import 'https://raw.githubusercontent.com/csh0617/qpresen-deck-engine/362445d9bba771b95beef60e21857fd7ca51af8d/supabase/functions/deck-engine/index.remote.ts';`
- 함수가 GitHub에서 추가로 받는 모듈: `engine/renderer/scenes.ts`, `engine/assets/maps.ts`(140KB, Natural Earth kr/world), `engine/assets/libs.ts`(752KB, 장면 9종). 콜드 스타트 영향은 1초 안팎.
- 2026-11-06 09:20 UTC 기준 라이브: deck-engine **v11** (= 릴리스 362445d), Readdy **Live Version 2170** ('내 슬라이드' 메뉴·페이지 제거, 사이드바 `DeckStatusDot` 상태색).
- 배포 검증 절차(이번에 실제로 한 것): ① `action:'models'` 익명 호출 → 401 AUTH_REQUIRED(정적 import 전부 로드됨) ② 로그인 토큰으로 `action:'render'`에 `out/prec/spec.json`(연결선·지도 데모)을 `images:false, register:false`로 보내 2장 렌더(3.7초) → 반환 HTML에 `:where(:not(`·`QPMAPS`·`connectors()`·`fixNumWrap` 포함 확인 ③ 숨김 iframe에 띄워 `QPDeck.lintAll()`: 1장 연결선 path 4개·라벨 3개·`data-numfix` 2개, 로컬 빌드와 동일한 린트 결과 ④ 검증용 스토리지 파일(`{uid}/deck-engine/{ts}.html`)은 Storage API로 삭제. `register:false`라도 스토리지 업로드는 일어나므로 검증 뒤 지울 것.
