# Qpresen Deck Engine — 동적 HTML 슬라이드 생성 방법론 v1

> 목적: "브리프(주제·청중·목적·자료)"에서 **발표 현장에서 바로 쓰는 고품질 동적 HTML 슬라이드 통합본(단일 파일)** 을 재현 가능하게 만든다.
> 레퍼런스: `고창 AI강의 60장`, `Qpresen IR 20장`, `800조의 문법 60장` 세 덱을 분해해 공통 DNA를 추출하고, 거기에 자동 검수 루프를 더했다.

---

## 0. 한 줄 요약

**브리프 → ① 덱 플랜(JSON) → ② 슬라이드 스펙 채우기(JSON, 장별 병렬) → ③ 결정론적 렌더러(디자인 시스템·컴포넌트·모션 내장) → ④ 자동 검수(렌더 린트) → ⑤ 통합본 조립(플레이어 셸)**

LLM은 "무엇을 말할지와 어떤 구성으로 보여줄지"만 결정하고, "어떻게 보이는지"는 렌더러가 보장한다. 이것이 세 레퍼런스가 일관되게 좋아 보이는 이유(공통 base.css/base.js)이며, 모델 출력 편차를 디자인 품질에서 분리하는 핵심이다.

---

## 1. 레퍼런스 분해 결과 (공통 DNA)

| 층위 | 공통 패턴 |
|---|---|
| 캔버스 | 1920×1080 고정 스테이지, `--s` 스케일로 뷰포트에 맞춤(레터박스). 글자 크기가 해상도와 무관하게 동일 |
| 문서 구조 | 슬라이드 1장 = 독립 HTML 문서(자체 `<head>` 스타일·스크립트). 통합본은 셸 + 장별 문서를 JSON/템플릿으로 내장, iframe(srcdoc)으로 재생 |
| 디자인 토큰 | `:root` 변수(배경/잉크/뮤트/라인/카드/그림자/브랜드/의미색) + `[data-theme=dark]` 오버라이드. 필드색 스코프(`.f-brand`, `.f-teal`…)로 `--f` 한 변수만 바꿔 컴포넌트 색을 전환 |
| 헤더 | 아이브로우(섹션·번호) → H1(결론형 문장, `<em>` 강조 키워드 1개) → 부제(1문장) |
| 본문 컴포넌트 | card(tint/solid/glass/edge/dark), chip/pill/tag, kpi(count-up), bullets(아이콘), grid-2~6, tbl, callout/band, bar, num, icon-circle, 타임라인, 프로세스, 비교표, 차트(SVG/Chart.js), 커스텀 SVG 다이어그램, 앱 목업(타이핑·커서), 사진+핫스팟 |
| 푸터 | 브랜드 라인 · 진행 바 · 페이지 `01 / 20` · 출처 라인(※) |
| 모션 | `data-reveal`(up/left/right/scale/fade) + `data-delay`/자동 70ms 스태거, `data-count`(숫자), `data-draw`(SVG 선), `data-bar`, `data-type`(타자), `data-cycle`(단계 순환), 앰비언트(파티클·오브). 전체 리빌 ≤ 2.6s. `?static=1`이면 즉시 완성 화면 |
| 발표 보조 | 장별 노트(스크립트 + 권장 초), 타이머, 목차(썸네일 그리드), 도움말, 해시 내비(`#s07`), 전체화면, 검은 화면, 다크 테마, 키보드/스와이프 |
| 폰트 | Pretendard Variable 서브셋 woff2를 base64로 1회 내장(오프라인 재생) |

세 덱의 "성격" 차이는 **테마 + 밀도 + 비주얼 소스**로 설명된다.

| 덱 | 테마 | 밀도 | 주 비주얼 |
|---|---|---|---|
| IR 20장 | signature-white(브랜드 그라디언트, 글래스) | 높음(장당 3구역) | 커스텀 SVG, 기기 목업, KPI, 차트 |
| 800조 60장 | editorial-navy(여백, 네이비 잉크) | 낮음(장당 1~2구역) | 다이어그램, 라인차트, 매트릭스, 사진 히어로 |
| 고창 60장 | vivid-photo(사진 배경, 섹션별 색) | 중간 | 사진+KPI, 타임라인, 앱 목업, 핫스팟 |

---

## 2. 덱 플랜 알고리즘 (어떤 상황에 어떤 슬라이드를)

