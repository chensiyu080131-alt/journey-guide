'use client'

import { useMemo } from 'react'
import type { RouteDetail } from '@/lib/route-detail-data'
import type { DemoRoute } from '@/lib/demo-carousel-data'
import { CarouselCoverflow, type CoverflowVariant } from '@/components/demo/carousel-coverflow'

function toDemoRoute(route: RouteDetail): DemoRoute {
  const bookShort = route.book.split(/[／/、《》]/)[0]?.trim() || route.book
  const quote = route.points[0]?.excerpt?.trim() || route.title
  return {
    slug: route.slug,
    title: route.title,
    author: route.author,
    city: route.city,
    book: route.book,
    bookShort,
    summary: route.plainExplain || route.summary,
    quote: quote.length > 28 ? `${quote.slice(0, 26)}…` : quote,
    place: route.points[0]?.name || route.city,
    points: route.points.length,
  }
}

export function HomeRouteDeck({
  routes,
  size = 'lg',
  variant = 'book',
}: {
  routes: RouteDetail[]
  size?: 'md' | 'lg'
  variant?: CoverflowVariant
}) {
  const demoRoutes = useMemo(() => routes.map(toDemoRoute), [routes])
  if (!demoRoutes.length) return null
  return <CarouselCoverflow routes={demoRoutes} size={size} variant={variant} />
}
