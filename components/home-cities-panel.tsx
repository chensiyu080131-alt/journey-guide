'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cityBooksMap } from '@/lib/city-books'
import { listAllRoutes } from '@/lib/route-detail-data'
import { CarouselCoverflow, type CoverflowItem } from '@/components/demo/carousel-coverflow'

export function HomeCitiesPanel() {
  const items: CoverflowItem[] = useMemo(() => {
    const routes = listAllRoutes()
    return Object.values(cityBooksMap)
      .map(meta => {
        const cityRoutes = routes.filter(r => r.city === meta.cityName)
        const checkinCount = meta.books.filter(b => b.checkinSlug).length
        return {
          slug: meta.citySlug,
          title: meta.cityName,
          author: meta.tagline,
          city: meta.cityName,
          book: meta.tagline,
          bookShort: meta.tagline,
          summary: meta.intro,
          quote: meta.tagline,
          place: meta.province,
          points: cityRoutes.length || meta.books.length,
          href: `/guide/${meta.citySlug}/books`,
          metaLine:
            cityRoutes.length > 0
              ? `${cityRoutes.length} 条可打卡路线 · ${cityRoutes.reduce((n, r) => n + r.points.length, 0)} 点位`
              : checkinCount > 0
                ? `${checkinCount} 本可打卡书目`
                : `${meta.books.length} 本书 · 路线规划`,
        } satisfies CoverflowItem
      })
      .sort((a, b) => b.points - a.points || a.city.localeCompare(b.city, 'zh'))
  }, [])

  return (
    <section className="xc-container py-8 sm:py-12 pb-16">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="font-lishu text-3xl sm:text-4xl font-normal text-literary-ink tracking-[0.16em]">
          一城一页，藏尽风华
        </h2>
        <p className="mt-2 text-sm text-literary-muted font-serif tracking-wide">
          以城寻迹
        </p>
      </div>

      <CarouselCoverflow routes={items} size="lg" variant="city" />

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/routes"
          className="text-sm font-serif text-literary-wine border border-literary-wine/40 rounded-lg px-4 py-2 hover:bg-literary-wine hover:text-white transition-colors"
        >
          全部可打卡路线 →
        </Link>
        <Link
          href="/guide/destination"
          className="text-sm font-serif text-literary-muted border border-literary-sand rounded-lg px-4 py-2 hover:border-literary-wine/40 hover:text-literary-wine transition-colors"
        >
          搜一座城 · 生成攻略 →
        </Link>
      </div>
    </section>
  )
}
