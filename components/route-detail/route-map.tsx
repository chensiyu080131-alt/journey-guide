'use client'

// T3 地图区块：优先高德交互地图（需 NEXT_PUBLIC_AMAP_KEY）；
// 无论有无 Key，若 6s 内未就绪则回退到「零依赖 SVG 静态路线图」——
// 5 点位 + 连线 + 标签 + 高德 URI 导航，永不卡在「地图加载中…」。
import { useEffect, useMemo, useRef, useState } from 'react'
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

/** 把经纬度线性投影到 SVG 坐标系（GCJ-02 近似即可，仅作示意） */
function useProjected(points: RoutePoint[]) {
  return useMemo(() => {
    if (points.length === 0) return { coords: [] as { x: number; y: number; p: RoutePoint }[], w: 680, h: 360 }
    const lngs = points.map(p => p.lng)
    const lats = points.map(p => p.lat)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const padX = 64
    const padY = 56
    const w = 680
    const h = 360
    const spanLng = maxLng - minLng || 1
    const spanLat = maxLat - minLat || 1
    const coords = points.map(p => ({
      x: padX + ((p.lng - minLng) / spanLng) * (w - padX * 2),
      // 纬度越大越靠北 → y 越小
      y: padY + ((maxLat - p.lat) / spanLat) * (h - padY * 2),
      p,
    }))
    return { coords, w, h }
  }, [points])
}

function StaticRouteMap({ points, activeSeq, onMarkerClick }: RouteMapProps) {
  const { coords, w, h } = useProjected(points)
  const nameBySeq = useMemo(() => Object.fromEntries(points.map(p => [p.seq, p.name])), [points])
  return (
    <div className="rounded-2xl border border-ink-100 bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="font-serif text-sm font-semibold text-charcoal">路线示意（点位顺序）</p>
        {!hasAmapKey() && (
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-400">
            零依赖示意图 · 点击导航用高德
          </span>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-ink-100 bg-[#F7F1E6]">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[300px] w-full" role="img" aria-label="路线示意图">
          {/* 连线 */}
          {coords.length > 1 && (
            <polyline
              points={coords.map(c => `${c.x},${c.y}`).join(' ')}
              fill="none"
              stroke="#C9A24B"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinejoin="round"
            />
          )}
          {coords.map(c => {
            const active = c.p.seq === activeSeq
            return (
              <g
                key={c.p.seq}
                className="cursor-pointer"
                onClick={() => onMarkerClick?.(c.p.seq)}
              >
                <circle cx={c.x} cy={c.y} r={active ? 16 : 13} fill={active ? '#E54D42' : '#8B4545'} />
                <text x={c.x} y={c.y + 4.5} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">
                  {c.p.seq}
                </text>
                <text x={c.x} y={c.y - 20} textAnchor="middle" fontSize="11.5" fill="#5A4632" fontWeight="600">
                  {c.p.name.replace(/（.*?）/g, '').slice(0, 6)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="mt-3 space-y-1.5">
        {points.map(p => (
          <li key={p.seq} className="flex items-center gap-2 text-sm">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-charcoal text-[11px] text-white">
              {p.seq}
            </span>
            <span className="text-ink-600">{p.name}</span>
            <a
              href={amapNavUrl(p)}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-vermilion underline underline-offset-2"
            >
              🧭 导航
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-ink-400">
        坐标为 GCJ-02 近似值，仅作示意；点「导航」跳转高德地图（移动端自动唤起 App）。
      </p>
    </div>
  )
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
    // 兜底：无论何种原因 6s 内未就绪，强制回退到 SVG 静态图（永不卡死）
    const backstop = setTimeout(() => {
      if (!cancelled && status === 'loading') setStatus('fallback')
    }, 6000)

    loadAmapScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.AMap) return
        clearTimeout(backstop)

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
      .finally(() => clearTimeout(backstop))

    return () => {
      cancelled = true
      clearTimeout(backstop)
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
    return <StaticRouteMap points={points} activeSeq={activeSeq} onMarkerClick={onMarkerClick} />
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
