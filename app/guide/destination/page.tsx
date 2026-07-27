'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Guide, InterestTag, BudgetLevel } from '@/types'
import { generateGuide } from '@/lib/llm-service'
import { GuideView } from '@/components/guide-view'
import { Button } from '@/components/ui'

const INTEREST_OPTIONS: InterestTag[] = ['文化', '美食', '自然', '体验']
const BUDGET_OPTIONS: BudgetLevel[] = ['穷游', '舒适', '轻奢']

function DestinationGuideContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const initialCity = searchParams.get('city') || ''
  const initialDays = Number(searchParams.get('days') || '2')
  const initialBudget = (searchParams.get('budget') as BudgetLevel) || '舒适'
  const initialInterests = (searchParams.get('interests') || '文化,美食')
    .split(',')
    .filter((item): item is InterestTag => INTEREST_OPTIONS.includes(item as InterestTag))

  const [city, setCity] = useState(initialCity)
  const [days, setDays] = useState(Math.min(Math.max(initialDays, 1), 7))
  const [budget, setBudget] = useState<BudgetLevel>(
    BUDGET_OPTIONS.includes(initialBudget) ? initialBudget : '舒适'
  )
  const [interests, setInterests] = useState<InterestTag[]>(
    initialInterests.length > 0 ? initialInterests : ['文化', '美食']
  )

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  // Handle recognized mode (from book text recognition)
  useEffect(() => {
    if (mode === 'recognized' && !hasGenerated) {
      try {
        const stored = sessionStorage.getItem('xuncheng-recognized-guide')
        if (stored) {
          const parsed = JSON.parse(stored) as Guide
          setGuide(parsed)
          setHasGenerated(true)
          sessionStorage.removeItem('xuncheng-recognized-guide')
          return
        }
      } catch (e) {
        console.error('Failed to parse recognized guide:', e)
      }
    }
  }, [mode, hasGenerated])

  useEffect(() => {
    if (initialCity && !hasGenerated && mode !== 'recognized') {
      handleGenerate(initialCity, initialDays, initialInterests.length > 0 ? initialInterests : ['文化', '美食'], initialBudget)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerate(
    targetCity = city,
    targetDays = days,
    targetInterests = interests,
    targetBudget = budget
  ) {
    if (!targetCity.trim()) {
      setError('请输入目的地')
      return
    }

    setLoading(true)
    setError(null)
    setGuide(null)
    setHasGenerated(true)
    setLoadingStage(0)

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => Math.min(prev + 1, 3))
    }, 700)

    try {
      const result = await generateGuide(
        targetCity.trim(),
        targetDays,
        targetInterests,
        targetBudget
      )
      setGuide(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '攻略生成失败，请重试')
    } finally {
      clearInterval(stageInterval)
      setLoading(false)
    }
  }

  function toggleInterest(tag: InterestTag) {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]
    )
  }

  const stageTexts = [
    '正在检索这座城的故事...',
    '对照文学原文与真实地点...',
    '整理美食与在地体验...',
    '攻略即将呈现！',
  ]

  return (
    <main className="min-h-screen pb-8">
      <div className="sticky top-1 z-40 bg-paper/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-ink-400 hover:text-ink-600 transition-colors">
            ← 返回
          </Link>
          <div className="flex-1 text-center">
            <span className="font-bold text-ink-900 text-sm">自定义目的地</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-ink-900">搜一座城，生成文学旅行攻略</h1>
            <p className="text-sm text-ink-500 mt-1">输入任意中国县城或小城市，AI 会生成可落地的路线</p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="例如：松阳、腾冲、常熟..."
              className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm text-ink-500 shrink-0">天数</label>
              <input
                type="range"
                min={1}
                max={7}
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="flex-1 accent-xuncheng-500"
              />
              <span className="text-sm font-medium text-ink-700 w-8">{days}天</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 md:gap-5">
            <div>
              <p className="text-sm text-ink-500 mb-2">兴趣方向</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      interests.includes(tag)
                        ? 'bg-xuncheng-500 text-white'
                        : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-500 mb-2">预算级别</p>
              <div className="flex gap-2">
                {BUDGET_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBudget(option)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      budget === option
                        ? 'bg-xuncheng-500 text-white'
                        : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>

          <Button
            onClick={() => handleGenerate()}
            disabled={loading || !city.trim()}
            className="w-full"
          >
            {loading ? '生成中...' : '生成攻略'}
          </Button>
        </section>

        {loading && (
          <div className="text-center space-y-6 py-10 animate-fade-in">
            <h2 className="text-xl font-serif font-bold text-ink-900">
              正在为你<span className="text-xuncheng-500">寻城</span>
            </h2>
            <div className="space-y-4">
              {stageTexts.map((text, i) => (
                <div
                  key={text}
                  className={`transition-all duration-500 ${
                    i <= loadingStage ? 'opacity-100' : 'opacity-0 h-0'
                  }`}
                >
                  <span className="text-lg">{['📖', '🗺️', '🍜', '✨'][i]}</span>
                  <p className="text-sm text-ink-500 mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center space-y-3">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" onClick={() => handleGenerate()}>
              重试
            </Button>
          </div>
        )}

        {guide && !loading && <GuideView guide={guide} />}
      </div>
    </main>
  )
}

export default function DestinationGuidePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-ink-400">加载中...</div>
        </main>
      }
    >
      <DestinationGuideContent />
    </Suspense>
  )
}
