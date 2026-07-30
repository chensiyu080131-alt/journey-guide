-- ============================================================================
-- 寻迹 xunji · route enrichment 字段补充
-- 执行位置：Supabase Dashboard → SQL Editor → 粘贴本文件 → Run
-- 为什么不在 API/脚本里跑：DDL 需 elevated 权限；发布密钥(publishable)只能读不能写。
-- 作用：给 public.routes 补 4 个内容字段，使 seed 脚本能把 JSON 里的 enrichment 落库。
-- 幂等：add column if not exists，可重复执行不报错。
-- ============================================================================

alter table public.routes
  add column if not exists plain_explain text,   -- 一句白话解释：这是干什么的（区别于文学化 summary）
  add column if not exists why_worth     text,   -- 为什么值得去（行动理由）
  add column if not exists category      text,   -- scenic 经典名胜 / literary 文学名篇 / figure 人物行旅
  add column if not exists season        text;   -- spring / summer / autumn / winter

-- /routes 分类筛选常用，建索引加速（可选，无害）
create index if not exists idx_routes_category on public.routes(category);
create index if not exists idx_routes_season  on public.routes(season);

comment on column public.routes.plain_explain is '一句白话解释（区别于文学化 summary）';
comment on column public.routes.why_worth     is '为什么值得去';
comment on column public.routes.category      is 'scenic 经典名胜 / literary 文学名篇 / figure 人物行旅';
comment on column public.routes.season        is 'spring / summer / autumn / winter';
