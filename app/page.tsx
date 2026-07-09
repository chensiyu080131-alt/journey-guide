'use client'

import { useState } from 'react'
import { HomeNav } from '@/components/home-nav'
import { HomeCoverCarousel } from '@/components/home-cover-carousel'
import { HomeTab, getCoversForTab, underDevelopmentTabs } from '@/lib/home-covers'

const tabHints: Record<HomeTab, string> = {
  '首页': '文化地理 · 精选推荐',
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
            alt="寻城 Xun Cheng"
            className="h-[2.56rem] sm:h-[3.2rem] w-auto"
          />
        </div>
        <HomeNav active={activeTab} onChange={setActiveTab} />
      </header>

      <div className="text-center px-6 flex-shrink-0">
        {activeTab === '首页' && (
          <p className="text-[10px] sm:text-[11px] text-literary-wine tracking-[0.25em] font-serif uppercase">
            Tracking
          </p>
        )}
        <h1 className="mt-1 text-base sm:text-lg font-serif font-semibold text-literary-ink tracking-wide">
          {activeTab === '首页' ? '有迹可循，寻迹而至' : tabHints[activeTab]}
        </h1>
        <p className="mt-1 text-[11px] text-literary-muted tracking-wide font-serif max-w-md mx-auto leading-relaxed">
          {activeTab === '首页'
            ? '书籍·游戏·音乐——跟着文化载体去旅行'
            : '左右滑动选择封面，点击进入探索'}
        </p>
      </div>

      <section className="flex-1 flex items-center justify-center py-4 sm:py-6 min-h-[50vh]">
        {isUnderDevelopment ? (
          <div className="text-center px-6">
            <div className="text-4xl sm:text-5xl mb-4 opacity-40">🚧</div>
            <p className="text-2xl sm:text-3xl font-serif font-semibold text-literary-ink tracking-[0.35em]">
              待开发
            </p>
            <p className="mt-3 text-xs sm:text-sm text-literary-muted tracking-wide font-serif">
              该功能正在建设中，敬请期待
            </p>
          </div>
        ) : (
          <HomeCoverCarousel key={activeTab} covers={covers} />
        )}
      </section>

      <footer className="px-4 sm:px-6 pb-8 sm:pb-10 flex-shrink-0">
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left max-w-4xl mx-auto">
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
            <p className="mt-1 text-xs text-literary-muted">6 城 · 10 路线 · 50+ 点位 · 5 文化载体</p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">说明</p>
            <p className="mt-1 text-xs text-literary-muted">原型演示，原文为摘录/示意，实景为占位</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
