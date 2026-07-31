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

const CATEGORY_LABEL: Record<string, string> = {
  scenic: '经典名胜',
  literary: '文学名篇',
  figure: '人物行旅',
}

const SEASON_LABEL: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export function RouteDetailView({ route: initialRoute }: { route: RouteDetail }) {
  const [route, setRoute] = useState<RouteDetail>(initialRoute)
  const [dataSource, setDataSource] = useState<'static' | 'supabase'>('static')
  const [geo, setGeo] = useState<GeoState>({ kind: 'idle' })
  const [activeSeq, setActiveSeq] = useState<number | undefined>(undefined)
  const [checkedIn, setCheckedIn] = useState<Record<number, string>>({}) // seq -> ISO time
  const [toast, setToast] = useState<string | null>(null)

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
    [locate, showToast, route.slug]
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
            <Link href="/routes" className="hover:text-vermilion">路线</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-500">{route.title}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.35em] text-vermilion uppercase">
              {route.book} · {route.city}
            </span>
            {route.category && (
              <span className="text-[10px] tracking-wider text-ink-500 border border-ink-100 rounded-full px-2.5 py-0.5">
                {CATEGORY_LABEL[route.category] ?? route.category}
              </span>
            )}
            {route.season && (
              <span className="text-[10px] tracking-wider text-ink-500 border border-ink-100 rounded-full px-2.5 py-0.5">
                {SEASON_LABEL[route.season] ?? route.season}
              </span>
            )}
          </div>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-charcoal tracking-wide">
            {route.title}
          </h1>
          <p className="mt-2 font-serif text-ink-400 tracking-[0.15em]">
            {route.author} · 共 {route.points.length} 个点位
            {route.duration ? ` · ${route.duration}` : ''}
            {route.difficulty ? ` · ${route.difficulty}` : ''}
          </p>
          {route.plainExplain && (
            <p className="mt-4 max-w-2xl font-serif text-lg text-charcoal leading-relaxed">
              {route.plainExplain}
            </p>
          )}
          <p className={`max-w-2xl font-serif text-base text-ink-500 leading-relaxed ${route.plainExplain ? 'mt-3' : 'mt-5'}`}>
            {route.summary}
          </p>
          {route.whyWorth && (
            <p className="mt-4 max-w-2xl text-sm text-vermilion/90 font-serif leading-relaxed border-l-2 border-vermilion/40 pl-4">
              {route.whyWorth}
            </p>
          )}
          {route.relatedBooks && route.relatedBooks.length > 0 && (
            <p className="mt-3 max-w-2xl text-sm text-ink-400 font-serif">
              走完可续读：{route.relatedBooks.join(' · ')}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => locate()}
              className="xc-pill bg-charcoal text-white hover:bg-charcoal-50"
              disabled={geo.kind === 'locating'}
            >
              {geo.kind === 'locating' ? '定位中…' : '📍 获取我的位置'}
            </button>
            <span className="font-serif text-sm text-ink-400">
              {geo.kind === 'ok' && `已定位（精度受浏览器限制）· 已打卡 ${checkedCount}/${route.points.length}`}
              {geo.kind === 'error' && <span className="text-vermilion">{geo.message}</span>}
              {geo.kind === 'idle' && `打卡需在点位 ${CHECKIN_RADIUS_METERS} 米内`}
            </span>
          </div>
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
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">
            点位 · 沿着{route.author || '原文'}的笔触走
          </h2>
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

                  {(p.sceneMatch || p.openInfo || p.pitfallGuide || p.tips || p.foodRecommend || p.photoSpots) && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-ink-500">
                      {p.culturalTag && (
                        <p><span className="font-semibold text-ink-600">类型：</span>{p.culturalTag}</p>
                      )}
                      {p.visitDuration && (
                        <p><span className="font-semibold text-ink-600">建议停留：</span>{p.visitDuration}</p>
                      )}
                      {p.sceneMatch && (
                        <p className="sm:col-span-2"><span className="font-semibold text-ink-600">场景对应：</span>{p.sceneMatch}</p>
                      )}
                      {p.openInfo && (
                        <p className="sm:col-span-2"><span className="font-semibold text-ink-600">开放：</span>{p.openInfo}</p>
                      )}
                      {p.transport && (
                        <p className="sm:col-span-2"><span className="font-semibold text-ink-600">交通：</span>{p.transport}</p>
                      )}
                      {p.pitfallGuide && (
                        <p><span className="font-semibold text-[#9C4A42]">避坑：</span>{p.pitfallGuide}</p>
                      )}
                      {p.tips && (
                        <p><span className="font-semibold text-ink-600">Tips：</span>{p.tips}</p>
                      )}
                      {p.foodRecommend && (
                        <p><span className="font-semibold text-ink-600">附近吃：</span>{p.foodRecommend}</p>
                      )}
                      {p.photoSpots && (
                        <p><span className="font-semibold text-ink-600">出片：</span>{p.photoSpots}</p>
                      )}
                      {p.nearby && (
                        <p className="sm:col-span-2"><span className="font-semibold text-ink-600">附近：</span>{p.nearby}</p>
                      )}
                    </div>
                  )}

                  {(p.baikeSummary || p.history || p.culturalStatus) && (
                    <details className="mt-3 rounded-xl border border-ink-100 bg-paper/60 px-4 py-3 text-sm text-ink-500">
                      <summary className="cursor-pointer font-serif font-semibold text-ink-700">百科 · 沿革 · 文化地位</summary>
                      {p.baikeSummary && <p className="mt-2 leading-relaxed">{p.baikeSummary}</p>}
                      {p.history && <p className="mt-2 leading-relaxed"><span className="font-semibold text-ink-600">沿革：</span>{p.history}</p>}
                      {p.culturalStatus && <p className="mt-2 leading-relaxed"><span className="font-semibold text-ink-600">地位：</span>{p.culturalStatus}</p>}
                    </details>
                  )}

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
                      {done ? '✓ 已打卡' : `到点位打卡（${CHECKIN_RADIUS_METERS}m 内）`}
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
