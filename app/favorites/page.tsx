'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { routesCatalog, type RouteCatalogItem } from '@/lib/routes-catalog'
import { getFavorites, toggleFavorite } from '@/lib/favorites-store'

export default function FavoritesPage() {
  const [favs, setFavs] = useState<string[]>([])

  useEffect(() => {
    setFavs(getFavorites())
  }, [])

  const items: RouteCatalogItem[] = favs
    .map(slug => routesCatalog.find(r => r.slug === slug))
    .filter((x): x is RouteCatalogItem => Boolean(x))

  return (
    <main className="bg-paper min-h-screen">
      <div className="xc-container py-10">
        <div className="text-xs text-ink-400">
          <Link href="/" className="hover:text-vermilion">
            首页
          </Link>
          <span className="mx-2">/</span>
          <span>我的收藏</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold text-charcoal">★ 我的收藏</h1>
        <p className="mt-2 text-ink-500">收藏的文学路线保存在本机，刷新不丢失。</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
            <p className="text-ink-400">还没有收藏任何路线。</p>
            <Link
              href="/routes"
              className="xc-pill mt-4 inline-block bg-vermilion text-sm text-white"
            >
              去逛逛所有路线 →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(r => (
              <div key={r.slug} className="rounded-2xl border border-ink-100 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{r.emoji}</div>
                  <button
                    onClick={() => {
                      toggleFavorite(r.slug)
                      setFavs(getFavorites())
                    }}
                    aria-label="取消收藏"
                    className="text-xl text-vermilion hover:opacity-70"
                  >
                    ★
                  </button>
                </div>
                <h3 className="mt-2 font-serif text-xl font-bold text-charcoal">{r.title}</h3>
                <p className="mt-1 text-xs text-ink-400">
                  {r.book} · {r.city}
                </p>
                <Link
                  href={`/route/${r.slug}/`}
                  className="xc-pill mt-4 inline-block bg-vermilion text-sm text-white"
                >
                  开始寻迹 →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/routes" className="xc-pill border-2 border-ink-200 bg-white text-sm text-ink-700">
            所有路线
          </Link>
        </div>
      </div>
    </main>
  )
}
