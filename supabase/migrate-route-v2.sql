-- ============================================================================
-- 寻迹 · 路线数据规范 V2 扩列（幂等）
-- 用法：Supabase SQL Editor 粘贴运行
-- JSON：duration / difficulty / related_books + points.guide 全字段
-- ============================================================================

alter table public.routes
  add column if not exists duration text,
  add column if not exists difficulty text,
  add column if not exists related_books jsonb;

alter table public.points
  add column if not exists baike_summary text,
  add column if not exists history text,
  add column if not exists cultural_status text,
  add column if not exists cultural_tag text,
  add column if not exists open_info text,
  add column if not exists transport text,
  add column if not exists nearby text,
  add column if not exists best_time text,
  add column if not exists scene_match text,
  add column if not exists pitfall_guide text,
  add column if not exists tips text,
  add column if not exists food_recommend text,
  add column if not exists photo_spots text,
  add column if not exists visit_duration text;

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('routes', 'points')
  and column_name in (
    'duration','difficulty','related_books',
    'baike_summary','history','cultural_status','cultural_tag',
    'open_info','transport','nearby','best_time','scene_match',
    'pitfall_guide','tips','food_recommend','photo_spots','visit_duration'
  )
order by table_name, column_name;
