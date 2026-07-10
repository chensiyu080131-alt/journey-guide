'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { HomeCover, CoverCategory } from '@/lib/home-covers'

/* ─── 小型封面卡（堆叠中的单本） ─── */
function MiniCoverCard({ cover, index, total, isExpanded }: {
  cover: HomeCover
  index: number
  total: number
  isExpanded: boolean
}) {
  const { style } = cover
  const isLiteraryBook = cover.id === 'renjianziwei'

  // 堆叠偏移：未展开时紧密堆叠，展开时扇形散开
  const stackOffset = isExpanded
    ? { rotate: (index - (total - 1) / 2) * 8, y: index * 8 }
    : { rotate: (index - (total - 1) / 2) * 3, y: index * 3 }
  const zIndex = total - index + (isExpanded ? 10 : 0)

  return (
    <div
      className="absolute transition-all duration-500 ease-out"
      style={{
        transform: `rotate(${stackOffset.rotate}deg) translateY(${stackOffset.y}px)`,
        zIndex,
        width: isExpanded ? '160px' : '140px',
        left: '50%',
        marginLeft: isExpanded ? '-80px' : '-70px',
      }}
    >
      <div className="relative rounded-md overflow-hidden shadow-lg"
        style={{
          background: isLiteraryBook
            ? 'linear-gradient(155deg, #A65D5D 0%, #8B4545 55%, #6B3333 100%)'
            : style.bg,
          aspectRatio: '3 / 4.2',
          border: `1px solid ${style.border}30`,
        }}
      >
        {cover.image && (
          <img src={cover.image} alt={cover.title}
            className="absolute inset-0 w-full h-full object-cover z-10" />
        )}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l opacity-20"
          style={{ borderColor: style.border }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r opacity-20"
          style={{ borderColor: style.border }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l opacity-20"
          style={{ borderColor: style.border }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r opacity-20"
          style={{ borderColor: style.border }} />

        <div className="flex flex-col items-center justify-center h-full py-4 px-3 z-20 relative">
          <p className="text-[8px] tracking-[0.15em] uppercase mb-1"
            style={{ color: isLiteraryBook ? 'rgba(255,255,255,0.6)' : style.subtitle }}>
            {cover.category}
          </p>
          <h4 className="font-serif font-semibold text-center leading-tight"
            style={{
              color: isLiteraryBook ? '#fff' : style.title,
              fontSize: isExpanded ? '1rem' : '0.85rem',
            }}>
            {cover.title}
          </h4>
          <p className="mt-1 text-[9px] text-center tracking-wide"
            style={{ color: isLiteraryBook ? 'rgba(255,255,255,0.7)' : style.subtitle }}>
            {cover.subtitle}
          </p>
        </div>

        {/* 左侧书脊 */}
        <div className="absolute left-0 top-1 bottom-1 w-2.5 rounded-l-md"
          style={{
            background: isLiteraryBook ? '#6B3333' : style.border,
            boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.1)',
          }} />
      </div>
    </div>
  )
}

/* ─── 分类堆叠组 ─── */
function CoverStack({ category, covers, isActive, onClick }: {
  category: CoverCategory
  covers: HomeCover[]
  isActive: boolean
  onClick: () => void
}) {
  // 每个堆叠取最多4本
  const displayCovers = covers.slice(0, 4)

  return (
    <div
      className={cn(
        'flex flex-col items-center cursor-pointer transition-all duration-500 ease-out',
        isActive ? 'scale-110' : 'scale-100 hover:scale-105'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      aria-label={`${category}封面堆叠`}
      aria-pressed={isActive}
    >
      {/* 堆叠区域 */}
      <div className="relative"
        style={{
          width: isActive ? '240px' : '200px',
          height: isActive ? '320px' : '260px',
        }}
      >
        {displayCovers.map((cover, i) => (
          <MiniCoverCard
            key={cover.id}
            cover={cover}
            index={i}
            total={displayCovers.length}
            isExpanded={isActive}
          />
        ))}
      </div>

      {/* 分类标签 */}
      <div className={cn(
        'mt-4 text-center transition-all duration-300',
        isActive ? 'opacity-100' : 'opacity-60'
      )}>
        <p className={cn(
          'text-sm font-serif font-semibold tracking-wider',
          isActive ? 'text-literary-wine' : 'text-literary-ink'
        )}>
          {category}
        </p>
        <p className="text-[10px] text-literary-muted mt-0.5">
          {covers.length} 本
        </p>
      </div>
    </div>
  )
}

/* ─── 展开后的封面网格 ─── */
function ExpandedGrid({ covers, category, onBack }: {
  covers: HomeCover[]
  category: CoverCategory
  onBack: () => void
}) {
  const [hoverId, setHoverId] = useState<string | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-literary-wine text-sm font-serif mb-6
                   hover:text-literary-wine-dark transition-colors"
      >
        <span>←</span>
        <span>返回全部</span>
      </button>

      <h3 className="text-lg font-serif font-semibold text-literary-ink mb-1">
        {category}
      </h3>
      <p className="text-xs text-literary-muted mb-6">
        {covers.length} 本文化载体，点击封面开始探索
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {covers.map((cover) => {
          const { style } = cover
          const isLiteraryBook = cover.id === 'renjianziwei'
          const isHover = hoverId === cover.id
          const isBookRoute = cover.category === '书籍'

          return (
            <Link
              key={cover.id}
              href={`${cover.route}?cat=${cover.category}`}
              className={cn(
                'group block transition-all duration-300',
                isHover && 'scale-[1.03]'
              )}
              onMouseEnter={() => setHoverId(cover.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <div className="relative rounded-md overflow-hidden shadow-md
                            group-hover:shadow-xl transition-shadow duration-300"
                style={{
                  background: isLiteraryBook
                    ? 'linear-gradient(155deg, #A65D5D 0%, #8B4545 55%, #6B3333 100%)'
                    : style.bg,
                  aspectRatio: '3 / 4.2',
                  border: `1px solid ${style.border}30`,
                }}
              >
                {cover.image && (
                  <img src={cover.image} alt={cover.title}
                    className="absolute inset-0 w-full h-full object-cover z-10" />
                )}

                {/* 左侧书脊 */}
                <div className="absolute left-0 top-1 bottom-1 w-3.5 rounded-l-md z-20"
                  style={{
                    background: isLiteraryBook ? '#6B3333' : style.border,
                    boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.12)',
                  }} />

                <div className="absolute top-3 left-5 w-4 h-4 border-t border-l opacity-20 z-20"
                  style={{ borderColor: style.border }} />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r opacity-20 z-20"
                  style={{ borderColor: style.border }} />
                <div className="absolute bottom-3 left-5 w-4 h-4 border-b border-l opacity-20 z-20"
                  style={{ borderColor: style.border }} />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r opacity-20 z-20"
                  style={{ borderColor: style.border }} />

                <div className="flex flex-col items-center justify-center h-full py-6 px-4 z-20 relative">
                  <p className="text-[9px] tracking-[0.15em] uppercase mb-1.5"
                    style={{ color: isLiteraryBook ? 'rgba(255,255,255,0.6)' : style.subtitle }}>
                    {cover.category}
                  </p>
                  <h4 className="font-serif font-semibold text-center leading-tight text-base"
                    style={{ color: isLiteraryBook ? '#fff' : style.title }}>
                    {cover.title}
                  </h4>
                  <p className="mt-2 text-[10px] text-center tracking-wide"
                    style={{ color: isLiteraryBook ? 'rgba(255,255,255,0.7)' : style.subtitle }}>
                    {cover.subtitle}
                  </p>

                  {isBookRoute && (
                    <div className="mt-4 px-4 py-1.5 rounded-full text-[10px] font-serif tracking-wide
                                  bg-literary-wine/80 text-white opacity-0 group-hover:opacity-100
                                  transition-opacity duration-300">
                      开始探索 →
                    </div>
                  )}
                </div>

                {/* 非书籍类别：建设中遮罩 */}
                {!isBookRoute && (
                  <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-white/90 font-serif tracking-wide">建设中</p>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 主组件 ─── */
interface HomeCoverCarouselProps {
  covers: HomeCover[]
}

export function HomeCoverCarousel({ covers }: HomeCoverCarouselProps) {
  const [activeCategory, setActiveCategory] = useState<CoverCategory | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<CoverCategory | null>(null)

  useEffect(() => {
    setActiveCategory(null)
    setExpandedCategory(null)
  }, [covers])

  if (covers.length === 0) return null

  // 按类别分组
  const grouped = covers.reduce<Record<CoverCategory, HomeCover[]>>((acc, cover) => {
    if (!acc[cover.category]) acc[cover.category] = []
    acc[cover.category].push(cover)
    return acc
  }, {} as Record<CoverCategory, HomeCover[]>)

  const categories = Object.keys(grouped) as CoverCategory[]

  // 展开某个类别
  if (expandedCategory && grouped[expandedCategory]) {
    return (
      <div className="flex items-center justify-center w-full px-4">
        <ExpandedGrid
          covers={grouped[expandedCategory]}
          category={expandedCategory}
          onBack={() => { setExpandedCategory(null); setActiveCategory(null) }}
        />
      </div>
    )
  }

  // 堆叠视图
  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-center gap-6 sm:gap-10 lg:gap-14 px-4">
        {categories.map((cat) => (
          <CoverStack
            key={cat}
            category={cat}
            covers={grouped[cat]}
            isActive={activeCategory === cat}
            onClick={() => {
              if (activeCategory === cat) {
                // 双击展开
                setExpandedCategory(cat)
              } else {
                setActiveCategory(cat)
              }
            }}
          />
        ))}
      </div>

      {/* 提示文字 */}
      <p className="mt-6 text-[10px] text-literary-muted tracking-wide font-serif animate-fade-in">
        点击类别展开堆叠 · 再次点击查看全部
      </p>
    </div>
  )
}
