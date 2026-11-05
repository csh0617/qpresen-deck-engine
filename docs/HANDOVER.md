# Qpresen Deck Engine — 인수인계 (2026-11-05)

## 1. 지금 무엇이 돌아가고 있나
| 구성 | 상태 | 위치 |
|---|---|---|
| 엔진 코드(렌더러·파이프라인·린트·문서) | GitHub `csh0617/qpresen-deck-engine` (main) | `engine/`, `docs/` |
| Supabase Edge Function `deck-engine` | 배포됨(원격 import, 커밋 SHA 고정) | 프로젝트 `rpnknnsplgomznlqlmlh` |
| DB | `deck_jobs`(작업), `deck_feedback`(피드백), `deck_rules`(규칙 13개: 시드 8 + 증류 5) | Supabase |
| 비밀키 | `DECK_LLM_API_KEY` = BizRouter(페어렌즈) — sonnet/opus/haiku 5.5 + gpt-image-2 사용 | Edge Function Secrets |
| 프런트 | Readdy Version 2160: `/dashboard/deck-studio` + 메뉴 'AI 슬라이드 스튜디오(신)' | **Publish 필요** |

## 2. 사용자 흐름 (스튜디오)
1. 브리프 입력(주제·목적·청중·시간·장수·자료 붙여넣기·추가 지시·AI 이미지 on/off)
2. **덱 구조 설계** — 서사 구조(섹션)와 장별 유형 제안 (≈20초)
3. **슬라이드 작성 + 렌더** — 3장씩 병렬 작성(≈15초) → AI 이미지(표지·히어로 최대 4장, ≈15초) → 렌더·검증 → **내 자료에 자동 등록**
4. 미리보기에서 장별 👍/👎, "이 장 고치기"(자연어 수정 → 재렌더), 오프라인 HTML / Qpresen용 HTML 다운로드, 발표하기

실측: 14장 특강 = 약 60초, 16장 IR = 약 70초. 비용은 덱당 수백 원 수준(BizRouter 과금 기준).

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

## 6. 다음 품질 후보
1. 인터랙티브 장(슬라이더·토글 비교·라이브 데모 목업) — 레퍼런스 덱의 '만져보는' 요소
2. 히어로 이미지 품질 medium 옵션, 섹션 간지 이미지 자동 생성
3. 비전 리뷰(스크린샷 → 모델 평가) 자동 실행(현재는 로컬 `engine/build.ts --review`)
4. 스튜디오에 관리자용 '규칙 증류' 버튼과 규칙 관리 화면
