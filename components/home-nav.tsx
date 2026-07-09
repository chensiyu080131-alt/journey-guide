'use client'

import { cn } from '@/lib/utils'
import { HomeTab, homeTabs } from '@/lib/home-covers'

interface HomeNavProps {
  active: HomeTab
  onChange: (tab: HomeTab) => void
}

export function HomeNav({ active, onChange }: HomeNavProps) {
  return (
    <nav
      className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-2"
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
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}
