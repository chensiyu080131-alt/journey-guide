'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { entryCards } from '@/lib/mock-data'
import { recognizeAndGenerateGuide } from '@/lib/llm-service'
import { cn } from '@/lib/utils'
import { EntryType } from '@/types'

const filters: { id: 'all' | EntryType; label: string }[] = [
  { id: 'all', label: '全部路线' },
  { id: '书籍', label: '跟着书走' },
  { id: '人物', label: '跟着人走' },
]

function buildDestinationUrl(city: string) {
  const params = new URLSearchParams({
    city,
    days: '2',
    interests: '文化,美食',
    budget: '舒适',
  })
  return `/guide/destination?${params.toString()}`
}

export function EntryCards() {
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
      <div className="flex flex-wrap justify-center gap-3">
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn('xc-pill', filter === f.id ? 'xc-pill-active' : 'xc-pill-inactive')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x"
          onScroll={e => {
            const el = e.currentTarget
            const idx = Math.round(el.scrollLeft / 260)
            setActiveIndex(Math.min(idx, filtered.length - 1))
          }}
        >
          {filtered.map((card, i) => (
            <Link
              key={card.id}
              href={card.route}
              className="xc-image-card snap-start group block no-underline"
              draggable={false}
            >
              <Image
                src={card.coverImage}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                sizes="240px"
                unoptimized
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white pointer-events-none">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  {card.type === '书籍' ? '跟着书走' : '跟着人走'} · {card.days}天
                </span>
                <h3 className="mt-1 text-xl font-serif font-bold">{card.title}</h3>
                <p className="mt-1 text-sm text-white/70 line-clamp-2">{card.subtitle}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-xuncheng-300">
                  进入路线 →
                </span>
              </div>
              {i === activeIndex && (
                <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg pointer-events-none">
                  →
                </div>
              )}
            </Link>
          ))}
        </div>

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
              type="button"
              onClick={() => scroll(-1)}
              className="h-10 w-10 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition-colors"
              aria-label="上一张"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="h-10 w-10 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition-colors"
              aria-label="下一张"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <DestinationSearch />
      <BookTextRecognition />
    </div>
  )
}

function DestinationSearch() {
  const [query, setQuery] = useState('')
  const hotCities = ['常熟', '松阳', '腾冲', '婺源']
  const searchHref = query.trim() ? buildDestinationUrl(query.trim()) : '#'

  return (
    <div className="rounded-3xl bg-ink-50 border border-ink-100 p-6 sm:p-8">
      <p className="text-center text-sm font-medium text-ink-500 mb-4">或者直接搜一座城</p>
      <div className="flex gap-3 max-w-lg mx-auto">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && query.trim()) {
              window.location.href = buildDestinationUrl(query.trim())
            }
          }}
          placeholder="输入城市名，如松阳..."
          className="flex-1 px-5 py-3.5 rounded-full border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        {query.trim() ? (
          <Link href={searchHref} className="xc-pill bg-charcoal text-white hover:bg-charcoal-50 shrink-0 no-underline">
            生成攻略
          </Link>
        ) : (
          <span className="xc-pill bg-charcoal text-white opacity-40 shrink-0 cursor-not-allowed">
            生成攻略
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {hotCities.map(city => (
          <Link
            key={city}
            href={buildDestinationUrl(city)}
            className="xc-pill xc-pill-inactive text-xs py-1.5 px-4 no-underline"
          >
            {city}
          </Link>
        ))}
      </div>
    </div>
  )
}

function BookTextRecognition() {
  const router = useRouter()
  const [bookText, setBookText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRecognize = async () => {
    if (!bookText.trim()) return
    setLoading(true)
    setError(null)

    try {
      const guide = await recognizeAndGenerateGuide(bookText.trim())
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('xuncheng-recognized-guide', JSON.stringify(guide))
      }
      router.push('/guide/destination?mode=recognized')
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl bg-ink-50 border border-ink-100 p-6 sm:p-8 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">📖</span>
        <span className="text-xs text-ink-500 font-medium">粘贴书籍片段，AI 识别地点并生成路线</span>
      </div>
      <textarea
        value={bookText}
        onChange={e => setBookText(e.target.value)}
        placeholder={'例如："那日到了常熟，先去了虞山脚下的兴福寺，寺旁有一老面馆..."\n或粘贴任意书中的文字段落'}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400 focus:border-transparent resize-none"
      />
      {error && (
        <p className="text-xs text-vermilion">{error}</p>
      )}
      <button
        type="button"
        onClick={handleRecognize}
        disabled={loading || !bookText.trim()}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          loading
            ? 'bg-ink-100 text-ink-400 cursor-wait'
            : 'bg-xuncheng-500 text-white hover:bg-xuncheng-600 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {loading ? '🔍 识别中...' : '📝 识别并生成路线'}
      </button>
    </div>
  )
}

export { entryCards as routeCards }
