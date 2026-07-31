'use client'

import { useEffect, useState } from 'react'

/** P1 · 内容资产看板（有 DB 时读真实统计，否则标注为文件回退） */
export function AssetBoard() {
  const [stats, setStats] = useState<{
    source: string
    cities: number
    guides: number
    spots: number
    books: number
    verifiedSpots: number
    databaseConfigured: boolean
  } | null>(null)

  useEffect(() => {
    fetch('/api/content?stats=1')
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const kpis = stats
    ? [
        {
          emoji: '🏙️',
          label: '城市',
          value: String(stats.cities),
          hint: stats.source === 'database' ? '来自 PostgreSQL' : '文件回退统计',
        },
        {
          emoji: '🗺️',
          label: '攻略路线',
          value: String(stats.guides),
          hint: '已发布 / 可展示',
        },
        {
          emoji: '📍',
          label: '点位',
          value: String(stats.spots),
          hint: `其中核验 ${stats.verifiedSpots}`,
        },
        {
          emoji: '📚',
          label: '城市书单条目',
          value: String(stats.books),
          hint: stats.databaseConfigured ? '可编辑' : '待接入 DATABASE_URL',
        },
      ]
    : [
        { emoji: '🏙️', label: '城市', value: '…', hint: '加载中' },
        { emoji: '🗺️', label: '攻略路线', value: '…', hint: '加载中' },
        { emoji: '📍', label: '点位', value: '…', hint: '加载中' },
        { emoji: '📚', label: '城市书单条目', value: '…', hint: '加载中' },
      ]

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-serif font-bold text-ink-900">📊 内容资产看板</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div
            key={k.label}
            className="rounded-2xl border border-ink-100 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="text-xl">{k.emoji}</div>
            <div className="mt-2 text-2xl font-serif font-bold text-charcoal">{k.value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{k.label}</div>
            <div className="text-[11px] text-ink-300 mt-1">{k.hint}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-300">
        {stats?.databaseConfigured
          ? '统计来自数据库；可在下方内容编辑器修改点位后刷新查看。'
          : '尚未配置 DATABASE_URL 时显示文件侧统计；接入 Neon/Supabase 并 seed 后即为真实资产数。'}
      </p>
    </div>
  )
}
