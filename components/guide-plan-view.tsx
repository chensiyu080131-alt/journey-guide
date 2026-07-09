'use client'

import Link from 'next/link'
import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { PlanAspect, planAspectLabels } from '@/lib/guide-category'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { PlanItineraryExplorer } from './plan-itinerary-explorer'

interface GuidePlanViewProps {
  guide: Guide
  category: CoverCategory
  aspect: PlanAspect
}

export function GuidePlanView({ guide, category, aspect }: GuidePlanViewProps) {
  return (
    <main className="xc-explorer-bg min-h-screen">
      <div className="xc-container max-w-6xl py-6 sm:py-8 pb-12">
        <Link
          href={`/guide/${guide.id}?cat=${category}`}
          className="text-xs text-warm-gray-muted hover:text-celadon-600 no-underline"
        >
          ← 返回地图探索
        </Link>

        <header className="mt-4 mb-6">
          <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-2">
            {planAspectLabels[aspect]}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-warm-gray tracking-tight">
            {guide.title}
          </h1>
          <p className="mt-2 text-sm text-warm-gray-muted">
            AI 基于已识别原文落点规划路线，可添加非遗/文化可选项并优化行程
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          <GuideFilterSidebar
            guideId={guide.id}
            category={category}
            activeAspect={aspect}
            variant="explorer"
          />
          <div className="flex-1 min-w-0">
            <PlanItineraryExplorer key={aspect} guide={guide} aspect={aspect} />
          </div>
        </div>
      </div>
    </main>
  )
}
