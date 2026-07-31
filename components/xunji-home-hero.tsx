'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { RouteDetail } from '@/lib/route-detail-data'
import { HomeRouteDeck } from '@/components/home-route-deck'
import '@/app/xunji-hero.css'

/** 线上同款左侧首屏 + 右侧 Coverflow 立体卡片（用户选定的 B 方案） */
export function XunjiHomeHero({
  routes,
  stats,
}: {
  routes: RouteDetail[]
  stats: { cities: number; routes: number; points: number }
}) {
  const subRef = useRef<HTMLParagraphElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const walkerRef = useRef<SVGCircleElement>(null)
  const featuredSlug = routes[0]?.slug || 'yangzhou-wangzengqi-zaocha'

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (subRef.current) {
      const el = subRef.current
      const text = el.textContent || ''
      el.textContent = ''
      Array.from(text).forEach((ch, i) => {
        const span = document.createElement('span')
        span.className = 'xh-ch' + (ch === '·' ? ' xh-dot' : '')
        span.textContent = ch === ' ' ? '\u00a0' : ch
        span.style.setProperty('--i', String(i))
        el.appendChild(span)
      })
    }

    const trail = trailRef.current
    const walker = walkerRef.current
    let walkerTimeout: number | null = null
    let raf = 0

    if (trail && walker && !reduce) {
      const len = trail.getTotalLength()
      let start: number | null = null
      const tick = (t: number) => {
        if (start === null) start = t
        const a = ((t - start) % 12000) / 9000
        if (a > 1) walker.style.opacity = '0'
        else {
          walker.style.opacity = a < 0.05 ? String(17 * a) : '0.85'
          const pt = trail.getPointAtLength(Math.min(a, 1) * len)
          walker.setAttribute('cx', String(pt.x))
          walker.setAttribute('cy', String(pt.y))
        }
        raf = requestAnimationFrame(tick)
      }
      walkerTimeout = window.setTimeout(() => {
        raf = requestAnimationFrame(tick)
      }, 6600)
    }

    return () => {
      if (walkerTimeout) clearTimeout(walkerTimeout)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="xunji-hero xh-wrap mx-4 sm:mx-6 lg:mx-8" aria-label="寻迹首屏">
      <div className="xh-grain" />
      <div className="xh-vignette" />
      <div className="xh-light" />
      <div className="xh-ambient" />

      <div className="xh-stage xh-stage-coverflow">
        <div className="xh-headline">
          <div className="xh-motto">有迹可循 · 寻迹而至</div>
          <div className="xh-title-row">
            <div className="xh-title-wrap">
              <svg className="xh-title" viewBox="0 0 420 190" aria-label="寻迹">
                <defs>
                  <filter id="xhInkBleed" x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" />
                  </filter>
                  <filter id="xhInkEdge">
                    <feGaussianBlur stdDeviation="0.4" />
                  </filter>
                  <mask id="xhM1">
                    <circle cx="105" cy="95" r="0" fill="#fff" filter="url(#xhInkEdge)">
                      <animate
                        attributeName="r"
                        from="0"
                        to="118"
                        begin="0.4s"
                        dur="1.15s"
                        calcMode="spline"
                        keySplines="0.25 0.6 0.3 1"
                        fill="freeze"
                      />
                    </circle>
                  </mask>
                  <mask id="xhM2">
                    <circle cx="300" cy="95" r="0" fill="#fff" filter="url(#xhInkEdge)">
                      <animate
                        attributeName="r"
                        from="0"
                        to="118"
                        begin="1.55s"
                        dur="1.15s"
                        calcMode="spline"
                        keySplines="0.25 0.6 0.3 1"
                        fill="freeze"
                      />
                    </circle>
                  </mask>
                </defs>
                <g filter="url(#xhInkBleed)">
                  <text x="30" y="150" mask="url(#xhM1)">
                    寻
                  </text>
                  <text x="215" y="150" mask="url(#xhM2)">
                    迹
                  </text>
                </g>
              </svg>
            </div>
            <div className="xh-seal" aria-hidden>
              <span>
                寻
                <br />
                迹
              </span>
            </div>
          </div>

          <p className="xh-sub" ref={subRef}>
            书籍 · 东方美学 · 音乐 —— 跟着文化载体去旅行
          </p>

          <div className="xh-quote">
            <p className="xh-quote-t">
              「他沿着河沿走过三座桥，<em>在城门下停了一会儿</em>。」—— 而你，可以真的走到那里。
            </p>
            <svg className="xh-path" viewBox="0 0 340 64" preserveAspectRatio="xMidYMid meet">
              <path
                ref={trailRef}
                className="xh-trail"
                d="M2,10 C60,10 70,44 128,44 S 210,18 258,26 S 320,50 330,50"
              />
              <circle ref={walkerRef} className="xh-walker" r="3.2" />
              <g className="xh-pin" transform="translate(330,50)">
                <circle r="4.5" fill="none" stroke="#8B4545" strokeWidth="1" />
                <circle r="1.6" fill="#8B4545" />
              </g>
            </svg>
          </div>

          <div className="xh-actions">
            <Link href="/routes" className="xh-btn xh-btn-primary">
              <span className="xh-blot" />
              全部路线 <span className="xh-arrow">→</span>
              <span className="xh-underline" />
            </Link>
            <Link href={`/route/${featuredSlug}`} className="xh-btn">
              <span className="xh-blot" />
              精选推荐 <span className="xh-arrow">→</span>
              <span className="xh-underline" />
            </Link>
          </div>

          <div className="xh-stats">
            <div className="xh-stat">
              <div className="xh-num">{stats.cities}</div>
              <div className="xh-label">座城市</div>
              <div className="xh-rule" />
            </div>
            <div className="xh-stat">
              <div className="xh-num">{stats.routes}</div>
              <div className="xh-label">条文学路线</div>
              <div className="xh-rule" />
            </div>
            <div className="xh-stat">
              <div className="xh-num">{stats.points}</div>
              <div className="xh-label">文化点位</div>
              <div className="xh-rule" />
            </div>
          </div>
        </div>

        {/* 右侧：Coverflow 立体（非线上旧叠卡） */}
        <div className="xh-coverflow-slot min-w-0 flex items-center justify-center lg:justify-end overflow-visible py-2">
          <HomeRouteDeck routes={routes} size="lg" variant="route" />
        </div>
      </div>
    </section>
  )
}
