'use client'

// T3 路线详情页视图：路线概览 / 点位列表 / 地图导航 / 打卡按钮（GPS 验证）
// 打卡后端存储属 T4，当前受阻于 Supabase 凭证 —— 本组件先完成 GPS 验证交互，
// 状态暂存内存并标注「试运行 · 未入库」，凭证到位后接 checkins 表（见 supabase/schema.sql）。

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CHECKIN_RADIUS_METERS,
  distanceMeters,
  fetchRouteDetailFromSupabase,
  type RouteDetail,
  type RoutePoint,
} from '@/lib/route-detail-data'
import { loadCheckins, saveCheckin, syncPendingToSupabase } from '@/lib/checkin-store'
import { RouteMap, amapNavUrl } from './route-map'
import { LiteraryCards } from './literary-cards'

type GeoState =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'ok'; lat: number; lng: number; ts: number }
  | { kind: 'error'; message: string }

const CONFIDENCE_LABEL: Record<RoutePoint['excerptConfidence'], { text: string; cls: string }> = {
  verified: { text: '原文实据', cls: 'bg-[#EAF3EA] text-[#3E6B3E] border-[#C6DCC6]' },
  derived: { text: '主题引用', cls: 'bg-[#F5EFE0] text-[#8A6D2F] border-[#E3D5B3]' },
  pending: { text: '出处待考', cls: 'bg-[#F6E9E7] text-[#9C4A42] border-[#E8CBC6]' },
}