### 2.1 입력 정규화
- `purpose`: `lecture`(교육/특강) · `ir`(투자/사업) · `report`(보고/정책) · `seminar`(세미나/학술) · `proposal`(제안/기획) · `product`(제품 소개)
- `audience`: 전문성(초심자/실무자/전문가/의사결정자) · 규모 · 언어
- `duration`: 분 → 장수 가이드 = 분 × (lecture 1.0 / ir 0.8 / seminar 1.2 / report 0.9). 사용자가 장수를 지정하면 그 값 우선.
- `tone`: `formal` · `friendly` · `bold` · `academic`
- `theme`: 미지정 시 purpose로 결정 — lecture→vivid-photo, ir/product→signature-white, seminar/report→editorial-navy, keynote→dark-stage

### 2.2 서사 골격 (purpose별 기본 스토리라인)
- **lecture**: 표지 → 오늘의 지도(agenda) → 후킹 질문 → [섹션 n: 간지 → 현황(KPI/연표) → 개념(bullets-visual/diagram) → 사례(image/annotated/mockup) → 적용(cards/checklist)] × N → 안전/주의 → 정리(summary) → 마무리(closing)
- **ir**: 표지 → Executive summary(kpi-grid) → 문제(bullets-visual) → 인사이트/왜 지금(timeline/cards) → 솔루션(diagram) → 제품(cards/mockup × n) → 기술·IP → 트랙션(kpi) → 시장(chart+cards) → 경쟁(comparison/matrix) → BM(diagram) → 가격(pricing) → GTM(process) → 재무(chart+table) → 팀(team) → 투자 제안(closing)
- **seminar/report**: 표지 → 질문 3개(agenda) → 배경 숫자(kpi/chart) → [원리 설명(diagram) → 근거(chart/table) → 해석(quote/callout)] × N → 시사점(matrix/comparison) → 제안(process/checklist) → 질의응답(closing)
- **proposal**: 표지 → 배경·필요성(kpi/bullets) → 목표(big-number) → 추진 체계(diagram) → 세부 과제(cards) → 일정(timeline) → 예산(table/chart) → 기대효과(kpi) → 마무리

### 2.3 슬라이드 유형 선택 규칙 (콘텐츠 신호 → 아키타입)
| 콘텐츠 신호 | 선택 |
|---|---|
| 숫자 3~6개가 병렬 | `kpi-grid` |
| 숫자 1개가 핵심 메시지 | `big-number` |
| 시계열/추세/비중 데이터 | `chart` (추세=line/area, 비교=bar, 비중=donut, 구성=stacked) |
| 연도·날짜 순 사건 | `timeline` |
| 단계·절차·파이프라인 | `process` (3~6단계) |
| A vs B, 전/후, 장단점 | `comparison` (2~3열) |
| 2축 포지셔닝/리스크 | `matrix` |
| 구성요소·관계·구조 | `diagram` (flow/hub/layers/cycle/funnel) |
| 정의·개념 + 근거 비주얼 | `bullets-visual` |
| 병렬 개념 3~8개 | `cards` |
| 표로만 정확히 전달되는 수치 | `table` |
| 현장·사물·장소 | `image-hero` / `annotated-image` |
| 소프트웨어 사용법 | `mockup` (chat/browser/phone/dashboard) |
| 권위 있는 한 문장 | `quote` |
| 선택지·요금 | `pricing` |
| 사람 | `team` |
| 할 일·점검 | `checklist` |
| 섹션 전환 | `section` / 시작 `cover` / 끝 `closing` / 요약 `summary` |
| 위 어디에도 없음 + 꼭 필요한 특수 비주얼 | `custom` (제약 컨테이너 안의 HTML/SVG) |

### 2.4 리듬 규칙
1. 같은 아키타입 3연속 금지(연속 2까지). 밀도 높은 장(kpi/table/chart) 뒤에는 가벼운 장(quote/section/image-hero/big-number).
2. 섹션 간지는 5~12장마다. 섹션마다 필드색(accent)을 순환(brand→teal→amber→violet→rose→azure).
3. 한 장 = 한 메시지. 제목은 **결론형 문장**(≤ 28자, 강조어 1개 `<em>`), 부제는 근거 1문장(≤ 60자).
4. 본문 텍스트 총량: 카드 1개당 ≤ 45자 설명, 불릿 ≤ 5개, 표 ≤ 7행.
5. 숫자는 반드시 단위·기준연도·출처(`source`)를 동반. 출처 없는 수치는 "약/추정"을 붙인다.
6. 장마다 발표자 노트(`notes.s`, 80~200자 구어체)와 권장 시간(`notes.t`, 초)을 쓴다. 합계가 발표 시간의 90~110%가 되도록 플랜 단계에서 배분.

