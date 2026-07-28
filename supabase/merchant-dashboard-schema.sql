-- ============================================================================
-- 寻迹 · 商家数据看板 schema（merchant_auth + merchant_stats RPC + 评价回复 + 种子）
-- 执行方式：Supabase 控制台 → SQL Editor → 粘贴本文件 → Run（幂等，可重复跑）
-- 前置：已跑过 supabase/setup-once.sql（routes/points/cards/checkins 已存在）
-- 作用：新建 merchant_auth 表 + merchant_stats 聚合函数(RPC) + merchant_replies 表
--       + RLS + 富春/冶春 两家试点商家密码（bcrypt 哈希，已用 bcryptjs 预计算）
-- 说明：本文件已合并 feedback-schema.sql 的 reviews/merchant_replies/存储桶建表，
--       故只需先跑 setup-once.sql，再跑本文件即可，无需额外跑 feedback-schema.sql。
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) reviews 表（用户评价，Step1 已定义；此处补建以保证本文件自包含）
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  route_id    uuid        not null references public.routes(id) on delete cascade,
  point_id    uuid        not null references public.points(id) on delete cascade,
  user_id     uuid        not null,
  rating      smallint    not null check (rating between 1 and 5),
  text        text,
  photo_url   text,
  created_at  timestamptz not null default now()
);
create index if not exists reviews_point_idx   on public.reviews(point_id);
create index if not exists reviews_route_idx   on public.reviews(route_id);
create index if not exists reviews_created_idx on public.reviews(created_at desc);

-- ---------------------------------------------------------------------------
-- 2) merchant_replies 表（商家对评价的一句话回复）
-- ---------------------------------------------------------------------------
create table if not exists public.merchant_replies (
  id         uuid        primary key default gen_random_uuid(),
  review_id  uuid        not null references public.reviews(id) on delete cascade,
  point_id   text        not null,
  text       text        not null check (char_length(text) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists merchant_replies_review_idx  on public.merchant_replies(review_id);
create index if not exists merchant_replies_point_idx  on public.merchant_replies(point_id);

-- ---------------------------------------------------------------------------
-- 3) merchant_auth 表（商家密码，bcrypt 哈希；point_id 即对应点位 uuid）
-- ---------------------------------------------------------------------------
create table if not exists public.merchant_auth (
  point_id      uuid primary key references public.points(id) on delete cascade,
  password_hash text not null
);

-- ---------------------------------------------------------------------------
-- 4) merchant_stats RPC：后端聚合「本周打卡/累计打卡/平均评分」
--    用 security definer 绕过 RLS（checkins 仅本人可读，但聚合需全量计数）
-- ---------------------------------------------------------------------------
create or replace function public.merchant_stats(p_point_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'weekCheckins', (
      select count(*) from public.checkins
      where point_id = p_point_id and created_at >= now() - interval '7 days'
    ),
    'totalCheckins', (
      select count(*) from public.checkins where point_id = p_point_id
    ),
    'avgRating', coalesce((
      select round(avg(rating)::numeric, 1) from public.reviews where point_id = p_point_id
    ), 0)
  );
$$;
grant execute on function public.merchant_stats(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------
alter table public.reviews          enable row level security;
alter table public.merchant_replies enable row level security;
alter table public.merchant_auth    enable row level security;

-- 评价：公开可读（C 端展示 + 商家看板读取本点位全部评价）；写需登录本人
drop policy if exists "reviews read all" on public.reviews;
create policy "reviews read all" on public.reviews for select using (true);
drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own" on public.reviews for insert with check (auth.uid() = user_id);

-- 商家回复：公开可读；匿名可写（前端已 gate 只能回复自己点位；真服务端校验需 Node API，见 BLOCKED）
drop policy if exists "merchant_replies read all" on public.merchant_replies;
create policy "merchant_replies read all" on public.merchant_replies for select using (true);
drop policy if exists "merchant_replies insert anon" on public.merchant_replies;
create policy "merchant_replies insert anon" on public.merchant_replies for insert with check (true);

-- 商家密码：公开可读哈希（浏览器取哈希做 bcrypt 比对，哈希本身安全）；禁止匿名写入（仅 PM/服务端可写）
drop policy if exists "merchant_auth read all" on public.merchant_auth;
create policy "merchant_auth read all" on public.merchant_auth for select using (true);

-- ---------------------------------------------------------------------------
-- 6) Storage：review-photos 公共桶（评价实拍图；feedback 阶段共用）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;
drop policy if exists "review photos public read" on storage.objects;
create policy "review photos public read" on storage.objects for select using (bucket_id = 'review-photos');
drop policy if exists "review photos insert own" on storage.objects;
create policy "review photos insert own" on storage.objects for insert with check (bucket_id = 'review-photos' and auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- 7) 种子：富春茶社 / 冶春茶社 试点商家密码（bcrypt 哈希，bcryptjs cost=10 预计算）
--    明文密码（试点用，正式上线前请更换）：
--      富春茶社（得胜桥总店）= fuchun2026
--      冶春茶社（御码头店）  = yechun2026
--    point_id 取自扬州路线 points：富春 seq=1 / 冶春 seq=2
-- ---------------------------------------------------------------------------
insert into public.merchant_auth (point_id, password_hash) values
  ('1a8ef7ac-bbc9-4ee9-89b4-b0d24f0747a6', '$2b$10$EagIwRasCZAwpMcG9UC/3uNGnNzEhFjvyZJylqV4GLgSuXV8wbdJC'),
  ('811d01d4-2c91-4ba1-9957-98cfb504f28b', '$2b$10$2DUPRlpeEPVXQfiHgPGTuOpP2HOc/4Z7txpeeQnc9mQV2yWy/TNL.')
on conflict (point_id) do update set password_hash = excluded.password_hash;
