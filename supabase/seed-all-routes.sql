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


-- ========== data seed ==========

-- ============================================================================
-- 寻迹 · 全量路线灌入（由 scripts 从 JSON 生成，幂等）
-- 用法：Supabase SQL Editor → 粘贴 → Run
-- 建议先跑：supabase/migrate-route-enrichment.sql
-- ============================================================================


-- ---------- changshu-shajiabang-jingju · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'changshu-shajiabang-jingju',
  '沙家浜芦苇荡 · 跟着京剧走常熟',
  '京剧《沙家浜》',
  '常熟',
  '京剧《沙家浜》',
  '从春来茶馆到芦苇荡，再到革命历史纪念馆：用半日时间走完京剧《沙家浜》写进常熟水乡的现场——戏里唱过的地方，脚下都能走到。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '一条可打卡的红色文学路线：5 个点位，对照京剧唱词与实地风景。',
    why_worth = '常熟文旅标杆线，适合 ToG 演示：原文（唱词）可核、坐标可导航、现场可打卡。',
    category = 'literary',
    season = 'autumn'
  where slug = 'changshu-shajiabang-jingju';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'changshu-shajiabang-jingju');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '春来茶馆', '常熟市沙家浜镇芦苇荡路188号（景区内）', 120.728::float8, 31.525::float8, '来的都是客，全凭嘴一张。相逢开口笑，过后不思量。', '京剧《沙家浜》·阿庆嫂唱段（通行剧本）', 'verified', '春来茶馆是阿庆嫂周旋敌伪的核心场景。如今按戏中格局还原，八仙桌、长条凳，喝茶也能对照唱词。', '在春来茶馆点一壶茶，拍一张八仙桌，抄一句阿庆嫂唱词发朋友圈。'),
  (2, '沙家浜芦苇荡', '常熟市沙家浜镇芦苇荡路188号', 120.735::float8, 31.522::float8, '芦花放，稻谷香，岸柳成行。', '京剧《沙家浜》·郭建光唱段（通行剧本）', 'verified', '芦苇荡是新四军伤员藏身的水上迷宫。秋天芦花飞雪时，和戏里唱的几乎同一幅画面。', '乘手摇船入芦苇水道，录 10 秒风声与桨声，对照「芦花放」那句。'),
  (3, '横泾老街', '常熟市沙家浜镇横泾老街一带', 120.73::float8, 31.526::float8, '朝霞映在阳澄湖上，芦花放稻谷香岸柳成行。', '京剧《沙家浜》·开场合唱（通行剧本）', 'verified', '横泾老街保留水乡街巷格局，也是影视取景地。石板路沿河，比周庄更安静。', '沿老街走一段石板路，拍白墙黛瓦倒影，记下你听到的一句乡音。'),
  (4, '沙家浜革命历史纪念馆', '常熟市沙家浜镇芦苇荡路188号', 120.729::float8, 31.524::float8, '要学那泰山顶上一青松，挺然屹立傲苍穹。', '京剧《沙家浜》·郭建光唱段（通行剧本）', 'verified', '纪念馆用实物与影像还原阳澄湖畔养伤、斗争的真实历史——三十六位伤病员的故事比戏更动人。', '在纪念馆找一件你最触动的展品，写下它与唱词之间的一句对照。'),
  (5, '阳澄湖畔（沙家浜段）', '常熟市沙家浜镇阳澄湖沿岸', 120.74::float8, 31.53::float8, '西风响，蟹脚痒。', '江南谚语（阳澄湖蟹季民谚；非京剧唱词，作地方风物延伸）', 'derived', '沙家浜在阳澄湖畔。蟹季到产地吃蟹，是戏外最鲜活的常熟风物——与红色叙事并列的烟火收束。', '在湖边拍一张开阔水面；若逢蟹季，记一笔你点的吃法（清蒸/蟹粉/蟹黄面）。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'changshu-shajiabang-jingju';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, '/images/route-cards/changshu-shajiabang-jingju-1.svg'), (2, '/images/route-cards/changshu-shajiabang-jingju-2.svg'), (3, '/images/route-cards/changshu-shajiabang-jingju-3.svg'), (4, '/images/route-cards/changshu-shajiabang-jingju-4.svg'), (5, '/images/route-cards/changshu-shajiabang-jingju-5.svg') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, '/images/route-cards/changshu-shajiabang-jingju-1.svg'), (2, '/images/route-cards/changshu-shajiabang-jingju-2.svg'), (3, '/images/route-cards/changshu-shajiabang-jingju-3.svg'), (4, '/images/route-cards/changshu-shajiabang-jingju-4.svg'), (5, '/images/route-cards/changshu-shajiabang-jingju-5.svg') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'changshu-shajiabang-jingju';


-- ---------- hangzhou-baidi-baijiuyi · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'hangzhou-baidi-baijiuyi',
  '白沙堤上 · 白居易的忆江南',
  '白居易',
  '杭州',
  '白居易《忆江南》《钱塘湖春行》',
  '他说“江南好”，便让一千多年的人都跟着忆。从断桥到孤山，走一段白乐天走过的白沙堤，看早莺新燕是否还认得旧人。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'figure',
    season = 'spring'
  where slug = 'hangzhou-baidi-baijiuyi';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'hangzhou-baidi-baijiuyi');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '白堤（白沙堤）', '杭州市西湖区西湖白堤', 120.144::float8, 30.252::float8, '最爱湖东行不足，绿杨阴里白沙堤。', '白居易《钱塘湖春行》，《全唐诗》卷四四六；末句“白沙堤”即今白堤一带', 'verified', '白居易在杭州刺史任上最爱湖东。他走的“白沙堤”虽非今人所传“白公堤”，但杭州人把这条堤记在了他的名下，一记千年。', '沿白堤从断桥走到孤山，拍一张绿杨与湖面的合影，数一数走过几座桥。'),
  (2, '断桥', '杭州市西湖区白堤东端', 120.146::float8, 30.258::float8, '几处早莺争暖树，谁家新燕啄春泥。', '白居易《钱塘湖春行》，《全唐诗》卷四四六；断桥为白堤起点，早莺新燕之景由此展开（引文实据；点位对应见解读）', 'verified', '断桥是白堤的起点，也是《白蛇传》相遇的地方。白居易看到的春意，与今天桥头的人潮，隔着一千二百年。', '在断桥拍一张残雪或春柳（依季节），想想为何“断桥不断”。'),
  (3, '孤山寺（广化寺故址）', '杭州市西湖区孤山', 120.144::float8, 30.254::float8, '孤山寺北贾亭西，水面初平云脚低。', '白居易《钱塘湖春行》，《全唐诗》卷四四六；起句即写孤山寺', 'verified', '孤山寺是白居易游湖的方位坐标。孤山不孤，是西湖里文人气最重的一座小山。', '在孤山找一处看湖的亭子，对照诗句找出“贾亭西”的大致方位。'),
  (4, '圣塘闸（湖滨）', '杭州市西湖区湖滨圣塘景区', 120.15::float8, 30.259::float8, '春来江水绿如蓝。', '白居易《忆江南·江南好》，《全唐诗》卷四五二；“江水绿如蓝”亦是西湖春水之色（引文实据；点位对应见解读）', 'verified', '湖滨是西湖的东岸，白居易写“春来江水绿如蓝”，那绿得发蓝的春水，在湖滨看得最满。', '在湖滨看一次西湖日落，拍下天光水色“绿如蓝”的那一刻。'),
  (5, '白苏二公祠（苏白二公祠）', '杭州市西湖区孤山南麓', 120.1445::float8, 30.2535::float8, '江南好，风景旧曾谙。日出江花红胜火，春来江水绿如蓝。能不忆江南？', '白居易《忆江南·江南好》，《全唐诗》卷四五二；祠合祀白居易、苏轼', 'verified', '杭州把白居易和苏轼合祀一祠，因为两人都治过西湖、都爱过西湖。“能不忆江南”——是白居易给杭州下的最重一句判词。', '在祠前读一遍《忆江南》，拍下匾额，写下你心中“忆”的某个江南瞬间。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'hangzhou-baidi-baijiuyi';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'hangzhou-baidi-baijiuyi';


-- ---------- hangzhou-gushan-linbu · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'hangzhou-gushan-linbu',
  '孤山放鹤 · 林逋的梅妻鹤子',
  '林逋',
  '杭州',
  '林逋《山园小梅》',
  '他隐居孤山二十年，以梅为妻、以鹤为子，写下“疏影横斜水清浅”的千古名句。走一趟孤山，看一位宋代文人如何把孤独活成诗意。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着林逋《山园小梅》诗里写到的梅花、水影、白鹤，去孤山走一段隐士的诗意居所。',
    why_worth = '林逋是宋代最纯粹的隐士，孤山是他的桃花源——这是一条走进梅妻鹤子传说的路线。',
    category = 'figure',
    season = 'winter'
  where slug = 'hangzhou-gushan-linbu';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'hangzhou-gushan-linbu');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '放鹤亭', '杭州市西湖区孤山北麓放鹤亭', 120.1445::float8, 30.2545::float8, '疏影横斜水清浅，暗香浮动月黄昏。', '林逋《山园小梅》，《全宋诗》卷一零六；放鹤亭为后人建', 'verified', '这是咏梅千古名句。放鹤亭是林逋梅妻鹤子传说的载体——亭下有他植的梅，亭前是他放鹤的湖。', '在放鹤亭前背一遍疏影横斜，找一枝最像诗里横斜姿态的梅枝拍下来。'),
  (2, '林逋墓（故址）', '杭州市西湖区孤山北麓', 120.1448::float8, 30.2542::float8, '霜禽欲下先偷眼，粉蝶如知合断魂。', '林逋《山园小梅》；林逋墓为其归葬地，《宋史·隐逸传》', 'verified', '林逋在此隐居二十年，死后亦葬于此。墓今已废，但孤山的梅与鹤仍记得他。', '在林逋墓故址静立片刻，想想一个人为何会选择这样的生活。'),
  (3, '孤山梅园', '杭州市西湖区孤山后山梅园', 120.145::float8, 30.2538::float8, '疏影横斜水清浅。', '林逋《山园小梅》；孤山梅花为杭州古老梅区', 'verified', '孤山的梅花因林逋而名。每年冬末春初，这里的梅开得最清冷——正是暗香浮动的样子。', '在梅园花期拍一张孤山梅，对比林逋诗里的疏影。'),
  (4, '西泠印社', '杭州市西湖区孤山路西泠印社', 120.1455::float8, 30.2535::float8, '暗香浮动月黄昏。', '林逋《山园小梅》；西泠印社建在林逋隐居地（引文实据；点位对应见解读）', 'verified', '西泠印社建在林逋隐居之地。文人篆刻与梅花清气一脉相承——孤山是杭州文气的根。', '在西泠印社看一方印章，感受孤山延续千年的文人气息。'),
  (5, '孤山-白堤连接处', '杭州市西湖区孤山东端接白堤', 120.146::float8, 30.255::float8, '幸有微吟可相狎，不须檀板共金樽。', '林逋《山园小梅》末联', 'verified', '孤山连着白堤，是林逋日常散步的路。山光水色之间，是他二十年不出的桃花源。', '从孤山走到白堤，拍一张山、水、堤同框的照片，体会隐士的日常。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'hangzhou-gushan-linbu';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'hangzhou-gushan-linbu';


-- ---------- hangzhou-lingyinsi-luobinwang · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'hangzhou-lingyinsi-luobinwang',
  '灵隐飞来峰 · 骆宾王的禅意山寺',
  '骆宾王',
  '杭州',
  '骆宾王《灵隐寺》诗',
  '飞来峰下的千年古刹，骆宾王遭贬路过此地，写下“楼观沧海日，门对浙江潮”的壮阔。循着诗里的禅意与山色，走一座杭州最深的文化名山。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着骆宾王《灵隐寺》诗里写到的飞来峰、冷泉、沧海水，去杭州灵隐寺走一遍禅意山路。',
    why_worth = '灵隐寺是杭州最古老的寺院，飞来峰的造像与冷泉是千年文人的打卡地——这是一条走进唐诗里禅意的路线。',
    category = 'scenic',
    season = 'autumn'
  where slug = 'hangzhou-lingyinsi-luobinwang';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'hangzhou-lingyinsi-luobinwang');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '灵隐寺（天王殿）', '杭州市西湖区灵隐路法云弄1号', 120.1::float8, 30.241::float8, '鹫岭郁岧峣，龙宫锁寂寥。', '骆宾王《灵隐寺》诗，《全唐诗》卷七十七（中华书局点校本）', 'verified', '骆宾王路过灵隐借宿于此，诗开篇即写山寺的高峻与幽静——这是他人生低谷时寻到的一片清净。', '在灵隐寺山门前抬头望飞来峰，拍一张山色的壮阔。'),
  (2, '飞来峰造像', '杭州市西湖区灵隐景区飞来峰', 120.0995::float8, 30.2408::float8, '楼观沧海日，门对浙江潮。', '骆宾王《灵隐寺》诗；飞来峰造像为五代至元代石窟，见《灵隐寺志》', 'verified', '飞来峰的石灰岩被雕成了一尊尊佛像。骆宾王看到的奇峰，今天仍奇，造像更添千年佛韵。', '在飞来峰下找一尊你最中意的造像，拍下来并查出它的朝代。'),
  (3, '冷泉亭', '杭州市西湖区灵隐寺前冷泉', 120.1002::float8, 30.2412::float8, '桂子月中落，天香云外飘。', '骆宾王《灵隐寺》诗；冷泉为灵隐名泉，白居易《冷泉亭记》亦写此', 'verified', '冷泉亭是灵隐最雅致的一角。白居易专门写过记，骆宾王的诗里也有它的影子——泉冷而意深。', '在冷泉边掬一捧水，感受那股清冽，记一句此刻的安静。'),
  (4, '北高峰', '杭州市西湖区北高峰', 120.098::float8, 30.245::float8, '霜薄花更发，冰轻叶未凋。', '骆宾王《灵隐寺》诗写山高察勘之意；北高峰为灵隐制高点（引文实据；点位对应见解读）', 'verified', '登北高峰可俯瞰灵隐与西湖。骆宾王诗里的壮阔气象，从这一望可见全貌。', '登北高峰远眺，拍一张灵隐寺全景，体会门对浙江潮的方位。'),
  (5, '韬光寺', '杭州市西湖区北高峰半山韬光寺', 120.0985::float8, 30.243::float8, '楼观沧海日，门对浙江潮。', '骆宾王《灵隐寺》（通行题名；一作宋之问）', 'verified', '韬光寺是灵隐后山制高点，观海亭看日出最佳。骆宾王“楼观沧海日”写的便是这种登高的壮阔。', '在韬光寺观海亭等一缕阳光，拍下观沧海日的同款视角。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'hangzhou-lingyinsi-luobinwang';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'hangzhou-lingyinsi-luobinwang';


-- ---------- hangzhou-longjing-sushi · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'hangzhou-longjing-sushi',
  '龙井茶山 · 苏轼的试焙新茶',
  '苏轼',
  '杭州',
  '苏轼《次韵曹辅寄壑源试焙新茶》',
  '春茶一杯，是苏轼在杭州最爱的闲适。循着茶香走进龙井村，看采茶、品新茶，走一段茶与诗的山路。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着苏轼写龙井茶的诗，去龙井村走一段采茶、品茶的山路，看一片叶子如何变成一杯宋代的雅事。',
    why_worth = '龙井茶天下闻名，苏轼在杭州爱茶成痴——这是一条用一杯茶走完的宋人闲适路线。',
    category = 'literary',
    season = 'spring'
  where slug = 'hangzhou-longjing-sushi';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'hangzhou-longjing-sushi');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '龙井村（茶文化村）', '杭州市西湖区龙井村', 120.116::float8, 30.218::float8, '仙山灵草湿行云，洗遍香肌粉未匀。', '苏轼《次韵曹辅寄壑源试焙新茶》，《全宋诗》卷八一七', 'verified', '苏轼写新茶如仙山灵草。龙井村是茶的原产地，春日采茶时节，整村都是苏轼笔下的清香。', '在龙井村看一次炒茶，闻一闻新茶的青香，记一句苏轼诗里的味道。'),
  (2, '龙井寺（老龙井）', '杭州市西湖区龙井寺', 120.1155::float8, 30.2185::float8, '明月来投玉川子，清风吹破武林春。', '苏轼《次韵曹辅寄壑源试焙新茶》；龙井寺为宋代购茶名坊', 'verified', '龙井寺有真正的龙井——一眼古泉。苏轼写茶，离不开这样的好水好山。', '在龙井寺看那口古井，拍下泉水的清澈，想想苏轼为何独爱这里的水。'),
  (3, '十八棵御茶', '杭州市西湖区龙井村狮峰山麓', 120.1148::float8, 30.219::float8, '戏作小诗君一笑，从来佳茗似佳人。', '苏轼《次韵曹辅寄壑源试焙新茶》末句；《西湖游览志》载狮峰茶事', 'verified', '苏轼把好茶比作佳人，是茶诗里最风流的比喻。狮峰山下的十八棵老茶树，传为乾隆钦封。', '在十八棵御茶前拍一张茶树照片，对比你日常喝的龙井是什么感觉。'),
  (4, '中国茶叶博物馆（龙井馆区）', '杭州市西湖区龙井路双峰村', 120.118::float8, 30.215::float8, '香食抹印如乳花。', '苏轼《次韵曹辅》句；茶叶博物馆讲述茶文化千年（引文实据；点位对应见解读）', 'verified', '苏轼写茶汤白沫如花。茶叶博物馆把一片叶子的前世今生讲得清清楚楚——诗里的雅，背后是千年手艺。', '在博物馆找一种你最想试的茶，记下它的产地和苏轼诗里的描述。'),
  (5, '九溪烟树', '杭州市西湖区九溪路', 120.109::float8, 30.208::float8, '水光潋滟晴方好。', '苏轼《饮湖上初晴后雨》；九溪为龙井茶山水系延伸', 'derived', '九溪烟树是龙井茶山的余脉。溪水、茶田、烟岚——苏轼在杭州的山居闲适，走的就是��种路。', '沿九溪走一段，录一段溪声，配一句苏轼写茶或写水的诗。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'hangzhou-longjing-sushi';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'hangzhou-longjing-sushi';


-- ---------- hangzhou-sudi-sushi · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'hangzhou-sudi-sushi',
  '苏堤春晓 · 苏轼的西湖',
  '苏轼',
  '杭州',
  '苏轼《饮湖上初晴后雨》《六月二十七日望湖楼醉书》',
  '他疏浚西湖筑起一条长堤，又把西湖写成了西子。沿着苏东坡的堤与诗，走一遍晴雨皆宜的湖山。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'figure',
    season = 'spring'
  where slug = 'hangzhou-sudi-sushi';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'hangzhou-sudi-sushi');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '苏堤（苏堤春晓）', '杭州市西湖区西湖苏堤', 120.1375::float8, 30.2426::float8, '欲把西湖比西子，淡妆浓抹总相宜。', '苏轼《饮湖上初晴后雨二首·其二》，《全宋诗》卷八一七；苏堤为苏轼知杭州时疏浚西湖所筑', 'verified', '苏轼任杭州知州时组织疏浚西湖，用淤泥筑成苏堤。他把西湖比作西施，晴也好雨也好——这条堤，是他留给杭州的实绩与情书。', '从苏堤南端走至北端（约2.8公里），拍下六桥之一与垂柳的合影。'),
  (2, '苏东坡纪念馆', '杭州市西湖区南山路2-1号（苏堤南入口）', 120.143::float8, 30.233::float8, '（苏轼知杭州，组织疏浚西湖、赈济百姓，事见《宋史·苏轼传》。）', '《宋史·苏轼传》（中华书局点校本）；纪念馆陈列其在杭政绩与诗文', 'verified', '苏轼两度在杭为官，治水、赈灾、吟诗。杭州人记他千年，不只记诗，更记那条堤和那口井。', '在馆内找一首苏轼写西湖的诗，抄在笔记本或备忘录里。'),
  (3, '望湖楼', '杭州市西湖区宝石山下（断桥东侧）', 120.141::float8, 30.258::float8, '黑云翻墨未遮山，白雨跳珠乱入船。卷地风来忽吹散，望湖楼下水如天。', '苏轼《六月二十七日望湖楼醉书》，《全宋诗》卷八一七；写于望湖楼上', 'verified', '苏轼在望湖楼醉酒，看一场西湖夏日暴雨来得急去得快。四句写尽云、雨、风、水——是宋诗里最利落的“快门”。', '在望湖楼凭栏望湖，等一场雨（或想象一场），拍下湖面天光的变化。'),
  (4, '孤山', '杭州市西湖区西湖孤山', 120.144::float8, 30.253::float8, '水光潋滟晴方好，山色空蒙雨亦奇。', '苏轼《饮湖上初晴后雨二首·其一》，《全宋诗》卷八一七', 'verified', '孤山是西湖的文眼，林逋梅妻鹤子、西泠印社都在此。苏轼笔下的“山色空蒙”，望的便是这一带湖山。', '在孤山找一处看湖的安静角落，拍一张晴或雨的湖山，配一句苏诗。'),
  (5, '大麦岭苏堤口', '杭州市西湖区苏堤北口近岳庙', 120.138::float8, 30.257::float8, '（苏轼在杭常游湖上诸寺，题诗多处，麦岭一带有其摩崖题名遗迹。）', '苏轼西湖题名摩崖（见《东坡题跋》及杭州地方志）；具体文字待核', 'derived', '苏堤北口连着通往灵隐的古道，苏轼游山常经此。他在湖山间留下的不只是诗，还有刻在石头上的题名。', '从苏堤北口走出，沿湖看一看远处的宝石山，拍一张山、湖、堤同框的照片。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'hangzhou-sudi-sushi';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, '/images/route-cards/hangzhou-sudi-sushi-1.svg'), (2, '/images/route-cards/hangzhou-sudi-sushi-2.svg'), (3, '/images/route-cards/hangzhou-sudi-sushi-3.svg'), (4, '/images/route-cards/hangzhou-sudi-sushi-4.svg'), (5, '/images/route-cards/hangzhou-sudi-sushi-5.svg') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, '/images/route-cards/hangzhou-sudi-sushi-1.svg'), (2, '/images/route-cards/hangzhou-sudi-sushi-2.svg'), (3, '/images/route-cards/hangzhou-sudi-sushi-3.svg'), (4, '/images/route-cards/hangzhou-sudi-sushi-4.svg'), (5, '/images/route-cards/hangzhou-sudi-sushi-5.svg') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'hangzhou-sudi-sushi';


-- ---------- nanjing-fuzimiao-shishuoxinyu · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'nanjing-fuzimiao-shishuoxinyu',
  '六朝烟水 · 《世说新语》里的建康',
  '刘义庆',
  '南京',
  '刘义庆《世说新语》',
  '魏晋的建康城，住着一群最会说话的人。从新亭对泣到乌衣巷口，循着《世说新语》的清言与风骨，走一段六朝旧都的烟水路。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'literary',
    season = 'spring'
  where slug = 'nanjing-fuzimiao-shishuoxinyu';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'nanjing-fuzimiao-shishuoxinyu');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '夫子庙·学宫（建康太学故地）', '南京市秦淮区夫子庙', 118.788::float8, 32.021::float8, '（六朝建康为南朝文化中心，国学、太学立于其地，名士多出其间。）', '《世说新语·文学》诸条及《建康实录》卷五至卷十；建康太学事见《宋书·礼志》', 'derived', '六朝的建康是南方的学术重心。《世说新语》里那些清谈名士，许多从这条秦淮河边的学宫与宅第走出。今日夫子庙，文脉不绝。', '在夫子庙学宫看一次展览，拍一张“明德堂”或贡院的牌匾，记一位你喜欢的六朝人物。'),
  (2, '乌衣巷', '南京市秦淮区乌衣巷', 118.787::float8, 32.02::float8, '过江诸人，每至美日，辄相邀新亭，藉卉饮宴。', '刘义庆《世说新语·言语》；“过江诸人”即南渡士族，王谢两家为乌衣巷望族。又刘禹锡《乌衣巷》：“旧时王谢堂前燕，飞入寻常百姓家”，《全唐诗》卷三六五', 'verified', '乌衣巷是东晋王导、谢安两族的居所，南渡士族聚居于此。《世说》里“过江诸人”的家国心事，与刘禹锡笔下的堂前燕，都在这条小巷里。', '在乌衣巷找王导谢安纪念馆，拍一张巷口的“乌衣巷”题字，背一句刘禹锡的诗。'),
  (3, '新亭（故址）', '南京市雨花台区新亭一带（近菊花台）', 118.768::float8, 32.0::float8, '过江诸人，每至美日，辄相邀新亭，藉卉饮宴。周侯中坐而叹曰：''风景不殊，正自有山河之异！''皆相视流泪。', '刘义庆《世说新语·言语》“新亭对泣”条（余嘉锡《世说新语笺疏》，中华书局）', 'verified', '新亭对泣是南渡士人的集体乡愁——风景还是那风景，山河已不是那山河。这是《世说》里最沉痛的一席话，也是六朝南人的精神原点。', '在新亭故址一带远眺，拍一张开阔的风景，写下“风景不殊”四字今日的体会。'),
  (4, '鸡鸣寺（同泰寺故址）', '南京市玄武区鸡鸣寺路1号', 118.795::float8, 32.06::float8, '（梁武帝舍身同泰寺，南朝佛法之盛甲于天下，与《世说》所记名士风仪同为六朝风物。）', '《梁书·武帝纪》记舍身同泰寺事；鸡鸣寺为同泰寺故址之延续，见《金陵梵刹志》', 'derived', '同泰寺是南朝四百八十寺之首。梁武帝四次舍身于此，《世说》时代的清谈之风，到梁代结出了佛寺与脂粉并盛的都城气象。', '登鸡鸣寺药师佛塔看一次玄武湖，拍下“南朝四百八十寺”的想象画面。'),
  (5, '台城（明城墙·玄武湖段）', '南京市玄武区台城（解放门至太平门段城墙）', 118.798::float8, 32.065::float8, '（六朝建康宫城即“台城”所在，历代屡毁屡建，为南朝政权核心。）', '《建康实录》卷六至卷二十；《世说新语》多记台城内外朝堂事；今存明城墙台城段为后人凭吊之地', 'derived', '台城是六朝宫城，“无情最是台城柳”写的便是这里。城墙下是玄武湖，湖那边是钟山——建康的格局，从台城一眼望尽。', '在台城墙上走一段，拍一张城墙、湖、山同框的照片，背一句韦庄《台城》。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'nanjing-fuzimiao-shishuoxinyu';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'nanjing-fuzimiao-shishuoxinyu';


-- ---------- nanjing-mochouhu-liangwudi · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'nanjing-mochouhu-liangwudi',
  '莫愁烟雨 · 梁武帝笔下的洛���女儿',
  '梁武帝（萧衍）/ 古乐府',
  '南京',
  '梁武帝《河中之水歌》（莫愁女传说）',
  '一个洛阳嫁到金陵的女子，被写进帝王的诗里，成了千年传说。莫愁湖的烟雨里，藏着南朝最温柔的民间记忆。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着《河中之水歌》里莫愁女的传说，去莫愁湖走一遍，看一个洛阳女儿如何在南京成了千年记忆。',
    why_worth = '莫愁湖是南京最柔美的湖，莫愁女的传说是它的灵魂——这是一条走进南朝民间记忆的路线。',
    category = 'literary',
    season = 'spring'
  where slug = 'nanjing-mochouhu-liangwudi';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'nanjing-mochouhu-liangwudi');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '莫愁湖公园（南门）', '南京市建邺区水西门大街132号莫愁湖公园', 118.738::float8, 32.038::float8, '河中之水向东流，洛阳女儿名莫愁。', '梁武帝萧衍《河中之水歌》，《乐府诗集》卷七十四', 'verified', '这首诗让莫愁女名传天下。河洛之水东流，洛阳的女儿嫁到了金陵——南朝最动人的迁徙故事。', '在莫愁湖公园门口读一遍《河中之水歌》开篇，想想一个女子为何叫莫愁。'),
  (2, '莫愁女故居（郁金堂）', '南京市建邺区莫愁湖公园内郁金堂', 118.7382::float8, 32.0382::float8, '十四嫁为卢家妇，莫愁心中有莫愁。', '梁武帝《河中之水歌》；郁金堂为后人建为莫愁女故居', 'verified', '郁金堂传说是莫愁女的居所。她嫁到卢家，富贵却愁苦——莫愁二字是反讽，也是祝愿。', '在郁金堂前看莫愁女塑像，拍一张她眺望湖面的背影。'),
  (3, '莫愁湖（湖心亭）', '南京市建邺区莫愁湖公园湖心', 118.7385::float8, 32.0385::float8, '水面初平云脚低。', '白居易《钱塘湖春行》句，其写湖山之意亦适莫愁湖', 'derived', '莫愁湖水波不兴，是南京城里最安静的一面镜子。春日云脚低的意境，白居易写过，这里也有。', '在湖心亭坐一刻，拍一张水面的倒影，想想莫愁此刻对你意味着什么。'),
  (4, '胜棋楼', '南京市建邺区莫愁湖公园胜棋楼', 118.7388::float8, 32.0388::float8, '南朝遗事多，莫愁湖畔。', '胜棋楼传为明代建筑，与莫愁女传说同为南京文化记忆', 'derived', '胜棋楼是明代朱元璋与徐达下棋的传说地。莫愁湖从南朝到明代，层层叠叠都是故事。', '在胜棋楼看一副棋盘，想想这湖里到底有多少朝代的故事。'),
  (5, '莫愁湖海棠专类园', '南京市建邺区莫愁湖公园海棠专类园', 118.739::float8, 32.039::float8, '春来江水绿如蓝。', '白居易《忆江南》句；莫愁湖海棠为春日名景', 'derived', '莫愁湖的海棠春天开成海。白居易写春来江水绿如蓝，莫愁湖的春就是这般颜色。', '春天来莫愁湖看海棠（3-4月），拍一张最像莫愁心情的花。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'nanjing-mochouhu-liangwudi';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'nanjing-mochouhu-liangwudi';


-- ---------- nanjing-qinhuaihe-zhuziqing · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'nanjing-qinhuaihe-zhuziqing',
  '桨声灯影里的秦淮河',
  '朱自清',
  '南京',
  '朱自清《桨声灯影里的秦淮河》',
  '1923 年夏夜，朱自清与俞平伯同泛秦淮，各写一篇同题散文。循着那夜的桨声灯影，从夫子庙到桃叶渡，走一段民国文人的秦淮河。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'literary',
    season = 'autumn'
  where slug = 'nanjing-qinhuaihe-zhuziqing';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'nanjing-qinhuaihe-zhuziqing');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '秦淮河画舫码头（夫子庙泮池）', '南京市秦淮区贡院街', 118.7896::float8, 32.0207::float8, '桨声灯影里的秦淮河。', '朱自清《桨声灯影里的秦淮河》，1923 年 8 月作，1924 年发表于《东方杂志》，收入散文集《踪迹》（开明书店1924）；篇名即此句', 'verified', '泮池码头是秦淮画舫的集中地。朱自清与俞平伯就是从这里上船，开始了那夜的水上夜游。篇名七个字，定下了整条河的调子。', '在码头看一次夜色秦淮，乘一段画舫，录下桨声或船马达声。'),
  (2, '夫子庙（南京夫子庙）', '南京市秦淮区夫子庙贡院西街', 118.788::float8, 32.021::float8, '（秦淮河畔夫子庙一带，为旧日南京最繁华处，朱自清文中所记两岸歌楼酒肆之所在。）', '朱自清《桨声灯影里的秦淮河》；两岸景象描写为文中主要段落（具体句待核）', 'derived', '夫子庙是秦淮河的心脏，文教与市井并置。朱自清那夜看到的灯火楼台，今天仍是南京最热闹的一段河。', '在夫子庙广场拍一张泮池照壁与魁星阁的夜景，找出文中“歌楼”的方向。'),
  (3, '钞库街（旧院故址）', '南京市秦淮区钞库街', 118.787::float8, 32.022::float8, '（明清旧院妓馆所在，朱自清文中所感慨的“艳迹”与“风月”旧事多指此一带。）', '朱自清《桨声灯影里的秦淮河》及俞平伯同题散文；旧院历史见《板桥杂记》', 'derived', '钞库街是明清秦淮旧院的地界，“桨声灯影”的浪漫与怅惘多源出于此。朱自清写的是民国残影，背后是更早的余怀《板桥杂记》。', '沿钞库街走一段，找一块旧迹说明牌，拍下并写下“艳迹”二字今日的意味。'),
  (4, '利涉桥（故址）', '南京市秦淮区利涉桥一带', 118.7915::float8, 32.022::float8, '这时我们已过了利涉桥，望见东关头了。沿路听见断续的歌声：有从沿河的妓楼飘来的，有从河上船里渡来的。', '朱自清《桨声灯影里的秦淮河》（1924；通行本）', 'verified', '利涉桥是朱自清秦淮夜游的关键节点——过桥望东关头，歌声与水声混成灯影里的密语。', '在利涉桥故址附近拍一张桥与河的关系图，对照文中水程。'),
  (5, '桃叶渡', '南京市秦淮区桃叶渡遗址公园', 118.7932::float8, 32.0245::float8, '（桃叶渡为东晋王献之送妾桃叶处，秦淮河古渡口，朱自清文中的历史余韵多与此类旧事相涉。）', '《隋书·经籍志》载桃叶歌；朱自清《桨声灯影里的秦淮河》历史感怀段落（具体句待核）', 'derived', '桃叶渡是秦淮最有名古渡，王献之在这里送别桃叶。朱自清那夜的怅惘，连着的是这条河上千年的离别。', '在桃叶渡看一次落日或夜色，拍下渡口，写一句你想送别的话。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'nanjing-qinhuaihe-zhuziqing';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-1.svg'), (2, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-2.svg'), (3, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-3.svg'), (4, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-4.svg'), (5, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-5.svg') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-1.svg'), (2, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-2.svg'), (3, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-3.svg'), (4, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-4.svg'), (5, '/images/route-cards/nanjing-qinhuaihe-zhuziqing-5.svg') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'nanjing-qinhuaihe-zhuziqing';


