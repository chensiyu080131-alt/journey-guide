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
    blurb:
      '跟着汪老的笔触，用一顿早茶走完扬州：富春 · 冶春 · 锦春 · 大麒麟阁 · 东关街。GPS 打卡解锁 5 枚文学卡片。',
  },
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
]

export function getRouteBySlug(slug: string): RouteCatalogItem | undefined {
  return routesCatalog.find(r => r.slug === slug)
}
