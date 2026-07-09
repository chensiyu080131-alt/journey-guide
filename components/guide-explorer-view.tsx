'use client'

import Link from 'next/link'
import { Guide } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { GuideCategoryNav } from './guide-category-nav'
import { GuideFilterSidebar } from './guide-filter-sidebar'
import { GuideMapExplorer } from './guide-map-explorer'

interface GuideExplorerViewProps {
  guide: Guide
  category: CoverCategory
}

export function GuideExplorerView({ guide, category }: GuideExplorerViewProps) {
  return (
    <main className="xc-detail-bg min-h-screen flex flex-col">
      <header className="xc-container max-w-6xl pt-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="xc-home-logo-mark">
            <span className="text-white font-serif text-lg leading-none">寻</span>
          </div>
          <div>
            <p className="font-serif text-lg text-literary-ink tracking-wide">寻城</p>
            <p className="text-[10px] text-literary-muted tracking-[0.3em]">XUN CHENG</p>
          </div>
        </div>
        <GuideCategoryNav activeCategory={category} variant="literary" />
      </header>

      <div className="xc-container max-w-6xl flex-1 py-4 pb-10">
        <div className="mb-6">
          <Link
            href={`/?cat=${category}`}
            className="text-xs text-literary-muted hover:text-literary-wine no-underline"
          >
            ← 返回封面选择
          </Link>
          <p className="xc-detail-eyebrow mt-4 mb-2">{category} · 深度探索</p>
          <h1 className="xc-detail-title">{guide.title}</h1>
          <p className="mt-2 text-sm text-literary-muted">{guide.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <div className="flex-1 min-w-0 order-1 sm:order-2">
            <GuideMapExplorer guide={guide} layout="hero" theme="literary" />
          </div>
          <div className="order-2 sm:order-1 flex-shrink-0">
            <GuideFilterSidebar guideId={guide.id} category={category} variant="literary" />
          </div>
        </div>

        {guide.routeIntro && (
          <p className="mt-6 text-sm text-literary-muted leading-relaxed max-w-2xl">
            {guide.routeIntro}
          </p>
        )}
      </div>

      <footer className="pb-8 text-center">
        <p className="text-xs text-literary-muted tracking-widest font-serif">
          有迹可循，寻迹而至
        </p>
      </footer>
    </main>
  )
}
