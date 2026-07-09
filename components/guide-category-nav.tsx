'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CoverCategory } from '@/lib/home-covers'
import { homeTabs } from '@/lib/home-covers'

interface GuideCategoryNavProps {
  activeCategory: CoverCategory
  variant?: 'default' | 'literary'
}

const categoryTabs = homeTabs.filter(t => t !== '首页') as CoverCategory[]

const literaryLabels: Partial<Record<CoverCategory, string>> = {
  '书籍': '高邮深度',
}

export function GuideCategoryNav({ activeCategory, variant = 'default' }: GuideCategoryNavProps) {
  const isLiterary = variant === 'literary'

  return (
    <nav
      className={cn(
        'flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap py-3',
        isLiterary ? 'border-b border-literary-sand' : 'border-b border-celadon-200/40'
      )}
      aria-label="分类导航"
    >
      <Link
        href="/"
        className={cn(
          'xc-home-tab no-underline',
          isLiterary ? 'text-literary-muted hover:text-literary-wine' : 'text-warm-gray-muted hover:text-celadon-600'
        )}
      >
        封面
      </Link>
      {categoryTabs.map(tab => {
        const isActive = tab === activeCategory
        const label = isLiterary && literaryLabels[tab] ? literaryLabels[tab] : tab
        return (
          <span
            key={tab}
            className={cn(
              'xc-home-tab cursor-default',
              isActive && 'xc-home-tab-active',
              !isActive && (isLiterary ? 'text-literary-muted/40' : 'text-warm-gray-muted/40 pointer-events-none')
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </span>
        )
      })}
      {isLiterary && (
        <>
          <span className="xc-home-tab text-literary-muted/40 cursor-default">全国美食地图</span>
          <span className="xc-home-tab text-literary-muted/40 cursor-default">人生轨迹</span>
        </>
      )}
    </nav>
  )
}
