import { notFound } from 'next/navigation'
import { getRouteById, listLocalRouteIds } from '@/lib/route-data'
import { RouteDetailClient } from './route-detail-client'

// 静态导出：预生成所有本地路线 id。
// 注意：output:'export' 模式下，未在 generateStaticParams 列出的 id 在生产构建时
// 不会生成页面，访问会自动走全局 not-found.tsx（404）。dev 模式下未列出 id 会报 500，
// 这是 Next.js 静态导出的已知行为，不影响生产部署。
export function generateStaticParams() {
  return listLocalRouteIds().map(id => ({ id }))
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getRouteById(decodeURIComponent(id))

  // ★ 任务3 反向验证：不存在的 route id → notFound() → 走 not-found.tsx，绝不白屏
  if (!result) {
    notFound()
  }

  return <RouteDetailClient guide={result.guide} fromSupabase={result.fromSupabase} />
}
