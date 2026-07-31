-- ============================================================================
-- 寻迹 xunji · 一次性初始化脚本（建表 + RLS + 扬州汪曾祺路线数据）
-- 用法：Supabase 控制台 → SQL Editor → New query → 全文粘贴 → Run
-- 可重复执行（幂等）：重复跑不会产生脏数据
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) routes 路线
-- ---------------------------------------------------------------------------
create table if not exists public.routes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  author      text,
  city        text,
  book        text,
  summary     text,
  cover_image text,
  source      text not null default 'human' check (source in ('human','ai')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) points 点位
-- ---------------------------------------------------------------------------
create table if not exists public.points (
  id                  uuid primary key default gen_random_uuid(),
  route_id           uuid not null references public.routes(id) on delete cascade,
  seq                 int,
  name               text not null,
  address            text,
  lng                double precision,
  lat                double precision,
  excerpt            text,
  excerpt_source     text,
  excerpt_confidence text not null default 'pending'
                        check (excerpt_confidence in ('verified','derived','pending')),
  interpretation     text,
  checkin_task       text,
  source             text not null default 'human' check (source in ('human','ai')),
  created_at         timestamptz not null default now()
);
create index if not exists idx_points_route on public.points(route_id);

-- ---------------------------------------------------------------------------
-- 3) cards 文学卡片
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  point_id     uuid not null references public.points(id) on delete cascade,
  title        text,
  quote        text,
  illustration text,
  photo        text,
  template     text not null default 'default',
  source       text not null default 'human' check (source in ('human','ai')),
  created_at   timestamptz not null default now()
);
create index if not exists idx_cards_point on public.cards(point_id);

-- ---------------------------------------------------------------------------
-- 4) users 用户
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text,
  city       text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5) checkins 打卡记录
-- ---------------------------------------------------------------------------
create table if not exists public.checkins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  route_id   uuid references public.routes(id) on delete cascade,
  point_id   uuid references public.points(id) on delete cascade,
  lng        double precision,
  lat        double precision,
  distance_m double precision,
  source     text not null default 'human' check (source in ('human','ai')),
  created_at timestamptz not null default now()
);
create index if not exists idx_checkins_user on public.checkins(user_id);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.routes   enable row level security;
alter table public.points   enable row level security;
alter table public.cards    enable row level security;
alter table public.users    enable row level security;
alter table public.checkins enable row level security;

drop policy if exists "public read routes" on public.routes;
create policy "public read routes" on public.routes for select using (true);

drop policy if exists "public read points" on public.points;
create policy "public read points" on public.points for select using (true);

drop policy if exists "public read cards" on public.cards;
create policy "public read cards" on public.cards for select using (true);

drop policy if exists "users read self" on public.users;
create policy "users read self" on public.users for select using (auth.uid() = id);
drop policy if exists "users upsert self" on public.users;
create policy "users upsert self" on public.users for insert with check (auth.uid() = id);
drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update using (auth.uid() = id);

drop policy if exists "checkins insert self" on public.checkins;
create policy "checkins insert self" on public.checkins
  for insert with check (auth.uid() = user_id);
drop policy if exists "checkins read self" on public.checkins;
create policy "checkins read self" on public.checkins for select using (auth.uid() = user_id);

-- ===========================================================================
-- 数据灌入：扬州汪曾祺早茶路线（幂等：先清后插）
-- ===========================================================================
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'yangzhou-wangzengqi-zaocha',
  '汪曾祺的扬州早茶地图',
  '汪曾祺',
  '扬州',
  '人间滋味',
  '沿着汪曾祺笔下的烟火气，用一顿早茶的时间走完扬州：从富春的题字到冶春的清静，从锦春的细点到大麒麟阁的茶食，最后落在东关街的市声里。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, source = excluded.source;

-- 清掉旧点位（连带 cards 级联删除），保证幂等
delete from public.points
where route_id = (select id from public.routes where slug = 'yangzhou-wangzengqi-zaocha');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '富春茶社（得胜桥总店）', '扬州市广陵区得胜桥35号', 119.4142::float8, 32.3938::float8,
   '耳富春之名久矣，今得亲尝其菜点，乃平生一快。「富春茶点，天下第一。」',
   '汪曾祺 1986 年于扬州富春茶社题字（实据；多家报道转引）',
   'verified',
   '汪老一生讲究吃喝，1986 年讲学扬州时独爱富春，留下「天下第一」的题字——早茶，是扬州人「皮包水」的慢生活注脚。',
   '在富春点一客烫干丝或三丁包，拍下蒸笼照片，写下你最爱的那一口。'),
  (2, '冶春茶社（御码头店）', '扬州市广陵区丰乐上街8号（天宁寺西）', 119.4085::float8, 32.4018::float8,
   '一边喝茶，吃干丝，既消磨时间，也调动胃口。',
   '汪曾祺《干丝》（收录于《人间滋味》等文集）；此句为汪老写扬州早茶/干丝之通写，非冶春专属篇目',
   'derived',
   '冶春临水而筑，比富春清静。汪老写扬州茶馆「茶在其次，点是实质」，一处好茶社，喝的是慢与闲。',
   '在冶春临窗要一壶绿杨春，数一数窗外的船过了几条，记一句此刻的心境。'),
  (3, '锦春茶社', '扬州市广陵区国庆路（近文昌阁）', 119.4160::float8, 32.3955::float8,
   '包点是现做现蒸，总得等一些时候，一般上茶馆的大都要一个干丝。',
   '汪曾祺《干丝》（《人间滋味》）；关于扬州茶馆点心「现做现蒸」之通写，非锦春专属篇目',
   'derived',
   '锦春亦是扬州老茶社。汪老把上茶馆叫「吃早茶」——等的那点期盼，本身就是仪式。',
   '点一客千层油糕或翡翠烧卖，对比富春，说说哪家的细点更合你口味。'),
  (4, '大麒麟阁茶食店（东关街）', '扬州市广陵区东关街', 119.4218::float8, 32.3932::float8,
   '家常酒菜，就要愈家常愈好，不追求精细。',
   '汪曾祺《人间滋味·家常酒菜》（主题性引用；大麒麟阁为扬州东关街茶食老字号，汪文中未见其专属篇目）',
   'derived',
   '东关街上茶食飘香。汪老论吃讲究「家常」，一碟茶食配一壶茶，便是扬州最日常的甜。',
   '买一盒大麒麟阁茶食，挑最像「家常」的那味，拍给远方的朋友。'),
  (5, '东关街（历史文化街区）', '扬州市广陵区东关街', 119.4212::float8, 32.3952::float8,
   '上茶馆并不是专为吃茶，茶当然是要喝的，但主要是吃点心。',
   '汪曾祺《八千岁》《如意楼和得意楼》等写高邮东大街茶馆（注：汪老写的是故乡高邮「东大街」，此处作导览延伸，存在地名混淆风险，待考）',
   'pending',
   '东关街是扬州最热闹的老街。把汪老写的高邮茶馆烟火，挪到扬州东关街的市声里，也算一种隔空致意。',
   '沿东关街走到底，找一家最老的铺子，录一段 10 秒的街声作纪念。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'yangzhou-wangzengqi-zaocha';

-- 文学卡片：每个点位生成一张（quote = 原文摘录）
insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt, '', '', 'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'yangzhou-wangzengqi-zaocha';

-- 完成提示
select 'setup done' as status,
  (select count(*) from public.routes)   as routes,
  (select count(*) from public.points)   as points,
  (select count(*) from public.cards)    as cards;
