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
import { ReviewPanel } from './review-panel'
import { fetchReviewsForPoint, syncPendingReviews, type PointReviews } from '@/lib/reviews-store'
import { fetchRepliesForReviews } from '@/lib/merchant-store'

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
  // 首次进入路线页 + HTTP 环境：弹一次轻提示，引导用户开体验模式（P0 修复）
  const [showDemoHint, setShowDemoHint] = useState(false)
  const geoAvailable =
    typeof navigator !== 'undefined' &&
    !!navigator.geolocation &&
    (typeof window === 'undefined' || window.isSecureContext !== false)

  useEffect(() => {
    if (!geoAvailable && typeof window !== 'undefined') {
      const seen = window.sessionStorage.getItem('xunji.demoHintShown')
      if (!seen) {
        setShowDemoHint(true)
        window.sessionStorage.setItem('xunji.demoHintShown', '1')
      }
    }
  }, [geoAvailable])

  // 反馈回路 Step1：已打卡点位的评价展示 + 写评价面板
  const [reviewOpenSeq, setReviewOpenSeq] = useState<number | null>(null)
  const [reviewsBySeq, setReviewsBySeq] = useState<Record<number, PointReviews>>({})
  // 反馈回路 Step2：评价对应的商家回复（reviewId -> 回复文本）
  const [merchantReplies, setMerchantReplies] = useState<Record<string, string>>({})

  const loadPointReviews = useCallback(
    (seq: number) => {
      void fetchReviewsForPoint(route.slug, seq, 3).then(pr => {
        setReviewsBySeq(prev => ({ ...prev, [seq]: pr }))
        const ids = pr.items.map(r => r.id).filter(id => !id.startsWith('local-'))
        if (ids.length) {
          void fetchRepliesForReviews(ids).then(replies => {
            setMerchantReplies(prev => ({ ...prev, ...replies }))
          })
        }
      })
    },
    [route.slug]
  )

  // T4：加载本地暂存的打卡记录 + 补偿同步后端（断网时留队列，下次进页再试）
  useEffect(() => {
    const saved = loadCheckins(route.slug)
    if (saved.length) {
      setCheckedIn(
        Object.fromEntries(saved.map(r => [r.pointSeq, r.checkedAt]))
      )
      saved.forEach(r => loadPointReviews(r.pointSeq))
    }
    void syncPendingToSupabase()
    void syncPendingReviews()
  }, [route.slug, loadPointReviews])

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

  // T3：真实定位模式下，距点位超过打卡半径则禁用该点打卡按钮
  // （反向验证：1km 外禁用 / 回到 100m 内重新定位后启用）
  const realMode = geoAvailable && !demoMode
  const tooFarFor = (p: { distance: number | null }) =>
    realMode && geo.kind === 'ok' && p.distance !== null && p.distance > CHECKIN_RADIUS_METERS

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

          {/* P0：体验模式入口 —— 醒目横幅，不藏二级交互 */}
          {!geoAvailable && (
            <div className={`mt-4 rounded-2xl border-2 px-5 py-4 transition-all ${
              demoMode
                ? 'border-vermilion bg-vermilion/5'
                : 'border-dashed border-vermilion/40 bg-vermilion/3'
            }`}>
              {showDemoHint && !demoMode && (
                <div className="mb-2 text-sm font-semibold text-vermilion">
                  💡 首次提示：当前网页为 HTTP，无法获取你的真实定位，打卡按钮会显示"过远"。
                  <button
                    type="button"
                    onClick={() => { setDemoMode(true); setShowDemoHint(false) }}
                    className="ml-2 underline underline-offset-2 hover:opacity-70"
                  >
                    点此一键开启体验模式 →
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-ink-600">
                  {demoMode ? (
                    <span><span className="font-bold text-vermilion">✓ 体验模式已开启</span> · 可直接点「体验打卡」解锁全部点位</span>
                  ) : (
                    <span>📡 当前为 HTTP 站点，移动端 GPS 被浏览器禁用。开启体验模式可<span className="font-semibold text-vermilion">免定位模拟打卡</span>。</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDemoMode(!demoMode)}
                  className={`xc-pill text-sm transition-all ${
                    demoMode
                      ? 'border-2 border-ink-200 bg-white text-ink-600'
                      : 'bg-vermilion text-white hover:opacity-90'
                  }`}
                >
                  {demoMode ? '关闭体验模式' : '⚡ 开启体验模式'}
                </button>
              </div>
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
                      disabled={done || tooFarFor(p)}
                      className={`xc-pill text-sm ${
                        done
                          ? 'cursor-default bg-[#EAF3EA] text-[#3E6B3E]'
                          : tooFarFor(p)
                          ? 'cursor-not-allowed bg-ink-100 text-ink-400'
                          : 'bg-vermilion text-white hover:opacity-90'
                      }`}
                    >
                      {done
                        ? '✓ 已打卡'
                        : tooFarFor(p)
                        ? `距「${p.name}」过远 · 需 ${CHECKIN_RADIUS_METERS}m 内`
                        : demoMode || !geoAvailable
                        ? '⚡ 体验打卡（免定位）'
                        : `到点位打卡（${CHECKIN_RADIUS_METERS}m 内）`}
                    </button>
                    {/* P0：未开体验模式且因 HTTP 过远禁用时，直接加快捷入口 */}
                    {!done && tooFarFor(p) && !demoMode && !geoAvailable && (
                      <button
                        type="button"
                        onClick={() => {
                          setDemoMode(true)
                          setTimeout(() => handleCheckin(p), 50)
                        }}
                        className="xc-pill border-2 border-vermilion bg-white text-sm text-vermilion hover:bg-vermilion/5"
                      >
                        ⚡ 开启体验模式并打卡
                      </button>
                    )}
                    <a
                      href={amapNavUrl(p)}
                      target="_blank"
                      rel="noreferrer"
                      className="xc-pill border-2 border-ink-200 bg-white text-sm text-ink-700 hover:bg-ink-50"
                    >
                        🧭 导航到这里
                      </a>
                    </div>

                    {/* 反馈回路 Step1：已打卡点位显示评分 + 写评价 */}
                    {done && (
                      <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-[#E0A800]">★ {reviewsBySeq[p.seq]?.avg ?? '—'}</span>
                            <span className="text-ink-400">{reviewsBySeq[p.seq]?.count ?? 0} 条评价</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReviewOpenSeq(reviewOpenSeq === p.seq ? null : p.seq)}
                            className="text-sm font-semibold text-vermilion hover:opacity-80"
                          >
                            {reviewOpenSeq === p.seq ? '收起' : '✍️ 写评价'}
                          </button>
                        </div>

                        {reviewsBySeq[p.seq]?.items?.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {reviewsBySeq[p.seq]?.items?.map(r => (
                              <li key={r.id} className="rounded-xl bg-paper px-3 py-2 text-sm">
                                <div className="flex items-center gap-1 text-[#E0A800]">
                                  {'★'.repeat(r.rating)}
                                  <span className="ml-1 text-xs text-ink-400">{r.rating} 星</span>
                                </div>
                                {r.text && <p className="mt-1 text-ink-600">{r.text}</p>}
                                {r.photoUrl && (
                                  <img src={r.photoUrl} alt="实拍" className="mt-2 h-20 w-20 rounded-lg object-cover" />
                                )}
                                {merchantReplies[r.id] && (
                                  <div className="mt-2 rounded-lg bg-[#F5EFE0] px-3 py-1.5 text-xs text-[#8A6D2F]">
                                    商家回复：{merchantReplies[r.id]}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {reviewOpenSeq === p.seq && (
                          <ReviewPanel
                            routeSlug={route.slug}
                            pointSeq={p.seq}
                            pointName={p.name}
                            onSubmitted={() => loadPointReviews(p.seq)}
                          />
                        )}
                      </div>
                    )}
                  </article>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-ink-400">
            GPS 验证已生效；打卡记录经待同步队列写入后端（断网时本地保留，联网自动补传）。
            {dataSource === 'supabase' ? ' 数据源：云端。' : ' 数据源：本地快照。'}
            {' '}
            <Link href="/reviews" className="text-vermilion hover:opacity-80">查看全站评价 →</Link>
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
