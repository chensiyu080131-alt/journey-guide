'use client'

import { useMemo, useState } from 'react'
import { Guide, Spot } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { GuideMapExplorer } from './guide-map-explorer'
import { SpotDetailDrawer } from './spot-detail-drawer'
import { GuideExplorerShell } from './guide-explorer-shell'
import { RenjianViewSidebar, RenjianViewMode } from './guide-filter-sidebar'
import {
  RENJIAN_REGIONS,
  RenjianRegion,
  RenjianFlavor,
  renjianziweiAllSpots,
  getRenjianSpotsByRegion,
  filterSpotsByFlavor,
} from '@/lib/renjianziwei-guide'
import { FLAVOR_FILTERS, buildCityFoodCards } from '@/lib/renjianziwei-ui'
import {
  GaoyouPoiLegend,
  GaoyouPoiGrid,
  GaoyouDayTimeline,
  NationalFoodGrid,
  LifeTrajectoryTimeline,
  FourChaptersGrid,
} from './renjianziwei-sections'
import { cn } from '@/lib/utils'

interface RenjianziweiExplorerProps {
  guide: Guide
  category: CoverCategory
}

export function RenjianziweiExplorer({ guide, category }: RenjianziweiExplorerProps) {
  const [viewMode, setViewMode] = useState<RenjianViewMode>('gaoyou')
  const [region, setRegion] = useState<RenjianRegion>('高邮')
  const [flavor, setFlavor] = useState<RenjianFlavor | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const [detailsOpen, setDetailsOpen] = useState(false)

  const gaoyouSpots = useMemo(() => guide.dayPlans.flatMap(d => d.spots), [guide])

  const mapSpots = useMemo(() => {
    let spots: Spot[]
    if (viewMode === 'gaoyou') {
      spots = gaoyouSpots
    } else if (viewMode === 'map') {
      spots = getRenjianSpotsByRegion(region)
    } else {
      spots = renjianziweiAllSpots
    }
    return filterSpotsByFlavor(spots, flavor)
  }, [viewMode, region, flavor, gaoyouSpots])

  const cityCards = useMemo(
    () => buildCityFoodCards(filterSpotsByFlavor(renjianziweiAllSpots, flavor)),
    [flavor]
  )

  const title =
    viewMode === 'gaoyou'
      ? '跟着汪曾祺吃高邮'
      : viewMode === 'map'
        ? '一张用食物标注的中国地图'
        : '汪曾祺 · 用食物串起的一生'

  const subtitle =
    viewMode === 'gaoyou'
      ? guide.subtitle
      : viewMode === 'map'
        ? '按地域与五味筛选，点击地图标记查看原文'
        : '五个人生阶段，五段食物记忆'

  const selectSpot = (spot: Spot, index: number) => {
    setSelectedSpot(spot)
    setSelectedIndex(index)
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1.5">
      {viewMode === 'map' &&
        RENJIAN_REGIONS.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[10px] border transition-all',
              region === r.id
                ? 'bg-celadon-500 text-white border-celadon-500'
                : 'bg-white/70 border-celadon-200/50 text-warm-gray-muted hover:border-celadon-300'
            )}
          >
            {r.label}
          </button>
        ))}
      {FLAVOR_FILTERS.map(f => (
        <button
          key={f.label}
          type="button"
          onClick={() => setFlavor(flavor === f.id ? null : f.id)}
          className={cn(
            'px-2.5 py-1 rounded-full text-[10px] border transition-all flex items-center gap-1',
            flavor === f.id
              ? 'bg-celadon-500 text-white border-celadon-500'
              : 'bg-white/70 border-celadon-200/50 text-warm-gray-muted hover:border-celadon-300'
          )}
        >
          <span>{f.icon}</span>
          {f.label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <GuideExplorerShell
        backHref={`/?cat=${category}`}
        backLabel="← 返回封面选择"
        title={title}
        subtitle={subtitle}
        eyebrow="《人间滋味》"
        sidebar={
          <RenjianViewSidebar
            guideId={guide.id}
            category={category}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        toolbar={toolbar}
        below={
          <button
            type="button"
            onClick={() => setDetailsOpen(v => !v)}
            className="text-xs text-celadon-600 hover:text-celadon-700 font-serif"
          >
            {detailsOpen ? '收起路线详情 ▲' : '展开路线详情 · 全书结构 ▼'}
          </button>
        }
      >
        <GuideMapExplorer
          guide={guide}
          spots={mapSpots}
          showChips
          layout="explorer"
          mapTitle="AI 识别原文景点 · 点击展开详情"
          mapClassName="h-[min(calc(100vh-260px),560px)] sm:h-[min(calc(100vh-240px),580px)]"
          onSpotSelect={selectSpot}
        />
      </GuideExplorerShell>

      {detailsOpen && (
        <div className="xc-container max-w-6xl pb-10 -mt-4 space-y-8">
          {viewMode === 'gaoyou' && (
            <section className="space-y-6">
              <GaoyouPoiLegend />
              <GaoyouPoiGrid spots={gaoyouSpots} onSpotClick={selectSpot} />
              <GaoyouDayTimeline spots={gaoyouSpots} onSpotClick={selectSpot} />
            </section>
          )}
          {viewMode === 'map' && (
            <NationalFoodGrid
              cards={cityCards}
              allSpots={renjianziweiAllSpots}
              onSpotClick={selectSpot}
            />
          )}
          {viewMode === 'life' && (
            <LifeTrajectoryTimeline allSpots={renjianziweiAllSpots} onSpotClick={selectSpot} />
          )}
          <FourChaptersGrid />
          {guide.routeIntro && (
            <p className="text-xs text-warm-gray-light leading-relaxed">{guide.routeIntro}</p>
          )}
        </div>
      )}

      <SpotDetailDrawer
        spot={selectedSpot}
        index={selectedIndex}
        onClose={() => setSelectedSpot(null)}
        checkedIn={selectedSpot ? checkedIn.has(selectedSpot.id) : false}
        onCheckIn={
          selectedSpot
            ? () => setCheckedIn(prev => new Set([...Array.from(prev), selectedSpot.id]))
            : undefined
        }
      />
    </>
  )
}
