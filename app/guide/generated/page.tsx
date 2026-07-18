'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookGuideResponse } from '@/types/book-guide'
import { BookGuideResultView } from '@/components/book-guide-result-view'
import { GuideMapExplorer } from '@/components/guide-map-explorer'
import { Guide } from '@/types'

function GeneratedGuideContent() {
  const [result, setResult] = useState<BookGuideResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('xuncheng-book-guide-result')
      if (raw) {
        setResult(JSON.parse(raw) as BookGuideResponse)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-literary-muted text-sm">
        加载攻略中…
      </div>
    )
  }

  if (!result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-literary-muted text-sm">暂无生成的攻略</p>
        <Link href="/" className="xc-explore-btn text-sm">
          返回首页，点击右下角「跟书旅行」开始
        </Link>
      </main>
    )
  }

  const guide: Guide = result.guide

  return (
    <main className="xc-explorer-bg min-h-screen pb-10">
      <header className="sticky top-0 z-40 bg-literary-paper/90 backdrop-blur-md border-b border-literary-sand">
        <div className="xc-container max-w-6xl py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-literary-muted hover:text-literary-wine transition-colors"
          >
            ← 返回首页
          </Link>
          <div className="flex-1 text-center">
            <p className="text-[10px] tracking-widest text-literary-wine">AI 生成 · 跟书旅行</p>
            <h1 className="font-serif font-semibold text-literary-ink text-sm truncate">
              {guide.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="xc-container max-w-6xl pt-6 space-y-8">
        {/* 结构化摘要 */}
        <section className="rounded-2xl border border-literary-sand bg-white/80 p-5 sm:p-6 shadow-sm">
          <BookGuideResultView result={result} />
        </section>

        {/* 地图 + 行程探索 */}
        <section>
          <h2 className="font-serif font-semibold text-literary-ink mb-4 flex items-center gap-2">
            🗺️ 地图路线
          </h2>
          <GuideMapExplorer
            guide={guide}
            layout="explorer"
            showChips
            mapTitle="书中地点 · 点击展开详情"
          />
        </section>
      </div>
    </main>
  )
}

export default function GeneratedGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-literary-muted">
          加载中…
        </div>
      }
    >
      <GeneratedGuideContent />
    </Suspense>
  )
}
