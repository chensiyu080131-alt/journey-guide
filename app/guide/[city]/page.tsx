'use client'

import { use } from 'react'
import { useState, useEffect, Suspense } from 'react'
import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getGuideById, generateGuide } from '@/lib/llm-service'
import { GuideView } from '@/components/guide-view'
import { Button } from '@/components/ui'
import Link from 'next/link'

function GuidePageContent({ guideId }: { guideId: string }) {
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
          if (result) {
            setGuide(result)
          } else {
            setError('未找到该路线')
          }
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError('攻略加载失败，请重试')
          setLoading(false)
        }
      }
    }

    fetchGuide()
    return () => { cancelled = true }
  }, [guideId])

  // 加载动画
  if (loading) {
    const stageTexts = [
      '翻开这本书...',
      '找到书中写到的地方...',
      '对照现实中的风景...',
      '攻略即将呈现！',
    ]

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 animate-fade-in">
          <h2 className="text-2xl font-serif font-bold text-ink-900">
            正在为你<span className="text-xuncheng-500">寻城</span>
          </h2>
          <div className="space-y-5">
            {stageTexts.map((text, i) => (
              <div
                key={i}
                className={`transition-all duration-600 ${
                  i <= loadingStage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 h-0'
                }`}
              >
                <span className="text-lg">{['📖', '🗺️', '🔍', '✨'][i]}</span>
                <p className="text-sm text-ink-500 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error || !guide) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <span className="text-4xl">😔</span>
          <p className="text-ink-600">{error || '攻略未找到'}</p>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </main>
    )
  }

  // 攻略展示
  return (
    <main className="min-h-screen pb-8">
      {/* 顶部导航 */}
      <div className="sticky top-1 z-40 bg-paper/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-ink-400 hover:text-ink-600 transition-colors">
            ← 返回
          </Link>
          <div className="flex-1 text-center">
            <span className="font-bold text-ink-900 text-sm">{guide.title}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              alert('链接已复制！')
            }}
            className="text-ink-400 hover:text-ink-600 transition-colors text-sm"
          >
            分享 ↗
          </button>
        </div>
      </div>

      {/* 攻略内容 */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <GuideView guide={guide} />
      </div>
    </main>
  )
}

export default function GuidePage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = use(params)
  const guideId = decodeURIComponent(city)

  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-ink-400">加载中...</div>
        </main>
      }
    >
      <GuidePageContent guideId={guideId} />
    </Suspense>
  )
}
