'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Hotspot = {
  id: string
  date: string
  title: string
  description: string
  routeSlug: string
}

function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 线上同款：今日热点（读 /hotspots.json） */
export function HomeDailyHotspots() {
  const [items, setItems] = useState<Hotspot[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/hotspots.json')
      .then(r => r.json())
      .then((all: Hotspot[]) => {
        const key = todayKey()
        setItems(all.filter(h => h.date === key).slice(0, 3))
      })
      .catch(() => setItems([]))
      .finally(() => setReady(true))
  }, [])

  return (
    <section className="px-4 sm:px-6 pb-2 flex-shrink-0">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-lg font-bold text-literary-ink">今日热点</h2>
          <span className="text-[11px] tracking-[0.2em] text-literary-wine uppercase">Daily</span>
        </div>

        {!ready && (
          <div className="mt-3 h-24 animate-pulse rounded-2xl bg-literary-sand/50" />
        )}

        {ready && items.length === 0 && (
          <div className="mt-3 rounded-2xl border border-dashed border-literary-wine/20 bg-white/50 p-6 text-center">
            <p className="text-sm text-literary-muted">
              今日暂无热点，先探索经典路线吧 →{' '}
              <Link href="/routes" className="font-semibold text-literary-wine hover:opacity-80">
                所有路线
              </Link>
            </p>
          </div>
        )}

        {ready && items.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {items.map(item => (
              <Link
                key={item.id}
                href={`/route/${item.routeSlug}`}
                className="group rounded-2xl border border-literary-wine/20 bg-white/70 p-4 transition-all hover:border-literary-wine hover:shadow-md"
              >
                <h3 className="font-serif text-sm font-bold text-literary-ink leading-snug group-hover:text-literary-wine">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-literary-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <span className="mt-2 inline-block text-[11px] font-semibold text-literary-wine">
                  去看看 →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
