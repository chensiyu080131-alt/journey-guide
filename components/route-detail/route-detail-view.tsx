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
import { PanoramaViewer } from '@/app/components/panorama-viewer'
import rawHeritage from '@/public/heritage.json'
import { ReviewPanel } from './review-panel'
import { fetchReviewsForPoint, syncPendingReviews, type PointReviews } from '@/lib/reviews-store'
import { fetchRepliesForReviews } from '@/lib/merchant-store'
import { track, useTrackImpression } from '@/lib/track'
import TrackDebug from '@/app/components/track-debug'

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

/** 非遗数据（Task2）—— 从 heritage.json 读取，按城市匹配 */
interface HeritageItem {
  id: string
  name: string
  city: string
  category: string
  level: string
  summary: string
  fullDesc: string
  activity: string
  venue: string
  routeRelated: string[]
}
const HERITAGE_ALL: HeritageItem[] = (rawHeritage as { items: HeritageItem[] }).items
/** 按城市取非遗，最多取 3 条（点位卡片展示用） */
function getHeritageByCity(city: string, limit = 3): HeritageItem[] {
  return HERITAGE_ALL.filter(h => h.city === city).slice(0, limit)
}
/** 全景图来源：使用 Pannellum 官方示例全景图（公开、免授权）作为原型占位 */
const PANORAMA_FALLBACKS = [
  { url: 'https://pannellum.org/images/alma.jpg', source: 'Pannellum 官方示例' },
  { url: 'https://pannellum.org/images/cerro-toco-0.jpg', source: 'Pannellum 官方示例' },
  { url: 'https://pannellum.org/images/jfk.jpg', source: 'Pannellum 官方示例' },
]
/** 给点位配全景图：优先用 JSON 里的 panorama 字段，没有则按 seq 取一张占位图 */
function getPanorama(p: RoutePoint): { url: string; source: string } | null {
  if (p.panorama) return { url: p.panorama, source: p.panoramaSource || '网络公开全景图' }
  const fb = PANORAMA_FALLBACKS[p.seq % PANORAMA_FALLBACKS.length]
  return fb
}

