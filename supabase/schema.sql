-- ============================================================
--  寻迹 MVP · Supabase schema
--  试点：扬州 + 汪曾祺《人间滋味》早茶地图
--
--  使用方式（PM 拿到 Supabase 项目后）：
--    1. 进入 Supabase Dashboard → SQL Editor → New query
--    2. 粘贴本文件全部内容 → Run
--    3. 再运行 supabase/seed-yangzhou.sql 灌入扬州早茶种子数据
--    4. 在本地跑 node scripts/supabase-seed-and-verify.mjs 做验收
--
--  设计要点：
--    - 4 张表：routes（路线）/ points（点位）/ cards（文学卡片）/ users（用户档案）
--    - 打卡记录单独建表 checkins（任务4 需要：打卡必须存后端，刷新不丢）
--    - RLS：匿名只读 routes/points/cards；checkins 仅登录本人可读写
--    - source 字段（任务1 建议）：标记数据来源 manual/AI，方便后期筛选
--    - 字段命名对齐前端 types/index.ts 的 Spot/Guide，方便任务3 直读
--    - 所有时间用 timestamptz（默认 now()）
-- ============================================================

-- 扩展（PostGIS 暂不引入，免费层虽支持但 MVP 用 numeric 经纬度 + JS 算距离即可，
-- 避免引入额外复杂度；后续做"附近点位查询"再开 PostGIS）。
-- create extension if not exists "postgis";

