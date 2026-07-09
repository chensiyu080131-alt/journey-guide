'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlanAspect } from '@/lib/guide-category'
import { CoverCategory } from '@/lib/home-covers'

interface GuideFilterSidebarProps {
  guideId: string
  category: CoverCategory
  activeAspect?: PlanAspect
  variant?: 'default' | 'literary' | 'explorer'
}

const filters: { aspect: PlanAspect | 'map'; icon: string; desc: string; label: string }[] = [
  { aspect: 'map', icon: '🗺️', desc: '原文落成地图', label: '地图探索' },
  { aspect: 'days', icon: '📅', desc: '按天规划行程', label: '按天数' },
  { aspect: 'budget', icon: '💰', desc: '费用与预算参考', label: '按预算' },
  { aspect: 'interests', icon: '✨', desc: '文化·美食·自然', label: '按喜好' },
]

export function GuideFilterSidebar({
  guideId,
  category,
  activeAspect,
  variant = 'default',
}: GuideFilterSidebarProps) {
  const isExplorer = variant === 'explorer'
  const isLiterary = variant === 'literary'

  return (
    <aside
      className={cn(
        'flex-shrink-0',
        isExplorer
          ? 'w-full lg:w-[168px] flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide pb-1 lg:pb-0'
          : 'w-full sm:w-36 lg:w-40 space-y-2'
      )}
    >
      {!isExplorer && (
        <p
          className={cn(
            'text-[10px] tracking-widest uppercase mb-3 hidden sm:block',
            isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted'
          )}
        >
          行程筛选
        </p>
      )}
      {filters.map(f => {
        const href = f.aspect === 'map'
          ? `/guide/${guideId}?cat=${category}`
          : `/guide/${guideId}/plan/${f.aspect}?cat=${category}`
        const isActive = f.aspect === 'map' ? !activeAspect : activeAspect === f.aspect

        if (isExplorer) {
          return (
            <Link
              key={f.aspect}
              href={href}
              className={cn(
                'xc-explorer-sidebar-item',
                isActive ? 'xc-explorer-sidebar-active' : 'xc-explorer-sidebar-inactive',
                'min-w-[140px] lg:min-w-0 lg:w-full'
              )}
            >
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-serif font-medium text-warm-gray">{f.label}</p>
                <p className="text-[10px] text-warm-gray-muted mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={f.aspect}
            href={href}
            className={cn(
              'flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1',
              'px-3 py-3 sm:py-4 rounded-xl border transition-all duration-200 no-underline group',
              isLiterary
                ? isActive
                  ? 'border-literary-wine/40 bg-literary-sand/60 shadow-sm'
                  : 'border-literary-sand bg-white/80 hover:bg-literary-paper hover:border-literary-wine/25 hover:shadow-sm'
                : isActive
                  ? 'border-celadon-400 bg-celadon-50/80 shadow-sm'
                  : 'border-celadon-200/50 bg-camel-light/40 hover:bg-camel-light hover:border-celadon-300 hover:shadow-sm'
            )}
          >
            <span className="text-lg sm:text-xl">{f.icon}</span>
            <div>
              <p
                className={cn(
                  'text-sm font-serif font-medium group-hover:text-literary-wine',
                  isLiterary ? 'text-literary-ink' : 'text-warm-gray group-hover:text-celadon-700'
                )}
              >
                {f.label}
              </p>
              <p
                className={cn(
                  'text-[10px] hidden sm:block mt-0.5',
                  isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted'
                )}
              >
                {f.desc}
              </p>
            </div>
          </Link>
        )
      })}
    </aside>
  )
}
