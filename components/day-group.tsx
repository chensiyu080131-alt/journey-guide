'use client'

import { DayPlan } from '@/types'
import { SpotCard } from './spot-card'

interface DayGroupProps {
  dayPlan: DayPlan
}

export function DayGroup({ dayPlan }: DayGroupProps) {
  const timeSlots = ['上午', '中午', '下午', '晚上'] as const
  const slotEmojis: Record<string, string> = {
    '上午': '🌅',
    '中午': '🍜',
    '下午': '☀️',
    '晚上': '🌙',
  }

  return (
    <div className="space-y-4">
      {/* 天数标题 */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-charcoal text-white flex items-center justify-center font-bold text-sm">
          D{dayPlan.day}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-ink-900">{dayPlan.title}</h3>
          {dayPlan.budgetEstimate && (
            <p className="text-xs text-ink-400">预算 {dayPlan.budgetEstimate}</p>
          )}
        </div>
      </div>

      {/* 按时段分组展示 */}
      <div className="ml-5 pl-5 border-l-2 border-xuncheng-200 space-y-4">
        {timeSlots.map(slot => {
          const slotSpots = dayPlan.spots.filter(s => s.timeSlot === slot)
          if (slotSpots.length === 0) return null

          return (
            <div key={slot} className="space-y-3">
              <div className="flex items-center gap-2 -ml-7">
                <span className="text-base">{slotEmojis[slot]}</span>
                <span className="text-sm font-medium text-ink-500">{slot}</span>
                <div className="flex-1 h-px bg-ink-100" />
              </div>
              <div className="space-y-3">
                {slotSpots.map((spot, i) => (
                  <SpotCard key={spot.id} spot={spot} index={i} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
