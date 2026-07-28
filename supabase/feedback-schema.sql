-- ============================================================================
-- 寻迹 · 反馈回路 schema（用户评价 + 商家看板）
-- 执行方式：Supabase 控制台 → SQL Editor → 粘贴本文件 → Run（幂等，可重复跑）
-- 前置：已跑过 setup-once.sql（routes/points/cards/checkins 已存在）
-- 作用：新建 reviews / merchant_replies 表 + review-photos 存储桶 + RLS
--       + 匿名身份可读全部评价（C 端展示），写需 auth.uid()=user_id（同 checkins 模式）
-- 说明：Storage 桶创建若本脚本权限不足（service_role 才能写 storage.buckets），
--      请在控制台 → Storage → New bucket 手动建名为 review-photos 的 Public 桶，
--      策略脚本仍会尝试创建（on conflict 忽略），不影响其余表。
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) reviews 表：用户在某个点位打卡后提交的评价
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
create index if not exists reviews_user_idx    on public.reviews(user_id);

-- ---------------------------------------------------------------------------
-- 2) merchant_replies 表：商家对评价的一句话回复（Step2 商家看板用）
--    merchant_id 对应 db/literary-routes.json 的 merchants[].id
-- ---------------------------------------------------------------------------
create table if not exists public.merchant_replies (
  id         uuid        primary key default gen_random_uuid(),
  review_id  uuid        not null references public.reviews(id) on delete cascade,
  merchant_id text       not null,
  text       text        not null check (char_length(text) <= 100),
  created_at timestamptz not null default now()
);

create index if not exists merchant_replies_review_idx on public.merchant_replies(review_id);
create index if not exists merchant_replies_merchant_idx on public.merchant_replies(merchant_id);

-- ---------------------------------------------------------------------------
-- 3) RLS：评价是公开内容（C 端要展示），但写入必须属于登录用户
-- ---------------------------------------------------------------------------
alter table public.reviews          enable row level security;
alter table public.merchant_replies enable row level security;

drop policy if exists "reviews read all"  on public.reviews;
create policy "reviews read all"
  on public.reviews for select
  using (true);

drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "merchant_replies read all" on public.merchant_replies;
create policy "merchant_replies read all"
  on public.merchant_replies for select
  using (true);

-- ---------------------------------------------------------------------------
-- 4) Storage：review-photos 公共桶 + 读写策略（照片为公开展示内容）
--    注：storage.buckets  inserts 需要 service_role；若当前 key 无权，忽略并手动建桶。
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

drop policy if exists "review photos public read" on storage.objects;
create policy "review photos public read"
  on storage.objects for select
  using (bucket_id = 'review-photos');

drop policy if exists "review photos insert own" on storage.objects;
create policy "review photos insert own"
  on storage.objects for insert
  with check (bucket_id = 'review-photos' and auth.uid() is not null);
