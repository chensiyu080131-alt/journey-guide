'use client'

import { useState } from 'react'
import { RenjianShell } from '@/components/renjian/renjian-shell'
import { cities, tastes } from '@/lib/renjian-data'
import { cn } from '@/lib/utils'

export default function MapPage() {
  const [active, setActive] = useState<string | null>(null)

  const toggle = (id: string) => setActive(cur => (cur === id ? null : id))

  return (
    <RenjianShell>
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">方案 B · 全国美食地图版</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">
            一张用<span className="text-vermilion">食物</span>标注的中国地图
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-sm text-ink-500">
            一本书走成一张地图。汪曾祺笔下的 18 座城市，按书中食物标注。用「五味」筛选，看哪座城偏酸、哪座城嗜辣。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12">
          {/* 五味筛选 */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <button onClick={() => setActive(null)}
              className={cn('rounded-full border px-4 py-2 text-sm transition-colors',
                active === null ? 'border-charcoal bg-charcoal text-white' : 'border-ink-200 bg-white text-ink-500 hover:border-vermilion hover:text-vermilion')}>
              全部
            </button>
            {tastes.map(t => (
              <button key={t.id} onClick={() => toggle(t.id)}
                className={cn('rounded-full border px-4 py-2 font-serif text-base tracking-widest transition-colors',
                  active === t.id ? 'border-vermilion bg-vermilion text-white' : 'border-ink-200 bg-white text-ink-500 hover:border-vermilion hover:text-vermilion')}>
                <span className="mr-1">{t.em}</span>{t.id}
              </button>
            ))}
          </div>

          {/* 城市网格 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(c => {
              const hit = !active || c.tastes.includes(active)
              return (
                <div key={c.id} className={cn(
                  'rounded-2xl border bg-white p-5 transition-all',
                  active && hit ? 'border-vermilion shadow-md' : 'border-ink-100',
                  active && !hit && 'opacity-30 grayscale')}>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-serif text-lg font-bold text-charcoal">{c.icon} {c.name}</h4>
                    {c.tag && (
                      <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full',
                        c.home ? 'bg-vermilion/10 text-vermilion' : 'bg-ink-100 text-ink-500')}>{c.tag}</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-[13px] text-ink-500 list-disc pl-5">
                    {c.foods.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.tastes.map(t => (
                      <span key={t} className={cn('text-[11px] px-2 py-0.5 rounded-md',
                        active === t ? 'bg-vermilion text-white' : 'bg-paper text-ink-400')}>{t}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-sm text-ink-400">💡 点击上方「五味」筛选，地图会高亮对应口味的城市，其余变淡。18 座城市，各有所归。</p>
        </div>
      </section>
    </RenjianShell>
  )
}
