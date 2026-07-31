'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HomeNav } from '@/components/home-nav'
import { XunjiHomeHero } from '@/components/xunji-home-hero'
import { HomeRouteDeck } from '@/components/home-route-deck'
import { HomeCitiesPanel } from '@/components/home-cities-panel'
import { HomeDailyHotspots } from '@/components/home-daily-hotspots'
import { HomeTab, underDevelopmentTabs } from '@/lib/home-covers'
import { getRouteStats, listAllRoutes, type RouteDetail } from '@/lib/route-detail-data'

const FEATURED_SLUGS = [
  'yangzhou-wangzengqi-zaocha',
  'suzhou-hanshansi-fengqiao',
  'hangzhou-sudi-sushi',
  'nanjing-qinhuaihe-zhuziqing',
  'shaoxing-luxun-baicaoyuan',
  'harbin-xiaohong-hulanhe',
]

function pickShowcaseRoutes(all: RouteDetail[], limit = 6): RouteDetail[] {
  const bySlug = new Map(all.map(r => [r.slug, r]))
  const picked: RouteDetail[] = []
  for (const slug of FEATURED_SLUGS) {
    const r = bySlug.get(slug)
    if (r) picked.push(r)
    if (picked.length >= limit) return picked
  }
  for (const r of all) {
    if (picked.some(p => p.slug === r.slug)) continue
    picked.push(r)
    if (picked.length >= limit) break
  }
  return picked
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('首页')
  const isUnderDevelopment = underDevelopmentTabs.includes(activeTab)
  const stats = getRouteStats()
  const allRoutes = listAllRoutes()
  const showcase = pickShowcaseRoutes(allRoutes)
  const featured = allRoutes.find(r => r.slug === 'yangzhou-wangzengqi-zaocha') ?? showcase[0]

  return (
    <main className="xc-home-bg min-h-screen flex flex-col">
      <header className="pt-6 sm:pt-8 pb-2 flex-shrink-0">
        <div className="xc-home-logo mb-3 sm:mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="寻迹" className="h-10 sm:h-12 w-auto" />
        </div>
        <HomeNav active={activeTab} onChange={setActiveTab} />
      </header>

      {activeTab === '首页' && (
        <>
          <XunjiHomeHero routes={showcase} stats={stats} />

          {/* 线上同款：精选文学路线 */}
          <section className="px-4 sm:px-6 pb-2 flex-shrink-0 pt-4">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-end justify-between">
                <h2 className="font-serif text-lg font-bold text-literary-ink">精选文学路线</h2>
                <span className="text-[11px] tracking-[0.2em] text-literary-wine uppercase">Live</span>
              </div>
              {featured && (
                <Link
                  href={`/route/${featured.slug}`}
                  className="group mt-3 flex flex-col gap-3 rounded-2xl border border-literary-wine/30 bg-white/70 p-5 transition-all hover:border-literary-wine hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-literary-wine/10 text-2xl">
                    🍵
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] tracking-[0.25em] text-literary-wine uppercase">
                      {featured.book.split(/[／/]/)[0]} · {featured.city}
                    </p>
                    <h3 className="mt-0.5 font-serif text-xl font-bold text-literary-ink">
                      {featured.title}
                    </h3>
                    <p className="mt-1 text-xs text-literary-muted leading-relaxed">
                      {featured.plainExplain || featured.summary}
                    </p>
                  </div>
                  <span className="xc-pill shrink-0 bg-literary-wine text-sm text-white group-hover:opacity-90">
                    开始寻迹 →
                  </span>
                </Link>
              )}
            </div>
          </section>

          <HomeDailyHotspots />
        </>
      )}

      {activeTab === '📖 书籍' && (
        <section className="flex-1 flex flex-col items-center py-8 sm:py-12 px-4">
          <div className="text-center mb-6 max-w-lg">
            <h2 className="font-lishu text-3xl sm:text-4xl font-normal text-literary-ink tracking-[0.16em]">
              字里行间，可抵山河
            </h2>
            <p className="mt-2 text-sm text-literary-muted font-serif tracking-wide">
              以书寻迹
            </p>
          </div>
          <HomeRouteDeck routes={allRoutes} size="lg" variant="book" />
          <Link
            href="/routes"
            className="mt-8 text-sm font-serif text-literary-wine hover:text-literary-wine-dark"
          >
            浏览全部路线目录 →
          </Link>
        </section>
      )}

      {activeTab === '🏙️ 城市' && <HomeCitiesPanel />}

      {isUnderDevelopment && (
        <section className="flex-1 flex items-center justify-center py-16 px-6">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/under-development.png"
              alt="待开发"
              className="h-28 sm:h-36 w-auto mx-auto object-contain"
            />
            <p className="mt-3 text-sm text-literary-muted tracking-wide font-serif">
              该功能正在建设中，敬请期待
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
