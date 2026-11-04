-- Qpresen Deck Engine: jobs, feedback (human/lint/vision), rules (distilled knowledge)
create table if not exists public.deck_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'planning', -- planning | filling | rendering | done | failed
  brief jsonb not null,
  plan jsonb,
  spec jsonb,
  progress jsonb,
  file_id uuid,
  storage_path text,
  page_count int,
  lint jsonb,
  error text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists deck_jobs_user_idx on public.deck_jobs(user_id, created_at desc);

create table if not exists public.deck_feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.deck_jobs(id) on delete cascade,
  user_id uuid,
  slide_id text,
  slide_type text,
  source text not null default 'user', -- user | lint | vision | author
  rating int,
  comment text,
  data jsonb,
  distilled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists deck_feedback_job_idx on public.deck_feedback(job_id);

create table if not exists public.deck_rules (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('plan','fill','render','all')),
  text text not null,
  weight int not null default 1,
  active boolean not null default true,
  source text,
  evidence text,
  created_at timestamptz not null default now()
);

alter table public.deck_jobs enable row level security;
alter table public.deck_feedback enable row level security;
alter table public.deck_rules enable row level security;
do $$ begin create policy "deck_jobs_own" on public.deck_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "deck_feedback_own" on public.deck_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "deck_rules_read" on public.deck_rules for select using (true); exception when duplicate_object then null; end $$;

insert into public.deck_rules (scope, text, weight, source) values
 ('fill','카드(cards) 4장 이하일 때는 각 카드에 desc와 points 2개 이상을 채워 카드 안이 비지 않게 한다.',2,'human-review 2026-11-05'),
 ('plan','표(table)는 7행 이하, 비교(comparison)는 3열 이하로 계획한다. 더 많으면 두 장으로 나눈다.',2,'methodology'),
 ('fill','차트 시리즈는 2~3개까지만, 라벨은 8개 이하. 값은 숫자(number)로, 단위는 unit에 분리한다.',2,'methodology'),
 ('fill','bullets-visual의 visual은 내용과 맞는 kind를 고른다: 수치 1개=stat, 개념 4개=icons, 추세=chart, 현장=image.',1,'human-review 2026-11-05'),
 ('plan','agenda는 5개 이하 항목일 때 가장 보기 좋다. 섹션이 6개 이상이면 묶어서 5개로 요약한다.',1,'human-review 2026-11-05'),
 ('fill','timeline 항목은 6개 이하, 각 desc ≤ 30자. 현재 시점이 있으면 nowIndex를 지정한다.',1,'human-review 2026-11-05'),
 ('fill','matrix의 points는 라벨 ≤ 10자, 좌표는 5~95 범위. 같은 사분면에 점 3개 이상 몰지 않는다.',1,'human-review 2026-11-05'),
 ('fill','mockup steps는 type→reply→click→reply 흐름으로 4~6개, 각 text ≤ 90자. 마지막은 note로 핵심 메시지.',1,'human-review 2026-11-05');
