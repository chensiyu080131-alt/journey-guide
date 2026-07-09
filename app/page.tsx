'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HomeNav } from '@/components/home-nav'
import { HomeCoverCarousel } from '@/components/home-cover-carousel'
import { HomeTab, getCoversForTab } from '@/lib/home-covers'

const tabHints: Record<HomeTab, string> = {
  '首页': '文化地理 · 精选推荐',
  '📖 书籍': '跟着书走，寻迹而至',
  '🎬 影视': '跟着光影，走进故事里',
  '🎮 游戏': '互动体验，读懂一座城',
  '🎵 音乐': '听一曲江南，走进故事里',
  '🏃 运动': '脚步丈量，山水之间',
}

const tabStats: Record<HomeTab, { value: string; label: string }[]> = {
  '首页': [
    { value: '6', label: '城' },
    { value: '10', label: '路线' },
    { value: '50+', label: '点位' },
    { value: '5', label: '文化载体' },
  ],
  '📖 书籍': [
    { value: '6', label: '文学原著' },
    { value: '30+', label: '原文引用' },
    { value: '10', label: '深度路线' },
    { value: '50+', label: '打卡点' },
  ],
  '🎬 影视': [
    { value: '4', label: '影视关联' },
    { value: '3', label: '传说故事' },
    { value: '5+', label: '取景地' },
    { value: '3', label: '城市标注' },
  ],
  '🎮 游戏': [
    { value: '2', label: '游戏取景' },
    { value: '2', label: '互动挑战' },
    { value: '5', label: '关联路线' },
    { value: '3+', label: '城市入口' },
  ],
  '🎵 音乐': [
    { value: '4', label: '江南曲调' },
    { value: '3', label: '古琴雅韵' },
    { value: '2', label: '戏曲唱段' },
    { value: '5', label: '关联城市' },
  ],
  '🏃 运动': [
    { value: '2', label: '运动路线' },
    { value: '1', label: '森林氧吧' },
    { value: '1', label: '半马赛道' },
    { value: '1', label: '城市标注' },
  ],
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('首页')
  const covers = getCoversForTab(activeTab)
  const stats = tabStats[activeTab]

  return (
    <main className="xc-home-bg min-h-screen flex flex-col">
      <header className="pt-6 sm:pt-8 pb-3 flex-shrink-0">
        <div className="xc-home-logo mb-5 sm:mb-6">
          <div className="xc-home-logo-mark">
            <span className="text-white font-serif text-lg sm:text-xl leading-none">寻</span>
          </div>
          <div className="text-left">
            <div className="font-serif text-lg sm:text-xl text-literary-ink tracking-wide">寻城</div>
            <div className="text-[10px] text-literary-muted tracking-[0.35em] uppercase">Xun Cheng</div>
          </div>
        </div>
        <HomeNav active={activeTab} onChange={setActiveTab} />
      </header>

      <div className="text-center px-6 flex-shrink-0">
        <p className="text-[11px] sm:text-xs text-literary-wine tracking-[0.25em] font-serif uppercase">
          {activeTab === '首页' ? 'Cultural Geography Engine' : activeTab}
        </p>
        <h1 className="mt-2 text-xl sm:text-2xl font-serif font-semibold text-literary-ink tracking-wide">
          {activeTab === '首页' ? '有迹可循，寻迹而至' : tabHints[activeTab]}
        </h1>
        <p className="mt-2 text-xs text-literary-muted tracking-wide font-serif max-w-md mx-auto leading-relaxed">
          {activeTab === '首页'
            ? '书籍·影视·游戏·音乐——跟着文化载体去旅行'
            : '左右滑动选择封面，点击封面进入详情'}
        </p>
      </div>

      <section className="flex-1 flex items-center justify-center py-4 sm:py-6 min-h-[50vh]">
        <HomeCoverCarousel key={activeTab} covers={covers} />
      </section>

      <div className="px-4 sm:px-6 pb-4 flex-shrink-0">
        <div className="xc-home-stats-bar">
          {stats.map(stat => (
            <div key={stat.label} className="xc-home-stat">
              <span className="xc-home-stat-value">{stat.value}</span>
              <span className="xc-home-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 flex-shrink-0">
        <div className="max-w-xl mx-auto flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('xuncheng:open-book-guide'))}
            className="px-4 py-2 rounded-full bg-literary-wine text-white text-xs sm:text-sm font-medium hover:bg-literary-wine/90 transition-colors shadow-sm ring-2 ring-literary-wine/20"
          >
            📖 跟书旅行
          </button>
          <Link
            href="/guide/destination"
            className="px-4 py-2 rounded-full border border-literary-wine/30 bg-literary-wine/10 text-literary-wine text-xs sm:text-sm font-medium hover:bg-literary-wine/15 transition-colors"
          >
            搜一座城
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full border border-literary-sand bg-white/70 text-literary-ink text-xs sm:text-sm font-medium hover:border-literary-wine/40 transition-colors"
          >
            文旅局工作台
          </Link>
        </div>
      </div>

      <footer className="px-4 sm:px-6 pb-8 sm:pb-10 flex-shrink-0">
        <div className="xc-home-quote-banner">
          <div className="text-center sm:text-left">
            <p className="text-base sm:text-lg font-serif font-semibold text-literary-ink leading-relaxed">
              「四方食事，不过一碗人间烟火」
            </p>
            <p className="mt-2 text-xs text-literary-muted tracking-wide">
              从一颗高邮咸鸭蛋开始，跟着书本吃遍中国。
            </p>
          </div>
          <Link
            href="/guide/renjianziwei?cat=书籍"
            className="xc-explore-btn whitespace-nowrap flex-shrink-0"
          >
            开始高邮之旅
            <span className="opacity-80">→</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left max-w-4xl mx-auto">
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">寻城 · 文化地理引擎</p>
            <p className="mt-1 text-xs text-literary-muted leading-relaxed">
              书籍·影视·游戏·音乐
              <br />
              把文字变成脚印
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
