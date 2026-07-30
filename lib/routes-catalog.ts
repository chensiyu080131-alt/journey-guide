// 路线总览目录（首页 /routes 列表页 + /favorites 收藏页共用）
// live = 已上线可体验；soon = 即将上线占位。
// 真实路线数据以 Supabase / db/*.json 为准；此处仅做「列表+入口」元数据。

export interface RouteCatalogItem {
  slug: string
  title: string
  book: string
  city: string
  emoji: string
  status: 'live' | 'soon'
  pointsCount: number
  blurb: string
  /** 分类（Task2 筛选）：scenic 经典名胜 / literary 文学名篇 / figure 人物行旅 / inspiration 灵感观察 */
  category?: 'scenic' | 'literary' | 'figure' | 'inspiration'
}

export const routesCatalog: RouteCatalogItem[] = [
  {
    slug: 'yangzhou-wangzengqi-zaocha',
    title: '汪曾祺的扬州早茶地图',
    book: '人间滋味',
    city: '扬州',
    emoji: '🍵',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '跟着汪老的笔触，用一顿早茶走完扬州：富春 · 冶春 · 锦春 · 大麒麟阁 · 东关街。GPS 打卡解锁 5 枚文学卡片。',
  },
  {
    slug: 'suzhou-hanshansi-fengqiao',
    title: '枫桥夜泊 · 寒山寺钟声',
    book: '全唐诗·张继《枫桥夜泊》',
    city: '苏州',
    emoji: '🔔',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '一首二十八字的小诗，让城外的寺院响了千年。从枫桥到寒山寺，沿张继那夜的愁眠与钟声走一段姑苏水路。',
  },
  {
    slug: 'suzhou-zhuozhengyuan-wenzhengming',
    title: '拙政园 · 文徵明的园林诗画',
    book: '文徵明《拙政园三十一景图咏》',
    city: '苏州',
    emoji: '🌿',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb:
      '园名来自一句自嘲，画家为它画了三十一景。循文徵明笔意走拙政园，看明代文人如何把山水搬进院墙。',
  },
  {
    slug: 'hangzhou-sudi-sushi',
    title: '苏堤春晓 · 苏轼的西湖',
    book: '苏轼《饮湖上初晴后雨》',
    city: '杭州',
    emoji: '🌊',
    status: 'live',
    pointsCount: 5,
    category: 'figure',
    blurb:
      '他疏浚西湖筑起长堤，又把西湖写成了西子。沿苏东坡的堤与诗，走一遍晴雨皆宜的湖山。',
  },
  {
    slug: 'hangzhou-baidi-baijiuyi',
    title: '白沙堤上 · 白居易的忆江南',
    book: '白居易《忆江南》',
    city: '杭州',
    emoji: '🌉',
    status: 'live',
    pointsCount: 5,
    category: 'figure',
    blurb:
      '他说"江南好"，便让千年的人都跟着忆。从断桥到孤山，走一段白乐天走过的白沙堤。',
  },
  {
    slug: 'nanjing-qinhuaihe-zhuziqing',
    title: '桨声灯影里的秦淮河',
    book: '朱自清《桨声灯影里的秦淮河》',
    city: '南京',
    emoji: '🏮',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '1923 年夏夜，朱自清与俞平伯同泛秦淮。循那夜的桨声灯影，从夫子庙到桃叶渡，走一段民国文人的河。',
  },
  {
    slug: 'zhangjiajie-qifeng-ruhua',
    title: '奇峰入画来 · 张家界的山水长卷',
    book: '吴冠中写生 · 沈从文《湘行散记》',
    city: '张家界',
    emoji: '⛰️',
    status: 'live',
    pointsCount: 5,
    category: 'inspiration',
    blurb:
      '三千奇峰拔地而起，是画家吴冠中笔下"养在深闺人未识"的秘境。走进峰林，看真实的层叠峰林如何启发东方山水画的创作。',
  },
  {
    slug: 'yangzhou-man-jiangkui',
    title: '一首词里的扬州 · 跟着《扬州慢》逛城',
    book: '姜夔《扬州慢·淮左名都》',
    city: '扬州',
    emoji: '🎵',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '这不是听歌打卡，而是跟着姜夔《扬州慢》词里写到的二十四桥、春风十里路，去走扬州。八百年前的词，今天还能在城里找到对应的地方。',
  },
  {
    slug: 'nanjing-fuzimiao-shishuoxinyu',
    title: '六朝烟水 · 《世说新语》里的建康',
    book: '刘义庆《世说新语》',
    city: '南京',
    emoji: '🏛️',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '魏晋的建康，住着一群最会说话的人。从新亭对泣到乌衣巷口，走一段六朝旧都的清言与风骨。',
  },
  // ========== 新增 8 条（2026-07-29 扩充） ==========
  {
    slug: 'hangzhou-lingyinsi-luobinwang',
    title: '灵隐飞来峰 · 骆宾王的禅意山寺',
    book: '骆宾王《灵隐寺》诗',
    city: '杭州',
    emoji: '🛕',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb:
      '飞来峰下的千年古刹，骆宾王遭贬路过此地，写下"楼观沧海日，门对浙江潮"。循着诗里的禅意与山色，走一座杭州最深的文化名山。',
  },
  {
    slug: 'hangzhou-longjing-sushi',
    title: '龙井茶山 · 苏轼的试焙新茶',
    book: '苏轼《次韵曹辅寄壑源试焙新茶》',
    city: '杭州',
    emoji: '🍵',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '春茶一杯，是苏轼在杭州最爱的闲适。循着茶香走进龙井村，看采茶、品新茶，走一段茶与诗的山路。',
  },
  {
    slug: 'hangzhou-gushan-linbu',
    title: '孤山放鹤 · 林逋的梅妻鹤子',
    book: '林逋《山园小梅》',
    city: '杭州',
    emoji: '🦩',
    status: 'live',
    pointsCount: 5,
    category: 'figure',
    blurb:
      '他隐居孤山二十年，以梅为妻、以鹤为子，写下"疏影横斜水清浅"。走一趟孤山，看一位宋代文人如何把孤独活成诗意。',
  },
  {
    slug: 'suzhou-huqiu-sushi',
    title: '虎丘剑池 · 苏东坡的苏州第一憾事',
    book: '苏轼语 + 袁宏道《虎丘记》',
    city: '苏州',
    emoji: '⚔️',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb:
      '苏东坡说"到苏州不游虎丘，乃憾事也"。袁宏道写下中秋虎丘的笙歌。一座小山，藏着吴王阖闾的剑与文人千年的唱和。',
  },
  {
    slug: 'suzhou-pingjiang-fushengliuji',
    title: '平江路烟火 · 沈复的浮生六记',
    book: '沈复《浮生六记》',
    city: '苏州',
    emoji: '🏮',
    status: 'live',
    pointsCount: 5,
    category: 'figure',
    blurb:
      '一对普通夫妻的市井日常，被沈复写成最动人的散文。沿平江路水巷与老铺，走一段乾隆年间苏州人的烟火人生。',
  },
  {
    slug: 'nanjing-mochouhu-liangwudi',
    title: '莫愁烟雨 · 梁武帝笔下的洛阳女儿',
    book: '梁武帝《河中之水歌》',
    city: '南京',
    emoji: '💧',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb:
      '一个洛阳嫁到金陵的女子，被写进帝王的诗里，成了千年传说。莫愁湖的烟雨里，藏着南朝最温柔的民间记忆。',
  },
  {
    slug: 'nanjing-yuejianglou-songlian',
    title: '阅江楼 · 宋濂笔下的帝王之楼',
    book: '宋濂《阅江楼记》',
    city: '南京',
    emoji: '🏯',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb:
      '朱元璋要在狮子山上建阅江楼，命文臣写记，宋濂拔得头筹。但楼六百年没建成——这是一篇记比楼先有名的地方。',
  },
  {
    slug: 'yangzhou-shouxihu-dumu',
    title: '瘦西湖诗画 · 杜牧的二十四桥明月',
    book: '杜牧《寄扬州韩绰判官》',
    city: '扬州',
    emoji: '🌙',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb:
      '二十四桥明月夜，玉人何处教吹箫。杜牧一句诗让瘦西湖的桥与月成了千年的意象。��一趟湖上园林，看诗里的桥、画里的柳。',
  },
  // ========== 即将上线 ==========
  {
    slug: 'biancheng-fenghuang',
    title: '沈从文的边城',
    book: '边城',
    city: '湘西 · 凤凰',
    emoji: '📖',
    status: 'soon',
    pointsCount: 0,
    blurb: '沱江吊脚楼、茶峒渡口，走进翠翠与爷爷的湘西世界。',
  },
  {
    slug: 'shajiabang',
    title: '沙家浜的芦苇荡',
    book: '沙家浜',
    city: '常熟 · 沙家浜',
    emoji: '🎭',
    status: 'soon',
    pointsCount: 0,
    blurb: '红色经典里的江南水乡，芦苇荡中寻访样板戏故里。',
  },
  {
    slug: 'changan-sanwanli',
    title: '长安三万里',
    book: '长安三万里',
    city: '西安',
    emoji: '🏯',
    status: 'soon',
    pointsCount: 0,
    blurb: '跟着唐诗去长安，走一遍李白杜甫的盛唐足迹。',
  },
  {
    slug: 'fanhua-shanghai',
    title: '繁花的上海弄堂',
    book: '繁花',
    city: '上海',
    emoji: '🌃',
    status: 'soon',
    pointsCount: 0,
    blurb: '王家卫镜头下的上海，梧桐树下寻访弄堂烟火。',
  },
  // ========== 灵感栏目（Task1 去IP化重构） ==========
  {
    slug: 'jiangnan-shuixiang-inspiration',
    title: '水乡楼船 · 中式虚构城市的现实灵感',
    book: '灵感·东方水乡原型地',
    city: '苏州/杭州',
    emoji: '🛶',
    status: 'live',
    pointsCount: 5,
    category: 'inspiration',
    blurb: '粉墙黛瓦、水巷穿城、楼船画舫——江南水乡的城市格局，是无数中式虚构世界最深的灵感源头。',
  },
  {
    slug: 'guta-changqiao-inspiration',
    title: '古塔长桥 · 中式空间美学',
    book: '灵感·古塔与长桥美学',
    city: '杭州/苏州',
    emoji: '🏯',
    status: 'live',
    pointsCount: 5,
    category: 'inspiration',
    blurb: '雷峰塔、保俶塔、宝带桥——真实存在了几百上千年的古建筑，构成中式空间审美的底层语言。',
  },
  // ========== 北京（Task3 扩张） ==========
  {
    slug: 'beijing-hongloumeng-yixiang',
    title: '红楼一梦 · 北京的红楼梦意象',
    book: '曹雪芹《红楼梦》',
    city: '北京',
    emoji: '📕',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb: '从恭王府到大观园，从什刹海到香山，寻找《红楼梦》留在京城里的真实印记。',
  },
  {
    slug: 'beijing-xishan-wenren',
    title: '西山行旅 · 文人与香山的秋色',
    book: '曹雪芹《红楼梦》· 纳兰性德《饮水词》',
    city: '北京',
    emoji: '🍁',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb: '香山红叶、碧云古寺、樱桃沟清泉——西山是北京文人最重要的精神原乡。',
  },
  // ========== 上海（Task4 扩张） ==========
  {
    slug: 'shanghai-songjiang-yunjian',
    title: '云间词派 · 松江古城的文脉',
    book: '陈子龙《湘真阁存稿》· 夏完淳《南冠草》',
    city: '上海',
    emoji: '📜',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb: '松江古称"云间"，是上海最古老的城区。陈子龙与夏完淳师徒，在此写下了中国文学史上最壮烈的一页。',
  },
  {
    slug: 'shanghai-yuyuan-mingqing',
    title: '豫园与老城厢 · 明清上海的城市生活',
    book: '潘允端《豫园记》· 王韬《瀛壖杂志》',
    city: '上海',
    emoji: '🏮',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb: '在"上海"还是一座江南县城的年代，老城厢就是一切。走一圈，看清上海在开埠之前的本来面目。',
  },
  // ========== 广州（Task5 扩张） ==========
  {
    slug: 'guangzhou-lingnan-shiwen',
    title: '岭南诗文 · 珠江文脉巡礼',
    book: '屈大均《广东新语》· 张九龄《曲江集》',
    city: '广州',
    emoji: '🌊',
    status: 'live',
    pointsCount: 5,
    category: 'literary',
    blurb: '从南海神庙的海丝记忆，到陈家祠的岭南建筑巅峰，再到珠江堤上的古今对照。',
  },
  {
    slug: 'guangzhou-xiguan-shenghuo',
    title: '西关生活 · 岭南叙事与骑楼街巷',
    book: '岭南民俗 · 西关大屋与骑楼文化',
    city: '广州',
    emoji: '🏘️',
    status: 'live',
    pointsCount: 5,
    category: 'figure',
    blurb: '西关大屋的趟栊门、恩宁路的骑楼、永庆坊的复兴——广州最完整的市井生活肌理。',
  },
  // ========== 深圳（Task6 扩张） ==========
  {
    slug: 'shenzhen-dapeng-haifang',
    title: '大鹏所城 · 深圳的海防文脉',
    book: '大鹏所城海防史料 · 赖氏家族抗英事迹',
    city: '深圳',
    emoji: '🏰',
    status: 'live',
    pointsCount: 5,
    category: 'scenic',
    blurb: '大鹏所城始建于1394年，是明清南海海防的军事枢纽。深圳简称"鹏城"就来自这里——深圳的根比你想的深。',
  },
]

export function getRouteBySlug(slug: string): RouteCatalogItem | undefined {
  return routesCatalog.find(r => r.slug === slug)
}