export function RouteDetailView({ route: initialRoute }: { route: RouteDetail }) {
  const [route, setRoute] = useState<RouteDetail>(initialRoute)
  const [dataSource, setDataSource] = useState<'static' | 'supabase'>('static')
  const [geo, setGeo] = useState<GeoState>({ kind: 'idle' })
  const [activeSeq, setActiveSeq] = useState<number | undefined>(undefined)
  const [checkedIn, setCheckedIn] = useState<Record<number, string>>({}) // seq -> ISO time
  const [toast, setToast] = useState<string | null>(null)
  // GPS 打卡需 HTTPS 安全上下文；站点为 HTTP 时移动端（含夸克）geolocation 被禁。
  // 体验模式：不依赖真实 GPS，直接模拟到点位打卡，便于演示解锁 + 分享图。
  const [demoMode, setDemoMode] = useState(false)
  const geoAvailable =
    typeof navigator !== 'undefined' &&
    !!navigator.geolocation &&
    (typeof window === 'undefined' || window.isSecureContext !== false)

  // T4：加载本地暂存的打卡记录 + 补偿同步后端（断网时留队列，下次进页再试）
  useEffect(() => {
    const saved = loadCheckins(route.slug)
    if (saved.length) {
      setCheckedIn(
        Object.fromEntries(saved.map(r => [r.pointSeq, r.checkedAt]))
      )
    }
    void syncPendingToSupabase()
  }, [route.slug])

  // T1/T3：挂载后从 Supabase 拉最新路线数据（构建期渲染的是本地快照，此处覆盖）
  useEffect(() => {
    let cancelled = false
    void fetchRouteDetailFromSupabase(initialRoute.slug).then(remote => {
      if (remote && !cancelled) {
        setRoute(remote)
        setDataSource('supabase')
      }
    })
    return () => {
      cancelled = true
    }
  }, [initialRoute.slug])

  const locate = useCallback((onDone?: (pos: { lat: number; lng: number }) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeo({ kind: 'error', message: '当前浏览器不支持定位' })
      return
    }
    setGeo({ kind: 'locating' })
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGeo({ kind: 'ok', ...p, ts: Date.now() })
        onDone?.(p)
      },
      err => {
        setGeo({
          kind: 'error',
          message:
            err.code === err.PERMISSION_DENIED
              ? '定位权限被拒绝，请在浏览器设置中允许定位'
              : '定位失败，请稍后重试',
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handleCheckin = useCallback(
    (point: RoutePoint) => {
      // 体验模式 或 无 GPS 环境：直接模拟到点位打卡（同坐标、距离 0）
      if (demoMode || !geoAvailable) {
        const now = new Date().toISOString()
        setCheckedIn(prev => ({ ...prev, [point.seq]: now }))
        saveCheckin({
          routeSlug: route.slug,
          pointSeq: point.seq,
          pointName: point.name,
          checkedAt: now,
          lat: point.lat,
          lng: point.lng,
          distanceM: 0,
          simulated: true,
        })
        showToast(`✅ 体验打卡：${point.name} · 文学卡片已解锁（演示数据，未用真实 GPS）`)
        return
      }
      locate(userPos => {
        const d = distanceMeters(userPos, point)
        if (d <= CHECKIN_RADIUS_METERS) {
          const now = new Date().toISOString()
          setCheckedIn(prev => ({ ...prev, [point.seq]: now }))
          // 先落本地队列（synced=false），随即写入 Supabase checkins 表
          saveCheckin({
            routeSlug: route.slug,
            pointSeq: point.seq,
            pointName: point.name,
            checkedAt: now,
            lat: userPos.lat,
            lng: userPos.lng,
            distanceM: d,
          })
          showToast(`✅ 打卡成功：${point.name}（距点位 ${d} 米）· 文学卡片已解锁`)
          void syncPendingToSupabase().then(r => {
            if (r.ok && r.synced > 0) showToast('☁️ 打卡记录已同步到后端')
          })
        } else {
          showToast(`📍 距离「${point.name}」还有约 ${d >= 1000 ? (d / 1000).toFixed(1) + ' 公里' : d + ' 米'}，需在 ${CHECKIN_RADIUS_METERS} 米内才能打卡`)
        }
      })
    },
    [locate, showToast, route.slug, demoMode, geoAvailable]
  )

  const userPos = geo.kind === 'ok' ? { lat: geo.lat, lng: geo.lng } : null
  const checkedCount = Object.keys(checkedIn).length

  const pointsWithDistance = useMemo(
    () =>
      route.points.map(p => ({
        ...p,
        distance: userPos ? distanceMeters(userPos, p) : null,
      })),
    [route.points, userPos]
  )

  return (
    <div className="bg-paper min-h-screen">
      {/* ① 路线概览 */}
      <section className="bg-paper">
        <div className="xc-container pt-10 pb-8">
          <div className="text-xs text-ink-400">
            <Link href="/" className="hover:text-vermilion">首页</Link>
            <span className="mx-2">/</span>
            <span>路线</span>
            <span className="mx-2">/</span>
            <span className="text-ink-500">{route.title}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.35em] text-vermilion uppercase">
              {route.book} · {route.city}
            </span>
          </div>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-charcoal tracking-wide">
            {route.title}
          </h1>
          <p className="mt-2 font-serif text-ink-400 tracking-[0.15em]">{route.author} · 共 {route.points.length} 个点位</p>
          <p className="mt-5 max-w-2xl font-serif text-base text-ink-500 leading-relaxed">{route.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => locate()}
              className="xc-pill bg-charcoal text-white hover:bg-charcoal-50"
              disabled={geo.kind === 'locating' || !geoAvailable}
            >
              {geo.kind === 'locating' ? '定位中…' : '📍 获取我的位置'}
            </button>
            <span className="font-serif text-sm text-ink-400">
              {geo.kind === 'ok' && `已定位（精度受浏览器限制）· 已打卡 ${checkedCount}/${route.points.length}`}
              {geo.kind === 'error' && <span className="text-vermilion">{geo.message}</span>}
              {geo.kind === 'idle' && (geoAvailable ? `打卡需在点位 ${CHECKIN_RADIUS_METERS} 米内` : 'GPS 需 HTTPS，可开启下方体验模式')}
            </span>
          </div>

          {!geoAvailable && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-paper px-4 py-3">
              <span className="text-sm text-ink-500">
                📡 当前站点为 HTTP，移动端（含夸克）GPS 被禁用。开启体验模式可免定位演示打卡解锁。
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={e => setDemoMode(e.target.checked)}
                  className="h-4 w-4 accent-vermilion"
                />
                <span className="font-semibold text-vermilion">体验模式</span>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ② 地图导航 */}
      <section className="bg-white">
        <div className="xc-container py-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">路线地图</h2>
          <RouteMap points={route.points} activeSeq={activeSeq} onMarkerClick={setActiveSeq} />
          <p className="mt-3 text-xs text-ink-400">
            点击地图标记可在下方列表定位；「导航」跳转高德地图（移动端自动唤起 App）。坐标为 GCJ-02 近似值，待实地核准。
          </p>
        </div>
      </section>

      {/* ③ 点位列表 + ④ 打卡按钮 */}
      <section className="bg-paper">
        <div className="xc-container py-10">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">点位 · 沿着汪老的笔触走</h2>
          <div className="space-y-5">
            {pointsWithDistance.map(p => {
              const done = Boolean(checkedIn[p.seq])
              const conf = CONFIDENCE_LABEL[p.excerptConfidence]
              return (
                <article
                  key={p.seq}
                  className={`rounded-2xl border bg-white p-6 transition-all ${
                    activeSeq === p.seq ? 'border-vermilion shadow-md' : 'border-ink-100'
                  }`}
                  onMouseEnter={() => setActiveSeq(p.seq)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-charcoal font-serif text-sm text-white">
                          {p.seq}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-charcoal">{p.name}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${conf.cls}`}>{conf.text}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-ink-400">{p.address}</p>
                    </div>
                    <div className="text-right text-xs text-ink-400">
                      {p.distance !== null && (
                        <div className="font-semibold text-ink-500">
                          距我 {p.distance >= 1000 ? `${(p.distance / 1000).toFixed(1)} 公里` : `${p.distance} 米`}
                        </div>
                      )}
                    </div>
                  </div>

                  <blockquote className="mt-4 border-l-2 border-vermilion/60 pl-4 font-serif text-[15px] leading-relaxed text-ink-700">
                    「{p.excerpt}」
                    <footer className="mt-1.5 text-xs text-ink-400 not-italic">—— {p.excerptSource}</footer>
                  </blockquote>

                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{p.interpretation}</p>

                  <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-500">
                    <span className="font-semibold text-[#8A6D2F]">打卡任务：</span>
                    {p.checkinTask}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleCheckin(p)}
                      disabled={done}
                      className={`xc-pill text-sm ${
                        done
                          ? 'cursor-default bg-[#EAF3EA] text-[#3E6B3E]'
                          : 'bg-vermilion text-white hover:opacity-90'
                      }`}
                    >
                      {done ? '✓ 已打卡' : demoMode || !geoAvailable ? '⚡ 体验打卡（免定位）' : `到点位打卡（${CHECKIN_RADIUS_METERS}m 内）`}
                    </button>
                    <a
                      href={amapNavUrl(p)}
                      target="_blank"
                      rel="noreferrer"
                      className="xc-pill border-2 border-ink-200 bg-white text-sm text-ink-700 hover:bg-ink-50"
                    >
                      🧭 导航到这里
                    </a>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-ink-400">
            GPS 验证已生效；打卡记录经待同步队列写入后端（断网时本地保留，联网自动补传）。
            {dataSource === 'supabase' ? ' 数据源：云端。' : ' 数据源：本地快照。'}
          </p>
        </div>
      </section>

      {/* ⑤ 文学卡片收集 + 分享图（T4） */}
      <LiteraryCards route={route} checkedSeqs={Object.keys(checkedIn).map(Number)} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-charcoal px-6 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
