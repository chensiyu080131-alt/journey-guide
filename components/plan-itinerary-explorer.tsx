'use client'

import { useCallback, useMemo, useState } from 'react'
import { Guide, OptionalRecommendSpot, ScheduleBlock, Spot } from '@/types'
import { PlanAspect } from '@/lib/guide-category'
import {
  buildItinerary,
  getRouteVariants,
  getSpotsForMap,
} from '@/lib/itinerary-planner'
import { getOptionalSpotsForGuide } from '@/lib/optional-spots'
import { cn } from '@/lib/utils'
import { Card, Badge } from './ui'
import { GuideMapExplorer } from './guide-map-explorer'
import { SpotDetailDrawer } from './spot-detail-drawer'

interface PlanItineraryExplorerProps {
  guide: Guide
  aspect: PlanAspect
  /** 地图优先：首屏展示地图，行程详情折叠在下 */
  mapFirst?: boolean
}

const blockIcons: Record<string, string> = {
  集合: '📍',
  上午: '🌅',
  午饭: '🍜',
  下午: '☀️',
  晚饭: '🍽️',
  晚间: '🌙',
}

export function PlanItineraryExplorer({ guide, aspect, mapFirst = false }: PlanItineraryExplorerProps) {
  const variants = useMemo(() => getRouteVariants(guide, aspect), [guide, aspect])
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '1d')
  const [selectedDay, setSelectedDay] = useState(1)
  const [pendingOptionals, setPendingOptionals] = useState<Set<string>>(new Set())
  const [confirmedOptionals, setConfirmedOptionals] = useState<Set<string>>(new Set())
  const [routeOptimized, setRouteOptimized] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const [detailsOpen, setDetailsOpen] = useState(!mapFirst)

  const optionalSpots = useMemo(() => getOptionalSpotsForGuide(guide.id, guide), [guide])

  const { itineraryDays, spotMap } = useMemo(
    () => buildItinerary(guide, aspect, variantId, Array.from(confirmedOptionals)),
    [guide, aspect, variantId, confirmedOptionals]
  )

  const activeDay = itineraryDays.find(d => d.day === selectedDay) ?? itineraryDays[0]
  const mapSpots = useMemo(
    () => (activeDay ? getSpotsForMap(itineraryDays, spotMap, activeDay.day) : []),
    [itineraryDays, spotMap, activeDay]
  )

  const openSpot = useCallback((spotId: string) => {
    const spot = spotMap.get(spotId)
    if (!spot) return
    const idx = activeDay?.spotIds.indexOf(spotId) ?? 0
    setSelectedSpot(spot)
    setSelectedIndex(idx)
  }, [spotMap, activeDay])

  const togglePending = (id: string) => {
    setPendingOptionals(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setRouteOptimized(false)
  }

  const confirmOptionals = () => {
    if (pendingOptionals.size === 0) return
    setConfirmedOptionals(prev => new Set([...Array.from(prev), ...Array.from(pendingOptionals)]))
    setPendingOptionals(new Set())
    setRouteOptimized(true)
  }

  const handleVariantChange = (id: string) => {
    setVariantId(id)
    setSelectedDay(1)
    setRouteOptimized(false)
  }

  const handleCheckIn = (spotId: string) => {
    setCheckedIn(prev => new Set([...Array.from(prev), spotId]))
  }

  const variantToolbar = (
    <div className="flex flex-wrap items-center gap-1.5 mb-2">
      {variants.map(v => (
        <button
          key={v.id}
          type="button"
          onClick={() => handleVariantChange(v.id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-[11px] border transition-all',
            variantId === v.id
              ? 'bg-celadon-500 text-white border-celadon-500'
              : 'bg-white/70 border-celadon-200/50 text-warm-gray-muted hover:border-celadon-300'
          )}
        >
          {v.title}
        </button>
      ))}
      {itineraryDays.length > 1 &&
        itineraryDays.map(d => (
          <button
            key={d.day}
            type="button"
            onClick={() => setSelectedDay(d.day)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] border transition-all',
              selectedDay === d.day
                ? 'bg-celadon-500 text-white border-celadon-500'
                : 'bg-white/70 border-celadon-200/50 text-warm-gray-muted hover:border-celadon-300'
            )}
          >
            Day {d.day}
          </button>
        ))}
    </div>
  )

  const mapSection = (
    <GuideMapExplorer
      guide={guide}
      spots={mapSpots}
      showChips={mapFirst}
      layout="explorer"
      mapTitle={mapFirst ? 'AI 识别原文景点 · 点击展开详情' : '行程点位'}
      mapClassName={
        mapFirst
          ? 'h-[min(calc(100vh-280px),520px)] sm:h-[min(calc(100vh-260px),540px)]'
          : 'h-[min(44vh,440px)] sm:h-[min(48vh,480px)]'
      }
      onSpotSelect={(spot, idx) => {
        setSelectedSpot(spot)
        setSelectedIndex(idx)
      }}
    />
  )

  const scheduleSection = activeDay && (
    <Card className="p-5 border-celadon-200/40 bg-white/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-warm-gray">
          Day {activeDay.day} · {activeDay.title}
        </h3>
        {activeDay.budgetEstimate && (
          <span className="text-xs text-warm-gray-muted">预算 {activeDay.budgetEstimate}</span>
        )}
      </div>
      <ScheduleBlockView block={activeDay.meetingPoint} onSpotClick={openSpot} checkedIn={checkedIn} />
      {activeDay.blocks.map(block => (
        <ScheduleBlockView
          key={block.type + block.label}
          block={block}
          onSpotClick={openSpot}
          checkedIn={checkedIn}
        />
      ))}
    </Card>
  )

  const optionalSection = optionalSpots.length > 0 && (
    <section>
      <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-2">
        沿途推荐 · 非遗文化 / 历史文化（可选项）
      </p>
      <div className="space-y-2">
        {optionalSpots.map(opt => (
          <OptionalSpotCard
            key={opt.id}
            opt={opt}
            selected={pendingOptionals.has(opt.id) || confirmedOptionals.has(opt.id)}
            confirmed={confirmedOptionals.has(opt.id)}
            onToggle={() => !confirmedOptionals.has(opt.id) && togglePending(opt.id)}
          />
        ))}
      </div>
      {pendingOptionals.size > 0 && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={confirmOptionals}
            className="px-5 py-2.5 rounded-full bg-celadon-500 text-white text-sm font-medium hover:bg-celadon-600 transition-colors"
          >
            确认选择（{pendingOptionals.size} 项）并优化路线
          </button>
        </div>
      )}
      {routeOptimized && (
        <p className="mt-2 text-xs text-celadon-600 bg-celadon-50 px-3 py-2 rounded-lg border border-celadon-200/40">
          ✓ 路线已优化，地图与行程表已更新
        </p>
      )}
    </section>
  )

  if (mapFirst) {
    return (
      <div className="flex flex-col min-h-0">
        {variantToolbar}
        {mapSection}
        <button
          type="button"
          onClick={() => setDetailsOpen(v => !v)}
          className="mt-3 text-xs text-celadon-600 hover:text-celadon-700 font-serif text-left"
        >
          {detailsOpen ? '收起行程详情 ▲' : '展开行程详情 · 方案与时间表 ▼'}
        </button>
        {detailsOpen && (
          <div className="mt-4 space-y-6">
            {scheduleSection}
            {optionalSection}
          </div>
        )}
        <SpotDetailDrawer
          spot={selectedSpot}
          index={selectedIndex}
          onClose={() => setSelectedSpot(null)}
          checkedIn={selectedSpot ? checkedIn.has(selectedSpot.id) : false}
          onCheckIn={selectedSpot ? () => handleCheckIn(selectedSpot.id) : undefined}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-3">
          AI 路线规划 · 选择方案
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVariantChange(v.id)}
              className={cn(
                'text-left px-4 py-3 rounded-xl border transition-all min-w-[140px]',
                variantId === v.id
                  ? 'border-celadon-400 bg-celadon-50/80 shadow-sm'
                  : 'border-celadon-200/50 bg-white/50 hover:border-celadon-300'
              )}
            >
              <p className="text-sm font-serif font-medium text-warm-gray">{v.title}</p>
              <p className="text-[10px] text-warm-gray-muted mt-1 line-clamp-2">{v.summary}</p>
              <p className="text-[10px] text-celadon-600 mt-1.5">{v.pace} · {v.budgetHint}</p>
            </button>
          ))}
        </div>
      </section>

      {itineraryDays.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {itineraryDays.map(d => (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                selectedDay === d.day
                  ? 'bg-celadon-500 text-white border-celadon-500'
                  : 'bg-white/60 text-warm-gray border-celadon-200/50 hover:border-celadon-300'
              )}
            >
              Day {d.day}
            </button>
          ))}
        </div>
      )}

      {scheduleSection}
      {optionalSection}

      <section>
        <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-2">
          Day {activeDay?.day} 行程地图 · 点击标记打卡
        </p>
        {mapSection}
      </section>

      <SpotDetailDrawer
        spot={selectedSpot}
        index={selectedIndex}
        onClose={() => setSelectedSpot(null)}
        checkedIn={selectedSpot ? checkedIn.has(selectedSpot.id) : false}
        onCheckIn={selectedSpot ? () => handleCheckIn(selectedSpot.id) : undefined}
      />
    </div>
  )
}