-- ============================================================
-- 1. routes —— 路线（一条路线 = 一个 Guide）
-- ============================================================
create table if not exists public.routes (
  id            text primary key,                       -- 与前端 Guide.id 对齐，如 'yangzhou-zaocha'
  title         text not null,                          -- 路线标题
  subtitle      text,                                   -- 副标题
  city          text not null,                          -- 城市，如 '扬州'
  province      text not null,                          -- 省份，如 '江苏'
  author        text,                                   -- 关联作家，如 '汪曾祺'
  book          text,                                   -- 关联书目，如 '《人间滋味》'
  days          int not null default 1,                 -- 建议天数
  intro         text,                                   -- 路线引言（routeIntro）
  cover_emoji   text default '🍵',                      -- 封面 emoji（替代图片，免版权）
  tags          text[] default '{}',                    -- 兴趣标签：文化/美食/自然/体验
  source        text not null default 'manual'          -- 数据来源：manual(人工录入) / ai(AI生成)
                check (source in ('manual','ai')),
  is_published  boolean not null default true,          -- 是否发布
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.routes is '寻迹路线表：一条文学旅行路线';

-- ============================================================
-- 2. points —— 点位（路线下的具体地点）
-- ============================================================
create table if not exists public.points (
  id              text primary key,                     -- 如 'yz-zc-1'
  route_id        text not null references public.routes(id) on delete cascade,
  seq             int not null default 0,               -- 路线内顺序
  name            text not null,                        -- 点位名，如 '富春茶社'
  desc            text,                                 -- 一句话描述
  type            text not null default '美食'           -- 景点/美食/体验
                  check (type in ('景点','美食','体验')),
  lat             numeric(9,6) not null,                -- 纬度
  lng             numeric(9,6) not null,                -- 经度
  address         text,                                 -- 详细地址
  original_text   text,                                 -- ★ 汪曾祺原文摘录（≤200字）
  original_source text,                                 -- ★ 出处：书名+篇名
  modern_note     text,                                 -- ★ 现代解读（≤100字，把原文翻译成到店体验）
  checkin_task    text,                                 -- ★ 打卡任务描述
  emoji           text default '📍',
  duration        text,                                 -- 建议停留
  budget_hint     text,                                 -- 预算提示
  flavor          text,                                 -- 酸/甜/苦/辣/咸（汪曾祺"五味"概念）
  source          text not null default 'manual'        -- manual / ai
                  check (source in ('manual','ai')),
  created_at      timestamptz not null default now(),
  unique (route_id, id)
);

comment on table public.points is '寻迹点位表：路线下的具体地点，含原文摘录与打卡任务';

create index if not exists idx_points_route on public.points(route_id);
create index if not exists idx_points_seq on public.points(route_id, seq);

-- ============================================================
-- 3. cards —— 文学卡片（打卡解锁）
-- ============================================================
create table if not exists public.cards (
  id              text primary key,                     -- 如 'card-yz-zc-1'
  point_id        text not null references public.points(id) on delete cascade,
  route_id        text not null references public.routes(id) on delete cascade,
  title           text not null,                        -- 卡片标题
  quote           text not null,                        -- 卡片上的金句（汪曾祺原文）
  quote_source    text not null,                        -- 金句出处
  illustration_emoji text default '🖼️',                -- 插画位（emoji 占位，设计出图后替换 URL）
  photo_hint      text,                                 -- 地点照片拍摄建议
  created_at      timestamptz not null default now(),
  unique (point_id)
);

comment on table public.cards is '寻迹文学卡片：打卡点位后解锁';

create index if not exists idx_cards_point on public.cards(point_id);
create index if not exists idx_cards_route on public.cards(route_id);

-- ============================================================
-- 4. users —— 用户档案（与 auth.users 1:1）
-- ============================================================
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

comment on table public.users is '寻迹用户档案表，与 Supabase auth.users 一对一';

-- ============================================================
-- 5. checkins —— 打卡记录（任务4 核心：必须存后端，刷新不丢）
-- ============================================================
create table if not exists public.checkins (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  point_id      text not null references public.points(id) on delete cascade,
  route_id      text not null references public.routes(id) on delete cascade,
  -- 打卡时的定位快照（用于事后审计 GPS 验证是否真的到过）
  checkin_lat   numeric(9,6),
  checkin_lng   numeric(9,6),
  distance_m    numeric(8,1),                           -- 打卡时距离点位的米数
  -- 客户端时间戳 + 服务端时间戳，防作弊用
  client_time   timestamptz,
  created_at    timestamptz not null default now(),
  unique (user_id, point_id)                            -- 同一用户同一点位只能打卡一次
);

comment on table public.checkins is '寻迹打卡记录：GPS 验证通过后写入，匿名写被 RLS 拒绝';

create index if not exists idx_checkins_user on public.checkins(user_id);
create index if not exists idx_checkins_route on public.checkins(route_id);

-- ============================================================
-- 触发器：新用户注册时自动建档案 + updated_at 自动维护
-- ============================================================

-- auth.users 新增 → public.users 自动建档案
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'name', '寻迹旅人'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- routes 的 updated_at 自动维护
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_routes_updated on public.routes;
create trigger trg_routes_updated
  before update on public.routes
  for each row execute function public.touch_updated_at();

-- ============================================================
-- RLS（Row Level Security）—— 任务1 验收的核心
-- ============================================================

-- 开启 RLS
alter table public.routes   enable row level security;
alter table public.points   enable row level security;
alter table public.cards    enable row level security;
alter table public.users    enable row level security;
alter table public.checkins enable row level security;

-- ---------- routes：匿名可读已发布，登录用户可读全部 ----------
drop policy if exists "routes_read" on public.routes;
create policy "routes_read" on public.routes
  for select to anon, authenticated
  using (is_published = true);

-- ---------- points：跟随 route 的可读性（已发布路线的点都能读） ----------
drop policy if exists "points_read" on public.points;
create policy "points_read" on public.points
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.routes r
      where r.id = points.route_id and r.is_published = true
    )
  );

-- ---------- cards：同 points ----------
drop policy if exists "cards_read" on public.cards;
create policy "cards_read" on public.cards
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.routes r
      where r.id = cards.route_id and r.is_published = true
    )
  );

-- ---------- users：仅本人可读自己的档案 ----------
drop policy if exists "users_read_self" on public.users;
create policy "users_read_self" on public.users
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- checkins：仅本人可读写自己的打卡记录 ----------
-- ★ 任务1 反向验证的关键：匿名(anon)没有任何 policy → 匿名 INSERT 必被拒（403）
drop policy if exists "checkins_read_self" on public.checkins;
create policy "checkins_read_self" on public.checkins
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "checkins_insert_self" on public.checkins;
create policy "checkins_insert_self" on public.checkins
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 注：checkins 不开放 update/delete（打卡不可篡改/撤销，保证数据真实性）。
-- 如需"取消打卡"功能，再单独加 policy 并做软删除。

-- ============================================================
-- 完成提示
-- ============================================================
-- 跑完后请运行 supabase/seed-yangzhou.sql 灌入扬州早茶种子数据。
-- 验收：node scripts/supabase-seed-and-verify.mjs
