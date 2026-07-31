import type { HomeCover } from '@/lib/home-covers'
import { listAllRoutes, type RouteDetail } from '@/lib/route-detail-data'

/** 按城市配色，让书籍 Tab 封面有可辨识差异 */
const CITY_PALETTE: Record<string, HomeCover['style']> = {
  扬州: {
    bg: 'linear-gradient(165deg, #FDF8F2 0%, #E8D8CC 100%)',
    border: '#8B4545',
    title: '#6B3333',
    subtitle: '#8A6A5A',
    motif: 'book',
  },
  苏州: {
    bg: 'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
    border: '#5A7D78',
    title: '#3D5550',
    subtitle: '#6B8480',
    motif: 'book',
  },
  杭州: {
    bg: 'linear-gradient(165deg, #C8E0D4 0%, #90C4A8 100%)',
    border: '#4A7A5A',
    title: '#2E4A38',
    subtitle: '#5A7A5A',
    motif: 'book',
  },
  南京: {
    bg: 'linear-gradient(165deg, #E0DDD6 0%, #B8B0A4 100%)',
    border: '#6B6560',
    title: '#3D3832',
    subtitle: '#8A8278',
    motif: 'book',
  },
  北京: {
    bg: 'linear-gradient(165deg, #E0C8C0 0%, #C09888 100%)',
    border: '#8A4A3A',
    title: '#4A2E24',
    subtitle: '#7A4A3A',
    motif: 'book',
  },
  绍兴: {
    bg: 'linear-gradient(165deg, #E8E0D0 0%, #C8B898 100%)',
    border: '#7A6A48',
    title: '#4A3E28',
    subtitle: '#7A6A50',
    motif: 'book',
  },
  哈尔滨: {
    bg: 'linear-gradient(165deg, #D0DCE8 0%, #A0B8D0 100%)',
    border: '#4A6A8A',
    title: '#2E4458',
    subtitle: '#5A7088',
    motif: 'book',
  },
  济南: {
    bg: 'linear-gradient(165deg, #D8E4F0 0%, #A8C0D8 100%)',
    border: '#5A7A98',
    title: '#2E4860',
    subtitle: '#5A7890',
    motif: 'book',
  },
  凤凰: {
    bg: 'linear-gradient(165deg, #D4D8E0 0%, #A8B4C0 100%)',
    border: '#5A6878',
    title: '#2E3E4E',
    subtitle: '#5A6A7A',
    motif: 'book',
  },
  乌镇: {
    bg: 'linear-gradient(165deg, #E0D8D0 0%, #C0B0A0 100%)',
    border: '#7A6A58',
    title: '#4A3A2E',
    subtitle: '#7A6A58',
    motif: 'book',
  },
  常熟: {
    bg: 'linear-gradient(165deg, #DDE5DC 0%, #B5C4B0 100%)',
    border: '#5C7260',
    title: '#3A4A3C',
    subtitle: '#6A7A6C',
    motif: 'book',
  },
  张家界: {
    bg: 'linear-gradient(165deg, #D0E0D8 0%, #98C0A8 100%)',
    border: '#4A7A5A',
    title: '#2E4A38',
    subtitle: '#5A7A5A',
    motif: 'landscape',
  },
}

const FALLBACK_STYLE: HomeCover['style'] = {
  bg: 'linear-gradient(165deg, #F5F0E8 0%, #D8D0C4 100%)',
  border: '#7A6A58',
  title: '#3D3832',
  subtitle: '#8A8278',
  motif: 'book',
}

/** 把库内可打卡路线转成首页书籍封面（内容与数据库同步） */
export function routeToHomeCover(route: RouteDetail): HomeCover {
  const style = CITY_PALETTE[route.city] ?? FALLBACK_STYLE
  return {
    id: `route-${route.slug}`,
    category: '书籍',
    title: route.book || route.title,
    subtitle: `${route.author} · ${route.city}`,
    route: `/route/${route.slug}`,
    checkinSlug: route.slug,
    eyebrow: '可打卡',
    style,
  }
}

export function getRouteBookCovers(): HomeCover[] {
  return listAllRoutes()
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city, 'zh') || a.title.localeCompare(b.title, 'zh'))
    .map(routeToHomeCover)
}

/** 首页精选：优先展示新入库/标杆文学线 */
const FEATURED_SLUGS = [
  'yangzhou-wangzengqi-zaocha',
  'shaoxing-luxun-baicaoyuan',
  'harbin-xiaohong-hulanhe',
  'jinan-laoshe-baotuquan',
  'fenghuang-shencongwen-biancheng',
  'beijing-laoshe-chaguan',
  'shaoxing-luyou-shenyuan',
  'wuzhen-maodun-linjiapuzi',
]

export function getFeaturedRouteCovers(limit = 4): HomeCover[] {
  const bySlug = new Map(listAllRoutes().map(r => [r.slug, r]))
  const picked: HomeCover[] = []
  for (const slug of FEATURED_SLUGS) {
    const r = bySlug.get(slug)
    if (r) picked.push(routeToHomeCover(r))
    if (picked.length >= limit) break
  }
  if (picked.length < limit) {
    for (const r of listAllRoutes()) {
      if (FEATURED_SLUGS.includes(r.slug)) continue
      picked.push(routeToHomeCover(r))
      if (picked.length >= limit) break
    }
  }
  return picked
}
