import Link from 'next/link'
import { RouteCatalog } from '@/components/routes/route-catalog'
import { listAllRoutes } from '@/lib/route-detail-data'

export const metadata = {
  title: '可打卡文学路线 · 寻迹',
  description: '按城市、分类与季节浏览可现场打卡的文学路线',
}

export default function RoutesPage() {
  const routes = listAllRoutes()

  return (
    <main className="bg-paper min-h-screen">
      <div className="xc-container pt-10 pb-16">
        <div className="text-xs text-ink-400">
          <Link href="/" className="hover:text-vermilion">
            首页
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-500">可打卡路线</span>
        </div>

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-charcoal tracking-wide">
          可打卡文学路线
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-500 leading-relaxed font-serif">
          不是攻略散文，而是能在现场验证、打卡、解锁文学卡片的路线。挑一条，带着原文出门。
        </p>

        <div className="mt-10">
          <RouteCatalog initialRoutes={routes} />
        </div>
      </div>
    </main>
  )
}
