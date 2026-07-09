'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Guide, Spot } from '@/types'
import { hasAmapKey, loadAmapScript, getAmapConfigStatus, ensureAmapSecurityConfig, waitForMapComplete, scheduleMapResize } from '@/lib/amap-loader'
import { planNavigationRoute, routeModeLabels, formatRouteSummary, RouteSummary } from '@/lib/amap-routing'
import { enrichSpotMedia } from '@/lib/spot-media'
import {
  addStyledRoutePolylines,
  buildSpotMarkerHtml,
  getSpotBullets,
} from '@/lib/map-route-visual'
import { cn } from '@/lib/utils'
import { SpotDetailDrawer } from './spot-detail-drawer'
import { OsmMapFallback } from './osm-map-fallback'

interface GuideMapExplorerProps {
  guide: Guide
  /** 自定义点位列表（行程规划页按天筛选） */
  spots?: Spot[]
  /** 是否显示原文落点卡片 */
  showChips?: boolean
  mapTitle?: string
  /** 外部接管点位点击（不打开内置抽屉） */
  onSpotSelect?: (spot: Spot, index: number) => void
  /** hero：地图优先展示（地图在上、点位卡片在下） */
  /** explorer：大地图 + 底部横向景点卡片（攻略页参考布局） */
  layout?: 'default' | 'hero' | 'explorer'
  /** 地图容器高度类名 */
  mapClassName?: string
  /** 视觉主题 */
  theme?: 'default' | 'literary'
}