---

## 3. 디자인 시스템 규칙 (렌더러가 강제)

- **타이포 스케일(1920 기준)**: 메가 120 / 빅 64 / H1 54~58 / 카드 제목 26 / 부제 22~23 / 본문 19~21 / 보조 16~17 / 캡션 15. 15px 미만 금지. 한글 `word-break: keep-all`, `letter-spacing -0.02em`(제목).
- **여백**: 스테이지 패딩 상 66~116 / 좌우 88~96 / 하 92~104. 그리드 gap 22~28. 카드 패딩 28×30.
- **색**: 슬라이드당 강조색 1개(`--f`) + 의미색(ok/danger)만. 그라디언트는 브랜드 테마에서만 제목 `em`과 진행바에 사용.
- **표면**: 카드 반경 22~24, 그림자 2단(기본/강조). 글래스는 밝은 테마에서만.
- **초점 원칙**: 장마다 "히어로" 1개(숫자/차트/이미지/다이어그램). 히어로는 본문 폭의 40~60%.
- **아이콘**: Lucide 라인 아이콘(stroke 2) 인라인 SVG, 아이콘 서클(56/72) 안에 배치.
- **모션 예산**: 헤더 0~250ms, 본문 스태거 70~120ms, 히어로 draw/scale 600~1300ms, 합계 ≤ 2.6s. 반복 앰비언트(파티클/오브/펄스)는 장당 1종.
- **다크 테마**: 토큰만 바뀌고 레이아웃 동일. 이미지 위 텍스트는 항상 오버레이 스크림.

---

## 4. 자동 검수(렌더 린트) — "사람 기술 눈"의 기계화

Playwright로 모든 장을 1920×1080에서 렌더(`?static=1` 최종 프레임 + 모션 완료 프레임)하고 검사:

| 검사 | 기준 | 심각도 |
|---|---|---|
| 스테이지 밖 요소 | 보이는 요소 bbox가 스테이지를 벗어남 | 오류 |
| 넘침/잘림 | `scrollHeight > clientHeight`(허용 표시 없는 컨테이너), `scrollWidth > clientWidth`(텍스트 한 줄 잘림) | 오류 |
| 겹침 | 형제 카드/블록 bbox 교차 | 오류 |
| 최소 글자 | 계산된 font-size < 15px | 오류 |
| 대비 | 텍스트/배경 대비 < 4.5(본문) / 3(큰 글자) | 경고 |
| 밀도 | 본문 영역 점유율 < 40% 또는 > 95% | 경고 |
| 이미지 | 깨진 이미지, 비율 왜곡 | 오류 |
| 콘솔 오류 | JS 에러 | 오류 |
| 정적 모드 | 정적 프레임에 숨겨진 요소 없음(리빌 누락) | 오류 |

오류가 있으면 해당 장만 **수정 패스**(모델에게 린트 결과 + 스펙을 주고 스펙 수정)를 돌린다. 최대 2회. 그래도 실패하면 자동 축약 규칙(불릿 수 축소, 설명 글자수 축소, 열 수 축소)을 적용해 렌더러가 안전 레이아웃으로 강등한다.

**사람 눈 검수(디자인)** 는 콘택트 시트(모든 장 썸네일)로 한 번에 본다: 위계·균형·정렬·리듬·가독성·임팩트. 이 단계의 피드백은 "렌더러/프롬프트 규칙"으로 환원해 다음 생성에 반영한다(이 문서의 §2~§3이 그 누적 결과).

---

## 5. 파이프라인 계약

```
POST deck-engine { action: "plan",  brief, options }          → { plan }          (LLM 1회)
POST deck-engine { action: "fill",  plan, slideIds[] }          → { slides[] }      (LLM, 장별 병렬 호출)
POST deck-engine { action: "render", spec }                     → { html, parts[] } (LLM 없음, 결정론)
POST deck-engine { action: "lint",  spec }  (로컬/워커 전용)      → { report }
POST deck-engine { action: "build", brief }                      → { jobId }  → status 폴링 (plan→fill→render→save)
```

- `spec`(= plan + 채워진 slides)은 **덱의 단일 진실 원천**이다. 수정 요청("3장을 차트로", "더 간결하게")은 스펙을 고치고 다시 렌더하면 된다(바이브코드 편집의 기반).
- 출력물: ① 통합본 `deck.html`(오프라인 재생) ② 장별 `slide-NN.html` ③ `spec.json` ④ 썸네일(선택).

---

## 6. 품질 기준(Definition of Done)

