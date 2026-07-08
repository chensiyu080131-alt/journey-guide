'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { entryCards } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { EntryCard, EntryType } from '@/types'

const typeLabels: Record<EntryType, { label: string; icon: string }> = {
  '书籍': { label: '选一本书', icon: '📖' },
  '人物': { label: '选一个人', icon: '👤' },
  '目的地': { label: '选目的地', icon: '📍' },
}

export function EntryCards() {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <p className="text-center text-sm text-ink-400 mb-6">
        选择你的旅行入口
      </p>

      {entryCards.map((card) => (
        <EntryCardItem
          key={card.id}
          card={card}
          isHovered={hoveredId === card.id}
          onHover={() => setHoveredId(card.id)}
          onLeave={() => setHoveredId(null)}
          onClick={() => router.push(card.route)}
        />
      ))}

      {/* 底部目的地入口 */}
      <div className="pt-4 border-t border-ink-100">
        <p className="text-center text-xs text-ink-300 mb-3">或者直接搜目的地</p>
        <DestinationSearch />
      </div>
    </div>
  )
}

function EntryCardItem({
  card,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  card: EntryCard
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}) {
  const typeInfo = typeLabels[card.type]

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        'w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden',
        'bg-gradient-to-br',
        card.gradient,
        isHovered
          ? 'border-xuncheng-400 shadow-lg -translate-y-1 scale-[1.02]'
          : 'border-ink-100 shadow-sm hover:border-ink-200',
      )}
    >
      <div className="p-5">
        {/* 类型标签 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
            card.type === '书籍' ? 'bg-indigo/10 text-indigo' :
            card.type === '人物' ? 'bg-jade/10 text-jade' :
            'bg-xuncheng-100 text-xuncheng-700'
          )}>
            {typeInfo.icon} {typeInfo.label}
          </span>
        </div>

        {/* 标题 */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{card.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-ink-900 font-serif">{card.title}</h3>
            <p className="text-sm text-ink-500">{card.subtitle}</p>
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-ink-600 leading-relaxed mb-3">
          {card.desc}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/60 text-xs text-ink-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

function DestinationSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (!query.trim()) return
    const params = new URLSearchParams({
      city: query,
      days: '2',
      interests: '文化,美食',
      budget: '舒适',
    })
    router.push(`/guide/destination?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="输入城市名..."
        className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400 focus:border-transparent"
      />
      <button
        onClick={handleSearch}
        disabled={!query.trim()}
        className="px-4 py-2.5 rounded-xl bg-xuncheng-500 text-white text-sm font-medium hover:bg-xuncheng-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        🔍
      </button>
    </div>
  )
}
