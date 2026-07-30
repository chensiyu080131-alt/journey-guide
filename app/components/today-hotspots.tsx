'use client'

/**
 * 首页"今日热点"模块（Task3）
 * 读取 /hotspots.json，按当天 date 取 3 条，渲染卡片。
 * 无当天数据时显示占位，不报错。
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Hotspot {
  id: string
  date: string
  title: string
  description: string
  routeSlug: string
}

function todayStr(d: Date): string {
  // 本地日期 YYYY-MM-DD
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function TodayHotspots() {
  const [items, setItems] = useState<Hotspot[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/hotspots.json')
      .then(r => r.json())
      .then((all: Hotspot[]) => {
        const today = todayStr(new Date())
        const todayItems = all.filter(h => h.date === today).slice(0, 3)
        setItems(todayItems)
      })
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <section className="px-4 sm:px-6 pb-2 flex-shrink-0">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-lg font-bold text-literary-ink">今日热点</h2>
          <span className="text-[11px] tracking-[0.2em] text-literary-wine uppercase">Daily</span>
        </div>
        {!loaded ? (
          <div className="mt-3 h-24 animate-pulse rounded-2xl bg-literary-sand/50" />
        ) : items.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-literary-wine/20 bg-white/50 p-6 text-center">
            <p className="text-sm text-literary-muted">
              今日暂无热点，先探索经典路线吧 →{' '}
              <Link href="/routes" className="font-semibold text-literary-wine hover:opacity-80">所有路线</Link>
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {items.map(h => (
              <Link
                key={h.id}
                href={`/route/${h.routeSlug}/`}
                className="group rounded-2xl border border-literary-wine/20 bg-white/70 p-4 transition-all hover:border-literary-wine hover:shadow-md"
              >
                <h3 className="font-serif text-sm font-bold text-literary-ink leading-snug group-hover:text-literary-wine">
                  {h.title}
                </h3>
                <p className="mt-1.5 text-xs text-literary-muted leading-relaxed line-clamp-2">
                  {h.description}
                </p>
                <span className="mt-2 inline-block text-[11px] font-semibold text-literary-wine">去看看 →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
