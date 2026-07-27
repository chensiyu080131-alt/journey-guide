'use client'

import { useState } from 'react'
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

type FilterItem = { aspect: PlanAspect | 'map'; icon: string; desc: string; label: string }

// 常用项：置于队列前部
const primaryFilters: FilterItem[] = [
  { aspect: 'days', icon: '📅', desc: '按天规划行程', label: '按天数' },
  { aspect: 'budget', icon: '💰', desc: '费用与预算参考', label: '按预算' },
  { aspect: 'interests', icon: '✨', desc: '文化·美食·自然', label: '按喜好' },
]

// 其他项：默认展开，可点击收起折叠，置于队列后部
const secondaryFilters: FilterItem[] = [
  { aspect: 'map', icon: '🗺️', desc: '原文落成地图', label: '地图探索' },
]

export function GuideFilterSidebar({
  guideId,
  category,
  activeAspect,
  variant = 'default',
}: GuideFilterSidebarProps) {
  const isExplorer = variant === 'explorer'
  const isLiterary = variant === 'literary'
  const [expanded, setExpanded] = useState(true)

  const renderItem = (f: FilterItem) => {
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
            'min-w-[140px] md:min-w-0 md:w-full'
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
  }

  return (
    <aside
      className={cn(
        'flex-shrink-0',
        isExplorer
          ? 'w-full md:w-[168px] flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-1 md:pb-0'
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

      {/* 常用项 */}
      {primaryFilters.map(renderItem)}

      {/* 其他项折叠区：默认展开，点击收起 */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className={cn(
          'flex items-center justify-center gap-1 text-[11px] font-serif rounded-lg border transition-colors flex-shrink-0',
          isExplorer
            ? 'min-w-[96px] md:min-w-0 md:w-full px-3 py-2'
            : 'w-full px-3 py-2',
          isLiterary
            ? 'border-literary-sand bg-white/70 text-literary-muted hover:text-literary-wine'
            : 'border-celadon-200/50 bg-camel-light/40 text-warm-gray-muted hover:text-celadon-700'
        )}
      >
        <span>{expanded ? '收起其他' : '展开其他'}</span>
        <span className="text-[9px] leading-none">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && secondaryFilters.map(renderItem)}
    </aside>
  )
}

/** 人间滋味 · 视图模式侧栏（与地图探索侧栏同款样式） */
export type RenjianViewMode = 'gaoyou' | 'map' | 'life'

const renjianViews: { id: RenjianViewMode; icon: string; label: string; desc: string }[] = [
  { id: 'gaoyou', icon: '🗺️', desc: '高邮深度 · 9点位', label: '高邮深度' },
  { id: 'map', icon: '🌏', desc: '全国美食地图', label: '全国地图' },
  { id: 'life', icon: '📖', desc: '人生轨迹', label: '人生轨迹' },
]

interface RenjianViewSidebarProps {
  guideId: string
  category: CoverCategory
  viewMode: RenjianViewMode
  onViewModeChange: (mode: RenjianViewMode) => void
}

export function RenjianViewSidebar({
  guideId,
  category,
  viewMode,
  onViewModeChange,
}: RenjianViewSidebarProps) {
  const planFilters = primaryFilters
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className="w-full md:w-[168px] flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-1 md:pb-0 flex-shrink-0">
      {/* 常用项：按天数 / 按预算 / 按喜好，置于前部 */}
      {planFilters.map(f => (
        <Link
          key={f.aspect}
          href={`/guide/${guideId}/plan/${f.aspect}?cat=${category}`}
          className={cn(
            'xc-explorer-sidebar-item min-w-[140px] md:min-w-0 md:w-full',
            'xc-explorer-sidebar-inactive'
          )}
        >
          <span className="text-xl flex-shrink-0">{f.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-serif font-medium text-warm-gray">{f.label}</p>
            <p className="text-[10px] text-warm-gray-muted mt-0.5 leading-snug">{f.desc}</p>
          </div>
        </Link>
      ))}

      {/* 其他项折叠区：默认展开，点击收起 */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className={cn(
          'flex items-center justify-center gap-1 text-[11px] font-serif rounded-lg border transition-colors flex-shrink-0',
          'min-w-[96px] md:min-w-0 md:w-full px-3 py-2',
          'border-celadon-200/50 bg-camel-light/40 text-warm-gray-muted hover:text-celadon-700'
        )}
      >
        <span>{expanded ? '收起其他' : '展开其他'}</span>
        <span className="text-[9px] leading-none">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && renjianViews.map(v => (
        <button
          key={v.id}
          type="button"
          onClick={() => onViewModeChange(v.id)}
          className={cn(
            'xc-explorer-sidebar-item min-w-[140px] md:min-w-0 md:w-full text-left',
            viewMode === v.id ? 'xc-explorer-sidebar-active' : 'xc-explorer-sidebar-inactive'
          )}
        >
          <span className="text-xl flex-shrink-0">{v.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-serif font-medium text-warm-gray">{v.label}</p>
            <p className="text-[10px] text-warm-gray-muted mt-0.5 leading-snug">{v.desc}</p>
          </div>
        </button>
      ))}
    </aside>
  )
}
