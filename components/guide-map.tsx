'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Guide } from '@/types'
import { hasAmapKey, loadAmapScript } from '@/lib/amap-loader'

interface GuideMapProps {
  guide: Guide
}

export function GuideMap({ guide }: GuideMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

  const spots = useMemo(
    () => guide.dayPlans.flatMap(day => day.spots).filter(spot => spot.location?.lat && spot.location?.lng),
    [guide]
  )

  useEffect(() => {
    if (!hasAmapKey() || spots.length === 0) {
      setStatus('fallback')
      return
    }

    let map: AMap.Map | null = null
    let cancelled = false

    loadAmapScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.AMap) return

        const center = spots[0].location!
        map = new window.AMap.Map(containerRef.current, {
          zoom: 12,
          center: [center.lng, center.lat],
          viewMode: '2D',
        })

        const path: AMap.LngLatLike[] = []

        spots.forEach((spot, index) => {
          const position: AMap.LngLatLike = [spot.location!.lng, spot.location!.lat]
          path.push(position)

          const marker = new window.AMap!.Marker({
            position,
            title: spot.name,
            label: {
              content: `<div style="background:#fff;border:1px solid #fed7aa;border-radius:999px;padding:2px 8px;font-size:12px;color:#9a3412;">${index + 1}. ${spot.name}</div>`,
              direction: 'top',
            },
          })
          map!.add(marker)
        })

        if (path.length > 1) {
          const polyline = new window.AMap!.Polyline({
            path,
            strokeColor: '#f97316',
            strokeWeight: 4,
            strokeOpacity: 0.8,
            showDir: true,
          })
          map.add(polyline)
          map.setFitView(undefined, false, [40, 40, 40, 40])
        }

        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback')
      })

    return () => {
      cancelled = true
      map?.destroy()
    }
  }, [guide.id, spots])

  if (spots.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg text-ink-900 flex items-center gap-2">
        🗺️ 路线地图
      </h3>

      {status === 'fallback' ? (
        <div className="rounded-xl border border-ink-100 bg-white p-4 space-y-3">
          <p className="text-sm text-ink-500">
            {hasAmapKey()
              ? '地图暂时无法加载，可先按下方卡片顺序游览。'
              : '配置 NEXT_PUBLIC_AMAP_KEY 后可显示交互地图。当前展示文字路线：'}
          </p>
          <ol className="space-y-2">
            {spots.map((spot, index) => (
              <li key={spot.id} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-xuncheng-500 text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-ink-800">{spot.emoji} {spot.name}</p>
                  {spot.address && <p className="text-xs text-ink-400 mt-0.5">{spot.address}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="relative">
          {status === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 text-sm text-ink-400">
              地图加载中...
            </div>
          )}
          <div ref={containerRef} className="h-72 w-full rounded-xl border border-ink-100 overflow-hidden" />
        </div>
      )}
    </div>
  )
}