/** Task4：把路线"是什么"翻译成一句人话。优先用 JSON 里的 plainExplain，没有则按 book 类型推断兜底。 */
function routeSummaryPlain(route: RouteDetail): string {
  if (route.plainExplain) return route.plainExplain
  // 兜底：按 book 字段推断
  const b = route.book || ''
  if (b.includes('游戏')) return `跟着游戏场景，去现实中的取景灵感地走一遍，在每个点位对比"游戏里 vs 现实中"。`
  if (b.includes('音乐') || b.includes('词') || b.includes('曲')) return `这不是听歌打卡，而是跟着词里写到的地名和意境，去走${route.city}。`
  return `跟着《${route.book}》里的描写，去${route.city}走这条真实的文学路线，到每个点位打卡解锁文学卡片。`
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
  // Task3：360° 全景 modal 状态（null 关闭，非 null 显示该点位的全景）
  const [panoramaPoint, setPanoramaPoint] = useState<{ p: RoutePoint; img: { url: string; source: string } } | null>(null)

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

  // 点位列表区块进入视口（≥50% 可见）上报一次 —— 用于测"非遗是否把主内容挤下去"
  const pointsRef = useTrackImpression<HTMLElement>('points_section_view', { slug: route.slug })

  const handleCheckin = useCallback(
    (point: RoutePoint) => {
      track('checkin_click', { point: point.seq, demo: demoMode || !geoAvailable })
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
    <div className={`bg-paper min-h-screen ${demoMode ? 'demo-mode-active' : ''}`}>
      {/* 体验模式全局状态条：开启时顶部明显提示，避免误以为真实定位（Task1 强化） */}
      {demoMode && (
        <div className="sticky top-16 z-30 bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          <span className="font-semibold">🎭 体验模式进行中</span> · 当前为模拟打卡，非真实定位 · <button type="button" onClick={() => setDemoMode(false)} className="underline underline-offset-2 hover:opacity-70">退出</button>
        </div>
      )}
      {/* ① 路线概览 —— Task4 统一首屏骨架：一句人话解释 / 为什么值得去 */}
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

          {/* Task4：一句人话解释（区别于 summary 的文学化表达） */}
          <div className="mt-5 rounded-2xl bg-white/70 border border-ink-100 px-5 py-4">
            <p className="text-base text-ink-700 leading-relaxed font-serif">
              <span className="font-semibold text-vermilion">这是什么 · </span>
              {routeSummaryPlain(route)}
            </p>
          </div>
          {/* Task4：为什么值得去 */}
          <div className="mt-3 text-sm text-ink-500 leading-relaxed">
            <span className="font-semibold text-charcoal">为什么值得去 · </span>{route.whyWorth || route.summary}
          </div>
          <p className="mt-3 max-w-2xl font-serif text-sm text-ink-400 leading-relaxed">{route.summary}</p>

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

      {/* ②½ 路线级「附近非遗」独立区块（去同城重复，强对比） */}
      <RouteHeritageSection city={route.city} />

      {/* ③ 点位列表 + ④ 打卡按钮 */}
      <section ref={pointsRef} className="bg-paper">
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

                  {/* Task2/3：文学 ↔ 现�� 对照说明块 */}
                  <div className="mt-3 rounded-xl border border-ink-100 bg-paper/60 px-4 py-3">
                    <div className="text-[11px] font-semibold tracking-widest text-ink-400 uppercase mb-1.5">文学 ↔ 现实 对照</div>
                    <p className="text-sm leading-relaxed text-ink-600">{p.interpretation}</p>
                  </div>

                  {/* Task3：360° 全景浏览入口（强对比 + 显眼） */}
                  {(() => {
                    const img = getPanorama(p)
                    if (!img) return null
                    return (
                      <button
                        type="button"
                        onClick={() => { track('panorama_open_click', { point: p.seq }); setPanoramaPoint({ p, img }) }}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#3E6B3E] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#345C34]"
                      >
                        🌀 全景浏览 · 360° 看看这里
                      </button>
                    )
                  })()}

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

      {/* Task4：为什么今天适合去（季节区块） */}
      <SeasonBanner route={route} />

      {/* Task3：360° 全景查看器 modal */}
      {panoramaPoint && (
        <PanoramaViewer
          imageUrl={panoramaPoint.img.url}
          title={panoramaPoint.p.name}
          source={panoramaPoint.img.source}
          onClose={() => setPanoramaPoint(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-charcoal px-6 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* 埋点实时 HUD：仅在 URL 带 ?track=debug 时出现，正常用户无感 */}
      <TrackDebug />
    </div>
  )
}

/** Task4：季节区块 —— 根据当前月份与路线 season 字段，显示"为什么今天适合去" */
function SeasonBanner({ route }: { route: RouteDetail }) {
  const month = new Date().getMonth() + 1
  const currentSeason = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter'
  const routeSeason = route.season || 'spring'
  const SEASON_NAME: Record<string, string> = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }

  const copy: Record<string, string> = {
    spring: `${SEASON_NAME.spring}天适合走这条路线——草木初醒，光线柔和，正是诗里"行到水穷处"的好时节。`,
    summer: `${SEASON_NAME.summer}天适合走这条路线——树荫浓密，水风清凉，午后斜阳把石板晒出文学的气味。`,
    autumn: `${SEASON_NAME.autumn}天适合走这条路线——天高气爽，月色最明，是读这首诗最好的季节。`,
    winter: `${SEASON_NAME.winter}天适合走这条路线——游人稀少，山水清瘦，恰能看见文人笔下最干净的那一笔。`,
  }

  const isCurrent = currentSeason === routeSeason
  const text = isCurrent
    ? copy[routeSeason]
    : `虽然现在是${SEASON_NAME[currentSeason]}季，但「${route.title}」在${SEASON_NAME[routeSeason]}季有别样的味道：${copy[routeSeason].split('——')[1] || copy[routeSeason]}`

  return (
    <section className="bg-white border-t border-ink-100">
      <div className="xc-container py-8">
        <div className="rounded-2xl bg-gradient-to-br from-paper-warm to-camel-light px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{isCurrent ? '🌿' : '🍂'}</span>
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">为什么今天适合去</h3>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Task2（重构）：路线级「附近非遗」独立区块 —— 按城市匹配、去同城重复、强对比 */
function RouteHeritageSection({ city }: { city: string }) {
  const items = getHeritageByCity(city, 6)
  // 区块进入视口上报一次 —— 用于测"非遗是否被自然看见"
  const secRef = useTrackImpression<HTMLElement>('heritage_section_view', { city, count: items.length })
  if (items.length === 0) {
    return (
      <section ref={secRef} className="bg-white border-t border-ink-100">
        <div className="xc-container py-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h2 className="font-serif text-2xl font-bold text-charcoal">附近非遗</h2>
          </div>
          <p className="mt-3 text-sm text-ink-500">这条路线暂未收录该地的非遗活动信息，后续会补充。</p>
        </div>
      </section>
    )
  }
  return (
    <section ref={secRef} className="bg-white border-t border-ink-100">
      <div className="xc-container py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h2 className="font-serif text-2xl font-bold text-charcoal">附近非遗 · {city}</h2>
          </div>
          <p className="text-sm text-ink-500">这条路线所在的{city}，藏着这些活着的传统技艺与习俗</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(h => (
            <HeritageCard key={h.id} h={h} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** 单张非遗卡片：标题/级别/类别 + 摘要，点击展开活动与地点 */
function HeritageCard({ h }: { h: HeritageItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-[#E3D5B3] bg-[#FBF8F0] p-4 transition-shadow hover:shadow-md">
      <button type="button" onClick={() => { track('heritage_card_expand', { id: h.id, level: h.level, category: h.category }); setOpen(o => !o) }} className="block w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-base font-bold text-charcoal">{h.name}</span>
          <span className="shrink-0 rounded-full bg-[#F5EFE0] px-2 py-0.5 text-[11px] font-semibold text-[#8A6D2F]">{h.level}</span>
        </div>
        <div className="mt-1 text-xs text-ink-400">{h.category}</div>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{h.summary}</p>
        <span className="mt-2 inline-block text-xs font-semibold text-vermilion">{open ? '收起 ▲' : '展开看看 ▼'}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-dashed border-ink-100 pt-3 text-sm leading-relaxed text-ink-600">
          <p>{h.fullDesc}</p>
          <p className="mt-2"><span className="font-semibold text-[#8A6D2F]">📅 活动：</span>{h.activity}</p>
          <p className="mt-1"><span className="font-semibold text-[#8A6D2F]">📍 地点：</span>{h.venue}</p>
        </div>
      )}
    </div>
  )
}