1. 린트 오류 0, 경고 ≤ 장수×0.3
2. 모든 장에 노트·권장시간·(수치가 있으면) 출처
3. 표지·간지·요약·마무리 포함, 아키타입 다양성 ≥ 6종(12장 이상 덱)
4. 1920×1080과 1366×768(스케일) 모두에서 글자 깨짐 없음, 다크 테마 전환 정상
5. 단일 파일 ≤ 15MB(폰트 0.5MB + 장별 ≤ 150KB 권장, 이미지는 webp 임베드)

---

## 7. 검수 로그 (사람 눈 → 규칙으로 환원한 기록)

| 회차 | 발견(사람 눈/기술 눈) | 환원된 규칙·수정 |
|---|---|---|
| R1 | 캔버스 대비 콘텐츠가 작고 하단이 비는 장 다수(agenda/timeline/process/summary/layers) | 본문 컨테이너를 수직으로 채우거나 중앙 정렬, 기본 타이포 +8%, 카드 최소 높이 300 |
| R1 | 차트 시리즈 색이 섹션 강조색과 충돌(둘 다 teal) | 시리즈 팔레트에서 슬라이드 강조색 자동 회피(`avoid`) |
| R1 | 매트릭스 점 라벨이 평면 밖으로 넘침 | 라벨을 점 아래 배치, 가장자리(x>78/x<22/y<14)에서 방향 전환, 좌표 6~94 클램프 |
| R1 | 강조색(teal/amber) 위 흰 글자·강조색 텍스트 대비 2.6~3.0:1 | 텍스트/배경용 `--f-ink`(강조색 68% + 잉크 32%) 도입 → 4.5:1 이상 |
| R2 | 아이콘이 점선으로 깨짐(flow 다이어그램) | SVG 유틸 클래스 `.flow`가 컨테이너 클래스와 충돌 → `.flowline`으로 분리 (상속되는 stroke 속성은 전용 클래스로) |
| R2 | 표지 보조 비주얼 공백, 랜덤 색 블롭이 조잡 | 테마 변수 기반 네이비 '테크 아트'(오브·점격자·동심원·스트릭)로 교체, 이미지 없으면 자동 적용 |
| R2 | 4장 카드가 전체 높이로 늘어나 내부 60% 공백 | 카드는 자연 높이 + 행 중앙 정렬, 내용이 적으면 글자 키움. (fill 규칙 r001: 카드 ≤4면 desc+points 채우기) |
| R3 | 목차가 큰 빈 카드 4개 | ≤5개 항목은 '넘버 레일'(로마숫자 54px + 제목 30px + 시간 칩) 레이아웃 |
| R3 | 원형 프로세스·팀 카드가 작아 보임 | 원 176px·아이콘 76px·연결선, 팀 아바타 136px·최소 높이 400 |
| R3 | 플레이어에서 H/F 키가 슬라이드 iframe에 갇힘 | 슬라이드→부모 키 전달 규약에 h/f 추가 |
| 린트 | `color-mix()` 계산색을 대비 검사가 못 읽어 1:1로 오탐 | `color(srgb …)` 파서 추가; 사진 오버레이·장식 요소는 대비 검사 제외 |

### 다음 라운드 후보(backlog)
- 실제 썸네일을 Edge 경로에서도 생성(클라이언트 캡처 또는 워커)
- `image.prompt` → 이미지 생성 API 연동(현재는 테마 아트로 대체)
- 비전 리뷰(`reviewSlide`) 결과를 `fix` 패스에 자동 연결(현재는 로컬 build.ts에서만)
- 슬라이드 간 전환 효과 옵션(현재 크로스페이드)

## 8. Qpresen 연동 포맷 (검증 완료 2026-11-05)
Qpresen 대시보드는 업로드된 HTML을 **`<!-- slide-title: slide-NN -->` 구분자 + 완전한 HTML 문서 + `<!-- SLIDE BREAK -->`** 로 이어 붙인 파일로 인식해 장별로 분할·재생한다(플레이어 셸 불필요, `page_count`=문서 수, `first_slide`=1번 문서에서 `<style id="pretendard-embedded">` 내용을 비운 것). 각 문서는 `.stage` 루트 + `window.DECK={n,total}` + `<meta name="qp-standalone-part" content="1">`. 엔진은 `qpresenBundle(parts)`로 이 형식을 만들고(폰트는 CDN 링크, 장당 ~80KB), 오프라인용 단일파일 플레이어(`deck.html`, 폰트 내장)는 별도로 낸다. 실제 업로드 테스트: 27장 인식·재생·넘김 정상.
