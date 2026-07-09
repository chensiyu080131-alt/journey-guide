'use client'

import Link from 'next/link'
import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { PlanAspect, planAspectLabels } from '@/lib/guide-category'
import { GuideCategoryNav } from './guide-category-nav'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { PlanItineraryExplorer } from './plan-itinerary-explorer'

interface GuidePlanViewProps {
  guide: Guide
  category: CoverCategory
  aspect: PlanAspect
}

export function GuidePlanView({ guide, category, aspect }: GuidePlanViewProps) {
  return (
    <main className="xc-detail-bg min-h-screen flex flex-col">
      <header className="xc-container max-w-6xl pt-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="xc-home-logo-mark">
            <span className="text-white font-serif text-lg leading-none">寻</span>
          </div>
          <div>
            <p className="font-serif text-lg text-literary-ink tracking-wide">寻城</p>
            <p className="text-[10px] text-literary-muted tracking-[0.3em]">行程规划</p>
          </div>
        </div>
        <GuideCategoryNav activeCategory={category} variant="literary" />
      </header>

      <div className="xc-container max-w-6xl flex-1 py-4 pb-10">
        <Link
          href={`/guide/${guide.id}?cat=${category}`}
          className="text-xs text-literary-muted hover:text-literary-wine no-underline"
        >
          ← 返回地图探索
        </Link>

        <p className="xc-detail-eyebrow mt-4 mb-2">{planAspectLabels[aspect]}</p>
        <h1 className="xc-detail-title">{guide.title}</h1>
        <p className="mt-2 text-sm text-literary-muted">
          AI 基于已识别原文落点规划路线，可添加非遗/文化可选项并优化行程
        </p>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-6">
          <GuideFilterSidebar
            guideId={guide.id}
            category={category}
            activeAspect={aspect}
            variant="literary"
          />
          <div className="flex-1 min-w-0">
            <PlanItineraryExplorer key={aspect} guide={guide} aspect={aspect} />
          </div>
        </div>
      </div>
    </main>
  )
}
