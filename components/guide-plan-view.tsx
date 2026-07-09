'use client'

import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { PlanAspect, planAspectLabels } from '@/lib/guide-category'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { PlanItineraryExplorer } from './plan-itinerary-explorer'
import { GuideExplorerShell } from './guide-explorer-shell'

interface GuidePlanViewProps {
  guide: Guide
  category: CoverCategory
  aspect: PlanAspect
}

export function GuidePlanView({ guide, category, aspect }: GuidePlanViewProps) {
  return (
    <GuideExplorerShell
      backHref={`/guide/${guide.id}?cat=${category}`}
      backLabel="← 返回地图探索"
      eyebrow={planAspectLabels[aspect]}
      title={guide.title}
      subtitle="AI 基于原文落点规划路线，可添加文化可选项并优化行程"
      sidebar={
        <GuideFilterSidebar
          guideId={guide.id}
          category={category}
          activeAspect={aspect}
          variant="explorer"
        />
      }
    >
      <PlanItineraryExplorer key={aspect} guide={guide} aspect={aspect} mapFirst />
    </GuideExplorerShell>
  )
}
