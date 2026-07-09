'use client'

import { BookGuideResponse } from '@/types/book-guide'
import { Guide } from '@/types'
import { cn } from '@/lib/utils'

interface BookGuideResultViewProps {
  result: BookGuideResponse
  compact?: boolean
}

export function BookGuideResultView({ result, compact }: BookGuideResultViewProps) {
  const { guide, location对照, diningRecommendations, dayTransports, meta } = result

  return (
    <div className={cn('space-y-5', compact ? 'text-sm' : '')}>
      {/* 头部摘要 */}
      <div className="rounded-xl border border-literary-sand bg-literary-paper/60 p-4">
        <p className="text-[10px] tracking-widest text-literary-wine uppercase">AI 生成攻略</p>
        <h3 className="mt-1 font-serif font-semibold text-literary-ink">{guide.title}</h3>
        <p className="mt-1 text-xs text-literary-muted">{guide.subtitle}</p>
        {guide.routeIntro && (
          <p className="mt-2 text-xs text-literary-muted leading-relaxed line-clamp-3">
            {guide.routeIntro}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-white border border-literary-sand">
            {meta.extractedCount} 处书中地点
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white border border-literary-sand">
            {meta.verifiedCount} 处 POI 验证
          </span>
          {meta.mock && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              演示模式
            </span>
          )}
        </div>
      </div>

      {/* 书中地点对照表 */}
      <section>
        <h4 className="text-xs font-serif font-semibold text-literary-ink mb-2">
          📖 书中地点对照表
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {location对照.map((row, i) => (
            <div
              key={i}
              className="rounded-lg border border-literary-sand/80 bg-white/80 p-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-literary-ink">{row.bookName}</span>
                  <span className="mx-1 text-literary-muted">→</span>
                  <span className="text-literary-wine">{row.realName}</span>
                </div>
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-literary-sand/60">
                  {row.category}
                </span>
              </div>
              {row.originalText && (
                <p className="mt-1.5 text-literary-muted font-serif italic line-clamp-2">
                  「{row.originalText}」
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-literary-muted">
                {row.address && <span>📍 {row.address}</span>}
                {row.openingHours && <span>🕐 {row.openingHours}</span>}
                {row.ticketInfo && <span>🎫 {row.ticketInfo}</span>}
                {row.verified && (
                  <span className="text-celadon-600">✓ 已验证</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 每日行程摘要 */}
      <section>
        <h4 className="text-xs font-serif font-semibold text-literary-ink mb-2">
          🗓️ 每日行程
        </h4>
        <div className="space-y-3">
          {guide.dayPlans.map(plan => {
            const transport = dayTransports.find(t => t.day === plan.day)
            return (
              <div
                key={plan.day}
                className="rounded-lg border border-celadon-200/50 bg-white/70 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-literary-ink">
                    第{plan.day}天 · {plan.title}
                  </span>
                  {plan.budgetEstimate && (
                    <span className="text-[10px] text-literary-muted">{plan.budgetEstimate}</span>
                  )}
                </div>
                <ol className="space-y-1.5">
                  {plan.spots.map((spot, si) => (
                    <li key={spot.id} className="flex gap-2 text-[11px]">
                      <span className="shrink-0 w-5 text-literary-wine font-medium">{si + 1}</span>
                      <div className="min-w-0">
                        <span className="font-medium text-literary-ink">
                          {spot.emoji} {spot.name}
                        </span>
                        <span className="ml-2 text-literary-muted">
                          {spot.timeSlot} · {spot.duration}
                        </span>
                        {spot.originalText && (
                          <p className="mt-0.5 text-literary-muted font-serif italic line-clamp-1">
                            「{spot.originalText}」
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {transport && transport.segments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-literary-sand/60">
                    <p className="text-[10px] text-literary-muted mb-1">交通</p>
                    {transport.segments.map((seg, ti) => (
                      <p key={ti} className="text-[10px] text-literary-muted">
                        {seg.from} → {seg.to} · {seg.mode} · {seg.duration}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 餐饮推荐 */}
      {diningRecommendations.length > 0 && (
        <section>
          <h4 className="text-xs font-serif font-semibold text-literary-ink mb-2">
            🍜 餐饮推荐
          </h4>
          <div className="grid gap-2">
            {diningRecommendations.map((d, i) => (
              <div key={i} className="rounded-lg bg-literary-sand/40 px-3 py-2 text-xs">
                <span className="font-medium text-literary-ink">{d.name}</span>
                <p className="text-literary-muted mt-0.5">{d.desc}</p>
                {d.bookReference && (
                  <p className="text-[10px] text-literary-wine mt-0.5">📖 {d.bookReference}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 实用贴士 */}
      {guide.tips && guide.tips.length > 0 && (
        <section>
          <h4 className="text-xs font-serif font-semibold text-literary-ink mb-2">
            💡 实用贴士
          </h4>
          <ul className="space-y-1 text-xs text-literary-muted">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-literary-wine">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** 将完整结果存入 sessionStorage 并跳转详情页 */
export function saveBookGuideAndNavigate(result: BookGuideResponse) {
  try {
    sessionStorage.setItem(
      'xuncheng-book-guide-result',
      JSON.stringify(result)
    )
  } catch {
    /* quota */
  }
  window.location.href = '/guide/generated/'
}

export type { Guide }
