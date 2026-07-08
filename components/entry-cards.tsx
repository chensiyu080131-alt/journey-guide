'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { entryCards } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { EntryCard, EntryType } from '@/types'

const filters: { id: 'all' | EntryType; label: string }[] = [
  { id: 'all', label: '全部路线' },
  { id: '书籍', label: '跟着书走' },
  { id: '人物', label: '跟着人走' },
]

export function EntryCards() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | EntryType>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = filter === 'all'
    ? entryCards
    : entryCards.filter(c => c.type === filter)

  const scroll = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      {/* 筛选 Tab */}
      <div className="flex flex-wrap justify-center gap-3">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn('xc-pill', filter === f.id ? 'xc-pill-active' : 'xc-pill-inactive')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 横向轮播 */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          onScroll={e => {
            const el = e.currentTarget
            const idx = Math.round(el.scrollLeft / 260)
            setActiveIndex(Math.min(idx, filtered.length - 1))
          }}
        >
          {filtered.map((card, i) => (
            <button
              key={card.id}
              onClick={() => router.push(card.route)}
              className="xc-image-card snap-start group"
            >
              <Image
                src={card.coverImage}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="240px"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  {card.type === '书籍' ? '跟着书走' : '跟着人走'} · {card.days}天
                </span>
                <h3 className="mt-1 text-xl font-serif font-bold">{card.title}</h3>
                <p className="mt-1 text-sm text-white/70 line-clamp-2">{card.subtitle}</p>
              </div>
              {i === activeIndex && (
                <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg">
                  →
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 轮播控制 */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {filtered.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-8 bg-charcoal' : 'w-4 bg-ink-200'
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="h-10 w-10 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition-colors"
              aria-label="上一张"
            >
              ←
            </button>
            <button
              onClick={() => scroll(1)}
              className="h-10 w-10 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition-colors"
              aria-label="下一张"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* 搜索 */}
      <DestinationSearch />
    </div>
  )
}

function DestinationSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const hotCities = ['常熟', '松阳', '腾冲', '婺源']

  const handleSearch = (city?: string) => {
    const target = (city || query).trim()
    if (!target) return
    const params = new URLSearchParams({
      city: target,
      days: '2',
      interests: '文化,美食',
      budget: '舒适',
    })
    router.push(`/guide/destination?${params.toString()}`)
  }

  return (
    <div className="rounded-3xl bg-ink-50 border border-ink-100 p-6 sm:p-8">
      <p className="text-center text-sm font-medium text-ink-500 mb-4">或者直接搜一座城</p>
      <div className="flex gap-3 max-w-lg mx-auto">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="输入城市名，如松阳..."
          className="flex-1 px-5 py-3.5 rounded-full border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          className="xc-pill bg-charcoal text-white hover:bg-charcoal-50 disabled:opacity-40 shrink-0"
        >
          生成攻略
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {hotCities.map(city => (
          <button
            key={city}
            onClick={() => handleSearch(city)}
            className="xc-pill xc-pill-inactive text-xs py-1.5 px-4"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}

export { entryCards as routeCards }
