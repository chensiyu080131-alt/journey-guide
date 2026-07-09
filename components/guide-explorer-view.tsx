'use client'

import Link from 'next/link'
import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { GuideMapExplorer } from './guide-map-explorer'
import { GuideExplorerShell } from './guide-explorer-shell'

interface GuideExplorerViewProps {
  guide: Guide
  category: CoverCategory
}

export function GuideExplorerView({ guide, category }: GuideExplorerViewProps) {
  return (
    <GuideExplorerShell
      backHref={`/?cat=${category}`}
      title={guide.title}
      subtitle={guide.subtitle}
      sidebar={<GuideFilterSidebar guideId={guide.id} category={category} variant="explorer" />}
      below={
        guide.routeIntro ? (
          <p className="text-xs text-warm-gray-light leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
            {guide.routeIntro}
          </p>
        ) : undefined
      }
    >
      <GuideMapExplorer
        guide={guide}
        layout="explorer"
        showChips
        mapTitle="AI 识别原文景点 · 点击展开详情"
        mapClassName="h-[min(calc(100vh-240px),560px)] sm:h-[min(calc(100vh-220px),580px)]"
      />
    </GuideExplorerShell>
  )
}
