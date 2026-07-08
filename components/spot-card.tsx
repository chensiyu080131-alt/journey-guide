'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Spot } from '@/types'
import { Badge } from './ui'
import { InteractiveTask } from './interactive-task'

interface SpotCardProps {
  spot: Spot
  index: number
}

export function SpotCard({ spot, index }: SpotCardProps) {
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div
      className="bg-white rounded-xl border border-ink-100 shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* 头部：emoji + 名称 + 类型 */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-xuncheng-50 flex items-center justify-center text-xl">
          {spot.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-ink-900">{spot.name}</h4>
            <Badge variant={spot.type === '美食' ? '美食' : spot.type === '体验' ? '体验' : '景点'}>
              {spot.type === '美食' ? '🍽️' : spot.type === '体验' ? '🎯' : '📍'} {spot.type}
            </Badge>
          </div>
          <p className="text-sm text-ink-500 mt-0.5">{spot.desc}</p>
        </div>
      </div>

      {/* 标签行 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="default">⏱ {spot.duration}</Badge>
        {spot.budgetHint && <Badge variant="default">💰 {spot.budgetHint}</Badge>}
        {spot.timeSlot && <Badge variant="default">🕐 {spot.timeSlot}</Badge>}
        {spot.photoSpot && <Badge variant="default">📷 拍照点</Badge>}
        {spot.goodNow && <Badge variant="active">✨ 现在适合去</Badge>}
        {spot.interactiveTask && <Badge variant="体验">🎮 互动</Badge>}
      </div>

      {/* ★ 原文+实景对照（v2核心功能） */}
      {spot.originalText && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full text-left"
          >
            <div className={cn(
              'rounded-lg p-3 transition-all duration-300 cursor-pointer',
              showOriginal
                ? 'bg-indigo/5 border border-indigo/20'
                : 'bg-paper hover:bg-xuncheng-50/50'
            )}>
              {/* 原文片段 */}
              <div className="flex items-start gap-2">
                <span className="text-indigo flex-shrink-0 mt-0.5">❝</span>
                <div className="flex-1">
                  <p className={cn(
                    'text-sm leading-relaxed font-serif italic',
                    showOriginal ? 'text-indigo' : 'text-ink-600'
                  )}>
                    {spot.originalText}
                  </p>
                  {spot.originalSource && (
                    <p className="text-xs text-ink-400 mt-1.5">
                      —— {spot.originalSource}
                    </p>
                  )}
                </div>
              </div>

              {/* 展开/收起提示 */}
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-ink-400">
                  {showOriginal ? '▾ 收起实景对照' : '▸ 查看实景对照'}
                </span>
              </div>
            </div>
          </button>

          {/* 实景对照 */}
          {showOriginal && spot.realityNote && (
            <div className="mt-2 rounded-lg p-3 bg-jade/5 border border-jade/20 animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-jade flex-shrink-0 mt-0.5">🔍</span>
                <p className="text-sm text-ink-600 leading-relaxed">
                  {spot.realityNote}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 故事/历史（无原文时显示） */}
      {spot.story && !spot.originalText && (
        <div className="bg-paper rounded-lg p-3 text-sm text-ink-600 leading-relaxed">
          <span className="text-xuncheng-500 font-medium">📖</span>{' '}
          {spot.story}
        </div>
      )}

      {/* 互动任务 */}
      {spot.interactiveTask && (
        <InteractiveTask task={spot.interactiveTask} />
      )}

      {/* "现在适合去"原因 */}
      {spot.goodNow && spot.goodNowReason && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-xuncheng-600">
          <span className="w-1.5 h-1.5 rounded-full bg-xuncheng-400 animate-pulse" />
          {spot.goodNowReason}
        </div>
      )}

      {/* 地址 */}
      {spot.address && (
        <div className="mt-2 text-xs text-ink-400 flex items-center gap-1">
          📍 {spot.address}
        </div>
      )}
    </div>
  )
}