-- ---------- nanjing-yuejianglou-songlian · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'nanjing-yuejianglou-songlian',
  '阅江楼 · 宋濂笔下的帝王之楼',
  '宋濂',
  '南京',
  '宋濂《阅江楼记》',
  '朱元璋要在狮子山上建一座阅江楼，命文臣写记，宋濂拔得头筹。但楼六百年没建成，直到2001年——这是一篇记比楼先有名的地方。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着宋濂《阅江楼记》里写到的狮子山、大江、金陵形胜，去登一座先有文后有楼的名楼。',
    why_worth = '阅江楼是有记无楼六百年的奇观，宋濂的一篇文章让它名垂青史——这是一条走进帝王文章与江山形胜的路线。',
    category = 'scenic',
    season = 'autumn'
  where slug = 'nanjing-yuejianglou-songlian';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'nanjing-yuejianglou-songlian');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '阅江楼', '南京市鼓楼区建宁路202号狮子山巅', 118.752::float8, 32.095::float8, '登阅江之楼，仰观大江。', '宋濂《阅江楼记》，《宋学士全集》；阅江楼2001年建成', 'verified', '宋濂的《阅江楼记》让它名扬天下，但楼六百年都没建起来。如今登楼，大江仍在，文章的气象还在。', '登阅江楼顶层，找一找宋濂笔下金陵之形胜的方向，拍一张大江。'),
  (2, '狮子山（明城墙段）', '南京市鼓楼区狮子山明城墙', 118.7518::float8, 32.0948::float8, '金陵之形胜。', '宋濂《阅江楼记》写金陵山川形势；狮子山即古卢龙山', 'verified', '狮子山扼长江与金陵要冲。宋濂写金陵之形胜，指的就是这种山控大江的格局。', '在城墙上看长江的方向，体会形胜二字。'),
  (3, '仪凤门', '南京市鼓楼区仪凤门', 118.7515::float8, 32.0945::float8, '城门以望江。', '宋濂《阅江楼记》记金陵城门；仪凤门为明代城门', 'derived', '仪凤门是明城墙十三门之一，出此门即可望江。宋濂时代的文人就是从这里登狮子山的。', '穿过仪凤门，拍一张门洞框住的长江或山色。'),
  (4, '天妃宫（故址）', '南京市鼓楼区下关天妃宫故址', 118.7505::float8, 32.096::float8, '亦写民生之忘。', '宋濂《阅江楼记》记与阅江楼同期之建筑；天妃宫为明永乐帝建', 'derived', '天妃宫与阅江楼同时期规划。宋濂在记里劝帝王不要只看江山，也要顾念民生——这是文章的良心。', '在天妃宫故址附近，找一处能看到普通南京人生活的地方，拍一张。'),
  (5, '下关滨江风光带', '南京市鼓楼区下关滨江风光带', 118.749::float8, 32.098::float8, '江山如画。', '宋濂《阅江楼记》写大江东去之壮阔；下关滨江为观江胜地', 'verified', '下关滨江是看长江最开阔处。宋濂笔下大江东去的壮阔，在这里看得最满。', '在下关江边拍一张最开阔的长江，配一句宋濂写江山的句子。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'nanjing-yuejianglou-songlian';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'nanjing-yuejianglou-songlian';


-- ---------- suzhou-hanshansi-fengqiao · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'suzhou-hanshansi-fengqiao',
  '枫桥夜泊 · 寒山寺钟声',
  '张继',
  '苏州',
  '全唐诗·张继《枫桥夜泊》',
  '一首二十八字的小诗，让一座城外的寺院响了千年。从枫桥到寒山寺，沿着张继那夜的愁眠与钟声，走一段姑苏城外的水路。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'literary',
    season = 'autumn'
  where slug = 'suzhou-hanshansi-fengqiao';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'suzhou-hanshansi-fengqiao');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '江村桥（枫桥）', '苏州市姑苏区枫桥路', 120.7478::float8, 31.3125::float8, '月落乌啼霜满天，江枫渔火对愁眠。', '张继《枫桥夜泊》，《全唐诗》卷二四二（中华书局点校本）；此为前两句，写枫桥夜泊所见所闻', 'verified', '枫桥实指江村桥与枫桥两桥一带。诗人夜泊于此，月落、乌啼、霜天、渔火，是孤舟客子最清冷的一夜。', '在江村桥上拍一张夜色或黄昏的河面，数一数能看到几盏渔火般的灯。'),
  (2, '寒山寺', '苏州市姑苏区寒山寺弄24号', 120.7524::float8, 31.3112::float8, '姑苏城外寒山寺，夜半钟声到客船。', '张继《枫桥夜泊》，《全唐诗》卷二四二；此为后两句，寺因诗名', 'verified', '寒山寺本在城外，因这首诗的钟声成为千古名刹。夜半钟声越水而来，落到一叶客船上——这是唐诗里最经典的“声音画面”。', '进寒山寺听一次钟（可撞钟祈福），录下钟声 10 秒，配一句此刻的心情。'),
  (3, '铁铃关', '苏州市姑苏区枫桥东堍', 120.5675::float8, 31.3088::float8, '月落乌啼霜满天。', '张继《枫桥夜泊》首句；铁铃关为明代抗倭关城，紧依枫桥，登关可俯瞰诗人当年泊舟的水道（引文实据；点位对应见解读）', 'verified', '铁铃关是枫桥的制高点。当年张继若是抬头，看见的“月落”与今天登关所见，是同一片姑苏夜空。', '登铁铃关，拍一张俯瞰枫桥与古运河的照片，找出诗中“江枫”的位置。'),
  (4, '枫桥古镇', '苏州市姑苏区枫桥大街', 120.565::float8, 31.31::float8, '江枫渔火对愁眠。', '张继《枫桥夜泊》第二句；古镇即当年渔火人家所在（引文实据；点位对应见解读）', 'verified', '古镇沿河而建，是诗中“渔火”的来处。灯影里的水乡夜市，一千二百年来换了人间，没换的是水声。', '在古镇找一家临河茶馆，要一壶碧螺春，拍一张河面倒影。'),
  (5, '古运河（枫桥段）', '苏州市姑苏区枫桥至江村桥段运河', 120.566::float8, 31.3095::float8, '夜半钟声到客船。', '张继《枫桥夜泊》末句；客船即泊于这段运河之上', 'verified', '这段运河是江南运河的一部分，张继的客船就泊在这里。钟声沿水面传来，比陆上更远更清——古人择水路夜泊，听的就是这一声。', '沿运河步道走一段，录一段水声，想想那夜诗人为何“愁眠”。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'suzhou-hanshansi-fengqiao';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, '/images/route-cards/suzhou-hanshansi-fengqiao-1.svg'), (2, '/images/route-cards/suzhou-hanshansi-fengqiao-2.svg'), (3, '/images/route-cards/suzhou-hanshansi-fengqiao-3.svg'), (4, '/images/route-cards/suzhou-hanshansi-fengqiao-4.svg'), (5, '/images/route-cards/suzhou-hanshansi-fengqiao-5.svg') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, '/images/route-cards/suzhou-hanshansi-fengqiao-1.svg'), (2, '/images/route-cards/suzhou-hanshansi-fengqiao-2.svg'), (3, '/images/route-cards/suzhou-hanshansi-fengqiao-3.svg'), (4, '/images/route-cards/suzhou-hanshansi-fengqiao-4.svg'), (5, '/images/route-cards/suzhou-hanshansi-fengqiao-5.svg') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'suzhou-hanshansi-fengqiao';


-- ---------- suzhou-huqiu-sushi · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'suzhou-huqiu-sushi',
  '虎丘剑池 · 苏东坡的苏州第一憾事',
  '苏轼 / 袁宏道',
  '苏州',
  '苏轼“到苏州不游虎丘乃憾事也” + 袁宏道《虎丘记》',
  '苏东坡说“到苏州不游虎丘，乃憾事也”。袁宏道写下中秋虎丘的笙歌与斗歌。一座小山，藏着吴王阖闾的剑与文人千年的唱和。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着苏轼和袁宏道写虎丘的文字，去这座吴中第一名胜走一遍，看剑池、听曲、登云岩寺塔。',
    why_worth = '虎丘是苏州的地标，苏轼一句话让它成了必游——这是一条走进吴中第一山的文学路线。',
    category = 'scenic',
    season = 'autumn'
  where slug = 'suzhou-huqiu-sushi';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'suzhou-huqiu-sushi');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '虎丘景区（断梁殿）', '苏州市姑苏区虎丘山风景名胜区', 120.572::float8, 31.322::float8, '到苏州不游虎丘，乃憾事也。', '苏轼语，见《苏州府志·虎丘山》引；为虎丘名片之始', 'verified', '苏轼这句话，让虎丘成了苏州必游。进门便是断梁殿，奇巧的木构是千年工匠的心血。', '在虎丘门口拍一张到苏州不游虎丘乃憾事也的题刻，想想你的憾事是什么。'),
  (2, '剑池', '苏州市姑苏区虎丘景区剑池', 120.5722::float8, 31.3222::float8, '剑池幽雅，传阖闾葬此。', '袁宏道《虎丘记》；传说吴王阖闾葬于此，三千剑为殉', 'verified', '剑池是虎丘最神秘处。袁宏道写它深不可测，传说吴王阖闾葬于此，以三千宝剑为殉。', '在剑池旁探头看那汪幽绿的深水，数一数崖壁上有几处古人题刻。'),
  (3, '云岩寺塔（虎丘塔）', '苏州市姑苏区虎丘山云岩寺塔', 120.5725::float8, 31.3225::float8, '塔开如海鸥，鸣锅敦人醉。', '袁宏道《虎丘记》写中秋夜虎丘歌塔之盛；虎丘塔为五代古塔', 'verified', '虎丘塔是苏州最古老的塔，向东北倾斜。袁宏道时代的中秋夜，这里笙歌彻旦。', '绕虎丘塔一圈，找出它倾斜的方向，拍下这座千年斜塔。'),
  (4, '千人石', '苏州市姑苏区虎丘景区千人石', 120.5723::float8, 31.3224::float8, '每至中秋，虎丘之夜，箫橄榄如林，歌者千人。', '袁宏道《虎丘记》，写中秋夜千人石上斗歌之盛', 'verified', '千人石是一片巨大的磐石。袁宏道笔下的中秋夜，苏州人在此斗歌至天明——明代最浪漫的群众音乐会。', '坐在千人石上，想象四百年前这里千人和歌的场面，录一段此刻的环境音。'),
  (5, '虎丘后山茶园', '苏州市姑苏区虎丘后山', 120.572::float8, 31.3228::float8, '虎丘茶，为苏州贵重之物。', '《苏州府志》载虎丘茶；虎丘花茶为清代贡茶', 'derived', '虎丘后山产茶，自宋以来即为名品。苏轼爱茶，若到虎丘必不会错过这一杯。', '在后山找一片茶田，拍下虎丘茶的叶子，对比龙井看看有何不同。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'suzhou-huqiu-sushi';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'suzhou-huqiu-sushi';


-- ---------- suzhou-pingjiang-fushengliuji · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'suzhou-pingjiang-fushengliuji',
  '平江路烟火 · 沈复的浮生六记',
  '沈复',
  '苏州',
  '沈复《浮生六记》',
  '一对普通夫妻的市井日常，被沈复写成最动人的散文。沿着平江路的水巷与老铺，走一段乾隆年间苏州人的烟火人生。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着沈复《浮生六记》里写到的水巷、园林、市井日常，去平江路走一段苏州人的真实生活。',
    why_worth = '《浮生六记》是中国文学最温柔的夫妻絮语，平江路是它最真实的舞台——这是一条走进市井烟火的路线。',
    category = 'figure',
    season = 'spring'
  where slug = 'suzhou-pingjiang-fushengliuji';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'suzhou-pingjiang-fushengliuji');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '平江路（历史街区入口）', '苏州市姑苏区平江路', 120.632::float8, 31.316::float8, '君尝闻吴人语，不薄脂粉骨。', '沈复《浮生六记·闺情记快》；平江路为苏州古街名片', 'verified', '沈复写芸娘，写的是日常的诗意。平江路的石板与河水，就是他们生活的底色。', '走进平江路，拍一张河水与老房子的倒影，想想沈复笔下那种平淡的甜。'),
  (2, '仓街（芸娘故居一带）', '苏州市姑苏区仓街近平江路', 120.633::float8, 31.3165::float8, '芸娘粘帖深情。', '沈复《浮生六记》；仓街一带为沈复与芸娘居住地之一', 'derived', '沈复与芸娘曾居于此。芸娘是中国文学里最可爱的妻子——她女扮男装陪丈夫看庙会，把贫日子过成了诗。', '在仓街找一处老弄堂，拍一张最像沈复和芸娘家的门。'),
  (3, '平江路河埠头', '苏州市姑苏区平江路沿河埠头', 120.6318::float8, 31.3162::float8, '一沙一世界，一河一人生。', '沈复《浮生六记》写水井巷生活；河埠头为苏州特有水乡设施（引文实据；点位对应见解读）', 'verified', '河埠头是苏州女人洗衣洗菜的地方。沈复写芸娘在此操持家务，烟火气里全是温柔。', '在河埠头坐一会，看河水流过，听一段苏州话的闲聊。'),
  (4, '耦园', '苏州市姑苏区小新桥巷耦园', 120.636::float8, 31.3155::float8, '同耦同心，沈复与芸娘之情。', '沈复《浮生六记》主题；耦园名取耦（伴侣）意，寓同俦者（引文实据；点位对应见解读）', 'verified', '耦园取耦（伴侣）之意，与沈复芸娘的爱情主题最合。园林是爱情的容器，平江路是它的院子。', '在耦园找一处最浪漫的角落，拍下来，配一句你想对爱人说的话。'),
  (5, '悬桥巷', '苏州市姑苏区悬桥巷', 120.6335::float8, 31.317::float8, '市井之中，美食与人情。', '沈复《浮生六记·闺情记快》写苏州市井生活；悬桥巷为老字号美食街', 'derived', '沈复写尽苏州的市井吃喝。悬桥巷至今烟火气十足，一碗苏式面、一块糕，都是浮生的滋味。', '在悬桥巷吃一味苏州小吃，记下它像不像沈复笔下的味道。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'suzhou-pingjiang-fushengliuji';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'suzhou-pingjiang-fushengliuji';


-- ---------- suzhou-zhuozhengyuan-wenzhengming · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'suzhou-zhuozhengyuan-wenzhengming',
  '拙政园 · 文徵明的园林诗画',
  '文徵明',
  '苏州',
  '文徵明《拙政园三十一景图咏》',
  '一座园子的名字来自一句自嘲，一位画家为它画了三十一景。循着文徵明的笔意走拙政园，看明代文人如何把山水搬进自家院墙。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '',
    why_worth = '',
    category = 'scenic',
    season = 'spring'
  where slug = 'suzhou-zhuozhengyuan-wenzhengming';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'suzhou-zhuozhengyuan-wenzhengming');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '拙政园（入口·兰雪堂）', '苏州市姑苏区东北街178号', 120.629::float8, 31.3245::float8, '灌园鬻蔬，是亦拙者之为政也。', '潘岳《闲居赋》；明·王献臣建园时取此句意命名“拙政”，见文徵明《王氏拙政园记》（嘉靖十二年，1533）', 'verified', '园名“拙政”是王献臣的自嘲：笨拙的人，把种菜浇水当作为政之道。文徵明为友人作记，定下这座园林的文人底色。', '在园门口拍一张“拙政园”匾额，写下你对“拙政”二字的理解。'),
  (2, '文徵明手植紫藤', '苏州市姑苏区拙政园中花园', 120.6288::float8, 31.3252::float8, '（文徵明于嘉靖年间绘《拙政园三十一景图》并系诗，咏园中诸景。）', '文徵明《拙政园三十一景图咏》，明嘉靖十二年（1533）作，图卷现藏故宫博物院等机构（诗题逐字待核）', 'derived', '园中这株紫藤传为文徵明亲手所植，五百年仍年年开花。画家与园主的情谊，长成了一棵树。', '找到紫藤架，拍一张花叶（花期约四月），与文徵明的画意做个对比。'),
  (3, '远香堂', '苏州市姑苏区拙政园中花园主厅', 120.6285::float8, 31.3248::float8, '香远益清，亭亭净植。', '周敦颐《爱莲说》（《周元公集》）；“远香堂”取名自此，取荷香远溢之意', 'verified', '远香堂面水而立，夏日荷香满堂。堂名取自周敦颐写莲花的“香远益清”，是园林以文学命名景致的典型。', '在远香堂前观荷（或想象荷景），拍一张水面与堂名的合影。'),
  (4, '小飞虹（廊桥）', '苏州市姑苏区拙政园中花园', 120.6286::float8, 31.325::float8, '我来仿佛踏金鳌，愿挥尘世从琴高。', '文徵明《拙政园三十一景图咏·小飞虹》（嘉靖癸巳前后；见《拙政园图咏》诸本）', 'verified', '小飞虹是拙政园标志性廊桥。文徵明为此景题诗，把过桥写成“踏金鳌”的升仙之感。', '走上小飞虹，低头看水中桥影，拍一张“虹卧碧波”的构图。'),
  (5, '拙政园西园·与谁同坐轩', '苏州市姑苏区拙政园西花园', 120.6282::float8, 31.3246::float8, '与谁同坐？明月，清风，我。', '苏轼《点绛唇·闲倚胡床》（《全宋词》）；轩名取自此词，为后世增建，承文徵明时代园林文脉', 'verified', '轩名来自苏轼词，扇形小筑临水而开。问“与谁同坐”，答以明月清风——园林是文人安放孤独的地方。', '在轩中坐片刻，拍一张扇形窗框出的水景，写下此刻愿与谁同坐。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'suzhou-zhuozhengyuan-wenzhengming';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'suzhou-zhuozhengyuan-wenzhengming';


-- ---------- yangzhou-man-jiangkui · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'yangzhou-man-jiangkui',
  '一首词里的扬州 · 跟着《扬州慢》逛城',
  '姜夔',
  '扬州',
  '姜夔《扬州慢·淮左名都》',
  '这不是听歌打卡，而是跟着姜夔《扬州慢》词里写到的地名去走扬州：二十四桥、春风十里路、废池乔木。八百年前的词，今天还能在城里找到对应的地方。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '这不是听歌打卡，而是跟着姜夔《扬州慢》词里写到的二十四桥、春风十里路，去走真实的扬州城。',
    why_worth = '八百年前姜夔过扬州，写下这首词的悲凉；八百年后，词里的地名还在，城已繁华——这是一条用脚丈量一首词的路线。',
    category = 'literary',
    season = 'winter'
  where slug = 'yangzhou-man-jiangkui';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'yangzhou-man-jiangkui');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '扬州城遗址（宋大城）', '扬州市蜀冈—瘦西湖风景区蜀冈古城遗址', 119.395::float8, 32.42::float8, '淮左名都，竹西佳处，解鞍少驻初程。', '姜夔《扬州慢·淮左名都》序及上阕，作于南宋淳熙三年（1176）；词集见《白石道人歌曲》卷四', 'verified', '姜夔过扬州时，这座“淮左名都”刚经历绍兴战火不久。他在蜀冈故城一带解鞍驻马，写下“少驻初程”——一个旅人对名城的初见，也是对废墟的叹息。', '在蜀冈古城遗址远眺，拍一张今日扬州城，对比词中“名都”二字。'),
  (2, '二十四桥（瘦西湖）', '扬州市邗江区瘦西湖风景名胜区二十四桥景区', 119.418::float8, 32.41::float8, '二十四桥仍在，波心荡、冷月无声。', '姜夔《扬州慢·淮左名都》', 'verified', '二十四桥是扬州最有名的意象。姜夔过此时，桥在月冷；今日瘦西湖的二十四桥是新修的景，但“波心荡”三字，仍是每个来扬州的人要找的。', '在二十四桥看一次夜景或月色，拍下水中的月影，背一遍“冷月无声”。'),
  (3, '大明寺（平山堂）', '扬州市蜀冈中峰大明寺', 119.401::float8, 32.415::float8, '过春风十里，尽荠麦青青。', '姜夔《扬州慢·淮左名都》上阕；“春风十里”用杜牧《赠别》典，大明寺—蜀冈一带为俯瞰扬州城故地（引文实据；点位对应见解读）', 'verified', '杜牧写“春风十里扬州路”，姜夔过此时只剩“荠麦青青”。大明寺平山堂是看扬州城的高处，欧阳修曾在此饮酒——这里能一眼看尽名都的盛与衰。', '在平山堂凭栏，拍一张俯瞰扬州的照片，想想“春风十里”今在何处。'),
  (4, '东关街（古邗沟一线）', '扬州市广陵区东关街', 119.4212::float8, 32.3952::float8, '自胡马窥江去后，废池乔木，犹厌言兵。', '姜夔《扬州慢·淮左名都》上阕；东关街为扬州古运河商埠，绍兴战火后衰落，今为繁华老街（引文实据；点位对应见解读）', 'verified', '东关街连着古运河，是扬州的市井命脉。姜夔写“废池乔木，犹厌言兵”——连草木都怕提那场战争。今日东关街烟火鼎盛，是这座城自我疗愈的证据。', '在东关街吃一味扬州小吃，拍一张最热闹的铺面，对比词中的“废池”。'),
  (5, '琼花观（蕃釐观）', '扬州市广陵区东关街琼花观', 119.423::float8, 32.396::float8, '纵豆蔻词工，青楼梦好，难赋深情。', '姜夔《扬州慢·淮左名都》下阕；用杜牧扬州诸诗典，琼花观为扬州古迹，隋炀帝传说地（引文实据；点位对应见解读）', 'verified', '琼花观因隋炀帝看琼花的传说而闻名。姜夔在这里感慨：再好的诗笔（杜牧的“豆蔻”“青楼”），也写不出此刻扬州的深情。古迹是词人无声的证人。', '在琼花观找一株琼花（花期4-5月），拍下来，写一句姜夔没写出的“深情”。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'yangzhou-man-jiangkui';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'yangzhou-man-jiangkui';


-- ---------- yangzhou-shouxihu-dumu · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'yangzhou-shouxihu-dumu',
  '瘦西湖诗画 · 杜牧的二十四桥明月',
  '杜牧 / 郑板桥',
  '扬州',
  '杜牧《寄扬州韩绰判官》+ 郑板桥《瘦西湖》诗',
  '二十四桥明月夜，玉人何处教吹箫。杜牧一句诗让瘦西湖的桥与月成了千年的意象。走一趟湖上园林，看诗里的桥、画里的柳。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着杜牧二十四桥明月夜和历代写瘦西湖的诗画，去湖上走一段桥、柳、月的诗画路线。',
    why_worth = '瘦西湖是扬州的名片，杜牧的诗是它的广告词——这是一条走进二十四桥明月夜的路线。',
    category = 'scenic',
    season = 'spring'
  where slug = 'yangzhou-shouxihu-dumu';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'yangzhou-shouxihu-dumu');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '瘦西湖（大虹桥）', '扬州市邗江区大虹桥路瘦西湖风景名胜区', 119.418::float8, 32.412::float8, '二十四桥明月夜，玉人何处教吹箫。', '杜牧《寄扬州韩绰判官》，《全唐诗》卷二六；大虹桥为瘦西湖名桥', 'verified', '杜牧这句诗让瘦西湖的桥与月成了千古绝唱。大虹桥是瘦西湖的入口，也是历代诗人写湖的起点。', '在大虹桥上拍一张湖面的全景，背一遍杜牧的诗。'),
  (2, '二十四桥景区', '扬州市邗江区瘦西湖风景名胜区二十四桥景区', 119.4195::float8, 32.4135::float8, '二十四桥明月夜。', '杜牧《寄扬州韩绰判官》；二十四桥为现代重建，名出杜牧诗', 'verified', '二十四桥是瘦西湖的灵魂。不论历史上是二十四座桥还是一座桥，杜牧的诗已让它成了扬州最浪漫的坐标。', '在二十四桥看一次月色或灯光，拍下水中桥影，想想玉人何处教吹箫。'),
  (3, '五亭桥', '扬州市邗江区瘦西湖风景名胜区五亭桥', 119.4188::float8, 32.413::float8, '五亭注湖乡。', '郑板桥等历代文人写瘦西湖之诗；五亭桥为瘦西湖标志建筑', 'derived', '五亭桥是瘦西湖最美的建筑，建在湖心，五亭如莲。中国园林虽由人作、宛自天开的典范。', '在五亭桥上找一扇最好的窗框，拍一张框住的湖景。'),
  (4, '白塔', '扬州市邗江区瘦西湖风景名胜区白塔', 119.419::float8, 32.4128::float8, '塔影凌波。', '扬州白塔传为仿北京白塔而建，见《扬州画舫录》', 'derived', '白塔矗立湖畔，倒影入水。传说扬州盐商为迎乾隆一夜仿建——虽是传说，说明扬州昔日富甲天下的气派。', '拍一张白塔与水中倒影的对称构图。'),
  (5, '熙春台', '扬州市邗江区瘦西湖风景名胜区熙春台', 119.42::float8, 32.414::float8, '春风十里扬州路。', '杜牧《赠别》句；熙春台为乾隆南巡时观演之处', 'verified', '熙春台是乾隆看戏的地方。春风十里扬州路的繁华，在瘦西湖的这头最盛。杜牧写的扬州，就是这般金粉。', '在熙春台远眺瘦西湖，找出春风十里的方向，拍一张最繁华的湖景。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'yangzhou-shouxihu-dumu';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'yangzhou-shouxihu-dumu';


-- ---------- yangzhou-wangzengqi-zaocha · 5 points ----------
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
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着汪曾祺《人间滋味》写过的茶社与街巷，用一顿早茶走完扬州老城。',
    why_worth = '汪老一生讲究吃喝，把扬州早茶写成了一种生活哲学——到富春、冶春、东关街实地走一遍，才算真读懂他笔下的烟火。',
    category = 'literary',
    season = 'autumn'
  where slug = 'yangzhou-wangzengqi-zaocha';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'yangzhou-wangzengqi-zaocha');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '富春茶社（得胜桥总店）', '扬州市广陵区得胜桥35号', 119.4398::float8, 32.3945::float8, '耳富春之名久矣，今得亲尝其菜点，乃平生一快。「富春茶点，天下第一。」', '汪曾祺 1986 年于扬州富春茶社题字（实据；多家报道转引，如腾讯新闻《种花起家，你喜欢的富春今年140岁》2025-11-19）', 'verified', '汪老一生讲究吃喝，1986 年讲学扬州时独爱富春，留下「天下第一」的题字——早茶，是扬州人「皮包水」的慢生活注脚。', '在富春点一客烫干丝或三丁包，拍下蒸笼照片，写下你最爱的那一口。'),
  (2, '冶春茶社（御码头店）', '扬州市广陵区丰乐上街8号', 119.4335::float8, 32.4028::float8, '一边喝茶，吃干丝，既消磨时间，也调动胃口。', '汪曾祺《干丝》（收录于《人间滋味》等文集）；冶春为扬州「三春」茶社之一，此句为汪老写扬州早茶/干丝之通写，非冶春专属篇目（引文实据；点位对应见解读）', 'verified', '冶春临水而筑，比富春清静。汪老写扬州茶馆「茶在其次，点是实质」，一处好茶社，喝的是慢与闲。', '在冶春临窗要一壶绿杨春，数一数窗外的船过了几条，记一句此刻的心境。'),
  (3, '锦春茶社', '扬州市广陵区国庆路（近文昌阁）', 119.416::float8, 32.3955::float8, '包点是现做现蒸，总得等一些时候，一般上茶馆的大都要一个干丝。', '汪曾祺《干丝》（《人间滋味》）；关于扬州茶馆点心「现做现蒸」之通写，非锦春专属篇目（引文实据；点位对应见解读）', 'verified', '锦春亦是扬州老茶社。汪老把上茶馆叫「吃早茶」——等的那点期盼，本身就是仪式。', '点一客千层油糕或翡翠烧卖，对比富春，说说哪家的细点更合你口味。'),
  (4, '大麒麟阁茶食店（东关街）', '扬州市广陵区东关街', 119.4218::float8, 32.3932::float8, '家常酒菜，就要愈家常愈好，不追求精细。', '汪曾祺《人间滋味·家常酒菜》（主题性引用；大麒麟阁为扬州东关街茶食老字号，汪文中未见其专属篇目）（引文实据；点位对应见解读）', 'verified', '东关街上茶食飘香。汪老论吃讲究「家常」，一碟茶食配一壶茶，便是扬州最日常的甜。', '买一盒大麒麟阁茶食，挑最像「家常」的那味，拍给远方的朋友。'),
  (5, '东关街（历史文化街区）', '扬州市广陵区东关街', 119.4485::float8, 32.3968::float8, '上茶馆并不是专为吃茶，茶当然是要喝的，但主要是吃点心。', '汪曾祺《如意楼和得意楼》等写高邮东大街茶馆烟火（《人间滋味》相关篇目）；注意：原文写故乡高邮「东大街」，此处映射扬州「东关街」为导览延伸，属主题引用而非同地实据（引文实据；点位对应见解读）', 'verified', '东关街是扬州最热闹的老街。用汪老写高邮茶馆的烟火气对照扬州东关街的市声，是隔空致意，不是把两处地名混为一谈。', '沿东关街走到底，找一家最老的铺子，录一段 10 秒的街声作纪念。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'yangzhou-wangzengqi-zaocha';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, '/images/route-cards/yangzhou-wangzengqi-zaocha-1.svg'), (2, '/images/route-cards/yangzhou-wangzengqi-zaocha-2.svg'), (3, '/images/route-cards/yangzhou-wangzengqi-zaocha-3.svg'), (4, '/images/route-cards/yangzhou-wangzengqi-zaocha-4.svg'), (5, '/images/route-cards/yangzhou-wangzengqi-zaocha-5.svg') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, '/images/route-cards/yangzhou-wangzengqi-zaocha-1.svg'), (2, '/images/route-cards/yangzhou-wangzengqi-zaocha-2.svg'), (3, '/images/route-cards/yangzhou-wangzengqi-zaocha-3.svg'), (4, '/images/route-cards/yangzhou-wangzengqi-zaocha-4.svg'), (5, '/images/route-cards/yangzhou-wangzengqi-zaocha-5.svg') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'yangzhou-wangzengqi-zaocha';


-- ---------- zhangjiajie-qifeng-ruhua · 5 points ----------
insert into public.routes (slug, title, author, city, book, summary, cover_image, source)
values (
  'zhangjiajie-qifeng-ruhua',
  '奇峰入画来 · 张家界的山水长卷',
  '吴冠中 / 沈从文',
  '张家界',
  '吴冠中张家界写生 · 沈从文《湘行散记》',
  '三千奇峰拔地而起，曾是画家吴冠中笔下“养在深闺人未识”的山水秘境，也是电影《阿凡达》悬浮山的灵感之地。这条路线带你走进这片峰林，在每一个观景台前，看真实的山水如何变成画里的世界。',
  '',
  'human'
)
on conflict (slug) do update set
  title = excluded.title, author = excluded.author, city = excluded.city,
  book = excluded.book, summary = excluded.summary, cover_image = excluded.cover_image,
  source = excluded.source;

-- optional enrichment (ignore if columns missing — run migrate first)
do $enrich$
begin
  update public.routes set
    plain_explain = '跟着游戏与影视里的悬浮山、仙人居所，去张家界找它们真正的取景灵感地，在每个观景台对比画面与现实。',
    why_worth = '三千座石英砂岩峰林拔地而起，是吴冠中笔下养在深闺的秘境，也是《阿凡达》悬浮山的灵感来源——这是一条用脚走进画里的路线。',
    category = 'scenic',
    season = 'autumn'
  where slug = 'zhangjiajie-qifeng-ruhua';
exception when undefined_column then
  null;
end
$enrich$;

delete from public.points
where route_id = (select id from public.routes where slug = 'zhangjiajie-qifeng-ruhua');

insert into public.points
  (route_id, seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task, source)
select r.id, v.seq, v.name, v.address, v.lng, v.lat, v.excerpt, v.excerpt_source, v.excerpt_confidence, v.interpretation, v.checkin_task, 'human'
from public.routes r,
(values
  (1, '袁家界（乾坤柱 · 哈利路亚悬浮山取景地）', '张家界市武陵源区张家界国家森林公园袁家界景区', 109.7475::float8, 29.348::float8, '奇峰拔地，群石凌空，云海翻涌如天外之境。', '电影《阿凡达》（2009）导演詹姆斯·卡梅隆公开确认潘多拉星球悬浮山灵感取自张家界；袁家界乾坤柱为官方授牌取景地（张家界景区公开标识）', 'verified', '袁家界是张家界石峰最密集之处。一根根石英砂岩柱拔地而起，云雾缠绕时确实像悬浮在空中——好莱坞来这里找外星山的灵感，不奇怪。', '在乾坤柱前找一找《阿凡达》里悬浮山的视角，拍一张“现实版”同款构图。'),
  (2, '天子山（御笔峰）', '张家界市武陵源区天子山自然保护区', 109.765::float8, 29.335::float8, '千峰耸立，云雾缭绕，如仙人列坐。', '吴冠中1979年张家界写生代表作《张家界》《马尾松》等（发表于《湖南日报》1979年《养在深闺人未识》一文，使张家界为世人所知）；御笔峰为天子山标志性峰林', 'verified', '1979年画家吴冠中偶然到此，惊叹“养在深闺人未识”，一篇短文让张家界走向世界。他笔下的峰林云海，画的就是天子山这片——御笔峰数十根石柱并立，是这片山水的脸。', '在天子山观景台等一次云海，拍一张“吴冠中画里”那样的峰林，记一句此刻的呼吸。'),
  (3, '金鞭溪', '张家界市武陵源区张家界国家森林公园金鞭溪', 109.74::float8, 29.355::float8, '沿溪而行，两岸夹峰，猿啼鸟鸣，水清见底。', '沈从文《湘行散记·一九三四年一月十八》（北岳文艺出版社《沈从文全集》）；沈从文写湘西沅水流域山水人情，金鞭溪为其笔下湘西地貌之延伸', 'derived', '金鞭溪两岸峰墙夹峙，溪水清澈见底。沈从文写湘西“一切光景静美得简直不像是人间”，走的便是这样的溪谷——两岸的峰、脚下的水，是湘西山水最干净的注脚。', '沿金鞭溪走一段，录一段溪声与鸟鸣，想想沈从文会怎么写这条溪。'),
  (4, '天门山（天门洞）', '张家界市永定区天门山国家森林公园', 110.186::float8, 29.062::float8, '绝壁穿洞，云从中过，如天门洞开。', '天门洞为世界最高海拔天然穿山溶洞（海拔1262米），载于《张家界市志》及世界自然遗产申报材料；自古有“天门”之谓', 'verified', '天门洞是一个天然穿山溶洞，悬在千米绝壁之上。云雾从洞中穿过时，真如天门洞开——古人为它起名“天门”，是中国山水“天人感应”想象最直观的载体。', '乘索道或爬999级台阶到天门洞下，拍一张云雾穿洞的天空。'),
  (5, '十里画廊', '张家界市武陵源区张家界国家森林公园十里画廊', 109.755::float8, 29.34::float8, '峰林如画卷徐徐展开，移步换景，每一笔都是山。', '宋代郭熙《林泉高致·山水训》论山水画“可行可望不如可游可居”；十里画廊为张家界峰林代表，《武陵源风物志》载其移步换景之胜', 'derived', '十里画廊是一条峰林走廊，两边石峰像徐徐展开的山水长卷。古人说山水画要“可行可望可游可居”，十里画廊就是“可游”二字最真切的注脚——人在画中走，画随人移。', '乘小火车或步行十里画廊，拍三座你认为最像山水画的石峰，给它们起个名字。')
) as v(seq, name, address, lng, lat, excerpt, excerpt_source, excerpt_confidence, interpretation, checkin_task)
where r.slug = 'zhangjiajie-qifeng-ruhua';

insert into public.cards (point_id, title, quote, illustration, photo, template, source)
select p.id, p.name, p.excerpt,
  coalesce((select x.ill from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ill) where x.seq = p.seq), ''),
  coalesce((select x.ph from (values (1, ''), (2, ''), (3, ''), (4, ''), (5, '') ) as x(seq, ph) where x.seq = p.seq), ''),
  'default', 'human'
from public.points p
join public.routes r on r.id = p.route_id
where r.slug = 'zhangjiajie-qifeng-ruhua';


select 'seed-all-routes done' as status,
  (select count(*) from public.routes) as routes,
  (select count(*) from public.points) as points,
  (select count(*) from public.cards) as cards;
