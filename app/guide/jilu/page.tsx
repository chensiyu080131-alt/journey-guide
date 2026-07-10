'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Guide } from '@/types'
import { GuideMapExplorer } from '@/components/guide-map-explorer'
import { GuideFilterSidebar } from '@/components/guide-filter-sidebar'
import { GuideExplorerShell } from '@/components/guide-explorer-shell'
import { JILU_GUIDE_KEY, JILU_GUIDE_UPDATED_EVENT } from '@/lib/jilu-guide-service'

function JiluGuideContent() {
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<number | null>(null)

  // 从 sessionStorage 读取攻略
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(JILU_GUIDE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Guide
        setGuide(parsed)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  // 监听迹录员更新攻略事件
  useEffect(() => {
    function handleUpdate(e: Event) {
      const customEvent = e as CustomEvent<Guide>
      if (customEvent.detail) {
        setGuide(customEvent.detail)
      } else {
        // fallback: 重新读取 sessionStorage
        try {
          const raw = sessionStorage.getItem(JILU_GUIDE_KEY)
          if (raw) setGuide(JSON.parse(raw) as Guide)
        } catch { /* ignore */ }
      }
    }

    window.addEventListener(JILU_GUIDE_UPDATED_EVENT, handleUpdate)
    return () => window.removeEventListener(JILU_GUIDE_UPDATED_EVENT, handleUpdate)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-warm-gray-muted text-sm">
        加载攻略中…
      </div>
    )
  }

  if (!guide) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-warm-gray-muted text-sm">暂无迹录员生成的攻略</p>
        <Link href="/" className="xc-explore-btn text-sm">
          返回首页，和迹录员聊聊吧
        </Link>
      </main>
    )
  }

  // 筛选指定天数的 spots
  const filteredSpots = activeDay !== null
    ? guide.dayPlans.find(d => d.day === activeDay)?.spots
    : undefined

  const allSpots = guide.dayPlans.flatMap(d => d.spots)
  const hasLocations = allSpots.some(s => s.location?.lat && s.location?.lng)

  return (
    <GuideExplorerShell
      backHref="/"
      backLabel="← 返回首页"
      title={guide.title}
      subtitle={guide.subtitle}
      eyebrow="迹录员 · AI 生成攻略"
      sidebar={
        <div className="space-y-4">
          {/* 天数选择 */}
          <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-3 shadow-sm">
            <p className="text-[10px] tracking-widest text-celadon-600 uppercase mb-2">📅 按天数筛选</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveDay(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeDay === null
                    ? 'bg-celadon-50 text-celadon-700 font-medium'
                    : 'text-warm-gray-muted hover:bg-celadon-50/50'
                }`}
              >
                全部天数
              </button>
              {guide.dayPlans.map(d => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setActiveDay(d.day)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    activeDay === d.day
                      ? 'bg-celadon-50 text-celadon-700 font-medium'
                      : 'text-warm-gray-muted hover:bg-celadon-50/50'
                  }`}
                >
                  Day {d.day}: {d.title}
                  <span className="ml-1 text-[10px] text-warm-gray-light">
                    {d.spots.length}个地点
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 攻略信息 */}
          <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-3 shadow-sm space-y-2">
            <p className="text-[10px] tracking-widest text-celadon-600 uppercase">📋 攻略概览</p>
            <div className="space-y-1.5 text-xs text-warm-gray-muted">
              <p>📍 {guide.city}{guide.province ? ` · ${guide.province}` : ''}</p>
              <p>📅 {guide.days}天行程 · {allSpots.length}个地点</p>
              <p>💰 {guide.budget}</p>
              <p>✨ {guide.interests?.join(' · ') || '文化 · 美食'}</p>
            </div>
          </div>

          {/* 方言速查 */}
          {guide.dialect && guide.dialect.length > 0 && (
            <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-3 shadow-sm">
              <p className="text-[10px] tracking-widest text-celadon-600 uppercase mb-2">🗣️ 方言速查</p>
              <div className="space-y-1.5">
                {guide.dialect.map((d, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-celadon-700">{d.dialect}</span>
                    <span className="text-warm-gray-muted mx-1">—</span>
                    <span className="text-warm-gray">{d.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 在地体验 */}
          {guide.localExperiences && guide.localExperiences.length > 0 && (
            <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-3 shadow-sm">
              <p className="text-[10px] tracking-widest text-celadon-600 uppercase mb-2">🎭 在地体验</p>
              <div className="space-y-1.5">
                {guide.localExperiences.map((exp, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-celadon-700">{exp.name}</span>
                    <span className="text-warm-gray-muted ml-1">{exp.type}</span>
                    <p className="text-warm-gray-muted text-[11px] mt-0.5">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 旅行贴士 */}
          {guide.tips && guide.tips.length > 0 && (
            <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-3 shadow-sm">
              <p className="text-[10px] tracking-widest text-celadon-600 uppercase mb-2">💡 旅行贴士</p>
              <ul className="space-y-1">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-warm-gray-muted flex gap-1.5">
                    <span className="text-celadon-500 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 迹录员提示 */}
          <div className="rounded-xl border border-dashed border-celadon-300 bg-celadon-50/50 p-3 text-center">
            <p className="text-[10px] text-celadon-600 mb-1">💬 想调整攻略？</p>
            <p className="text-[11px] text-warm-gray-muted">点击右下角迹录员继续对话<br/>如"加一天行程""多推荐点美食"</p>
          </div>
        </div>
      }
      below={
        guide.routeIntro ? (
          <div className="rounded-xl border border-celadon-200/50 bg-white/80 p-4 shadow-sm">
            <p className="text-[10px] tracking-widest text-celadon-600 uppercase mb-1.5">📝 路线引言</p>
            <p className="text-xs text-warm-gray leading-relaxed font-serif italic">
              {guide.routeIntro}
            </p>
          </div>
        ) : undefined
      }
    >
      <GuideMapExplorer
        guide={guide}
        spots={filteredSpots}
        layout="explorer"
        showChips
        mapTitle="书中地点 · 点击展开详情"
        mapClassName="h-[min(calc(100vh-240px),560px)] sm:h-[min(calc(100vh-220px),580px)]"
      />
    </GuideExplorerShell>
  )
}

export default function JiluGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-warm-gray-muted">
          加载中…
        </div>
      }
    >
      <JiluGuideContent />
    </Suspense>
  )
}
