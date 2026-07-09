'use client'

import Link from 'next/link'
import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { GuideMapExplorer } from './guide-map-explorer'

interface GuideExplorerViewProps {
  guide: Guide
  category: CoverCategory
}

export function GuideExplorerView({ guide, category }: GuideExplorerViewProps) {
  return (
    <main className="xc-explorer-bg min-h-screen">
      <div className="xc-container max-w-6xl py-6 sm:py-8 pb-12">
        <Link
          href={`/?cat=${category}`}
          className="text-xs text-warm-gray-muted hover:text-celadon-600 no-underline"
        >
          ← 返回封面选择
        </Link>

        <header className="mt-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-warm-gray tracking-tight">
            {guide.title}
          </h1>
          <p className="mt-2 text-sm text-warm-gray-muted leading-relaxed">
            {guide.subtitle}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          <GuideFilterSidebar guideId={guide.id} category={category} variant="explorer" />
          <div className="flex-1 min-w-0">
            <GuideMapExplorer guide={guide} layout="explorer" showChips mapTitle="AI 识别原文景点 · 点击展开详情" />
            {guide.routeIntro && (
              <p className="mt-5 text-xs text-warm-gray-light leading-relaxed max-w-2xl">
                {guide.routeIntro}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
