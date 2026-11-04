# Qpresen Deck Engine

브리프 한 단락 → 발표 현장에서 바로 쓰는 **동적 HTML 슬라이드 통합본(단일 파일)**.
LLM은 "무엇을 어떤 구성으로"만 결정하고, 디자인·레이아웃·모션·플레이어는 결정론적 렌더러가 보장한다. 생성 결과는 자동 린트 + 사람 눈 검수 → 규칙으로 증류 → 다음 생성에 반영(자가 성장).

```
브리프 → ① plan(JSON) → ② fill(장별 병렬, JSON) → ③ render(결정론) → ④ lint/review → ⑤ fix → 단일파일 deck.html (+ parts/slide-NN.html, spec.json)
```

## 구조
```
docs/METHODOLOGY.md          방법론(아키타입 선택 규칙·리듬·디자인 규칙·검수 기준)
engine/renderer/             결정론적 렌더러 (Node/Deno 공용, 의존성 0)
  types.ts                   Deck Spec 타입(단일 진실 원천)
  theme.ts                   4테마 토큰(signature-white · editorial-navy · vivid-photo · dark-stage) + 다크 모드
  baseCss.ts / baseJs.ts     디자인 시스템 CSS, 슬라이드 런타임(스케일·리빌·카운터·타자·사이클·목업·파티클)
  archetypes.ts              25종 슬라이드 유형 렌더러
  charts.ts                  SVG 차트(bar/hbar/line/area/donut/stacked/pie) draw-in 모션
  icons.ts                   Lucide 아이콘 160종 + 별칭
  slide.ts / player.ts       장 문서 조립, 단일파일 플레이어(dock·목차·노트+타이머·도움말·해시·정적모드·테마)
  validate.ts                스펙 정규화·상한 적용(안전 강등)
engine/llm/                  LLM 파이프라인 (provider: Anthropic 네이티브 / OpenAI 호환=BizRouter)
  prompts.ts                 plan · fill · fix · review(비전) · distill 프롬프트 + 아키타입 카탈로그
  pipeline.ts                planDeck / fillSlides / buildSpec / fixSlide / reviewSlide / distillRules
engine/qa/lint.js            Playwright 렌더 린트(넘침·겹침·스테이지 이탈·글자크기·대비·밀도·깨진 이미지·JS 오류) + 콘택트시트 + 썸네일
engine/knowledge/            rules.json(증류된 규칙), feedback.jsonl(누적 피드백)
engine/cli.ts                spec.json → deck.html
engine/build.ts              brief.json → (LLM) → deck.html + 린트/수정 루프 (+ --review 비전 검수)
samples/                     쇼케이스 스펙(25종 유형 전부) / 테마 변형
supabase/functions/deck-engine  Edge Function (plan·fill·render·build·fix·feedback·rules·distill)
supabase/migrations/         deck_jobs · deck_feedback · deck_rules
frontend/DeckStudio.tsx      Qpresen(Readdy) 스튜디오 페이지
```

## 로컬 사용
```bash
npm install
npx tsx engine/cli.ts samples/showcase.json out/showcase          # 스펙 → 덱
node engine/qa/lint.js out/showcase --static --sheet --thumbs      # 린트 + 시트 + 썸네일
npx tsx engine/cli.ts samples/showcase.json out/showcase --thumbs  # 썸네일 포함 재조립

# LLM 포함 전체 빌드 (BizRouter)
LLM_KIND=openai LLM_BASE_URL=https://bizrouter.ai/api/v1 LLM_API_KEY=sk-br-... LLM_MODEL=anthropic/claude-sonnet-5 \
  npx tsx engine/build.ts samples/brief.lecture.json out/lecture --review
```

## 배포
1. `supabase/migrations/20261105_deck_engine_tables.sql` 적용
2. `scripts/sync-function.sh` 후 `supabase functions deploy deck-engine --no-verify-jwt` (또는 MCP deploy)
3. 시크릿: `BIZROUTER_API_KEY`(있음), 선택 `LLM_MODEL`, `LLM_FALLBACKS`, `DECK_FONT_URL`
4. 폰트: `engine/assets/PretendardVariable-ko-subset.woff2`를 Storage 공개 버킷 `deck-assets/`에 업로드(없으면 jsDelivr 전체 폰트로 대체)
5. 프런트: `frontend/DeckStudio.tsx`를 Readdy 프로젝트에 추가, 라우트 `/dashboard/slide-generator`에 연결

## 자가 성장 루프
- 생성 시 린트 결과(기술 눈), 비전 모델 리뷰(디자인 눈), 사용자 👍/👎·수정 코멘트(사람 눈)가 `deck_feedback`에 쌓인다.
- `action: distill`(관리자)이 피드백을 규칙으로 증류해 `deck_rules`에 넣고, 다음 plan/fill 프롬프트에 자동 삽입된다.
- `render` 스코프 규칙은 렌더러 개선 백로그(개발자용)로 쓴다.
