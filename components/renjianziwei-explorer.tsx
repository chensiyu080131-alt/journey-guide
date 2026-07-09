'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Guide, Spot } from '@/types'
import { CoverCategory } from '@/lib/home-covers'
import { GuideCategoryNav } from './guide-category-nav'
import { GuideMapExplorer } from './guide-map-explorer'
import { SpotDetailDrawer } from './spot-detail-drawer'
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
  LiteraryDetailFooter,
  ViewModeCards,
} from './renjianziwei-sections'
import { cn } from '@/lib/utils'

type ViewMode = 'gaoyou' | 'map' | 'life'

const VIEW_META: Record<ViewMode, { eyebrow: string; title: string; desc: string }> = {
  gaoyou: {
    eyebrow: '方案 A · 单城深度版',
    title: '跟着汪曾祺吃高邮',
    desc: '点击地图标记或下方卡片，查看书中原文摘录与现代打卡点位对照。',
  },
  map: {
    eyebrow: '方案 B · 全国美食地图版',
    title: '一张用食物标注的中国地图',
    desc: '一本书变成一张地图。从汪曾祺笔下 19 座城市出发，按五味筛选你想尝的味道。',
  },
  life: {
    eyebrow: '方案 C · 人生轨迹版',
    title: '汪曾祺 · 用食物串起的一生',
    desc: '五个人生阶段，五段食物记忆。吃什么，就是怎样活过。',
  },
}

interface RenjianziweiExplorerProps {
  guide: Guide
  category: CoverCategory
}

export function RenjianziweiExplorer({ guide, category }: RenjianziweiExplorerProps) {
  const mapSectionRef = useRef<HTMLElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('gaoyou')
  const [region, setRegion] = useState<RenjianRegion>('高邮')
  const [flavor, setFlavor] = useState<RenjianFlavor | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())

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

  const meta = VIEW_META[viewMode]

  const selectSpot = (spot: Spot, index: number) => {
    setSelectedSpot(spot)
    setSelectedIndex(index)
  }

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="xc-detail-bg">
      <header className="xc-container max-w-6xl pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="xc-home-logo-mark">
              <span className="text-white font-serif text-lg leading-none">味</span>
            </div>
            <div>
              <p className="font-serif text-lg text-literary-ink tracking-wide">人间滋味</p>
              <p className="text-[10px] text-literary-muted tracking-[0.3em]">RENJIAN ZIWEI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToMap}
            className="xc-explore-btn text-xs sm:text-sm py-2.5 px-5 sm:px-6"
          >
            一日美食路线 →
          </button>
        </div>
        <GuideCategoryNav activeCategory={category} variant="literary" />
      </header>

      <div className="xc-container max-w-6xl flex-1 pb-6">
        <div className="mb-6">
          <Link
            href={`/?cat=${category}`}
            className="text-xs text-literary-muted hover:text-literary-wine no-underline"
          >
            ← 返回封面
          </Link>
        </div>

        <section className="mb-8">
          <p className="xc-detail-eyebrow text-center mb-2">Three Ways to Explore</p>
          <h2 className="text-center text-lg sm:text-xl font-serif font-semibold text-literary-ink mb-1">
            三种打开方式
          </h2>
          <p className="text-center text-xs text-literary-muted mb-5">
            单城深度 / 全国漫游 / 人生轨迹，选一种开始
          </p>
          <ViewModeCards active={viewMode} onChange={setViewMode} />
        </section>

        <section className="mb-6">
          <p className="xc-detail-eyebrow mb-2">{meta.eyebrow}</p>
          <h1 className="xc-detail-title">{meta.title}</h1>
          <p className="mt-3 text-sm text-literary-muted leading-relaxed max-w-2xl">{meta.desc}</p>
        </section>

        {viewMode === 'map' && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {RENJIAN_REGIONS.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegion(r.id)}
                className={cn(
                  'xc-detail-pill',
                  region === r.id ? 'xc-detail-pill-active' : 'xc-detail-pill-inactive'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {FLAVOR_FILTERS.map(f => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFlavor(f.id)}
              className={cn(
                'xc-detail-pill flex items-center gap-1.5',
                flavor === f.id ? 'xc-detail-pill-active' : 'xc-detail-pill-inactive'
              )}
            >
              <span className="text-sm">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        <section ref={mapSectionRef} className="w-full mb-8 scroll-mt-4">
          <p className="xc-detail-eyebrow mb-3">
            {viewMode === 'gaoyou' ? '高邮美食地图' : viewMode === 'map' ? '全国点位地图' : '人生轨迹总览'}
            {' · '}点击标记查看原文
          </p>
          <GuideMapExplorer
            guide={guide}
            spots={mapSpots}
            showChips
            layout="hero"
            theme="literary"
            mapTitle="原文落点 · 点击展开"
            onSpotSelect={selectSpot}
          />
        </section>

        {viewMode === 'gaoyou' && (
          <section className="mb-10 space-y-8">
            <div>
              <GaoyouPoiLegend />
              <GaoyouPoiGrid spots={gaoyouSpots} onSpotClick={selectSpot} />
            </div>
            <GaoyouDayTimeline spots={gaoyouSpots} onSpotClick={selectSpot} />
          </section>
        )}

        {viewMode === 'map' && (
          <section className="mb-10">
            <p className="xc-detail-eyebrow mb-2">Food Map</p>
            <h3 className="xc-detail-section-title mb-5">城市美食卡片</h3>
            <NationalFoodGrid
              cards={cityCards}
              allSpots={renjianziweiAllSpots}
              onSpotClick={selectSpot}
            />
          </section>
        )}

        {viewMode === 'life' && (
          <section className="mb-10">
            <LifeTrajectoryTimeline
              allSpots={renjianziweiAllSpots}
              onSpotClick={selectSpot}
            />
          </section>
        )}

        <section className="mb-6">
          <FourChaptersGrid />
        </section>

        {guide.routeIntro && (
          <p className="text-sm text-literary-muted leading-relaxed max-w-3xl mb-8">
            {guide.routeIntro}
          </p>
        )}

        <LiteraryDetailFooter onCtaClick={() => { setViewMode('gaoyou'); scrollToMap() }} />
      </div>

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
        theme="literary"
      />
    </main>
  )
}
