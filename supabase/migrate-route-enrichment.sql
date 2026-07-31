-- ============================================================================
-- 寻迹 · 路线库字段对齐（幂等）
-- 用法：Supabase SQL Editor 粘贴运行；或由 service_role 管理流程执行
-- 对应 JSON：plain_explain / why_worth / category / season / panorama*
-- ============================================================================

alter table public.routes
  add column if not exists plain_explain text,
  add column if not exists why_worth text,
  add column if not exists category text,
  add column if not exists season text;

alter table public.points
  add column if not exists panorama text,
  add column if not exists panorama_source text,
  add column if not exists photo text,
  add column if not exists illustration text;

-- 校验
select
  column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('routes', 'points')
  and column_name in (
    'plain_explain','why_worth','category','season',
    'panorama','panorama_source','photo','illustration'
  )
order by table_name, column_name;
