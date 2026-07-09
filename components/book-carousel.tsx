'use client'

import { useState } from 'react'
import Link from 'next/link'
import { entryCards } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const bookStyles: Record<string, {
  coverTitle: string
  bg: string
  border: string
  accent: string
  pattern: 'pipa' | 'ship' | 'portrait' | 'reed'
}> = {
  qianliu: {
    coverTitle: '柳如是别传',
    bg: 'linear-gradient(180deg, #F5E6D3 0%, #E8D5C0 100%)',
    border: '#8B6914',
    accent: '#A0522D',
    pattern: 'pipa',
  },
  niehaifeng: {
    coverTitle: '孽海花',
    bg: 'linear-gradient(180deg, #D4E4ED 0%, #A8C4D4 100%)',
    border: '#4A6B7C',
    accent: '#2C5266',
    pattern: 'ship',
  },
  wengtonghe: {
    coverTitle: '翁同龢传',
    bg: 'linear-gradient(180deg, #F0EDE6 0%, #DDD8CE 100%)',
    border: '#6B5B4F',
    accent: '#4A3F35',
    pattern: 'portrait',
  },
  shajiabang: {
    coverTitle: '沙家浜',
    bg: 'linear-gradient(180deg, #E8F0E4 0%, #C5D9BC 100%)',
    border: '#4A6741',
    accent: '#2D4A28',
    pattern: 'reed',
  },
}

const displayOrder = ['qianliu', 'niehaifeng', 'wengtonghe', 'shajiabang']

