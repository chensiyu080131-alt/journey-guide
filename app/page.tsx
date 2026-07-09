'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HomeNav } from '@/components/home-nav'
import { HomeCoverCarousel } from '@/components/home-cover-carousel'
import { HomeTab, getCoversForTab } from '@/lib/home-covers'

const tabHints: Record<HomeTab, string> = {
  '首页': '江苏省城市 · 精选推荐',
  '城市': '搜一座城，寻迹而至',
  '书籍': '跟着书走，寻迹而至',
  '音乐': '听一曲江南，走进故事里',
  '游戏': '互动体验，读懂一座城',
}

const tabStats: Record<HomeTab, { value: string; label: string }[]> = {
  '首页': [
    { value: '5', label: '江苏城市' },
    { value: '5', label: '文学路线' },
    { value: '30+', label: '可打卡点' },
    { value: '9', label: '精选攻略' },
  ],
  '城市': [
    { value: '5', label: '江苏名城' },
    { value: '20+', label: '地标景点' },
    { value: '12', label: '美食打卡' },
    { value: '5', label: '深度路线' },
  ],
  '书籍': [
    { value: '5', label: '文学原著' },
    { value: '30+', label: '美食散文' },
    { value: '9', label: '高邮点位' },
    { value: '19', label: '城市标注' },
  ],
  '音乐': [
    { value: '4', label: '江南曲调' },
    { value: '3', label: '古琴雅韵' },
    { value: '2', label: '戏曲唱段' },
    { value: '5', label: '关联城市' },
  ],
  '游戏': [
    { value: '4', label: '互动体验' },
    { value: '3', label: '诗词挑战' },
    { value: '2', label: '书法临摹' },
    { value: '5', label: '关联路线' },
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
          {activeTab === '首页' ? 'Featured Routes' : activeTab}
        </p>
        <h1 className="mt-2 text-xl sm:text-2xl font-serif font-semibold text-literary-ink tracking-wide">
          {activeTab === '首页' ? '有迹可循，寻迹而至' : tabHints[activeTab]}
        </h1>
        <p className="mt-2 text-xs text-literary-muted tracking-wide font-serif max-w-md mx-auto leading-relaxed">
          {activeTab === '首页'
            ? '跟着书本去旅行 · 从一座城、一本书、一曲江南开始'
            : '左右滑动选择封面，点击进入探索'}
        </p>
      </div>

      <section className="flex-1 flex items-center justify-center py-4 sm:py-6 min-h-[50vh]">
        <HomeCoverCarousel key={activeTab} covers={covers} />
      </section>

      <div className="px-4 sm:px-6 pb-6 flex-shrink-0">
        <div className="xc-home-stats-bar">
          {stats.map(stat => (
            <div key={stat.label} className="xc-home-stat">
              <span className="xc-home-stat-value">{stat.value}</span>
              <span className="xc-home-stat-label">{stat.label}</span>
            </div>
          ))}
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
            <p className="text-sm font-serif font-medium text-literary-ink">寻城 · 文旅 demo</p>
            <p className="mt-1 text-xs text-literary-muted leading-relaxed">
              一本书 · 一个人 · 一座城
              <br />
              跟着书本去旅行
            </p>
          </div>
          <div>
            <p className="text-sm font-serif font-medium text-literary-ink">数据</p>
            <p className="mt-1 text-xs text-literary-muted">5 城 · 5 书 · 30+ 篇 · 9 高邮点位</p>
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
