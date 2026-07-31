import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { RouteDetailView } from '@/components/route-detail/route-detail-view'
import { getAllRouteSlugs, getRouteDetail } from '@/lib/route-detail-data'

interface PageProps {
  params: { id: string }
}

// 预生成已知路线 slug（静态导出与 standalone 均可）。
// 未知 id：standalone 走 not-found；勿设 dynamicParams=false（旧 export 模式下曾导致 /route/* 500）。
export function generateStaticParams() {
  return getAllRouteSlugs().map(id => ({ id }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const route = getRouteDetail(params.id)
  if (!route) return { title: '未找到该路线 · 寻迹' }
  return {
    title: `${route.title} · 寻迹`,
    description: route.summary,
  }
}

export default function RouteDetailPage({ params }: PageProps) {
  const route = getRouteDetail(params.id)
  if (!route) {
    notFound()
  }

  return (
    <>
      <SiteHeader />
      <main>
        <RouteDetailView route={route} />
      </main>
    </>
  )
}