function BookPattern({ type }: { type: 'pipa' | 'ship' | 'portrait' | 'reed' }) {
  if (type === 'pipa') {
    return (
      <svg viewBox="0 0 80 120" className="w-full h-full opacity-60" fill="none">
        <ellipse cx="40" cy="70" rx="28" ry="8" stroke="#A0522D" strokeWidth="1.5" />
        <path d="M12 70 Q40 30 68 70" stroke="#A0522D" strokeWidth="2" fill="none" />
        <circle cx="12" cy="70" r="4" fill="#A0522D" />
        <line x1="68" y1="70" x2="68" y2="50" stroke="#A0522D" strokeWidth="1.5" />
      </svg>
    )
  }
  if (type === 'ship') {
    return (
      <svg viewBox="0 0 80 120" className="w-full h-full opacity-70" fill="none">
        <path d="M10 80 Q40 60 70 80 L65 90 Q40 75 15 90 Z" fill="#2C5266" opacity="0.3" />
        <path d="M25 75 L40 45 L55 75 Z" fill="#4A6B7C" opacity="0.5" />
        <circle cx="60" cy="35" r="12" fill="#D4E4ED" stroke="#4A6B7C" strokeWidth="1" />
      </svg>
    )
  }
  if (type === 'portrait') {
    return (
      <svg viewBox="0 0 80 120" className="w-full h-full opacity-60" fill="none">
        <rect x="20" y="25" width="40" height="50" rx="2" stroke="#6B5B4F" strokeWidth="1.5" fill="#F0EDE6" />
        <circle cx="40" cy="42" r="10" stroke="#6B5B4F" strokeWidth="1" fill="none" />
        <path d="M28 68 Q40 58 52 68" stroke="#6B5B4F" strokeWidth="1" fill="none" />
        <line x1="15" y1="85" x2="65" y2="85" stroke="#6B5B4F" strokeWidth="0.8" />
        <line x1="20" y1="90" x2="60" y2="90" stroke="#6B5B4F" strokeWidth="0.8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 80 120" className="w-full h-full opacity-60" fill="none">
      <path d="M10 90 Q25 50 40 90 Q55 50 70 90" stroke="#2D4A28" strokeWidth="2" fill="none" />
      <path d="M15 85 Q30 55 45 85 Q60 55 75 85" stroke="#4A6741" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function BookCoverVisual({ bookId, size }: { bookId: string; size: 'side' | 'center' }) {
  const style = bookStyles[bookId]
  if (!style) return null

  const isCenter = size === 'center'

  return (
    <div
      className={cn(
        'relative flex-shrink-0 transition-all duration-500 ease-out',
        isCenter ? 'w-[168px] sm:w-[200px]' : 'w-[120px] sm:w-[140px]'
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2.5 sm:w-3 rounded-l-sm"
        style={{ background: style.border }}
      />
      <div
        className={cn(
          'relative ml-2.5 sm:ml-3 rounded-r-md border-2 overflow-hidden',
          isCenter ? 'shadow-xl' : 'shadow-md'
        )}
        style={{
          background: style.bg,
          borderColor: style.border,
          aspectRatio: '2 / 3',
          boxShadow: isCenter
            ? '4px 6px 16px rgba(0,0,0,0.18)'
            : '2px 3px 10px rgba(0,0,0,0.12)',
        }}
      >
        <div className="absolute top-2 left-3 w-3 h-3 border-t border-l" style={{ borderColor: style.border }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: style.border }} />
        <div className="absolute bottom-2 left-3 w-3 h-3 border-b border-l" style={{ borderColor: style.border }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: style.border }} />

        <div className="relative pt-5 px-2 text-center">
          <h3
            className="font-serif font-bold leading-tight tracking-wider"
            style={{ color: style.accent, fontSize: isCenter ? '1rem' : '0.85rem' }}
          >
            {style.coverTitle}
          </h3>
        </div>

        <div className="relative mx-3 mt-2" style={{ height: isCenter ? '55%' : '50%' }}>
          <BookPattern type={style.pattern} />
        </div>

        <div className="absolute bottom-4 left-3 right-3 h-px" style={{ background: style.border, opacity: 0.4 }} />
      </div>
    </div>
  )
}

export function BookCarousel() {
  const books = displayOrder
    .map(id => entryCards.find(c => c.id === id))
    .filter(Boolean) as typeof entryCards

  const [activeIndex, setActiveIndex] = useState(1)

  const prev = () => setActiveIndex(i => (i - 1 + books.length) % books.length)
  const next = () => setActiveIndex(i => (i + 1) % books.length)

  const prevIndex = (activeIndex - 1 + books.length) % books.length
  const nextIndex = (activeIndex + 1) % books.length
  const activeBook = books[activeIndex]

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex items-end justify-center w-full max-w-xl mx-auto">
        <button
          type="button"
          onClick={prev}
          className="xc-carousel-arrow absolute -left-2 sm:left-0 z-30"
          aria-label="上一本"
        >
          ‹
        </button>

        <div className="flex items-end justify-center gap-3 sm:gap-5 px-14 sm:px-16">
          <button
            type="button"
            onClick={prev}
            className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
            aria-label={`上一本：${bookStyles[books[prevIndex].id]?.coverTitle}`}
          >
            <BookCoverVisual bookId={books[prevIndex].id} size="side" />
          </button>

          <Link
            href={activeBook.route}
            className="no-underline hover:scale-[1.02] transition-transform duration-300 z-20"
            aria-label={`进入${bookStyles[activeBook.id]?.coverTitle}`}
          >
            <BookCoverVisual bookId={books[activeIndex].id} size="center" />
          </Link>

          <button
            type="button"
            onClick={next}
            className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
            aria-label={`下一本：${bookStyles[books[nextIndex].id]?.coverTitle}`}
          >
            <BookCoverVisual bookId={books[nextIndex].id} size="side" />
          </button>
        </div>

        <button
          type="button"
          onClick={next}
          className="xc-carousel-arrow absolute -right-2 sm:right-0 z-30"
          aria-label="下一本"
        >
          ›
        </button>
      </div>

      <div className="flex gap-2 mt-8">
        {books.map((book, i) => (
          <button
            key={book.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === activeIndex ? 'w-6 bg-charcoal' : 'w-1.5 bg-ink-300'
            )}
            aria-label={bookStyles[book.id]?.coverTitle}
          />
        ))}
      </div>

      <Link href={activeBook.route} className="xc-explore-btn mt-8">
        开始探索 →
      </Link>
    </div>
  )
}
