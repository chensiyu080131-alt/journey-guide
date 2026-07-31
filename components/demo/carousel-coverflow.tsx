'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DemoRoute } from '@/lib/demo-carousel-data'

const CITY_WASH: Record<string, string> = {
  杭州: 'linear-gradient(145deg, #C8E0D4 0%, #7AAB90 100%)',
  扬州: 'linear-gradient(145deg, #F0E0D4 0%, #C4887A 100%)',
  绍兴: 'linear-gradient(145deg, #E8E0D0 0%, #B8A070 100%)',
  哈尔滨: 'linear-gradient(145deg, #D0DCE8 0%, #7A9AB8 100%)',
  北京: 'linear-gradient(145deg, #E0C8C0 0%, #B87868 100%)',
  凤凰: 'linear-gradient(145deg, #D4D8E0 0%, #8898A8 100%)',
  济南: 'linear-gradient(145deg, #D8E4F0 0%, #7A9AB8 100%)',
  乌镇: 'linear-gradient(145deg, #E0D8D0 0%, #A89080 100%)',
  苏州: 'linear-gradient(145deg, #D8E4E2 0%, #7A9A92 100%)',
  南京: 'linear-gradient(145deg, #E0DDD6 0%, #9A9288 100%)',
  常熟: 'linear-gradient(145deg, #DDE5DC 0%, #8A9E88 100%)',
}

function washFor(city: string) {
  return CITY_WASH[city] ?? 'linear-gradient(145deg, #F0EAE0 0%, #C4B8A8 100%)'
}

export type CoverflowVariant = 'route' | 'book' | 'city'

type Size = 'md' | 'lg'

const SIZE: Record<Size, { wrapH: string; cardW: string; cardH: string; shift: number; washH: string }> = {
  md: {
    wrapH: 'h-[360px] sm:h-[400px]',
    cardW: 'w-[min(280px,78%)]',
    cardH: 'h-[320px] sm:h-[360px]',
    shift: 38,
    washH: 'h-[88px]',
  },
  lg: {
    wrapH: 'h-[400px] sm:h-[460px]',
    cardW: 'w-[min(300px,80%)]',
    cardH: 'h-[360px] sm:h-[400px]',
    shift: 40,
    washH: 'h-[100px]',
  },
}

export type CoverflowItem = DemoRoute & {
  href?: string
  /** 城市轮播：路线数文案 */
  metaLine?: string
}

export function CarouselCoverflow({
  routes,
  size = 'lg',
  variant = 'route',
}: {
  routes: CoverflowItem[]
  size?: Size
  variant?: CoverflowVariant
}) {
  const [index, setIndex] = useState(0)
  const total = routes.length
  const active = routes[index]
  const s = SIZE[size]

  if (!total || !active) return null

  const href = active.href || `/route/${active.slug}`

  return (
    <div className="relative py-2 w-full max-w-[520px] mx-auto">
      <div className={`relative ${s.wrapH} flex items-center justify-center [perspective:1100px]`}>
        {routes.map((route, i) => {
          let offset = i - index
          if (offset > total / 2) offset -= total
          if (offset < -total / 2) offset += total
          const abs = Math.abs(offset)
          if (abs > 2) return null
          const isCenter = offset === 0
          return (
            <button
              key={route.slug}
              type="button"
              onClick={() => setIndex(i)}
              className={`absolute ${s.cardW} ${s.cardH} rounded-2xl border border-[#E8E0D6] bg-white text-left transition-all duration-500 ease-out overflow-hidden flex flex-col`}
              style={{
                zIndex: 10 - abs,
                transform: `
                  translateX(${offset * s.shift}%)
                  scale(${isCenter ? 1 : 0.88 - abs * 0.03})
                  rotateY(${offset * -8}deg)
                `,
                opacity: isCenter ? 1 : 0.55,
                boxShadow: isCenter
                  ? '0 22px 52px rgba(40,30,24,0.12)'
                  : '0 8px 20px rgba(40,30,24,0.05)',
              }}
            >
              <div
                className={`${s.washH} shrink-0 relative flex items-end px-5 pb-3`}
                style={{ background: washFor(route.city) }}
              >
                {variant === 'book' ? (
                  <span className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-sm line-clamp-1 pr-10">
                    {route.bookShort || route.title}
                  </span>
                ) : (
                  <span className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-sm">
                    {route.city}
                  </span>
                )}
                <span className="absolute bottom-3 right-5 text-xs tabular-nums text-white/80 font-serif font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="relative flex-1 flex flex-col p-5 sm:p-6 bg-white min-h-0">
                {variant === 'book' ? (
                  <>
                    {/* 色条已是书名；正文：作者 → 城市 → 简介 */}
                    <p className="text-base sm:text-lg font-serif font-semibold text-[#3D2E2E]">
                      {route.author}
                    </p>
                    <p className="mt-1.5 text-sm text-[#8A7A72] font-serif">{route.city}</p>
                    <p className="mt-4 text-xs text-[#8A7A72] leading-relaxed line-clamp-4">
                      {route.summary}
                    </p>
                    <p className="mt-auto pt-3 text-xs text-[#8B4545]">
                      {isCenter ? `${route.points} 个点位 · 进入路线` : '点击选中'}
                    </p>
                  </>
                ) : variant === 'city' ? (
                  <>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E2E] tracking-wide">
                      {route.city}
                    </h3>
                    <p className="mt-2 text-sm text-[#8B4545] font-serif">{route.author}</p>
                    <p className="mt-4 text-sm text-[#8A7A72] leading-relaxed line-clamp-4">
                      {route.summary}
                    </p>
                    <p className="mt-auto pt-3 text-xs text-[#8A7A72]">
                      {route.metaLine || (isCenter ? '进入城市书单' : '点击选中')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#8A7A72] font-serif line-clamp-1">
                      {route.author} · 《{route.bookShort}》
                    </p>
                    <h3 className="mt-2 font-serif text-lg sm:text-xl font-bold text-[#3D2E2E] leading-snug line-clamp-3">
                      {route.quote}
                    </h3>
                    <p className="mt-2 text-xs text-[#8B4545] font-serif line-clamp-1">{route.place}</p>
                    <p className="mt-auto pt-2 text-xs text-[#8A7A72]">
                      {isCenter ? `${route.points} 个点位` : '点击选中'}
                    </p>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex justify-center gap-3 items-center">
        <button
          type="button"
          onClick={() => setIndex(i => (i - 1 + total) % total)}
          className="h-9 w-9 rounded-full border border-[#E8E0D6] text-[#8A7A72] hover:border-[#8B4545] hover:text-[#8B4545]"
          aria-label="上一条"
        >
          ‹
        </button>
        <Link
          href={href}
          className="h-9 px-5 rounded-full bg-[#8B4545] text-white text-sm font-serif leading-9"
        >
          {variant === 'city' ? '进入城市' : '进入本路线'}
        </Link>
        <button
          type="button"
          onClick={() => setIndex(i => (i + 1) % total)}
          className="h-9 w-9 rounded-full border border-[#E8E0D6] text-[#8A7A72] hover:border-[#8B4545] hover:text-[#8B4545]"
          aria-label="下一条"
        >
          ›
        </button>
      </div>
    </div>
  )
}
