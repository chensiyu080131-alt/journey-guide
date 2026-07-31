'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { DemoRoute } from '@/lib/demo-carousel-data'

/** A · 杂志 Peek：主卡 + 右侧露出下一张（高端编辑站常用） */
export function CarouselPeek({ routes }: { routes: DemoRoute[] }) {
  const [index, setIndex] = useState(0)
  const total = routes.length
  const current = routes[index]
  const next = routes[(index + 1) % total]

  useEffect(() => {
    const id = window.setInterval(() => setIndex(i => (i + 1) % total), 5000)
    return () => window.clearInterval(id)
  }, [total])

  return (
    <div className="relative">
      <div className="flex gap-4 items-stretch overflow-hidden">
        <article className="w-[78%] sm:w-[72%] shrink-0 rounded-2xl border border-[#E8E0D6] bg-white p-6 sm:p-8 min-h-[320px] flex flex-col shadow-[0_16px_40px_rgba(40,30,24,0.06)] transition-all duration-700">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B4545] font-serif">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <p className="mt-3 text-xs text-[#8A7A72] font-serif">
            书籍 · {current.author}《{current.bookShort}》
          </p>
          <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-[#3D2E2E] leading-snug">
            {current.quote}
          </h3>
          <p className="mt-3 text-sm text-[#8B4545]">{current.city} · {current.place}</p>
          <p className="mt-4 text-sm text-[#8A7A72] leading-relaxed line-clamp-3 flex-1">
            {current.summary}
          </p>
          <div className="mt-6 flex justify-between items-center">
            <span className="text-xs text-[#8A7A72]">{current.points} 个点位 · 约一日</span>
            <Link href={`/route/${current.slug}`} className="text-sm text-[#8B4545] font-serif">
              进入路线 →
            </Link>
          </div>
        </article>

        <button
          type="button"
          onClick={() => setIndex((index + 1) % total)}
          className="w-[22%] sm:w-[28%] shrink-0 rounded-2xl border border-[#E8E0D6]/80 bg-[#FDFBF7] p-4 text-left opacity-70 hover:opacity-100 transition-opacity min-h-[320px] flex flex-col justify-between"
          aria-label="下一张"
        >
          <p className="text-[10px] text-[#8A7A72] font-serif line-clamp-1">{next.author}</p>
          <p className="font-serif text-sm sm:text-base text-[#3D2E2E] line-clamp-3 leading-snug">
            {next.quote}
          </p>
          <p className="text-[10px] text-[#8B4545]">下一篇 ›</p>
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        {routes.map((r, i) => (
          <button
            key={r.slug}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all ${i === index ? 'w-8 bg-[#8B4545]' : 'w-2 bg-[#E8E0D6]'}`}
            aria-label={r.title}
          />
        ))}
      </div>
    </div>
  )
}

export { CarouselCoverflow } from '@/components/demo/carousel-coverflow'

/** C · 引文焦点：大字金句淡入淡出（杂志 pull-quote / 品牌故事站） */
export function CarouselQuoteFade({ routes }: { routes: DemoRoute[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const total = routes.length
  const current = routes[index]

  const go = (next: number) => {
    setVisible(false)
    window.setTimeout(() => {
      setIndex(((next % total) + total) % total)
      setVisible(true)
    }, 280)
  }

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), 5500)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total])

  return (
    <div className="rounded-2xl border border-[#E8E0D6] bg-gradient-to-br from-white to-[#F9F6F1] px-6 sm:px-10 py-10 sm:py-14 min-h-[340px] relative overflow-hidden">
      <div
        className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B4545] font-serif">
          Pull Quote · {current.author}
        </p>
        <blockquote className="mt-6 font-serif text-2xl sm:text-4xl font-bold text-[#3D2E2E] leading-snug tracking-wide max-w-xl">
          「{current.quote}」
        </blockquote>
        <p className="mt-6 text-sm text-[#8A7A72]">
          —— {current.bookShort} · {current.city}{current.place ? ` · ${current.place}` : ''}
        </p>
        <p className="mt-4 max-w-lg text-sm text-[#8A7A72] leading-relaxed line-clamp-2">
          {current.summary}
        </p>
        <Link
          href={`/route/${current.slug}`}
          className="inline-flex mt-8 text-sm font-serif text-[#8B4545] border-b border-[#8B4545]/40 pb-0.5 hover:border-[#8B4545]"
        >
          沿着这句话走一遍 →
        </Link>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <button type="button" onClick={() => go(index - 1)} className="text-[#8A7A72] hover:text-[#8B4545] px-2">
          ‹
        </button>
        <span className="text-xs font-serif text-[#8A7A72] tabular-nums">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={() => go(index + 1)} className="text-[#8A7A72] hover:text-[#8B4545] px-2">
          ›
        </button>
      </div>
    </div>
  )
}

/** D · 横向 Snap 轨道：可拖拽浏览（Airbnb / 精品内容站） */
export function CarouselSnapRail({ routes }: { routes: DemoRoute[] }) {
  const scroller = useRef<HTMLDivElement>(null)

  const scrollByCard = (dir: -1 | 1) => {
    const el = scroller.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const w = card?.offsetWidth ?? 280
    el.scrollBy({ left: dir * (w + 16), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="h-10 w-10 rounded-full bg-white border border-[#E8E0D6] shadow-md text-[#8A7A72] hover:text-[#8B4545]"
        >
          ‹
        </button>
      </div>
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="h-10 w-10 rounded-full bg-white border border-[#E8E0D6] shadow-md text-[#8A7A72] hover:text-[#8B4545]"
        >
          ›
        </button>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-1 -mx-1"
        style={{ scrollPaddingInline: 8 }}
      >
        {routes.map(route => (
          <Link
            key={route.slug}
            href={`/route/${route.slug}`}
            data-card
            className="snap-start shrink-0 w-[min(280px,78vw)] rounded-2xl border border-[#E8E0D6] bg-white overflow-hidden hover:shadow-lg hover:border-[#8B4545]/30 transition-all group"
          >
            <div className="h-36 bg-[#F5F0E8] relative overflow-hidden">
              {route.illustration ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={route.illustration}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full grid place-items-center font-serif text-[#8B4545]/40 text-3xl">
                  {route.city.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="text-[10px] tracking-wide text-[#8B4545] font-serif">
                {route.city} · {route.author}
              </p>
              <h3 className="mt-2 font-serif text-base font-bold text-[#3D2E2E] leading-snug line-clamp-2">
                {route.quote}
              </h3>
              <p className="mt-3 text-xs text-[#8A7A72] line-clamp-2 leading-relaxed">{route.summary}</p>
              <p className="mt-4 text-xs text-[#8B4545]">{route.points} 个点位 →</p>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[#8A7A72] text-center sm:text-left">左右滑动或点箭头浏览</p>
    </div>
  )
}
