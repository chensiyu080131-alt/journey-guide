-- ============================================================================
-- 寻迹 xunji · Supabase 免费层 schema（执行者按任务书 Task 1 产出）
-- 说明：本文件为「建表 + RLS」脚本。执行需 Supabase 项目 URL + anon/service key，
--       当前凭证未提供 → 执行与反向验证（403/201）待 PM 建项目后回流。
-- 设计要点：
--   * routes/points/cards/users 四张主表（任务书指定）
--   * 额外补 checkins 表：任务书 Task 4 要求「打卡记录必须存后端，不能只存 localStorage」
--   * 每张表均有 source 字段（human | ai），方便后期筛选数据来源（任务书建议）
--   * 坐标用 GCJ-02（高德坐标系），与前端高德 JS API 一致
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) routes 路线
-- ---------------------------------------------------------------------------
create table if not exists public.routes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  author      text,                       -- 汪曾祺
  city        text,                       -- 扬州
  book        text,                       -- 人间滋味
  summary     text,
  cover_image text,
  source      text not null default 'human' check (source in ('human','ai')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) points 点位（一条路线含多个点位）
-- ---------------------------------------------------------------------------
create table if not exists public.points (
  id                  uuid primary key default gen_random_uuid(),
  route_id           uuid not null references public.routes(id) on delete cascade,
  seq                 int,
  name               text not null,
  address            text,
  lng                double precision,     -- GCJ-02 经度
  lat                double precision,     -- GCJ-02 纬度
  excerpt            text,                 -- 汪曾祺原文摘录 ≤200 字
  excerpt_source     text,                 -- 出处：书名 + 篇名
  excerpt_confidence text not null default 'pending'
                        check (excerpt_confidence in ('verified','derived','pending')),
  interpretation     text,                 -- 现代解读 ≤100 字
  checkin_task       text,                 -- 打卡任务描述
  source             text not null default 'human' check (source in ('human','ai')),
  created_at         timestamptz not null default now()
);
create index if not exists idx_points_route on public.points(route_id);

-- ---------------------------------------------------------------------------
-- 3) cards 文学卡片（用户打卡后解锁）
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  point_id     uuid not null references public.points(id) on delete cascade,
  title        text,
  quote        text,                       -- 汪曾祺原文
  illustration text,                       -- 手绘插图（占位 url）
  photo        text,                       -- 地点照片（占位 url）
  template     text not null default 'default',
  source       text not null default 'human' check (source in ('human','ai')),
  created_at   timestamptz not null default now()
);
create index if not exists idx_cards_point on public.cards(point_id);

-- ---------------------------------------------------------------------------
-- 4) users 用户（Supabase Auth 关联）
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text,
  city       text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5) checkins 打卡记录（Task 4 必须存后端）
-- ---------------------------------------------------------------------------
create table if not exists public.checkins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  route_id   uuid references public.routes(id) on delete cascade,
  point_id   uuid references public.points(id) on delete cascade,
  lng        double precision,             -- 打卡时 GPS 经度
  lat        double precision,             -- 打卡时 GPS 纬度
  distance_m double precision,             -- 与点位距离（米），用于审计
  source     text not null default 'human' check (source in ('human','ai')),
  created_at timestamptz not null default now()
);
create index if not exists idx_checkins_user on public.checkins(user_id);

-- ===========================================================================
-- RLS：开启行级安全
--   公开只读：routes / points / cards（匿名可 SELECT，不可写）
--   打卡：匿名禁止写入（应得 403）；登录用户仅可写自己的记录，仅可读自己
--   users：仅本人可读写自己
-- ===========================================================================
alter table public.routes   enable row level security;
alter table public.points   enable row level security;
alter table public.cards    enable row level security;
alter table public.users    enable row level security;
alter table public.checkins enable row level security;

-- 公开读：routes / points / cards（匿名 SELECT = true）
drop policy if exists "public read routes" on public.routes;
create policy "public read routes" on public.routes for select using (true);

drop policy if exists "public read points" on public.points;
create policy "public read points" on public.points for select using (true);

drop policy if exists "public read cards" on public.cards;
create policy "public read cards" on public.cards for select using (true);

-- users：本人可读写
drop policy if exists "users read self" on public.users;
create policy "users read self" on public.users for select using (auth.uid() = id);
drop policy if exists "users upsert self" on public.users;
create policy "users upsert self" on public.users for insert with check (auth.uid() = id);
drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update using (auth.uid() = id);

-- checkins：登录用户写自己；读自己。匿名无任何策略 → 写入被拒（预期 403）
drop policy if exists "checkins insert self" on public.checkins;
create policy "checkins insert self" on public.checkins
  for insert with check (auth.uid() = user_id);
drop policy if exists "checkins read self" on public.checkins;
create policy "checkins read self" on public.checkins for select using (auth.uid() = user_id);

-- ===========================================================================
-- 反向验证（待 Supabase 凭证就位后执行，预期结果）
--   A) 匿名写打卡 → 应被 RLS 拒绝（HTTP 403 / 无策略匹配）
--      curl -X POST '<PROJECT_URL>/rest/v1/checkins' \
--        -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
--        -d '{"user_id":"00000000-0000-0000-0000-000000000000","point_id":"...","lng":119.4,"lat":32.39}'
--      → 期望 403 / {"code":"42501"}
--   B) 登录后写打卡 → 成功（HTTP 201）
--      （先用 supabase.auth.signInWithPassword / 微信登录拿到 token，再带 Authorization: Bearer <JWT>）
--      → 期望 201，返回新行
-- ===========================================================================
