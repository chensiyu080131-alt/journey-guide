'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { routesCatalog } from '@/lib/routes-catalog'
import { loadCheckins } from '@/lib/checkin-store'
import { getFavorites, toggleFavorite } from '@/lib/favorites-store'

export default function RoutesPage() {
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [favs, setFavs] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'scenic' | 'literary' | 'figure'>('all')

  useEffect(() => {
    const p: Record<string, number> = {}
    for (const r of routesCatalog) {
      if (r.status === 'live') p[r.slug] = loadCheckins(r.slug).length
    }
    setProgress(p)
    setFavs(getFavorites())
  }, [])

  const allLiveRoutes = routesCatalog.filter(r => r.status === 'live')
  const liveRoutes = filter === 'all' ? allLiveRoutes : allLiveRoutes.filter(r => r.category === filter)
  const soonRoutes = routesCatalog.filter(r => r.status === 'soon')

  const FILTERS: { key: 'all' | 'scenic' | 'literary' | 'figure'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'scenic', label: '经典名胜' },
    { key: 'literary', label: '文学名篇' },
    { key: 'figure', label: '人物行旅' },
  ]

  return (
    <main className="bg-paper min-h-screen">
      <div className="xc-container py-10">
        <div className="text-xs text-ink-400">
          <Link href="/" className="hover:text-vermilion">
            首页
          </Link>
          <span className="mx-2">/</span>
          <span>所有路线</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold text-charcoal">寻迹 · 文学路线</h1>
        <p className="mt-2 text-ink-500">
          跟着书本去旅行 —— 已上线 {liveRoutes.length} 条 · 即将上线 {soonRoutes.length} 条
        </p>

        <h2 className="mt-9 font-serif text-xl font-bold text-charcoal">已上线</h2>
        {/* Task2：分类筛选标签 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                filter === f.key
                  ? 'border-vermilion bg-vermilion text-white'
                  : 'border-ink-200 bg-white text-ink-500 hover:border-vermilion/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {liveRoutes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-sm text-ink-400">
            暂无此类路线
          </div>
        ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {liveRoutes.map(r => {
            const fav = favs.includes(r.slug)
            return (
              <div
                key={r.slug}
                className="group relative rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-vermilion hover:shadow-md"
              >
                <button
                  onClick={() => {
                    toggleFavorite(r.slug)
                    setFavs(getFavorites())
                  }}
                  aria-label={fav ? '取消收藏' : '收藏'}
                  className={`absolute right-4 top-4 text-xl transition ${
                    fav ? 'text-vermilion' : 'text-ink-400 hover:text-vermilion'
                  }`}
                >
                  {fav ? '★' : '☆'}
                </button>
                <Link href={`/route/${r.slug}/`}>
                  <div className="text-3xl">{r.emoji}</div>
                  <h3 className="mt-2 font-serif text-xl font-bold text-charcoal group-hover:text-vermilion">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-400">
                    {r.book} · {r.city}
                  </p>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{r.blurb}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-ink-400">{r.pointsCount} 个点位</span>
                    <span className="text-xs font-semibold text-vermilion">
                      已打卡 {progress[r.slug] ?? 0}/{r.pointsCount}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
        )}

        <h2 className="mt-10 font-serif text-xl font-bold text-charcoal">即将上线</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {soonRoutes.map(r => (
            <div
              key={r.slug}
              className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-5 opacity-80"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl grayscale">{r.emoji}</div>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-400">
                  即将上线
                </span>
              </div>
              <h3 className="mt-2 font-serif text-xl font-bold text-charcoal">{r.title}</h3>
              <p className="mt-1 text-xs text-ink-400">
                {r.book} · {r.city}
              </p>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{r.blurb}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/favorites" className="xc-pill border-2 border-ink-200 bg-white text-sm text-ink-700">
            ★ 我的收藏
          </Link>
        </div>
      </div>
    </main>
  )
}
