'use client'

import Link from 'next/link'
import { getRouteStats } from '@/lib/route-detail-data'

/** 全站固定底栏：探索更多 + 品牌/数据/说明 */
export function XunjiExploreFooter() {
  const stats = getRouteStats()

  return (
    <div className="xc-home-bg border-t border-literary-sand/60 mt-auto">
      <div className="px-4 sm:px-6 pt-8 pb-6">
        <div className="mb-7 flex flex-col items-center gap-2.5">
          <span className="text-[11px] tracking-[0.3em] text-literary-muted font-serif">探索更多</span>
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-literary-wine/20 bg-white/60 p-1">
            <Link
              href="/routes"
              className="rounded-full px-4 py-1.5 text-sm font-serif text-literary-ink transition-colors hover:bg-literary-wine/10 hover:text-literary-wine"
            >
              所有路线
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('xuncheng:open-book-guide'))}
              className="rounded-full px-4 py-1.5 text-sm font-serif text-literary-ink transition-colors hover:bg-literary-wine/10 hover:text-literary-wine"
            >
              跟书旅行
            </button>
            <Link
              href="/guide/destination"
              className="rounded-full px-4 py-1.5 text-sm font-serif text-literary-ink transition-colors hover:bg-literary-wine/10 hover:text-literary-wine"
            >
              搜一座城
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-1.5 text-sm font-serif text-literary-ink transition-colors hover:bg-literary-wine/10 hover:text-literary-wine"
            >
              文旅局
            </Link>
          </div>
        </div>
      </div>

      <footer className="px-4 sm:px-6 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto text-center sm:text-left">
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">寻迹 · 有迹可循</p>
            <p className="mt-1 text-xs text-literary-muted leading-relaxed">
              书籍 · 东方美学 · 音乐
              <br />
              有迹可循，寻迹而至
            </p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">数据</p>
            <p className="mt-1 text-xs text-literary-muted">
              {stats.cities} 城 · {stats.routes} 路线 · {stats.points} 点位
            </p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">说明</p>
            <p className="mt-1 text-xs text-literary-muted">图片来源均为网络图片，仅供原型演示</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