export function GuideMapExplorer({
  guide,
  spots: spotsProp,
  showChips = true,
  mapTitle,
  onSpotSelect,
  layout = 'default',
  mapClassName,
  theme = 'default',
}: GuideMapExplorerProps) {
  const isLiterary = theme === 'literary'
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<AMap.Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'osm'>('loading')
  const [mapError, setMapError] = useState<string | null>(null)
  const [routeMode, setRouteMode] = useState<'walking' | 'driving' | 'riding' | null>(null)
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null)
  const [routeWarning, setRouteWarning] = useState<string | null>(null)
  const amapStatus = getAmapConfigStatus()
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const spots = useMemo(
    () => (spotsProp ?? guide.dayPlans.flatMap(d => d.spots))
      .filter(s => s.location?.lat && s.location?.lng)
      .map(enrichSpotMedia),
    [guide, spotsProp]
  )

  const center = spots[0]?.location

  const spotKey = useMemo(
    () => spots.map(s => `${s.id}:${s.location!.lng},${s.location!.lat}`).join('|'),
    [spots]
  )

  const selectSpot = (spot: Spot, index: number) => {
    if (onSpotSelect) {
      onSpotSelect(spot, index)
      return
    }
    setSelectedSpot(spot)
    setSelectedIndex(index)
  }

  useEffect(() => {
    if (spots.length === 0) return

    if (!hasAmapKey()) {
      setMapError('未配置 NEXT_PUBLIC_AMAP_KEY，已切换备用地图')
      setStatus('osm')
      return
    }

    let cancelled = false
    let map: AMap.Map | null = null
    let resizeObserver: ResizeObserver | null = null

    async function initMap() {
      setStatus('loading')
      setMapError(null)
      setRouteMode(null)
      setRouteSummary(null)
      setRouteWarning(null)

      await loadAmapScript()
      ensureAmapSecurityConfig()

      if (cancelled || !containerRef.current || !window.AMap) {
        throw new Error('地图容器未就绪')
      }

      // React Strict Mode 下重复挂载时，需清空容器再初始化
      containerRef.current.innerHTML = ''

      const first = spots[0].location!
      map = new window.AMap.Map(containerRef.current, {
        zoom: 13,
        center: [first.lng, first.lat],
        viewMode: '2D',
      })
      mapRef.current = map

      scheduleMapResize(map)

      resizeObserver = new ResizeObserver(() => {
        if (!cancelled && map) scheduleMapResize(map)
      })
      resizeObserver.observe(containerRef.current)

      spots.forEach((spot, index) => {
        const position: AMap.LngLatLike = [spot.location!.lng, spot.location!.lat]

        const markerContent = document.createElement('div')
        markerContent.innerHTML = buildSpotMarkerHtml(spot, index)
        markerContent.onclick = (e) => {
          e.stopPropagation()
          selectSpot(spot, index)
        }

        map!.add(new window.AMap!.Marker({
          position,
          content: markerContent,
          title: spot.name,
          anchor: 'bottom-center',
          zIndex: 120 + index,
        }))
      })

      await waitForMapComplete(map)

      if (cancelled) return

      setStatus('ready')
      scheduleMapResize(map)

      if (spots.length > 1) {
        const points = spots.map(s => ({ lng: s.location!.lng, lat: s.location!.lat }))
        const { path, mode, summary, warning } = await planNavigationRoute(points, 'auto')
        if (cancelled || !map) return

        setRouteMode(mode)
        setRouteSummary(summary ?? null)
        setRouteWarning(warning ?? null)

        if (path.length > 1) {
          addStyledRoutePolylines(map, path)
          map.setFitView(undefined, false, [50, 50, 50, 50])
          scheduleMapResize(map)
        }
      }
    }

    initMap().catch((err: Error) => {
      if (!cancelled) {
        setMapError(err.message || '高德地图加载失败')
        setStatus('osm')
      }
    })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      map?.destroy()
      mapRef.current = null
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [guide.id, spotKey])

  if (spots.length === 0) {
    return (
      <p className={cn('text-sm text-center py-12', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
        暂无地图坐标数据
      </p>
    )
  }

  const mapHeightClass = mapClassName ?? (
    layout === 'explorer'
      ? 'h-[min(52vh,520px)] sm:h-[min(58vh,580px)]'
      : layout === 'hero'
        ? 'h-[min(56vh,560px)] sm:h-[min(60vh,600px)]'
        : 'h-[400px] sm:h-[440px]'
  )

  const isExplorer = layout === 'explorer'

  const chipsBlock = showChips && (
    <div className={cn('space-y-2', isExplorer ? 'mt-4' : '')}>
      <p className={cn(
        'text-[10px] tracking-widest uppercase',
        isLiterary ? 'text-literary-wine' : 'text-celadon-600'
      )}>
        {mapTitle || (isExplorer ? 'AI 识别原文景点 · 点击展开详情' : 'AI 识别原文落点 · 点击展开详情')}
      </p>
      <div className={cn(
        isExplorer
          ? 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide'
          : 'flex flex-wrap gap-2 overflow-y-auto scrollbar-hide max-h-[160px]',
        !isExplorer && layout === 'hero' && 'max-h-[120px]'
      )}>
        {spots.map((spot, i) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => selectSpot(spot, i)}
            className={cn(
              'text-left transition-all duration-200',
              isExplorer
                ? cn(
                    'xc-explorer-spot-card',
                    selectedSpot?.id === spot.id ? 'xc-explorer-spot-active' : 'xc-explorer-spot-inactive'
                  )
                : cn(
                    'max-w-[200px] px-3 py-2 rounded-xl border',
                    isLiterary
                      ? selectedSpot?.id === spot.id
                        ? 'border-literary-wine/50 bg-literary-sand/70 shadow-sm'
                        : 'border-literary-sand bg-white/80 hover:border-literary-wine/30'
                      : selectedSpot?.id === spot.id
                        ? 'border-[#FACC15] bg-amber-50/80 shadow-sm ring-1 ring-[#FACC15]/40'
                        : 'border-celadon-200/50 bg-camel-light/40 hover:border-[#FACC15]/50'
                  )
            )}
          >
            {isExplorer ? (
              <>
                <div className="xc-explorer-spot-pill">
                  <span className="xc-explorer-spot-pill-title">{spot.name}</span>
                </div>
                <div className="xc-explorer-spot-detail">
                  <ul className="list-disc pl-3.5 space-y-0.5">
                    {getSpotBullets(spot).map(b => (
                      <li key={b} className="line-clamp-2">{b}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                'text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                isLiterary
                  ? 'text-literary-wine bg-literary-wine/10'
                  : 'text-amber-700 bg-[#FACC15]/30'
              )}>
                {i + 1}
              </span>
              <span className={cn(
                'text-xs font-medium truncate',
                isLiterary ? 'text-literary-ink' : 'text-warm-gray'
              )}>
                {spot.name}
              </span>
            </div>
            {spot.originalText && (
              <p className={cn(
                'text-[10px] font-serif italic line-clamp-3 leading-relaxed',
                isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted'
              )}>
                「{spot.originalText}」
              </p>
            )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  const mapBlock = (
    <div className={cn(
      'relative rounded-2xl border overflow-hidden shadow-sm',
      isLiterary
        ? 'border-literary-sand bg-literary-sand/20'
        : 'border-celadon-200/50 bg-white',
      mapHeightClass
    )}>
      {status === 'loading' && (
        <div className={cn(
          'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-sm',
          isLiterary ? 'bg-literary-paper/90 text-literary-muted' : 'bg-paper-warm/90 text-warm-gray-muted'
        )}>
          <span>地图加载中…</span>
          <span className="text-[10px]">正在规划沿道路线</span>
        </div>
      )}

      {status === 'ready' && (
        <div className="absolute top-2 left-2 right-2 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex flex-wrap gap-1">
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border',
              amapStatus.hasKey
                ? isLiterary ? 'bg-literary-sand text-literary-wine border-literary-sand' : 'bg-celadon-50 text-celadon-700 border-celadon-200'
                : 'bg-seal/10 text-seal border-seal/30'
            )}>
              {amapStatus.hasKey ? '✓ Key' : '✗ 缺 Key'}
            </span>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border',
              amapStatus.hasSecurity
                ? isLiterary ? 'bg-literary-sand text-literary-wine border-literary-sand' : 'bg-celadon-50 text-celadon-700 border-celadon-200'
                : 'bg-seal/10 text-seal border-seal/30'
            )}>
              {amapStatus.hasSecurity ? '✓ 安全密钥' : '✗ 缺安全密钥'}
            </span>
            {routeMode && (
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                isLiterary
                  ? 'bg-white/95 text-literary-muted border-literary-sand'
                  : 'bg-paper-warm/95 text-warm-gray-muted border-celadon-200/40'
              )}>
                {routeModeLabels[routeMode]}
              </span>
            )}
            {routeSummary && (
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                isLiterary
                  ? 'bg-white/95 text-literary-wine border-literary-sand'
                  : 'bg-paper-warm/95 text-celadon-600 border-celadon-200/40'
              )}>
                {formatRouteSummary(routeSummary)}
              </span>
            )}
          </div>
          {!amapStatus.ready && amapStatus.hint && (
            <p className="text-[10px] text-seal bg-paper-warm/95 px-2 py-1 rounded-lg border border-seal/20 max-w-md">
              {amapStatus.hint}。修改后请重启 npm run dev
            </p>
          )}
          {routeWarning && (
            <p className="text-[10px] text-seal bg-paper-warm/95 px-2 py-1 rounded-lg border border-seal/20 max-w-md">
              路线：{routeWarning}
            </p>
          )}
        </div>
      )}

      {status === 'osm' && center && (
        <>
          {mapError && (
            <p className="absolute top-2 left-2 right-2 z-20 text-[10px] text-warm-gray-muted bg-paper-warm/95 px-2 py-1 rounded-lg border border-celadon-200/40">
              {mapError}。请在 GitHub Actions Secrets 或本地 .env.local 配置 NEXT_PUBLIC_AMAP_KEY 与 NEXT_PUBLIC_AMAP_SECURITY。
            </p>
          )}
          <OsmMapFallback lat={center.lat} lng={center.lng} label={guide.city} />
        </>
      )}

      {status !== 'osm' && (
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {layout === 'hero' || layout === 'explorer' ? (
        <>
          {mapBlock}
          {chipsBlock}
        </>
      ) : (
        <>
          {chipsBlock}
          {mapBlock}
        </>
      )}

      {!onSpotSelect && (
      <SpotDetailDrawer
        spot={selectedSpot}
        index={selectedIndex}
        onClose={() => setSelectedSpot(null)}
        theme={theme}
      />
      )}
    </div>
  )
}
