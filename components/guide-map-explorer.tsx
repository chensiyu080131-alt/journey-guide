'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Guide, Spot } from '@/types'
import { hasAmapKey, loadAmapScript, getAmapConfigStatus } from '@/lib/amap-loader'
import { planNavigationRoute, routeModeLabels, formatRouteSummary, RouteSummary } from '@/lib/amap-routing'
import { enrichSpotMedia } from '@/lib/spot-media'
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
  layout?: 'default' | 'hero'
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

    loadAmapScript()
      .then(async () => {
        if (cancelled || !containerRef.current || !window.AMap) {
          throw new Error('地图容器未就绪')
        }

        const first = spots[0].location!
        const map = new window.AMap.Map(containerRef.current, {
          zoom: 13,
          center: [first.lng, first.lat],
          viewMode: '2D',
        })
        mapRef.current = map

        spots.forEach((spot, index) => {
          const position: AMap.LngLatLike = [spot.location!.lng, spot.location!.lat]

          const excerpt = spot.originalText
            ? spot.originalText.slice(0, 16) + (spot.originalText.length > 16 ? '…' : '')
            : spot.desc.slice(0, 10)

          const markerContent = document.createElement('div')
          markerContent.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;max-width:130px;">
              <div style="background:#F7F3EB;border:1px solid #5A7D78;border-radius:6px;padding:3px 6px;margin-bottom:3px;box-shadow:0 1px 6px rgba(90,125,120,0.2);">
                <p style="font-size:9px;color:#3D3832;margin:0;font-family:serif;line-height:1.3;text-align:center;">「${excerpt}」</p>
              </div>
              <div style="width:26px;height:26px;border-radius:50%;background:#5A7D78;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid #F7F3EB;">${index + 1}</div>
            </div>
          `
          markerContent.onclick = (e) => {
            e.stopPropagation()
            selectSpot(spot, index)
          }

          const marker = new window.AMap!.Marker({ position, content: markerContent, title: spot.name })
          map.add(marker)
        })

        if (spots.length > 1) {
          const points = spots.map(s => ({ lng: s.location!.lng, lat: s.location!.lat }))
          const { path, mode, summary, warning } = await planNavigationRoute(points, 'auto')
          if (!cancelled) {
            setRouteMode(mode)
            setRouteSummary(summary ?? null)
            setRouteWarning(warning ?? null)
          }

          if (path.length > 1) {
            const polyline = new window.AMap!.Polyline({
              path,
              strokeColor: '#5A7D78',
              strokeWeight: 5,
              strokeOpacity: 0.85,
              showDir: true,
              lineJoin: 'round',
              lineCap: 'round',
            })
            map.add(polyline)
          }
        }

        map.setFitView(undefined, false, [50, 50, 50, 50])

        // 容器尺寸稳定后再 resize，避免地图空白
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (!cancelled) map.resize()
          }, 200)
        })

        if (!cancelled) {
          setStatus('ready')
          setMapError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setMapError(err.message || '高德地图加载失败')
          setStatus('osm')
        }
      })

    return () => {
      cancelled = true
      setRouteMode(null)
      setRouteSummary(null)
      setRouteWarning(null)
      mapRef.current?.destroy()
      mapRef.current = null
    }
  }, [guide.id, spots])

  if (spots.length === 0) {
    return (
      <p className={cn('text-sm text-center py-12', isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted')}>
        暂无地图坐标数据
      </p>
    )
  }

  const mapHeightClass = mapClassName ?? (
    layout === 'hero'
      ? 'h-[min(56vh,560px)] sm:h-[min(60vh,600px)]'
      : 'h-[400px] sm:h-[440px]'
  )

  const chipsBlock = showChips && (
    <div className={cn(
      'space-y-2 overflow-y-auto scrollbar-hide',
      layout === 'hero' ? 'max-h-[120px]' : 'max-h-[160px]'
    )}>
      <p className={cn(
        'text-[10px] tracking-widest uppercase',
        isLiterary ? 'text-literary-wine' : 'text-celadon-600'
      )}>
        {mapTitle || 'AI 识别原文落点 · 点击展开详情'}
      </p>
      <div className="flex flex-wrap gap-2">
        {spots.map((spot, i) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => selectSpot(spot, i)}
            className={cn(
              'text-left max-w-[200px] px-3 py-2 rounded-xl border transition-all duration-200',
              isLiterary
                ? selectedSpot?.id === spot.id
                  ? 'border-literary-wine/50 bg-literary-sand/70 shadow-sm'
                  : 'border-literary-sand bg-white/80 hover:border-literary-wine/30'
                : selectedSpot?.id === spot.id
                  ? 'border-celadon-400 bg-celadon-50/80 shadow-sm'
                  : 'border-celadon-200/50 bg-camel-light/40 hover:border-celadon-300'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center',
                isLiterary
                  ? 'text-literary-wine bg-literary-wine/10'
                  : 'text-celadon-600 bg-celadon-100'
              )}>
                {i + 1}
              </span>
              <span className={cn('text-xs font-medium truncate', isLiterary ? 'text-literary-ink' : 'text-warm-gray')}>
                {spot.name}
              </span>
            </div>
            {spot.originalText && (
              <p className={cn(
                'text-[10px] font-serif italic line-clamp-2 leading-relaxed',
                isLiterary ? 'text-literary-muted' : 'text-warm-gray-muted'
              )}>
                「{spot.originalText}」
              </p>
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
        : 'border-celadon-200/50 bg-camel-light/20',
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
              {mapError}。若需高德地图，请在 .env.local 配置 NEXT_PUBLIC_AMAP_KEY 与 NEXT_PUBLIC_AMAP_SECURITY（安全密钥）。
            </p>
          )}
          <OsmMapFallback lat={center.lat} lng={center.lng} label={guide.city} />
        </>
      )}

      {status !== 'osm' && (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {layout === 'hero' ? (
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
