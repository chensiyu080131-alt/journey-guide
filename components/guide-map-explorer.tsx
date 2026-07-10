'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
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
  const chipsScrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 })
  const [thumb, setThumb] = useState({ width: 100, left: 0 })

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

  // ── 底部滑块：同步卡片行横向滚动 ──
  const updateThumb = () => {
    const el = chipsScrollRef.current
    if (!el) return
    const { scrollWidth, clientWidth, scrollLeft } = el
    if (scrollWidth <= clientWidth + 1) {
      setThumb({ width: 100, left: 0 })
      return
    }
    const w = (clientWidth / scrollWidth) * 100
    const left = (scrollLeft / (scrollWidth - clientWidth)) * (100 - w)
    setThumb({ width: w, left })
  }

  useEffect(() => {
    updateThumb()
    const onResize = () => updateThumb()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots])

  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    dragStartRef.current = { x: e.clientX, scrollLeft: chipsScrollRef.current?.scrollLeft || 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onThumbMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const el = chipsScrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const thumbW = (el.clientWidth / el.scrollWidth) * track.clientWidth
    const travel = track.clientWidth - thumbW
    const dx = e.clientX - dragStartRef.current.x
    el.scrollLeft = dragStartRef.current.scrollLeft + (travel > 0 ? (dx / travel) * maxScroll : 0)
  }
  const onThumbUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
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

          const nameText = spot.name || spot.desc.slice(0, 10)

          const markerContent = document.createElement('div')
          markerContent.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;max-width:130px;">
              <div style="background:#F7F3EB;border:1px solid #5A7D78;border-radius:6px;padding:3px 8px;margin-bottom:3px;box-shadow:0 1px 6px rgba(90,125,120,0.2);">
                <p style="font-size:11px;color:#3D3832;margin:0;font-weight:600;line-height:1.3;text-align:center;">${nameText}</p>
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
      <div>
        <div
          ref={isExplorer ? chipsScrollRef : undefined}
          onScroll={isExplorer ? updateThumb : undefined}
          className={cn(
            isExplorer
              ? 'flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide scroll-smooth'
              : 'flex flex-wrap gap-2 overflow-y-auto scrollbar-hide max-h-[160px]',
            !isExplorer && layout === 'hero' && 'max-h-[120px]'
          )}
        >
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
                        ? 'border-celadon-400 bg-celadon-50/80 shadow-sm'
                        : 'border-celadon-200/50 bg-camel-light/40 hover:border-celadon-300'
                  )
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                'text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                isLiterary
                  ? 'text-literary-wine bg-literary-wine/10'
                  : 'text-celadon-600 bg-celadon-100'
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
          </button>
        ))}
        </div>
        {isExplorer && thumb.width < 100 && (
          <div
            ref={trackRef}
            className="relative mt-1 h-1.5 w-full rounded-full bg-celadon-100/70"
          >
            <div
              role="scrollbar"
              aria-label="左右滑动查看更多点位"
              aria-orientation="horizontal"
              onPointerDown={onThumbDown}
              onPointerMove={onThumbMove}
              onPointerUp={onThumbUp}
              className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-celadon-400 hover:bg-celadon-500 cursor-grab active:cursor-grabbing touch-none transition-colors"
              style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
            />
          </div>
        )}
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
              {mapError}。请在 GitHub Actions Secrets 或本地 .env.local 配置 NEXT_PUBLIC_AMAP_KEY 与 NEXT_PUBLIC_AMAP_SECURITY。
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
