# Qpresen Deck Engine — 인수인계 (2026-11-05)

## 1. 지금 무엇이 돌아가고 있나
| 구성 | 상태 | 위치 |
|---|---|---|
| 엔진 코드(렌더러·파이프라인·린트·문서) | GitHub `csh0617/qpresen-deck-engine` (main) | `engine/`, `docs/` |
| Supabase Edge Function `deck-engine` | 배포됨(원격 import, 커밋 SHA 고정) | 프로젝트 `rpnknnsplgomznlqlmlh` |
| DB | `deck_jobs`(작업), `deck_feedback`(피드백), `deck_rules`(규칙 13개: 시드 8 + 증류 5) | Supabase |
| 비밀키 | `DECK_LLM_API_KEY` = BizRouter(페어렌즈) — 표준: sonnet-5.5 / 프리미엄: fable-5.1(설계)+opus-5.5(플랜·구조장) / gpt-image-2(이미지) | Edge Function Secrets |
| 프런트 | Readdy Version 2160: `/dashboard/deck-studio` + 메뉴 'AI 슬라이드 스튜디오(신)' | **Publish 필요** |

## 2. 사용자 흐름 (스튜디오)
1. 브리프 입력(주제·목적·청중·시간·장수·자료 붙여넣기·추가 지시·**품질: 표준/프리미엄**·AI 이미지 on/off)
2. **덱 구조 설계** — 서사 구조(섹션)와 장별 유형 제안 (≈20초)
3. **슬라이드 작성 + 렌더** — 3장씩 병렬 작성(≈15초) → AI 이미지(표지·히어로 최대 4장, ≈15초) → 렌더·검증 → **내 자료에 자동 등록**
4. 미리보기에서 장별 👍/👎, "이 장 고치기"(자연어 수정 → 재렌더), 오프라인 HTML / Qpresen용 HTML 다운로드, 발표하기

실측(표준): 14장 특강 = 약 60초, 16장 IR = 약 70초. 비용은 덱당 수백 원 수준(BizRouter 과금 기준).
**프리미엄 2.0**(`docs/METHODOLOGY.md` §9~10): 자료집(자료 없을 때) → 플랜(opus) → **아트 디렉션**(fable: 덱 전용 CSS 레이어·섹션 색·사진 계획·시네마틱 섹션) → 장별 맞춤 설계(fable, 5 병렬) → 이미지(표지·히어로·콘텐츠 사진 최대 10장) → 렌더 → **검수 루프**: 레이아웃 린트 → 디자인 디렉터(비전) 리뷰 → 4점 미만 장 수정 → 재렌더 → 린트. 20장 ≈ 8~12분, 비용 ≈ 2~3만 원/덱(설계 장당 ₩450~1,000, 리뷰 장당 ₩120~160, 수정 장당 ₩400~700, 이미지 장당 ₩~100). 표준 모드는 레이아웃 린트 루프만.
스튜디오 상태 표시: "자료집+구조 설계 중" → "아트 디렉션 설계 중" → "프리미엄 설계 중 n/N" → "AI 이미지 생성+렌더링" → "레이아웃 검수 n/N" → "디자인 디렉터 검수 n/N · 평균 x점" → "디렉터 지시로 k장 수정 중" → "검수 완료 · 평균 x점 · k장 수정".

## 3. 자체 성장 루프 (사람 눈 → 규칙)
- 피드백은 자동으로 `deck_feedback`에 쌓인다: 사용자 👍/👎·코멘트, 수정 요청, 린트 이슈, 리뷰어 코멘트.
- 관리자가 `distill`을 실행하면(스튜디오에 버튼 추가 예정 · 지금은 함수 호출) 모델이 피드백을 **규칙**으로 환원해 `deck_rules`에 넣는다.
  - `plan`/`fill` 규칙 → 다음 생성부터 프롬프트에 자동 주입(즉시 효과)
  - `render` 규칙 → 렌더러 개선 백로그(개발자가 CSS/레이아웃에 반영 후 재배포)
- 권장 주기: 피드백 20건마다 1회. 규칙이 30개를 넘으면 weight 낮은 것부터 `active=false`.
- 검수 기록: `docs/METHODOLOGY.md` §7 (R1~R5, 사람 눈/기술 눈 → 규칙).

## 4. 엔진을 고쳐서 다시 배포하는 법 (개발자)
```
bash scripts/release.sh "변경 요약"      # 커밋 → index.remote.ts SHA 고정 → push → 한 줄 출력
```
출력된 `import '…/index.remote.ts';` 한 줄을 Supabase 대시보드(Edge Functions → deck-engine → Code)에 붙여넣고 **Deploy updates**.
로컬 검증: `npx tsx engine/cli.ts spec.json out/x --parts-embed && node engine/qa/lint.js out/x --static --sheet` → `out/x/sheet.static.jpg`로 사람 눈 검수.

