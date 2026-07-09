'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { HomeCover } from '@/lib/home-covers'

function CoverMotif({ type, color }: { type: HomeCover['style']['motif']; color: string }) {
  const stroke = color
  const cls = 'w-24 h-24 sm:w-28 sm:h-28 opacity-35'
  if (type === 'city') {
    return (
      <svg viewBox="0 0 64 64" className={cls} fill="none">
        <path d="M12 48 L32 16 L52 48 Z" stroke={stroke} strokeWidth="1.2" />
        <rect x="26" y="36" width="12" height="12" stroke={stroke} strokeWidth="1" />
        <line x1="20" y1="48" x2="44" y2="48" stroke={stroke} strokeWidth="1" />
      </svg>
    )
  }
  if (type === 'note') {
    return (
      <svg viewBox="0 0 64 64" className={cls} fill="none">
        <ellipse cx="32" cy="44" rx="18" ry="6" stroke={stroke} strokeWidth="1.2" />
        <path d="M18 44 Q32 18 46 44" stroke={stroke} strokeWidth="1.5" />
        <circle cx="18" cy="44" r="2.5" fill={stroke} opacity="0.5" />
        <line x1="46" y1="44" x2="46" y2="28" stroke={stroke} strokeWidth="1.2" />
      </svg>
    )
  }
  if (type === 'game') {
    return (
      <svg viewBox="0 0 64 64" className={cls} fill="none">
        <rect x="14" y="22" width="36" height="24" rx="4" stroke={stroke} strokeWidth="1.2" />
        <circle cx="24" cy="34" r="4" stroke={stroke} strokeWidth="1" />
        <circle cx="40" cy="30" r="2" fill={stroke} opacity="0.5" />
        <circle cx="44" cy="36" r="2" fill={stroke} opacity="0.5" />
      </svg>
    )
  }
  if (type === 'landscape') {
    return (
      <svg viewBox="0 0 64 64" className={cls} fill="none">
        <path d="M8 48 Q20 28 32 48 Q44 28 56 48" stroke={stroke} strokeWidth="1.5" />
        <path d="M12 44 Q24 32 36 44" stroke={stroke} strokeWidth="1" opacity="0.6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className={cls} fill="none">
      <rect x="18" y="14" width="28" height="38" rx="1" stroke={stroke} strokeWidth="1.2" />
      <line x1="24" y1="22" x2="40" y2="22" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="28" x2="38" y2="28" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="34" x2="36" y2="34" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

function CoverCard({
  cover,
  isActive,
  onClick,
}: {
  cover: HomeCover
  isActive: boolean
  onClick: () => void
}) {
  const { style } = cover
  const isLiteraryBook = cover.id === 'renjianziwei'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'xc-cover-card snap-center flex-shrink-0 transition-all duration-500 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-literary-wine/40',
        isActive ? 'xc-cover-card-active' : 'xc-cover-card-inactive'
      )}
      aria-label={`选择${cover.title}`}
      aria-pressed={isActive}
    >
      <div
        className={cn(
          'relative transition-transform duration-500',
          isActive && 'xc-cover-inner-active'
        )}
      >
        <div
          className="absolute left-0 top-2 bottom-2 w-4 sm:w-5 rounded-l-md"
          style={{
            background: isActive && isLiteraryBook ? '#6B3333' : style.border,
            boxShadow: isActive ? 'inset -2px 0 6px rgba(0,0,0,0.15)' : undefined,
          }}
        />
        <div
          className={cn(
            'relative ml-3 sm:ml-4 rounded-r-md border overflow-hidden',
            isActive && 'shadow-xl'
          )}
          style={{
            background: isActive && isLiteraryBook
              ? 'linear-gradient(155deg, #A65D5D 0%, #8B4545 55%, #6B3333 100%)'
              : style.bg,
            borderColor: isActive && isLiteraryBook ? '#6B333340' : `${style.border}40`,
            aspectRatio: '3 / 4.2',
            boxShadow: isActive
              ? '8px 12px 32px rgba(107, 51, 51, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '4px 6px 16px rgba(61, 46, 46, 0.08)',
          }}
        >
          <div
            className="absolute top-4 left-4 w-5 h-5 border-t border-l opacity-25"
            style={{ borderColor: isActive && isLiteraryBook ? '#fff' : style.border }}
          />
          <div
            className="absolute top-4 right-4 w-5 h-5 border-t border-r opacity-25"
            style={{ borderColor: isActive && isLiteraryBook ? '#fff' : style.border }}
          />
          <div
            className="absolute bottom-4 left-4 w-5 h-5 border-b border-l opacity-25"
            style={{ borderColor: isActive && isLiteraryBook ? '#fff' : style.border }}
          />
          <div
            className="absolute bottom-4 right-4 w-5 h-5 border-b border-r opacity-25"
            style={{ borderColor: isActive && isLiteraryBook ? '#fff' : style.border }}
          />

          <div className="flex flex-col items-center justify-between h-full py-8 sm:py-10 px-5 sm:px-6">
            <div className="text-center">
              <p
                className="text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{
                  color: isActive && isLiteraryBook ? 'rgba(255,255,255,0.65)' : style.subtitle,
                }}
              >
                {cover.category}
              </p>
              <h3
                className="font-serif font-semibold tracking-widest leading-snug"
                style={{
                  color: isActive && isLiteraryBook ? '#FFFFFF' : style.title,
                  fontSize: isActive ? '1.5rem' : '1.2rem',
                }}
              >
                {cover.title}
              </h3>
              <p
                className="mt-3 text-xs sm:text-sm tracking-wide"
                style={{
                  color: isActive && isLiteraryBook ? 'rgba(255,255,255,0.78)' : style.subtitle,
                }}
              >
                {cover.subtitle}
              </p>
            </div>

            <CoverMotif
              type={style.motif}
              color={isActive && isLiteraryBook ? 'rgba(255,255,255,0.45)' : style.border}
            />

            {isActive && (
              <div
                className={cn(
                  'w-10 h-10 rounded-md flex items-center justify-center',
                  isLiteraryBook
                    ? 'bg-white/15 border border-white/25'
                    : 'border border-literary-wine/30 bg-literary-paper/50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-serif leading-none',
                    isLiteraryBook ? 'text-white' : 'text-literary-wine'
                  )}
                >
                  {isLiteraryBook ? '味' : '寻'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

interface HomeCoverCarouselProps {
  covers: HomeCover[]
}

export function HomeCoverCarousel({ covers }: HomeCoverCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [covers])

  const scrollTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.children[index] as HTMLElement | undefined
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
    setActiveIndex(index)
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || el.children.length === 0) return
    const center = el.scrollLeft + el.clientWidth / 2
    let closest = 0
    let minDist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const card = child as HTMLElement
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(center - cardCenter)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    })
    setActiveIndex(closest)
  }

  if (covers.length === 0) return null

  const activeCover = covers[activeIndex] ?? covers[0]

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4">
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => scrollTo((activeIndex - 1 + covers.length) % covers.length)}
          className="xc-cover-arrow absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10"
          aria-label="上一个"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-10 sm:gap-14 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-20 sm:px-28 py-8 touch-pan-x min-h-[400px] sm:min-h-[460px]"
        >
          {covers.map((cover, i) => (
            <CoverCard
              key={cover.id}
              cover={cover}
              isActive={i === activeIndex}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTo((activeIndex + 1) % covers.length)}
          className="xc-cover-arrow absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10"
          aria-label="下一个"
        >
          ›
        </button>
      </div>

      <div className="text-center mt-2 px-4 animate-fade-in" key={activeCover.id}>
        <p className="text-[11px] text-literary-wine tracking-[0.2em] font-serif">
          {activeCover.category} · 精选
        </p>
        <h2 className="mt-1 text-lg sm:text-xl font-serif font-semibold text-literary-ink">
          {activeCover.title}
        </h2>
        <p className="mt-1 text-xs text-literary-muted">{activeCover.subtitle}</p>
      </div>

      <div className="flex gap-2.5 mt-5">
        {covers.map((cover, i) => (
          <button
            key={cover.id}
            type="button"
            onClick={() => scrollTo(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === activeIndex
                ? 'w-8 h-2 bg-literary-wine'
                : 'w-2 h-2 bg-literary-sand hover:bg-literary-wine/30'
            )}
            aria-label={cover.title}
          />
        ))}
      </div>

      <div className="mt-8 h-14 flex items-center justify-center gap-3">
        <Link
          href={`${activeCover.route}?cat=${activeCover.category}`}
          className="xc-explore-btn animate-fade-in"
        >
          开始探索
          <span className="opacity-80">→</span>
        </Link>
      </div>
    </div>
  )
}
