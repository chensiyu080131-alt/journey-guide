'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Guide } from '@/types'
import { getGuideById } from '@/lib/llm-service'
import { GuidePlanView } from '@/components/guide-plan-view'
import { parseCategoryParam, PlanAspect } from '@/lib/guide-category'
import { CoverCategory } from '@/lib/home-covers'
import { Button } from '@/components/ui'

function PlanPageContent({
  guideId,
  aspect,
}: {
  guideId: string
  aspect: PlanAspect
}) {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const category = parseCategoryParam(catParam, guideId) as CoverCategory

  useEffect(() => {
    let cancelled = false
    getGuideById(guideId)
      .then(result => {
        if (!cancelled) {
          if (result) setGuide(result)
          else setError('未找到该路线')
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('加载失败')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [guideId])

  if (loading) {
    return (
      <main className="xc-home-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-warm-gray-muted animate-pulse">加载行程…</p>
      </main>
    )
  }

  if (error || !guide) {
    return (
      <main className="xc-home-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-warm-gray-muted">{error}</p>
          <Link href="/"><Button variant="outline">返回首页</Button></Link>
        </div>
      </main>
    )
  }

  return <GuidePlanView guide={guide} category={category} aspect={aspect} />
}

export default function PlanClient({
  city,
  aspect,
}: {
  city: string
  aspect: PlanAspect
}) {
  const guideId = decodeURIComponent(city)
  return (
    <Suspense fallback={
      <main className="xc-home-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-warm-gray-muted animate-pulse">加载中…</p>
      </main>
    }>
      <PlanPageContent guideId={guideId} aspect={aspect} />
    </Suspense>
  )
}