## 5. 운영 체크리스트
- [ ] Readdy **Publish** (스튜디오 메뉴를 qpresen.com에 반영)
- [ ] 내 자료의 테스트 파일 정리("공무원을 위한 AI 활용 특강 3P"는 버그 재현용)
- [ ] 선택: Storage 공개 버킷 `deck-assets`에 `PretendardVariable-ko-subset.woff2` 업로드(현재는 jsDelivr 폰트 사용 — 정상 동작)
- [ ] 선택: 기존 'HTML 슬라이드 생성' 탭을 새 엔진으로 교체(지금은 별도 메뉴로 공존)

## 5-1. 프리미엄 2.1에서 달라진 운영 포인트
- 아트 디렉션 카드에 덱의 **브랜드 그라데이션 스와치**가 보인다(디렉터가 고른 3색). 보라(테마 기본)가 아니라 주제에 맞는 색이 나오는 것이 정상.
- 린트에 `MOTION_LOW`(정지 화면), `TEXT_ON_PHOTO`(사진 위 글자), `CINE_BG_LIGHT`가 추가됐다. 프리미엄 QA 루프가 이들을 수정 라운드로 보낸다.
- 검수 점수는 7축(style·dynamics 추가). 어두운(cine) 장은 의도된 다크 무대로 평가된다.
- 모션이 궁금하면 `node scripts/motion-strip.mjs <outdir> out.jpg --only=1,4` 로 등장 장면을 시간대별로 캡처할 수 있다.

## 5-2. 스튜디오 v3 (2026-11-06)
- 화면: 대시보드 안 '동적 슬라이드 생성'. 입력 후 **발표자료 만들기** 한 번 → 완성본이 내 자료에 저장. 진행 카드에 단계·경과 시간·예상 시간이 보인다.
- 참고자료 파일 업로드는 `pdfs/{uid}/deck-studio/refs/`에 올라가고 `extract-file-content`가 본문을 뽑는다(스캔 PDF 불가).
- 크레딧 차감은 아직 없다(가격 규칙 결정 필요 — `credit-operations` 함수에 연결하면 됨).
- v3.1(2026-11-06 오후): 작업 대기열 `frontend/deckJobs.ts`(React 밖 싱글톤) — 여러 건을 등록하면 순서대로 처리, 중지 버튼(AbortController → 직접 fetch 호출을 끊음; 이미 서버에 들어간 LLM 호출은 끝까지 돌지만 다음 단계는 시작하지 않음), 탭 이동해도 진행 유지, 검수는 deckJobs가 띄우는 숨김 iframe에서 수행, 목록은 localStorage `qp-deck-jobs`(새로고침 시 진행 중이던 작업은 '중단'으로 표시, 완료 작업은 `render register:false images:false`로 미리보기 재로드).
- v3.2(2026-11-06 저녁, Readdy Live 2170): 사이드바 '동적 슬라이드 생성' 점이 `frontend/DeckStatusDot.tsx`로 바뀜 — 만드는 중/대기 = 노랑 깜빡임, 완성 후 아직 안 봄 = 초록 깜빡임, 오류 미확인 = 빨강, 그 외 = 회색. 스튜디오 화면을 열면 `deckJobs.markAllSeen()`이 돌아 회색으로 돌아간다. '내 슬라이드' 메뉴와 페이지(`my-slides`)는 제거(저장된 파일·대시보드 목록은 그대로).
- 엔진 정밀 레이어(2.3, 함수 v11): 생성된 CSS의 `span/svg/i` 태그 선택자를 `:where(:not(엔진 부품))`로 자동 재작성, `.icon-circle/.ic-sq` 중앙 정렬 보호, 숫자 라벨 줄바꿈 자가 치유(`fixNumWrap`), `data-connect` 실측 연결선, `data-map` 실측 지도(한국 17개 시·도, 세계 176개국), 표지/간지 장면 9종을 덱 제목 해시로 다르게 조합, 정밀 린트 8종(`ICON_*`, `NUM_WRAP`, `CONNECTOR_OFF`). 상세는 `docs/METHODOLOGY.md` §12~§14.

## 6. 다음 품질 후보
1. 인터랙티브 장(슬라이더·토글 비교·라이브 데모 목업) — 레퍼런스 덱의 '만져보는' 요소
2. 히어로 이미지 품질 medium 옵션, 섹션 간지 이미지 자동 생성
3. 비전 리뷰(스크린샷 → 모델 평가) 자동 실행(현재는 로컬 `engine/build.ts --review`)
4. 스튜디오에 관리자용 '규칙 증류' 버튼과 규칙 관리 화면
