'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Guide } from '@/types'
import { getGuideById } from '@/lib/llm-service'
import { GuideExplorerView } from '@/components/guide-explorer-view'
import { RenjianziweiExplorer } from '@/components/renjianziwei-explorer'
import { parseCategoryParam } from '@/lib/guide-category'
import { CoverCategory } from '@/lib/home-covers'
import { Button } from '@/components/ui'

function GuidePageContent({ guideId }: { guideId: string }) {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const category = parseCategoryParam(catParam, guideId) as CoverCategory

  useEffect(() => {
    let cancelled = false

    async function fetchGuide() {
      try {
        setLoading(true)
        setError(null)
        const stageInterval = setInterval(() => {
          setLoadingStage(prev => Math.min(prev + 1, 3))
        }, 500)
        const result = await getGuideById(guideId)
        clearInterval(stageInterval)
        if (!cancelled) {
          await new Promise(resolve => setTimeout(resolve, 500))
          if (result) setGuide(result)
          else setError('未找到该路线')
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('攻略加载失败，请重试')
          setLoading(false)
        }
      }
    }

    fetchGuide()
    return () => { cancelled = true }
  }, [guideId])

  if (loading) {
    const stageTexts = ['翻开这本书...', 'AI 识别原文落点...', '对照现实地理位置...', '地图即将呈现']
    return (
      <main className="xc-home-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-xl font-serif font-medium text-celadon-700">正在寻城</h2>
          <p className="text-sm text-warm-gray-muted">{stageTexts[loadingStage]}</p>
          <div className="h-1 w-32 mx-auto bg-celadon-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-celadon-500 transition-all duration-500 rounded-full"
              style={{ width: `${((loadingStage + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </main>
    )
  }

  if (error || !guide) {
    return (
      <main className="xc-home-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-warm-gray-muted">{error || '攻略未找到'}</p>
          <Link href="/"><Button variant="outline">返回首页</Button></Link>
        </div>
      </main>
    )
  }

  return guideId === 'renjianziwei'
    ? <RenjianziweiExplorer guide={guide} category={category} />
    : <GuideExplorerView guide={guide} category={category} />
}

export default function GuideClient({ city }: { city: string }) {
  const guideId = decodeURIComponent(city)
  return (
    <Suspense fallback={
      <main className="xc-home-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-warm-gray-muted animate-pulse">加载中…</p>
      </main>
    }>
      <GuidePageContent guideId={guideId} />
    </Suspense>
  )
}
