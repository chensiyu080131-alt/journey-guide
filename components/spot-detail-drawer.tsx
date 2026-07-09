'use client'

import Image from 'next/image'
import { Spot } from '@/types'
import { getSpotMedia } from '@/lib/spot-media'
import { cn } from '@/lib/utils'

interface SpotDetailDrawerProps {
  spot: Spot | null
  index: number
  onClose: () => void
  checkedIn?: boolean
  onCheckIn?: () => void
  theme?: 'default' | 'literary'
}

export function SpotDetailDrawer({
  spot,
  index,
  onClose,
  checkedIn,
  onCheckIn,
  theme = 'default',
}: SpotDetailDrawerProps) {
  if (!spot) return null

  const isLiterary = theme === 'literary'
  const media = getSpotMedia(spot.id)
  const historicalImage = spot.historicalImage || media?.historicalImage
  const realityImage = spot.realityImage || media?.realityImage

  return (
    <>
      <div
        className="fixed inset-0 bg-literary-ink/15 backdrop-blur-[2px] z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto',
          'rounded-t-3xl shadow-2xl animate-slide-up',
          isLiterary
            ? 'bg-literary-paper border-t border-literary-sand'
            : 'bg-paper-warm border-t border-celadon-200/60'
        )}
        role="dialog"
        aria-label={`${spot.name}详情`}
      >
        <div className="xc-container max-w-2xl py-6 pb-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium',
                  isLiterary ? 'bg-literary-wine' : 'bg-celadon-500'
                )}
              >
                {index + 1}
              </span>
              <div>
                <h3 className={cn('text-lg font-serif font-bold', isLiterary ? 'text-literary-ink' : 'text-warm-gray')}>
                  {spot.name}
                </h3>
                <p className={cn('text-xs mt-0.5', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
                  {spot.address}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'h-8 w-8 rounded-full border flex items-center justify-center',
                isLiterary
                  ? 'border-literary-sand text-literary-muted hover:bg-literary-sand/50'
                  : 'border-celadon-200 text-warm-gray-muted hover:bg-camel-light'
              )}
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          <p className={cn('text-sm leading-relaxed mb-5', isLiterary ? 'text-literary-muted' : 'text-warm-gray-light')}>
            {spot.desc}
          </p>

          {spot.originalText && (
            <div
              className={cn(
                'rounded-2xl border p-4 mb-4',
                isLiterary
                  ? 'bg-literary-sand/40 border-literary-sand'
                  : 'bg-camel-light/60 border-celadon-200/40'
              )}
            >
              <p className={cn('text-[10px] font-medium tracking-widest uppercase mb-2', isLiterary ? 'text-literary-wine' : 'text-celadon-600')}>
                书中原文 · AI 识别落点
              </p>
              <p className={cn('text-sm font-serif italic leading-relaxed', isLiterary ? 'text-literary-ink' : 'text-warm-gray')}>
                「{spot.originalText}」
              </p>
              {spot.originalSource && (
                <p className={cn('text-xs mt-2', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
                  —— {spot.originalSource}
                </p>
              )}
            </div>
          )}

          {spot.realityNote && (
            <div
              className={cn(
                'rounded-2xl border p-4 mb-4',
                isLiterary
                  ? 'bg-white/70 border-literary-sand/80'
                  : 'bg-celadon-50/50 border-celadon-200/30'
              )}
            >
              <p className={cn('text-[10px] font-medium tracking-widest uppercase mb-2', isLiterary ? 'text-literary-wine' : 'text-celadon-600')}>
                现实地理位置对照
              </p>
              <p className={cn('text-sm leading-relaxed', isLiterary ? 'text-literary-muted' : 'text-warm-gray-light')}>
                {spot.realityNote}
              </p>
            </div>
          )}

          {(historicalImage || realityImage) && (
            <div className={cn('grid gap-3 mb-4', historicalImage && realityImage ? 'grid-cols-2' : 'grid-cols-1')}>
              {historicalImage && (
                <div>
                  <div
                    className={cn(
                      'relative aspect-[4/3] rounded-xl overflow-hidden border bg-literary-sand/30',
                      isLiterary ? 'border-literary-sand' : 'border-celadon-200/40 bg-camel-light'
                    )}
                  >
                    <Image
                      src={historicalImage}
                      alt={media?.historicalCaption || `${spot.name}历史影像`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="240px"
                    />
                  </div>
                  <p className={cn('text-[10px] mt-1.5 text-center', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
                    {media?.historicalCaption || '历史影像'}
                  </p>
                </div>
              )}
              {realityImage && (
                <div>
                  <div
                    className={cn(
                      'relative aspect-[4/3] rounded-xl overflow-hidden border',
                      isLiterary ? 'border-literary-sand bg-literary-sand/30' : 'border-celadon-200/40 bg-camel-light'
                    )}
                  >
                    <Image
                      src={realityImage}
                      alt={media?.realityCaption || `${spot.name}实景`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="240px"
                    />
                  </div>
                  <p className={cn('text-[10px] mt-1.5 text-center', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
                    {media?.realityCaption || `${spot.name}实景`}
                  </p>
                </div>
              )}
            </div>
          )}

          {spot.story && (
            <div
              className={cn(
                'rounded-2xl border p-4 mb-4',
                isLiterary ? 'bg-white/60 border-literary-sand/70' : 'bg-white/50 border-celadon-100'
              )}
            >
              <p className={cn('text-[10px] font-medium tracking-widest uppercase mb-2', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
                点位概况
              </p>
              <p className={cn('text-sm leading-relaxed', isLiterary ? 'text-literary-muted' : 'text-warm-gray-light')}>
                {spot.story}
              </p>
            </div>
          )}

          {spot.interactiveTask && (
            <div className={cn('rounded-2xl border p-4 mb-4', isLiterary ? 'bg-literary-wine/5 border-literary-wine/20' : 'bg-seal/5 border-seal/20')}>
              <p className={cn('text-[10px] font-medium tracking-widest uppercase mb-2', isLiterary ? 'text-literary-wine' : 'text-seal')}>
                特色体验
              </p>
              <p className={cn('text-sm font-medium', isLiterary ? 'text-literary-ink' : 'text-warm-gray')}>
                {spot.interactiveTask.title}
              </p>
              <p className={cn('text-sm mt-1 leading-relaxed', isLiterary ? 'text-literary-muted' : 'text-warm-gray-light')}>
                {spot.interactiveTask.description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs mb-4">
            <span className={cn('px-2.5 py-1 rounded-full border', isLiterary ? 'bg-literary-sand/50 border-literary-sand text-literary-muted' : 'bg-camel-light border-celadon-200/30 text-warm-gray-muted')}>
              ⏱ 预估停留 {spot.duration}
            </span>
            {spot.budgetHint && (
              <span className={cn('px-2.5 py-1 rounded-full border', isLiterary ? 'bg-literary-sand/50 border-literary-sand text-literary-muted' : 'bg-camel-light border-celadon-200/30 text-warm-gray-muted')}>
                💰 {spot.budgetHint}
              </span>
            )}
            <span className={cn('px-2.5 py-1 rounded-full border', isLiterary ? 'bg-literary-sand/50 border-literary-sand text-literary-muted' : 'bg-camel-light border-celadon-200/30 text-warm-gray-muted')}>
              {spot.type}
            </span>
            {spot.photoSpot && (
              <span className={cn('px-2.5 py-1 rounded-full border', isLiterary ? 'bg-literary-wine/10 border-literary-wine/20 text-literary-wine' : 'bg-celadon-50 border-celadon-200/30 text-warm-gray-muted')}>
                📷 经典机位
              </span>
            )}
          </div>

          {onCheckIn && (
            <button
              type="button"
              onClick={onCheckIn}
              disabled={checkedIn}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-medium transition-colors',
                isLiterary
                  ? checkedIn
                    ? 'bg-literary-sand text-literary-wine border border-literary-sand'
                    : 'bg-literary-wine text-white hover:bg-literary-wine-dark'
                  : checkedIn
                    ? 'bg-celadon-100 text-celadon-700 border border-celadon-200'
                    : 'bg-celadon-500 text-white hover:bg-celadon-600'
              )}
            >
              {checkedIn ? '✓ 已打卡此点位' : '打卡此点位'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
