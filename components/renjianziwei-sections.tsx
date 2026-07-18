'use client'

import { Spot } from '@/types'
import { RENJIANZIWEI_CHAPTERS, WANGZENGQI_LIFE_PHASES } from '@/lib/renjianziwei-guide'
import {
  GAOYOU_POI_CATEGORIES,
  GAOYOU_ROUTE_STOPS,
  CHAPTER_NUMERALS,
  LIFE_PHASE_DETAILS,
  RenjianCityCard,
  getGaoyouPoiCategory,
} from '@/lib/renjianziwei-ui'
import { cn } from '@/lib/utils'

export function GaoyouPoiLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
      {Object.values(GAOYOU_POI_CATEGORIES).map(cat => (
        <span key={cat.label} className="flex items-center gap-1.5 text-[11px] text-literary-muted">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.dot }} />
          {cat.label}
        </span>
      ))}
    </div>
  )
}

export function GaoyouPoiGrid({
  spots,
  onSpotClick,
}: {
  spots: Spot[]
  onSpotClick: (spot: Spot, index: number) => void
}) {
  const extraCard = {
    id: 'rjz-gy-wild',
    name: '原野 · 野菜',
    desc: '蒌蒿、荠菜、马齿苋——故乡田野的春日滋味',
    emoji: '🌿',
    category: 'nature' as const,
    tag: 'Artemisia · Shepherd\'s Purse',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {spots.map((spot, i) => {
        const cat = getGaoyouPoiCategory(spot.id)
        const meta = GAOYOU_POI_CATEGORIES[cat]
        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => onSpotClick(spot, i)}
            className="xc-poi-card group"
          >
            <div className="flex items-start gap-3">
              <span
                className="w-7 h-7 rounded-full text-white text-xs font-medium flex items-center justify-center flex-shrink-0"
                style={{ background: meta.dot }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-literary-ink group-hover:text-literary-wine transition-colors">
                  {spot.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: meta.color }}>
                  {spot.emoji} {spot.type}
                </p>
                <p className="text-xs text-literary-muted mt-2 line-clamp-2 leading-relaxed">
                  {spot.desc}
                </p>
              </div>
            </div>
          </button>
        )
      })}
      <div className="xc-poi-card opacity-90">
        <div className="flex items-start gap-3">
          <span
            className="w-7 h-7 rounded-full text-white text-xs font-medium flex items-center justify-center flex-shrink-0"
            style={{ background: GAOYOU_POI_CATEGORIES.nature.dot }}
          >
            {spots.length + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-literary-ink">{extraCard.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: GAOYOU_POI_CATEGORIES.nature.color }}>
              {extraCard.emoji} 时令 · 春季
            </p>
            <p className="text-xs text-literary-muted mt-2 leading-relaxed">{extraCard.desc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GaoyouDayTimeline({
  spots,
  onSpotClick,
}: {
  spots: Spot[]
  onSpotClick: (spot: Spot, index: number) => void
}) {
  const spotMap = new Map(spots.map(s => [s.id, s]))

  return (
    <section className="xc-detail-card p-6 sm:p-8">
      <p className="xc-detail-eyebrow mb-2">One-Day Route</p>
      <h3 className="xc-detail-section-title mb-6">「跟着汪曾祺吃高邮」一日路线</h3>

      <div className="relative">
        <div className="absolute top-4 left-4 right-4 h-px border-t-2 border-dashed border-literary-wine/35 hidden sm:block" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-3">
          {GAOYOU_ROUTE_STOPS.map((stop, i) => {
            const spot = spotMap.get(stop.spotId)
            if (!spot) return null
            const idx = spots.findIndex(s => s.id === spot.id)
            return (
              <button
                key={stop.spotId}
                type="button"
                onClick={() => onSpotClick(spot, idx >= 0 ? idx : i)}
                className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 text-center group"
              >
                <span className="xc-timeline-node relative z-10 group-hover:scale-105 transition-transform">
                  {i + 1}
                </span>
                <div className="sm:mt-4 text-left sm:text-center">
                  <p className="text-sm font-medium text-literary-ink group-hover:text-literary-wine transition-colors">
                    {spot.name}
                  </p>
                  <p className="text-[11px] text-literary-muted mt-1">
                    {stop.time} · {stop.note}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-literary-sand grid sm:grid-cols-3 gap-4 text-xs text-literary-muted">
        <div>
          <p className="font-medium text-literary-ink mb-1">高邮深度 · 方案 A</p>
          <p>9 个可打卡点位 · 手绘地图 + 书中原文</p>
        </div>
        <div>
          <p className="font-medium text-literary-ink mb-1">路线</p>
          <p>汪曾祺纪念馆 → 高邮湖 → 盂城驿 → 界首镇 → 东大街</p>
        </div>
        <div>
          <p className="font-medium text-literary-ink mb-1">说明</p>
          <p>原文为摘录/示意，实景图为占位</p>
        </div>
      </div>
    </section>
  )
}

export function NationalFoodGrid({
  cards,
  onSpotClick,
  allSpots,
}: {
  cards: RenjianCityCard[]
  onSpotClick: (spot: Spot, index: number) => void
  allSpots: Spot[]
}) {
  const spotMap = new Map(allSpots.map((s, i) => [s.id, { spot: s, index: i }]))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(card => (
        <button
          key={card.id}
          type="button"
          onClick={() => {
            const first = card.spotIds[0]
            const entry = first ? spotMap.get(first) : undefined
            if (entry) onSpotClick(entry.spot, entry.index)
          }}
          className="xc-detail-card p-4 sm:p-5 text-left hover:shadow-md hover:border-literary-wine/20 transition-all group"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="text-base font-semibold text-literary-ink group-hover:text-literary-wine transition-colors">
              {card.city}
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-literary-sand text-literary-muted flex-shrink-0">
              {card.zone}
            </span>
          </div>
          <ul className="space-y-1.5 mb-4">
            {card.foods.slice(0, 3).map(f => (
              <li key={`${f.dish}-${f.place}`} className="text-xs text-literary-muted">
                {f.dish} · {f.place}
              </li>
            ))}
          </ul>
          {card.flavors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.flavors.map(fl => (
                <span
                  key={fl}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-literary-sand/80 text-literary-muted"
                >
                  {fl}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export function LifeTrajectoryTimeline({
  onSpotClick,
  allSpots,
}: {
  onSpotClick: (spot: Spot, index: number) => void
  allSpots: Spot[]
}) {
  return (
    <section className="xc-detail-card p-6 sm:p-8">
      <div className="relative pl-8 sm:pl-10">
        <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-literary-wine/25" />
        <div className="space-y-8">
          {WANGZENGQI_LIFE_PHASES.map(phase => {
            const detail = LIFE_PHASE_DETAILS[phase.place] ?? {
              location: phase.place,
              summary: phase.foods,
            }
            const relatedSpot = allSpots.find(s =>
              s.region === phase.place.split('/')[0] ||
              (phase.place.includes('高邮') && s.region === '高邮') ||
              (phase.place.includes('昆明') && s.region === '昆明') ||
              (phase.place.includes('北京') && s.region === '北京') ||
              (phase.place.includes('张家口') && s.region === '张家口')
            )
            const spotIndex = relatedSpot ? allSpots.findIndex(s => s.id === relatedSpot.id) : 0

            return (
              <div key={phase.period} className="relative">
                <span className="absolute -left-8 sm:-left-10 top-1 w-6 h-6 rounded-full border-2 border-literary-wine bg-white flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-literary-wine" />
                </span>
                <p className="text-sm font-serif text-literary-wine tracking-wide">{phase.period}</p>
                <button
                  type="button"
                  onClick={() => relatedSpot && onSpotClick(relatedSpot, spotIndex)}
                  className="mt-2 text-left group"
                >
                  <h4 className="text-lg font-semibold text-literary-ink group-hover:text-literary-wine transition-colors">
                    {phase.place}
                  </h4>
                </button>
                <p className="text-xs text-literary-muted mt-1 flex items-center gap-1.5">
                  <span>{phase.emoji}</span>
                  {detail.location}
                </p>
                <p className="text-sm text-literary-muted mt-2 leading-relaxed max-w-xl lg:max-w-3xl">
                  {detail.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {phase.foods.split('、').map(food => (
                    <span
                      key={food}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-literary-sand/70 text-literary-muted border border-literary-sand"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function FourChaptersGrid() {
  return (
    <section>
      <p className="xc-detail-eyebrow mb-2">Four Chapters</p>
      <h3 className="xc-detail-section-title">全书四章 · 安身之本</h3>
      <p className="text-sm text-literary-muted mt-2 mb-6">从食材本味到四方食事，层层递进</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {RENJIANZIWEI_CHAPTERS.map((ch, i) => (
          <div key={ch.chapter} className="xc-chapter-card">
            <span className="absolute top-3 left-4 text-4xl font-serif text-literary-wine/10 select-none">
              {CHAPTER_NUMERALS[i]}
            </span>
            <div className="relative">
              <h4 className="text-sm font-semibold text-literary-ink leading-snug pr-4">
                {ch.title}
              </h4>
              <p className="text-[11px] text-literary-wine mt-1.5">{ch.theme}</p>
              <p className="text-[11px] text-literary-muted mt-3 leading-relaxed">
                {ch.essays.join(' ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LiteraryDetailFooter({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <footer className="mt-10 pb-8">
      <div className="xc-home-quote-banner">
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-serif font-semibold text-literary-ink">
            「四方食事，不过一碗人间烟火」
          </p>
          <p className="mt-2 text-xs text-literary-muted">
            从一颗高邮咸鸭蛋开始，跟着汪曾祺吃遍中国。
          </p>
        </div>
        {onCtaClick ? (
          <button type="button" onClick={onCtaClick} className="xc-explore-btn whitespace-nowrap">
            回到高邮，从头逛起 →
          </button>
        ) : (
          <span className="xc-explore-btn whitespace-nowrap opacity-80 cursor-default">
            回到高邮，从头逛起 →
          </span>
        )}
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left max-w-4xl mx-auto">
        <div>
          <p className="text-sm font-serif font-medium text-literary-ink">人间滋味 · 文旅 demo</p>
          <p className="mt-1 text-xs text-literary-muted leading-relaxed">
            一本书 · 一个人 · 一座城
          </p>
        </div>
        <div>
          <p className="text-sm font-serif font-medium text-literary-ink">数据</p>
          <p className="mt-1 text-xs text-literary-muted">4 章 · 30+ 篇 · 9 高邮点位 · 19 城</p>
        </div>
        <div>
          <p className="text-sm font-serif font-medium text-literary-ink">说明</p>
          <p className="mt-1 text-xs text-literary-muted">原型演示，原文为摘录/示意，实景为占位</p>
        </div>
      </div>
    </footer>
  )
}

export function ViewModeCards({
  active,
  onChange,
}: {
  active: 'gaoyou' | 'map' | 'life'
  onChange: (mode: 'gaoyou' | 'map' | 'life') => void
}) {
  const modes = [
    {
      id: 'gaoyou' as const,
      label: '方案 A · 推荐',
      title: '高邮单城深度版',
      desc: '汪曾祺故乡，点位最密集。咸鸭蛋、茶干、蒲包肉，手绘地图 + 原文 + 一日美食路线。',
      link: '进入高邮 →',
    },
    {
      id: 'map' as const,
      label: '方案 B',
      title: '全国美食地图版',
      desc: '用食物标注的中国地图，19 座城市相连。可按五味筛选：酸甜苦辣咸。',
      link: '展开地图 →',
    },
    {
      id: 'life' as const,
      label: '方案 C',
      title: '人生轨迹版',
      desc: '汪曾祺五个人生阶段与对应食物记忆：高邮、昆明、张家口、北京。',
      link: '看他一生 →',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {modes.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            'xc-detail-card p-5 sm:p-6 text-left transition-all duration-200',
            active === m.id
              ? 'ring-2 ring-literary-wine/30 shadow-md border-literary-wine/20'
              : 'hover:shadow-md hover:border-literary-wine/15'
          )}
        >
          <p className="text-[11px] text-literary-wine tracking-wide mb-2">{m.label}</p>
          <h3 className="text-base font-serif font-semibold text-literary-ink">{m.title}</h3>
          <p className="text-xs text-literary-muted mt-2 leading-relaxed line-clamp-3">{m.desc}</p>
          <p className="text-xs text-literary-wine mt-4 font-medium">{m.link}</p>
        </button>
      ))}
    </div>
  )
}
