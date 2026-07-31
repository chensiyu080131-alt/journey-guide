'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  listRoutesFromSupabase,
  type RouteDetail,
} from '@/lib/route-detail-data'

const CATEGORY_LABEL: Record<string, string> = {
  scenic: '经典名胜',
  literary: '文学名篇',
  figure: '人物行旅',
}

const SEASON_LABEL: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export function RouteCatalog({ initialRoutes }: { initialRoutes: RouteDetail[] }) {
  const [routes, setRoutes] = useState(initialRoutes)
  const [city, setCity] = useState<string>('全部')
  const [category, setCategory] = useState<string>('全部')
  const [season, setSeason] = useState<string>('全部')

  useEffect(() => {
    let cancelled = false
    void listRoutesFromSupabase().then(remote => {
      if (remote && !cancelled) setRoutes(remote)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const cities = useMemo(() => {
    const set = new Set(routes.map(r => r.city).filter(Boolean))
    return ['全部', ...Array.from(set).sort()]
  }, [routes])

  const categories = useMemo(() => {
    const set = new Set(routes.map(r => r.category).filter(Boolean) as string[])
    return ['全部', ...Array.from(set)]
  }, [routes])

  const seasons = useMemo(() => {
    const set = new Set(routes.map(r => r.season).filter(Boolean) as string[])
    return ['全部', ...Array.from(set)]
  }, [routes])

  const filtered = useMemo(() => {
    return routes.filter(r => {
      if (city !== '全部' && r.city !== city) return false
      if (category !== '全部' && r.category !== category) return false
      if (season !== '全部' && r.season !== season) return false
      return true
    })
  }, [routes, city, category, season])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <FilterRow label="城市" options={cities} value={city} onChange={setCity} />
        <FilterRow
          label="分类"
          options={categories}
          value={category}
          onChange={setCategory}
          format={v => (v === '全部' ? v : CATEGORY_LABEL[v] ?? v)}
        />
        <FilterRow
          label="季节"
          options={seasons}
          value={season}
          onChange={setSeason}
          format={v => (v === '全部' ? v : SEASON_LABEL[v] ?? v)}
        />
      </div>

      <p className="mt-6 text-sm text-ink-400 font-serif">
        共 {filtered.length} 条可打卡路线
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(route => (
          <li key={route.slug}>
            <Link
              href={`/route/${route.slug}`}
              className="block h-full rounded-2xl border border-ink-100 bg-white p-5 transition-shadow hover:border-vermilion/40 hover:shadow-md"
            >
              <div className="flex flex-wrap gap-2">
                {route.category && (
                  <span className="text-[10px] tracking-wider text-vermilion border border-vermilion/25 rounded-full px-2 py-0.5">
                    {CATEGORY_LABEL[route.category] ?? route.category}
                  </span>
                )}
                {route.season && (
                  <span className="text-[10px] tracking-wider text-ink-400 border border-ink-100 rounded-full px-2 py-0.5">
                    {SEASON_LABEL[route.season] ?? route.season}
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-serif text-lg font-bold text-charcoal leading-snug">
                {route.title}
              </h2>
              <p className="mt-1 text-xs text-ink-400">
                {route.author} · {route.city} · {route.book}
              </p>
              <p className="mt-3 text-sm text-ink-500 leading-relaxed line-clamp-3">
                {route.plainExplain || route.summary}
              </p>
              <p className="mt-4 text-xs text-vermilion font-medium">
                {route.points.length} 个打卡点 →
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-400 font-serif">没有匹配的路线，试试换个筛选条件。</p>
      )}
    </div>
  )
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  format?: (v: string) => string
}) {
  if (options.length <= 1) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-ink-400 w-10 shrink-0">{label}</span>
      {options.map(opt => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-ink-500 border-ink-100 hover:border-ink-300'
            }`}
          >
            {format ? format(opt) : opt}
          </button>
        )
      })}
    </div>
  )
}