function ScheduleBlockView({
  block,
  onSpotClick,
  checkedIn,
}: {
  block: ScheduleBlock
  onSpotClick: (id: string) => void
  checkedIn: Set<string>
}) {
  return (
    <div className="border-l-2 border-celadon-200 pl-4 ml-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{blockIcons[block.type] || '·'}</span>
        <span className="text-sm font-medium text-warm-gray">{block.label}</span>
        {block.timeRange && (
          <span className="text-[10px] text-warm-gray-muted">{block.timeRange}</span>
        )}
      </div>
      {block.travelTime && (
        <p className="text-[10px] text-celadon-600 mb-2">🚶 {block.travelTime}</p>
      )}
      {block.activity && block.spots.length > 1 && (
        <p className="text-xs text-warm-gray-light mb-2">{block.activity}</p>
      )}
      {block.highlight && (
        <p className="text-[10px] text-warm-gray-muted mb-2">特色：{block.highlight}</p>
      )}
      <ul className="space-y-2">
        {block.spots.map(ref => (
          <li key={ref.spotId}>
            <button
              type="button"
              onClick={() => onSpotClick(ref.spotId)}
              className={cn(
                'w-full text-left flex items-start gap-2 p-2 rounded-lg border transition-all',
                checkedIn.has(ref.spotId)
                  ? 'border-seal/40 bg-seal/5'
                  : 'border-celadon-100 bg-camel-light/30 hover:border-celadon-300'
              )}
            >
              <span className="text-sm">{ref.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-warm-gray">{ref.name}</span>
                  {checkedIn.has(ref.spotId) && (
                    <span className="text-[10px] text-seal bg-seal/10 px-1.5 py-0.5 rounded-full">已打卡</span>
                  )}
                </div>
                <p className="text-[10px] text-warm-gray-muted mt-0.5">
                  停留 {ref.duration}
                  {ref.travelTime && ` · 前往 ${ref.travelTime}`}
                </p>
                <p className="text-[10px] text-celadon-600 mt-0.5">{ref.highlight}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OptionalSpotCard({
  opt,
  selected,
  confirmed,
  onToggle,
}: {
  opt: OptionalRecommendSpot
  selected: boolean
  confirmed: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all',
        confirmed
          ? 'border-celadon-400 bg-celadon-50/50'
          : selected
            ? 'border-camel bg-camel-light/60'
            : 'border-celadon-200/40 bg-white/40'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={confirmed}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border mt-0.5 flex items-center justify-center text-xs',
          selected || confirmed
            ? 'bg-celadon-500 border-celadon-500 text-white'
            : 'border-celadon-300 bg-white'
        )}
        aria-label={selected ? '取消选择' : '选择'}
      >
        {(selected || confirmed) && '✓'}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">{opt.emoji}</span>
          <span className="text-sm font-medium text-warm-gray">{opt.name}</span>
          <Badge variant="default">{opt.category}</Badge>
          {confirmed && <Badge variant="default">已加入行程</Badge>}
        </div>
        <p className="text-xs text-warm-gray-light mt-1">{opt.desc}</p>
        <p className="text-[10px] text-warm-gray-muted mt-1">
          预估停留 {opt.duration}
          {opt.budgetHint && ` · ${opt.budgetHint}`}
        </p>
        {opt.heritage && (
          <p className="text-[10px] text-celadon-600 mt-1">{opt.heritage}</p>
        )}
      </div>
    </div>
  )
}
