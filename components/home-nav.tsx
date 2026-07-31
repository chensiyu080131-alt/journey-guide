'use client'

import { cn } from '@/lib/utils'
import { HomeTab, homeTabs } from '@/lib/home-covers'

interface HomeNavProps {
  active: HomeTab
  onChange: (tab: HomeTab) => void
}

const tabImages: Record<HomeTab, string> = {
  首页: '/images/tab-home.png',
  '📖 书籍': '/images/tab-book.png',
  '🏙️ 城市': '/images/tab-city.png',
  '🎮 游戏': '/images/tab-game.png',
  '🎵 音乐': '/images/tab-music.png',
}

const tabAlts: Record<HomeTab, string> = {
  首页: '首页',
  '📖 书籍': '书籍',
  '🏙️ 城市': '城市',
  '🎮 游戏': '游戏',
  '🎵 音乐': '音乐',
}

export function HomeNav({ active, onChange }: HomeNavProps) {
  return (
    <nav
      className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap px-2"
      aria-label="主导航"
    >
      {homeTabs.map(tab => {
        const isActive = active === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              'rounded-xl p-1 sm:p-1.5 transition-all duration-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-literary-wine/30',
              isActive
                ? 'ring-1 ring-literary-wine/80 shadow-sm'
                : 'hover:opacity-80'
            )}
            aria-label={tabAlts[tab]}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tabImages[tab]}
              alt={tabAlts[tab]}
              className="h-[5rem] sm:h-[6.5rem] md:h-[7.2rem] w-auto object-contain"
            />
          </button>
        )
      })}
    </nav>
  )
}
