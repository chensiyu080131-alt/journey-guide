'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Spot } from '@/types'
import { Badge } from './ui'

interface SpotCardProps {
  spot: Spot
  index: number
}

export function SpotCard({ spot, index }: SpotCardProps) {
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* 顶部色条 */}
      <div className={cn(
        'h-1',
        spot.type === '美食' ? 'bg-vermilion' : spot.type === '体验' ? 'bg-jade' : 'bg-indigo'
      )} />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-charcoal flex items-center justify-center text-xl">
            {spot.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-lg text-charcoal">{spot.name}</h4>
              <Badge variant={spot.type === '美食' ? '美食' : spot.type === '体验' ? '体验' : '景点'}>
                {spot.type}
              </Badge>
            </div>
            <p className="text-sm text-ink-400 mt-1">{spot.desc}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="default">{spot.duration}</Badge>
          {spot.budgetHint && <Badge variant="default">{spot.budgetHint}</Badge>}
          {spot.timeSlot && <Badge variant="default">{spot.timeSlot}</Badge>}
          {spot.goodNow && <Badge variant="active">现在适合去</Badge>}
        </div>

        {spot.originalText && (
          <div className="mb-4">
            <div className="rounded-2xl bg-ink-50 border border-ink-100 p-4">
              <p className="text-xs font-medium text-indigo uppercase tracking-wider mb-2">书中原文</p>
              <p className="text-sm leading-relaxed font-serif italic text-charcoal">
                "{spot.originalText}"
              </p>
              {spot.originalSource && (
                <p className="text-xs text-ink-400 mt-2">—— {spot.originalSource}</p>
              )}
            </div>

            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="mt-2 w-full text-left text-xs text-xuncheng-600 font-medium hover:text-xuncheng-700 transition-colors"
            >
              {showOriginal ? '▾ 收起实景对照' : '▸ 查看实景对照'}
            </button>

            {showOriginal && spot.realityNote && (
              <div className="mt-2 rounded-2xl p-4 bg-jade/5 border border-jade/20 animate-fade-in">
                <p className="text-xs font-medium text-jade mb-1">实景对照</p>
                <p className="text-sm text-ink-600 leading-relaxed">{spot.realityNote}</p>
              </div>
            )}
          </div>
        )}

        {spot.story && !spot.originalText && (
          <div className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600 leading-relaxed">
            {spot.story}
          </div>
        )}

        {spot.address && (
          <p className="mt-3 text-xs text-ink-400 flex items-center gap-1">
            📍 {spot.address}
          </p>
        )}
      </div>
    </div>
  )
}
