'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Guide } from '@/types'
import { getGuideById } from '@/lib/llm-service'
import { entryCards } from '@/lib/mock-data'
import { GuideView } from '@/components/guide-view'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui'
import Link from 'next/link'

function GuidePageContent({ guideId }: { guideId: string }) {
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const entryMeta = entryCards.find(c => c.id === guideId)

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
          await new Promise(resolve => setTimeout(resolve, 600))
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
    const stageTexts = ['翻开这本书...', '找到书中写到的地方...', '对照现实中的风景...', '攻略即将呈现！']
    return (
      <main className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <div className="text-center space-y-8 animate-fade-in max-w-md">
          <h2 className="text-2xl font-serif font-bold text-white">
            正在为你<span className="text-xuncheng-400">寻城</span>
          </h2>
          <div className="space-y-5">
            {stageTexts.map((text, i) => (
              <div key={i} className={`transition-all duration-600 ${i <= loadingStage ? 'opacity-100' : 'opacity-0 h-0'}`}>
                <p className="text-sm text-white/60 mt-2">{text}</p>
              </div>
            ))}
          </div>
          <div className="h-1 w-32 mx-auto bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-xuncheng-500 transition-all duration-500 rounded-full"
              style={{ width: `${((loadingStage + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </main>
    )
  }

  if (error || !guide) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-ink-600">{error || '攻略未找到'}</p>
          <Link href="/"><Button variant="outline">返回首页</Button></Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <SiteHeader variant="light" />

      {/* 攻略 Hero */}
      <section className="relative h-64 sm:h-80 overflow-hidden bg-charcoal">
        {entryMeta?.coverImage && (
          <Image
            src={entryMeta.coverImage}
            alt={guide.title}
            fill
            className="object-cover opacity-60"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
        <div className="relative z-10 h-full xc-container flex flex-col justify-end pb-8">
          <Link href="/" className="text-white/60 text-sm hover:text-white mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">{guide.title}</h1>
          <p className="mt-2 text-white/70">{guide.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="xc-pill bg-white/10 text-white text-xs py-1 px-3 border border-white/20">
              {guide.days}天行程
            </span>
            <span className="xc-pill bg-white/10 text-white text-xs py-1 px-3 border border-white/20">
              {guide.budget}
            </span>
            {entryMeta && (
              <span className="xc-pill bg-xuncheng-500 text-white text-xs py-1 px-3">
                {entryMeta.priceHint}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="xc-container max-w-2xl py-10">
        <GuideView guide={guide} />
      </div>
      <SiteFooter />
    </>
  )
}

export default function GuideClient({ city }: { city: string }) {
  const guideId = decodeURIComponent(city)
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-ink-400">加载中...</div></main>}>
      <GuidePageContent guideId={guideId} />
    </Suspense>
  )
}
