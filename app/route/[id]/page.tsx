import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { RouteDetailView } from '@/components/route-detail/route-detail-view'
import { getAllRouteSlugs, getRouteDetail } from '@/lib/route-detail-data'

interface PageProps {
  params: { id: string }
}

// 静态导出（output: 'export'）要求：预生成全部路线 slug。
// 注意：不要加 `export const dynamicParams = false` —— Next 14.2 dev + output:export 下
// 它会使 fallbackMode 非 "static"，导致所有 /route/* 请求 500（base-server.js:1079）。
// 未知 id 的 404 行为由静态导出产物保证：out/ 中不存在对应 html，服务器返回 404.html。
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
      <SiteFooter />
    </>
  )
}
