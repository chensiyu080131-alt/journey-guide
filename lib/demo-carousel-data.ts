import { listAllRoutes, type RouteDetail } from '@/lib/route-detail-data'

const FEATURED = [
  'hangzhou-sudi-sushi',
  'yangzhou-wangzengqi-zaocha',
  'shaoxing-luxun-baicaoyuan',
  'harbin-xiaohong-hulanhe',
  'beijing-laoshe-chaguan',
  'fenghuang-shencongwen-biancheng',
]

export type DemoRoute = {
  slug: string
  title: string
  author: string
  city: string
  book: string
  bookShort: string
  summary: string
  quote: string
  place: string
  points: number
  illustration?: string
}

export function getDemoRoutes(): DemoRoute[] {
  const all = listAllRoutes()
  const bySlug = new Map(all.map(r => [r.slug, r]))
  const picked: RouteDetail[] = []
  for (const slug of FEATURED) {
    const r = bySlug.get(slug)
    if (r) picked.push(r)
  }
  while (picked.length < 6 && picked.length < all.length) {
    const r = all[picked.length]
    if (r && !picked.some(p => p.slug === r.slug)) picked.push(r)
  }
  return picked.map(r => {
    const bookShort = r.book.split(/[／/、《》]/)[0]?.trim() || r.book
    const quote = r.points[0]?.excerpt?.trim() || r.title
    return {
      slug: r.slug,
      title: r.title,
      author: r.author,
      city: r.city,
      book: r.book,
      bookShort,
      summary: r.plainExplain || r.summary,
      quote: quote.length > 28 ? `${quote.slice(0, 26)}…` : quote,
      place: r.points[0]?.name || r.city,
      points: r.points.length,
      illustration: r.points[0]?.illustration || r.points[0]?.photo,
    }
  })
}
