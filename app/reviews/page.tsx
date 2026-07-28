'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { fetchAllReviews, type Review } from '@/lib/reviews-store'
import { routesCatalog } from '@/lib/routes-catalog'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [routeFilter, setRouteFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    void fetchAllReviews(routeFilter === 'all' ? undefined : { routeSlug: routeFilter }).then(
      rows => {
        setReviews(rows)
        setLoading(false)
      }
    )
  }, [routeFilter])

  const cities = useMemo(
    () => Array.from(new Set(reviews.map(r => r.city).filter(Boolean))) as string[],
    [reviews]
  )

  return (
    <main className="bg-paper min-h-screen">
      <div className="xc-container py-10">
        <div className="text-xs text-ink-400">
          <Link href="/" className="hover:text-vermilion">
            首页
          </Link>
          <span className="mx-2">/</span>
          <span>全站评价</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold text-charcoal">寻迹 · 用户评价</h1>
        <p className="mt-2 text-ink-500">跟着书本走完的人，留下了他们的星评与实拍。</p>

        {/* 筛选 */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-400">路线</span>
          <select
            value={routeFilter}
            onChange={e => setRouteFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700 outline-none focus:border-vermilion"
          >
            <option value="all">全部路线</option>
            {routesCatalog
              .filter(r => r.status === 'live')
              .map(r => (
                <option key={r.slug} value={r.slug}>
                  {r.title}
                </option>
              ))}
          </select>
          {cities.length > 0 && (
            <span className="text-xs text-ink-400">覆盖城市：{cities.join('、')}</span>
          )}
          <span className="ml-auto text-sm text-ink-400">{reviews.length} 条评价</span>
        </div>

        {/* 列表 */}
        {loading ? (
          <p className="mt-10 text-center text-ink-400">加载中…</p>
        ) : reviews.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center">
            <p className="text-ink-500">还没有评价。</p>
            <p className="mt-1 text-sm text-ink-400">
              去{' '}
              <Link
                href="/route/yangzhou-wangzengqi-zaocha/"
                className="text-vermilion hover:opacity-80"
              >
                扬州早茶路线
              </Link>{' '}
              打卡后写下第一条吧。
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map(r => (
              <li key={r.id} className="rounded-2xl border border-ink-100 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#E0A800]">
                      {'★'.repeat(r.rating)}
                      <span className="ml-1 text-xs text-ink-400">{r.rating} 星</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {r.pointName ?? '—'}
                      {r.routeTitle ? ` · ${r.routeTitle}` : ''}
                      {r.city ? ` · ${r.city}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-ink-300">
                    {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {r.text && <p className="mt-3 text-sm leading-relaxed text-ink-600">{r.text}</p>}
                {r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt="实拍"
                    className="mt-3 h-32 w-32 rounded-xl object-cover"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/routes"
            className="xc-pill border-2 border-ink-200 bg-white text-sm text-ink-700"
          >
            ← 所有路线
          </Link>
        </div>
      </div>
    </main>
  )
}
