'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HomeNav } from '@/components/home-nav'
import { HomeCoverCarousel } from '@/components/home-cover-carousel'
import { HeroAnimation } from '@/app/components/hero-animation'
import { SectionHome } from '@/app/components/section-home'
import { TodayHotspots } from '@/app/components/today-hotspots'
import { HomeTab, getCoversForTab, underDevelopmentTabs } from '@/lib/home-covers'

const taglineImages: Record<HomeTab, string> = {
  '首页': '/images/tagline-home.png',
  '📖 书籍': '/images/tagline-book.png',
  '🏙️ 城市': '/images/tagline-city.png',
  '🎮 游戏': '/images/tagline-game.png',
  '🎵 音乐': '/images/tagline-music.png',
}

const taglineAlts: Record<HomeTab, string> = {
  '首页': '有迹可循，寻迹而至',
  '📖 书籍': '字里行间，可抵山河',
  '🏙️ 城市': '一城一页，藏尽风华',
  '🎮 游戏': '屏幕之外，次元之间',
  '🎵 音乐': '入耳入心，落地成迹',
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('首页')
  const covers = getCoversForTab(activeTab)
  const isUnderDevelopment = underDevelopmentTabs.includes(activeTab)

  return (
    <main className="xc-home-bg min-h-screen flex flex-col">
      <header className="pt-6 sm:pt-8 pb-3 flex-shrink-0">
        <div className="xc-home-logo mb-2 sm:mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="寻迹 Xun Ji"
            className="h-[2.56rem] sm:h-[3.2rem] w-auto"
          />
        </div>
        <HomeNav active={activeTab} onChange={setActiveTab} />
      </header>

      {activeTab === '首页' ? (
        <HeroAnimation />
      ) : (activeTab === '🎮 游戏' || activeTab === '🎵 音乐') ? (
        <SectionHome tab={activeTab} />
      ) : (
        <>
          <div className="text-center px-6 flex-shrink-0">
            <h1 className="mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={taglineImages[activeTab]}
                alt={taglineAlts[activeTab]}
                className="h-12 sm:h-16 w-auto mx-auto object-contain"
              />
            </h1>
            <p className="mt-1 text-[11px] text-literary-muted tracking-wide font-serif max-w-md mx-auto leading-relaxed">
              滑动或点击箭头选择封面，点击进入探索
            </p>
          </div>

          <section className="flex-1 flex items-center justify-center py-4 sm:py-6 min-h-[50vh]">
            {isUnderDevelopment ? (
              <div className="text-center px-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/under-development.png"
                  alt="待开发"
                  className="h-28 sm:h-36 w-auto mx-auto object-contain"
                />
                <p className="mt-3 text-xs sm:text-sm text-literary-muted tracking-wide font-serif">
                  该功能正在建设中，敬请期待
                </p>
              </div>
            ) : (
              <HomeCoverCarousel
                key={activeTab}
                covers={covers}
                onExploreCover={(cover) => {
                  if (cover.targetTab) setActiveTab(cover.targetTab)
                }}
              />
            )}
          </section>
        </>
      )}

      {/* 精选文学路线 · 已上线入口 */}
      <section className="px-4 sm:px-6 pb-2 flex-shrink-0">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-lg font-bold text-literary-ink">精选文学路线</h2>
            <span className="text-[11px] tracking-[0.2em] text-literary-wine uppercase">Live</span>
          </div>
          <Link
            href="/route/yangzhou-wangzengqi-zaocha/"
            className="group mt-3 flex flex-col gap-3 rounded-2xl border border-literary-wine/30 bg-white/70 p-5 transition-all hover:border-literary-wine hover:shadow-md sm:flex-row sm:items-center"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-literary-wine/10 text-2xl">
              🍵
            </div>
            <div className="flex-1">
              <p className="text-[11px] tracking-[0.25em] text-literary-wine uppercase">人间滋味 · 扬州</p>
              <h3 className="mt-0.5 font-serif text-xl font-bold text-literary-ink">
                汪曾祺的扬州早茶地图
              </h3>
              <p className="mt-1 text-xs text-literary-muted leading-relaxed">
                跟着汪老的笔触，用一顿早茶走完扬州：富春 · 冶春 · 锦春 · 大麒麟阁 · 东关街。GPS 打卡解锁 5 枚文学卡片。
              </p>
            </div>
            <span className="xc-pill shrink-0 bg-literary-wine text-sm text-white group-hover:opacity-90">
              开始寻迹 →
            </span>
          </Link>
        </div>
      </section>

      {/* 今日热点 · Task3 */}
      <TodayHotspots />

      <footer className="px-4 sm:px-6 pb-8 sm:pb-10 flex-shrink-0">
        <div className="mb-6 flex items-center justify-center gap-6 text-sm">
          <Link href="/routes" className="font-serif text-literary-wine hover:opacity-80">
            所有路线
          </Link>
          <Link href="/reviews" className="font-serif text-literary-wine hover:opacity-80">
            用户评价
          </Link>
          <Link href="/favorites" className="font-serif text-literary-wine hover:opacity-80">
            我的收藏
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10 text-center sm:text-left max-w-6xl mx-auto">
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">寻迹 · 有迹可循</p>
            <p className="mt-1 text-xs text-literary-muted leading-relaxed">
              书籍·游戏·音乐
              <br />
              有迹可循，寻迹而至
            </p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">数据</p>
            <p className="mt-1 text-xs text-literary-muted">5 城 · 17 路线 · 85+ 点位 · 3 文化载体</p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">说明</p>
            <p className="mt-1 text-xs text-literary-muted">图片来源均为网络图片，仅供原型演示</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
