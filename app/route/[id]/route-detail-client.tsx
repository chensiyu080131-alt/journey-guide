'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Guide, Spot } from '@/types'
import { GuideMap } from '@/components/guide-map'
import { Badge, Card } from '@/components/ui'
import { CheckinCard } from '@/components/checkin-card'
import { getCheckedInPointIds } from '@/lib/checkin'

interface Props {
  guide: Guide
  fromSupabase: boolean
}

/**
 * 路线详情页客户端组件（任务3 主体 + 任务4 打卡按钮）
 *
 * 4 区块（任务3 要求）：
 *   1. 路线概览（标题/作者/城市/天数/标签）
 *   2. 点位列表（可滚动卡片，每个点位显示名称+原文摘录+地址+打卡按钮）
 *   3. 地图导航（复用 GuideMap，标记所有点位 + 文字路线降级）
 *   4. 打卡（CheckinCard，GPS 验证 + 文学卡片解锁）
 *
 * 视觉：复用现有 xuncheng、ink、paper-warm 设计系统，不引入新配色。
 */
export function RouteDetailClient({ guide, fromSupabase }: Props) {
  const allSpots = guide.dayPlans.flatMap(d => d.spots)

  return (
    <div className="min-h-screen bg-paper-warm pb-16">
      {/* 顶栏（不动首页导航，这里是详情页独立顶栏） */}
      <header className="sticky top-0 z-20 bg-paper-warm/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-ink-500 hover:text-xuncheng-600 text-sm flex items-center gap-1">
            ← 返回首页
          </Link>
          <span className="text-ink-200">/</span>
          <span className="text-sm text-ink-600 truncate">{guide.city} · 路线</span>
          <span className="ml-auto text-xs text-ink-300">
            {fromSupabase ? '☁ 数据源：Supabase' : '📒 数据源：本地'}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-8 mt-6">
        {/* ── 区块1：路线概览 ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-xuncheng-600">
            <Badge variant={guide.entryType === '书籍' ? '文化' : 'default'}>
              📖 跟着书走
            </Badge>
            {guide.relatedAuthor && (
              <span className="text-ink-500">{guide.relatedAuthor}</span>
            )}
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink-900 leading-tight">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="text-base text-ink-500">{guide.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <span>📍 {guide.city} · {guide.province}</span>
            <span className="text-ink-200">·</span>
            <span>🗓 {guide.days} 天</span>
            {guide.relatedBook && (
              <>
                <span className="text-ink-200">·</span>
                <span>📕 {guide.relatedBook}</span>
              </>
            )}
            {guide.interests.map(t => (
              <Badge key={t} variant={t as '文化' | '美食' | '自然' | '体验'}>{t}</Badge>
            ))}
          </div>
        </section>

        {/* ── 路线引言 ── */}
        {guide.routeIntro && (
          <Card className="p-5 bg-gradient-to-br from-xuncheng-50/60 to-paper border-xuncheng-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="font-bold text-sm text-xuncheng-700 mb-2">这条路的故事</h3>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                  {guide.routeIntro}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── 区块3：地图导航 ── */}
        <GuideMap guide={guide} />

        {/* ── 区块2：点位列表（含打卡按钮 = 任务4） ── */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-serif font-bold text-ink-900 flex items-center gap-2">
              📍 点位清单
            </h2>
            <span className="text-xs text-ink-400">共 {allSpots.length} 个点位</span>
          </div>
          <SpotList spots={allSpots} guide={guide} />
        </section>

        {/* ── 旅行贴士 ── */}
        {guide.tips && guide.tips.length > 0 && (
          <Card className="p-4 bg-xuncheng-50/40 border-xuncheng-100">
            <h3 className="font-bold text-sm text-xuncheng-700 mb-2">💡 旅行贴士</h3>
            <ul className="space-y-1.5">
              {guide.tips.map((tip, i) => (
                <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                  <span className="text-xuncheng-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 底部说明 */}
        <div className="text-center text-xs text-ink-300 pt-4 space-y-1">
          <p>「寻迹」· 有迹可循，寻迹而至</p>
          <p>跟着书本去旅行，让文学照进现实</p>
        </div>
      </main>
    </div>
  )
}

/** 点位列表：每个点位一张卡片，含原文摘录 + 打卡按钮 */
function SpotList({ spots, guide }: { spots: Spot[]; guide: Guide }) {
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())

  // 拉取当前用户已打卡点位（任务4：打卡状态从后端读，刷新不丢）
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // userId 暂取 localStorage 的匿名 id（接入登录后改为真实 auth.uid）
      const userId = typeof window !== 'undefined'
        ? localStorage.getItem('xunji:demo-uid')
        : null
      const ids = await getCheckedInPointIds(userId, guide.id)
      if (!cancelled) setCheckedIn(ids)
    })()
    return () => { cancelled = true }
  }, [guide.id])

  return (
    <div className="space-y-3">
      {spots.map((spot, idx) => (
        <SpotCardItem
          key={spot.id}
          spot={spot}
          seq={idx + 1}
          guideId={guide.id}
          checkedIn={checkedIn.has(spot.id)}
          onChecked={() => setCheckedIn(prev => new Set(prev).add(spot.id))}
        />
      ))}
    </div>
  )
}

/** 单个点位卡片：序号+名称+原文摘录+地址+打卡按钮 */
function SpotCardItem({
  spot, seq, guideId, checkedIn, onChecked
}: {
  spot: Spot
  seq: number
  guideId: string
  checkedIn: boolean
  onChecked: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-xuncheng-500 text-white text-xs font-bold flex items-center justify-center">
          {seq}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{spot.emoji}</span>
            <h3 className="font-bold text-ink-900">{spot.name}</h3>
            <Badge variant={spot.type === '美食' ? '美食' : spot.type === '景点' ? '景点' : '体验'}>
              {spot.type}
            </Badge>
            {spot.flavor && (
              <Badge variant="default">五味·{spot.flavor}</Badge>
            )}
          </div>

          {spot.desc && (
            <p className="text-sm text-ink-500 mt-1">{spot.desc}</p>
          )}

          {/* 原文摘录（任务2 数据的核心展示） */}
          {spot.originalText && (
            <blockquote className="mt-3 pl-3 border-l-2 border-xuncheng-300 bg-xuncheng-50/40 py-2 pr-3 rounded-r">
              <p className="text-sm text-ink-700 leading-relaxed font-serif italic">
                「{spot.originalText}」
              </p>
              {spot.originalSource && (
                <p className="text-xs text-xuncheng-600 mt-1.5">—— {spot.originalSource}</p>
              )}
            </blockquote>
          )}

          {/* 现代解读 */}
          {spot.realityNote && (
            <p className="text-sm text-ink-600 mt-2 leading-relaxed">{spot.realityNote}</p>
          )}

          {/* 地址 + 预算 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-ink-400">
            {spot.address && <span>📍 {spot.address}</span>}
            {spot.budgetHint && <span>💰 {spot.budgetHint}</span>}
            {spot.duration && <span>⏱ {spot.duration}</span>}
          </div>

          {/* ★ 打卡按钮（任务4，连接 CheckinCard 组件） */}
          <div className="mt-3">
            <CheckinCard
              spot={spot}
              guideId={guideId}
              checkedIn={checkedIn}
              onChecked={onChecked}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
