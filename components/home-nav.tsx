'use client'

import { cn } from '@/lib/utils'
import { HomeTab, homeTabs } from '@/lib/home-covers'

interface HomeNavProps {
  active: HomeTab
  onChange: (tab: HomeTab) => void
}

const tabImages: Record<HomeTab, string> = {
  '首页': '/images/tab-home.png',
  '📖 书籍': '/images/tab-book.png',
  '🏙️ 城市': '/images/tab-city.png',
  '🎮 游戏': '/images/tab-game.png',
  '🎵 音乐': '/images/tab-music.png',
}

const tabAlts: Record<HomeTab, string> = {
  '首页': '首页',
  '📖 书籍': '书籍',
  '🏙️ 城市': '城市',
  '🎮 游戏': '游戏',
  '🎵 音乐': '音乐',
}

export function HomeNav({ active, onChange }: HomeNavProps) {
  return (
    <nav
      className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 flex-wrap px-2"
      aria-label="主导航"
    >
      {homeTabs.map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'xc-home-tab',
            active === tab && 'xc-home-tab-active'
          )}
          aria-label={tabAlts[tab]}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tabImages[tab]}
            alt={tabAlts[tab]}
            className="h-[4.2rem] sm:h-[5.4rem] w-auto object-contain"
          />
        </button>
      ))}
    </nav>
  )
}
