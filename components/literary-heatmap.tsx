'use client'

import { useMemo } from 'react'
import { Guide } from '@/types'

interface LiteraryHeatmapProps {
  guide: Guide
}

/** 文学意象——固定意象词池（Mock，用于热力可视化） */
const IMAGERY_POOL = ['归隐', '离乱', '烟水', '故园', '登临', '别离', '市声', '风骨']

/** P2 · 文学意象热力图（纯 CSS + Mock 数据，仅作视觉演示） */
export function LiteraryHeatmap({ guide }: LiteraryHeatmapProps) {
  const spots = useMemo(() => guide.dayPlans.flatMap(d => d.spots), [guide])

  // 由景点生成热点：位置按索引分布，热度递减（Mock）
  const hotspots = useMemo(() => {
    const named = spots.slice(0, 6)
    return named.map((s, i) => {
      const weight = Math.max(0.35, 1 - i * 0.13)
      // 伪随机但确定的位置（避免 Math.random 带来的水合不一致）
      const x = 12 + ((i * 37 + s.name.length * 13) % 76)
      const y = 14 + ((i * 53 + s.name.length * 7) % 68)
      return {
        name: s.name,
        imagery: IMAGERY_POOL[(s.name.length + i) % IMAGERY_POOL.length],
        weight,
        x,
        y,
      }
    })
  }, [spots])

  const ranked = useMemo(() => [...hotspots].sort((a, b) => b.weight - a.weight), [hotspots])

  if (hotspots.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg text-ink-900 flex items-center gap-2">🔥 文学意象热力图</h3>
      <p className="text-xs text-ink-400 -mt-1">
        颜色越暖，表示该区域在文学作品中被提及、书写得越多（演示数据）。
      </p>

      {/* 热力版图 */}
      <div className="relative h-64 w-full rounded-3xl overflow-hidden border border-ink-100 bg-[#0f1424]">
        {/* 底纹网格 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#334 1px, transparent 1px), linear-gradient(90deg, #334 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* 热力光斑 */}
        {hotspots.map((h, i) => {
          const size = 90 + h.weight * 130
          return (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none mix-blend-screen"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, rgba(249,115,22,${0.55 * h.weight}) 0%, rgba(249,115,22,${0.28 * h.weight}) 35%, rgba(249,115,22,0) 70%)`,
              }}
            />
          )
        })}
        {/* 意象标签 */}
        {hotspots.map((h, i) => (
          <div
            key={`label-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-amber-200 whitespace-nowrap">
              {h.imagery}
            </span>
          </div>
        ))}
        <div className="absolute bottom-2 right-3 text-[10px] text-white/40">寻城 · 意象热力（Mock）</div>
      </div>

      {/* 意象排行 */}
      <div className="grid grid-cols-2 gap-2">
        {ranked.slice(0, 4).map((h, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2">
            <span className="text-xs text-ink-300 w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-800 truncate">
                {h.name} <span className="text-xuncheng-500">· {h.imagery}</span>
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-xuncheng-500"
                  style={{ width: `${Math.round(h.weight * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
