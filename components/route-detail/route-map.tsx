'use client'

// T3 地图区块：高德大头针标记 + 点击导航（跳高德 URI，不用导航 SDK，遵循任务书建议）
import { useEffect, useRef, useState } from 'react'
import { hasAmapKey, loadAmapScript, scheduleMapResize } from '@/lib/amap-loader'
import type { RoutePoint } from '@/lib/route-detail-data'

interface RouteMapProps {
  points: RoutePoint[]
  activeSeq?: number
  onMarkerClick?: (seq: number) => void
}

/** 高德「标点 → 唤起导航」的 Web URI（移动端唤起 App，PC 打开网页版） */
export function amapNavUrl(p: RoutePoint): string {
  return `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${encodeURIComponent(p.name)}&src=xunji&coordinate=gaode&callnative=1`
}

export function RouteMap({ points, activeSeq, onMarkerClick }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<AMap.Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

  useEffect(() => {
    if (!hasAmapKey() || points.length === 0) {
      setStatus('fallback')
      return
    }

    let cancelled = false

    loadAmapScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.AMap) return

        const map = new window.AMap.Map(containerRef.current, {
          zoom: 14,
          center: [points[0].lng, points[0].lat],
          viewMode: '2D',
        })
        mapRef.current = map

        points.forEach(p => {
          const marker = new window.AMap!.Marker({
            position: [p.lng, p.lat],
            title: p.name,
            label: {
              content: `<div style="background:#FDF6EC;border:1px solid #E54D42;border-radius:999px;padding:2px 10px;font-size:12px;color:#8B4545;font-weight:600;">${p.seq} · ${p.name}</div>`,
              direction: 'top',
            },
          })
          marker.on('click', () => onMarkerClick?.(p.seq))
          map.add(marker)
        })

        if (points.length > 1) {
          map.setFitView(undefined, false, [48, 48, 48, 48])
        }
        scheduleMapResize(map)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback')
      })

    return () => {
      cancelled = true
      mapRef.current?.destroy()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  // 高亮联动：列表选中某点位时地图居中
  useEffect(() => {
    if (!mapRef.current || !activeSeq) return
    const p = points.find(pt => pt.seq === activeSeq)
    if (p) mapRef.current.setCenter([p.lng, p.lat])
  }, [activeSeq, points])

  if (status === 'fallback') {
    return (
      <div className="rounded-2xl border border-ink-100 bg-paper p-6 text-center">
        <p className="font-serif text-ink-500">
          地图暂不可用{!hasAmapKey() ? '（未配置高德 Key）' : ''}，可直接点下方点位跳转高德导航：
        </p>
        <ul className="mt-4 space-y-2 text-left">
          {points.map(p => (
            <li key={p.seq}>
              <a
                href={amapNavUrl(p)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-vermilion underline underline-offset-4"
              >
                {p.seq}. {p.name} — 打开高德地图 →
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[380px] w-full rounded-2xl border border-ink-100 overflow-hidden"
      />
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-paper/80">
          <span className="font-serif text-sm text-ink-400">地图加载中…</span>
        </div>
      )}
    </div>
  )
}
