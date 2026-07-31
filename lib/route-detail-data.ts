// 路线详情数据层 — T3 骨架阶段用本地 mock（JSON），T1 拿到 Supabase 凭证后切换为远端读取
// 切换方式：实现 fetchRouteFromSupabase 并把 getRouteDetail 内部分支打开，页面代码无需改动

import rawYangzhou from '@/public/xunji-mvp/db/yangzhou-wangzengqi-zaocha.json'
import rawSuzhouHanshan from '@/public/xunji-mvp/db/suzhou-hanshansi-fengqiao.json'
import rawSuzhouZhuozheng from '@/public/xunji-mvp/db/suzhou-zhuozhengyuan-wenzhengming.json'
import rawHangzhouSudi from '@/public/xunji-mvp/db/hangzhou-sudi-sushi.json'
import rawHangzhouBaidi from '@/public/xunji-mvp/db/hangzhou-baidi-baijiuyi.json'
import rawNanjingQinhuai from '@/public/xunji-mvp/db/nanjing-qinhuaihe-zhuziqing.json'
import rawNanjingFuzimiao from '@/public/xunji-mvp/db/nanjing-fuzimiao-shishuoxinyu.json'
import rawYuanshen from '@/public/xunji-mvp/db/zhangjiajie-qifeng-ruhua.json'
import rawYangzhouMan from '@/public/xunji-mvp/db/yangzhou-man-jiangkui.json'
import rawLingyinsi from '@/public/xunji-mvp/db/hangzhou-lingyinsi-luobinwang.json'
import rawLongjing from '@/public/xunji-mvp/db/hangzhou-longjing-sushi.json'
import rawGushan from '@/public/xunji-mvp/db/hangzhou-gushan-linbu.json'
import rawHuqiu from '@/public/xunji-mvp/db/suzhou-huqiu-sushi.json'
import rawPingjiang from '@/public/xunji-mvp/db/suzhou-pingjiang-fushengliuji.json'
import rawMochou from '@/public/xunji-mvp/db/nanjing-mochouhu-liangwudi.json'
import rawYuejiang from '@/public/xunji-mvp/db/nanjing-yuejianglou-songlian.json'
import rawShouxihu from '@/public/xunji-mvp/db/yangzhou-shouxihu-dumu.json'
import rawChangshuShajiabang from '@/public/xunji-mvp/db/changshu-shajiabang-jingju.json'
import rawShaoxingLuxun from '@/public/xunji-mvp/db/shaoxing-luxun-baicaoyuan.json'
import rawBeijingLaoshe from '@/public/xunji-mvp/db/beijing-laoshe-chaguan.json'
import rawShaoxingLuyou from '@/public/xunji-mvp/db/shaoxing-luyou-shenyuan.json'
import rawHarbinXiaohong from '@/public/xunji-mvp/db/harbin-xiaohong-hulanhe.json'
import rawJinanLaoshe from '@/public/xunji-mvp/db/jinan-laoshe-baotuquan.json'
import rawFenghuangShencongwen from '@/public/xunji-mvp/db/fenghuang-shencongwen-biancheng.json'
import rawWuzhenMaodun from '@/public/xunji-mvp/db/wuzhen-maodun-linjiapuzi.json'
import rawYananLuyao from '@/public/xunji-mvp/db/yanan-luyao-pingfan.json'
import rawGaoyouWangzengqi from '@/public/xunji-mvp/db/gaoyou-wangzengqi-duck.json'
import rawCambridgeXuzhimo from '@/public/xunji-mvp/db/cambridge-xuzhimo-kangqiao.json'

export type ExcerptConfidence = 'verified' | 'derived' | 'pending'

/** 规范 V2：点位导览扩展字段 */
export interface PointGuide {
  baikeSummary?: string
  history?: string
  culturalStatus?: string
  culturalTag?: string
  openInfo?: string
  transport?: string
  nearby?: string
  bestTime?: string
  sceneMatch?: string
  pitfallGuide?: string
  tips?: string
  foodRecommend?: string
  photoSpots?: string
  visitDuration?: string
}

export interface RoutePoint extends PointGuide {
  seq: number
  name: string
  address: string
  lng: number
  lat: number
  excerpt: string
  excerptSource: string
  excerptConfidence: ExcerptConfidence
  interpretation: string
  checkinTask: string
  /** 360° 全景图 URL（可选，无则不显示全景入口） */
  panorama?: string
  /** 全景图来源标注（版权/出处） */
  panoramaSource?: string
  /** 文学卡片插图 */
  illustration?: string
  /** 文学卡片地点照片 */
  photo?: string
}

export interface RouteDetail {
  slug: string
  title: string
  author: string
  city: string
  book: string
  summary: string
  /** 一句白话解释（Task4）：区别于 summary 的文学化表达，直接告诉用户"这是干什么的" */
  plainExplain?: string
  /** 为什么值得去（Task4）：给用户一个行动理由 */
  whyWorth?: string
  /** 季节（Task4 季节区块）：spring/summer/autumn/winter */
  season?: string
  /** 分类（Task2 筛选）：scenic 经典名胜 / literary 文学名篇 / figure 人物行旅 */
  category?: string
  /** 规范 V2：建议时长 / 难度 / 相关书目 */
  duration?: string
  difficulty?: string
  relatedBooks?: string[]
  points: RoutePoint[]
}

interface RawRouteFile {
  route: {
    slug: string
    title: string
    author: string
    city: string
    book: string
    summary: string
    plain_explain?: string
    why_worth?: string
    season?: string
    category?: string
    duration?: string
    difficulty?: string
    related_books?: string[]
  }
  points: Array<{
    seq: number
    name: string
    address: string
    lng: number
    lat: number
    excerpt: string
    excerpt_source: string
    excerpt_confidence: string
    interpretation: string
    checkin_task: string
    panorama?: string
    panorama_source?: string
    photo?: string
    illustration?: string
    baike_summary?: string
    history?: string
    cultural_status?: string
    cultural_tag?: string
    open_info?: string
    transport?: string
    nearby?: string
    best_time?: string
    scene_match?: string
    pitfall_guide?: string
    tips?: string
    food_recommend?: string
    photo_spots?: string
    visit_duration?: string
  }>
}

function normalizePoint(p: RawRouteFile['points'][number]): RoutePoint {
  return {
    seq: p.seq,
    name: p.name,
    address: p.address,
    lng: p.lng,
    lat: p.lat,
    excerpt: p.excerpt,
    excerptSource: p.excerpt_source,
    excerptConfidence: (['verified', 'derived', 'pending'].includes(p.excerpt_confidence)
      ? p.excerpt_confidence
      : 'pending') as ExcerptConfidence,
    interpretation: p.interpretation,
    checkinTask: p.checkin_task,
    panorama: p.panorama,
    panoramaSource: p.panorama_source,
    photo: p.photo,
    illustration: p.illustration,
    baikeSummary: p.baike_summary,
    history: p.history,
    culturalStatus: p.cultural_status,
    culturalTag: p.cultural_tag,
    openInfo: p.open_info,
    transport: p.transport,
    nearby: p.nearby,
    bestTime: p.best_time,
    sceneMatch: p.scene_match,
    pitfallGuide: p.pitfall_guide,
    tips: p.tips,
    foodRecommend: p.food_recommend,
    photoSpots: p.photo_spots,
    visitDuration: p.visit_duration,
  }
}

function normalize(raw: RawRouteFile): RouteDetail {
  return {
    slug: raw.route.slug,
    title: raw.route.title,
    author: raw.route.author,
    city: raw.route.city,
    book: raw.route.book,
    summary: raw.route.summary,
    plainExplain: raw.route.plain_explain,
    whyWorth: raw.route.why_worth,
    season: raw.route.season,
    category: raw.route.category,
    duration: raw.route.duration,
    difficulty: raw.route.difficulty,
    relatedBooks: raw.route.related_books,
    points: raw.points
      .slice()
      .sort((a, b) => a.seq - b.seq)
      .map(normalizePoint),
  }
}

/** 远端覆盖时：用本地 V2 导览字段补齐（Supabase 未扩列前不丢内容） */
export function mergeRouteGuide(remote: RouteDetail, local: RouteDetail | null): RouteDetail {
  if (!local) return remote
  const bySeq = new Map(local.points.map(p => [p.seq, p]))
  return {
    ...remote,
    duration: remote.duration || local.duration,
    difficulty: remote.difficulty || local.difficulty,
    relatedBooks: remote.relatedBooks?.length ? remote.relatedBooks : local.relatedBooks,
    points: remote.points.map(rp => {
      const lp = bySeq.get(rp.seq)
      if (!lp) return rp
      return {
        ...rp,
        baikeSummary: rp.baikeSummary || lp.baikeSummary,
        history: rp.history || lp.history,
        culturalStatus: rp.culturalStatus || lp.culturalStatus,
        culturalTag: rp.culturalTag || lp.culturalTag,
        openInfo: rp.openInfo || lp.openInfo,
        transport: rp.transport || lp.transport,
        nearby: rp.nearby || lp.nearby,
        bestTime: rp.bestTime || lp.bestTime,
        sceneMatch: rp.sceneMatch || lp.sceneMatch,
        pitfallGuide: rp.pitfallGuide || lp.pitfallGuide,
        tips: rp.tips || lp.tips,
        foodRecommend: rp.foodRecommend || lp.foodRecommend,
        photoSpots: rp.photoSpots || lp.photoSpots,
        visitDuration: rp.visitDuration || lp.visitDuration,
        photo: rp.photo || lp.photo,
        illustration: rp.illustration || lp.illustration,
      }
    }),
  }
}

// mock 数据源注册表（新增路线：加一个 JSON 导入即可）
const MOCK_ROUTES: RouteDetail[] = [
  normalize(rawYangzhou as RawRouteFile),
  normalize(rawSuzhouHanshan as RawRouteFile),
  normalize(rawSuzhouZhuozheng as RawRouteFile),
  normalize(rawHangzhouSudi as RawRouteFile),
  normalize(rawHangzhouBaidi as RawRouteFile),
  normalize(rawNanjingQinhuai as RawRouteFile),
  normalize(rawNanjingFuzimiao as RawRouteFile),
  normalize(rawYuanshen as RawRouteFile),
  normalize(rawYangzhouMan as RawRouteFile),
  normalize(rawLingyinsi as RawRouteFile),
  normalize(rawLongjing as RawRouteFile),
  normalize(rawGushan as RawRouteFile),
  normalize(rawHuqiu as RawRouteFile),
  normalize(rawPingjiang as RawRouteFile),
  normalize(rawMochou as RawRouteFile),
  normalize(rawYuejiang as RawRouteFile),
  normalize(rawShouxihu as RawRouteFile),
  normalize(rawChangshuShajiabang as RawRouteFile),
  normalize(rawShaoxingLuxun as RawRouteFile),
  normalize(rawBeijingLaoshe as RawRouteFile),
  normalize(rawShaoxingLuyou as RawRouteFile),
  normalize(rawHarbinXiaohong as RawRouteFile),
  normalize(rawJinanLaoshe as RawRouteFile),
  normalize(rawFenghuangShencongwen as RawRouteFile),
  normalize(rawWuzhenMaodun as RawRouteFile),
  normalize(rawYananLuyao as RawRouteFile),
  normalize(rawGaoyouWangzengqi as RawRouteFile),
  normalize(rawCambridgeXuzhimo as RawRouteFile),
]

export function getAllRouteSlugs(): string[] {
  return MOCK_ROUTES.map(r => r.slug)
}

export function listAllRoutes(): RouteDetail[] {
  return MOCK_ROUTES.slice()
}

export function getRouteStats(): { cities: number; routes: number; points: number } {
  const cities = new Set(MOCK_ROUTES.map(r => r.city).filter(Boolean))
  const points = MOCK_ROUTES.reduce((n, r) => n + r.points.length, 0)
  return { cities: cities.size, routes: MOCK_ROUTES.length, points }
}

/** 轻量列表：挂载后可覆盖目录页 enrichment（失败静默） */
export async function listRoutesFromSupabase(): Promise<RouteDetail[] | null> {
  if (!supabaseConfigured()) return null
  const select =
    'routes?select=slug,title,author,city,book,summary,plain_explain,why_worth,category,season,points(seq)&order=title.asc'
  const res = await supabaseRest<
    Array<{
      slug: string
      title: string
      author: string | null
      city: string | null
      book: string | null
      summary: string | null
      plain_explain?: string | null
      why_worth?: string | null
      category?: string | null
      season?: string | null
      points?: Array<{ seq: number | null }>
    }>
  >(select)
  if (!res.ok || !Array.isArray(res.data) || !res.data.length) return null
  return res.data.map(row => ({
    slug: row.slug,
    title: row.title,
    author: row.author ?? '',
    city: row.city ?? '',
    book: row.book ?? '',
    summary: row.summary ?? '',
    plainExplain: row.plain_explain ?? undefined,
    whyWorth: row.why_worth ?? undefined,
    category: row.category ?? undefined,
    season: row.season ?? undefined,
    points: (row.points ?? [])
      .slice()
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
      .map(p => ({
        seq: p.seq ?? 0,
        name: '',
        address: '',
        lng: 0,
        lat: 0,
        excerpt: '',
        excerptSource: '',
        excerptConfidence: 'pending' as ExcerptConfidence,
        interpretation: '',
        checkinTask: '',
      })),
  }))
}

export function getRouteDetail(slug: string): RouteDetail | null {
  // 构建期（静态导出）用本地 mock 渲染骨架；客户端挂载后由
  // fetchRouteDetailFromSupabase() 拉后端最新数据覆盖（Supabase 已接入）。
  return MOCK_ROUTES.find(r => r.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Supabase 远端读取（T1/T3：客户端挂载后刷新，失败静默回退 mock）
// ---------------------------------------------------------------------------
import { supabaseRest, supabaseConfigured } from '@/lib/supabase-rest'

interface DbRouteRow {
  id: string
  slug: string
  title: string
  author: string | null
  city: string | null
  book: string | null
  summary: string | null
  plain_explain?: string | null
  why_worth?: string | null
  category?: string | null
  season?: string | null
  duration?: string | null
  difficulty?: string | null
  related_books?: string[] | null
  points: Array<{
    seq: number | null
    name: string
    address: string | null
    lng: number | null
    lat: number | null
    excerpt: string | null
    excerpt_source: string | null
    excerpt_confidence: string
    interpretation: string | null
    checkin_task: string | null
    panorama?: string | null
    panorama_source?: string | null
    photo?: string | null
    illustration?: string | null
    baike_summary?: string | null
    history?: string | null
    cultural_status?: string | null
    cultural_tag?: string | null
    open_info?: string | null
    transport?: string | null
    nearby?: string | null
    best_time?: string | null
    scene_match?: string | null
    pitfall_guide?: string | null
    tips?: string | null
    food_recommend?: string | null
    photo_spots?: string | null
    visit_duration?: string | null
  }>
}

/** 从 Supabase 读取路线详情；未配置/失败/无数据返回 null（调用方回退 mock） */
export async function fetchRouteDetailFromSupabase(slug: string): Promise<RouteDetail | null> {
  if (!supabaseConfigured()) return null
  const v2Select =
    `routes?select=id,slug,title,author,city,book,summary,plain_explain,why_worth,category,season,duration,difficulty,related_books,points(id,seq,name,address,lng,lat,excerpt,excerpt_source,excerpt_confidence,interpretation,checkin_task,panorama,panorama_source,photo,illustration,baike_summary,history,cultural_status,cultural_tag,open_info,transport,nearby,best_time,scene_match,pitfall_guide,tips,food_recommend,photo_spots,visit_duration)&slug=eq.${encodeURIComponent(slug)}&limit=1`
  const enrichedSelect =
    `routes?select=id,slug,title,author,city,book,summary,plain_explain,why_worth,category,season,points(id,seq,name,address,lng,lat,excerpt,excerpt_source,excerpt_confidence,interpretation,checkin_task,panorama,panorama_source,photo,illustration)&slug=eq.${encodeURIComponent(slug)}&limit=1`
  const baseSelect =
    `routes?select=id,slug,title,author,city,book,summary,points(id,seq,name,address,lng,lat,excerpt,excerpt_source,excerpt_confidence,interpretation,checkin_task)&slug=eq.${encodeURIComponent(slug)}&limit=1`

  let res = await supabaseRest<DbRouteRow[]>(v2Select)
  if (!res.ok) res = await supabaseRest<DbRouteRow[]>(enrichedSelect)
  if (!res.ok) res = await supabaseRest<DbRouteRow[]>(baseSelect)
  const row = res.ok && Array.isArray(res.data) ? res.data[0] : undefined
  if (!row || !row.points?.length) return null

  // cards 表已有 photo/illustration：migrate 前也能给文学卡片补图
  const pointIds = row.points.map(p => (p as { id?: string }).id).filter(Boolean) as string[]
  const cardByPoint = new Map<string, { photo?: string; illustration?: string }>()
  if (pointIds.length) {
    const cardsRes = await supabaseRest<
      Array<{ point_id: string; photo: string | null; illustration: string | null }>
    >(`cards?select=point_id,photo,illustration&point_id=in.(${pointIds.join(',')})`)
    if (cardsRes.ok && Array.isArray(cardsRes.data)) {
      for (const c of cardsRes.data) {
        cardByPoint.set(c.point_id, {
          photo: c.photo || undefined,
          illustration: c.illustration || undefined,
        })
      }
    }
  }

  const remote: RouteDetail = {
    slug: row.slug,
    title: row.title,
    author: row.author ?? '',
    city: row.city ?? '',
    book: row.book ?? '',
    summary: row.summary ?? '',
    plainExplain: row.plain_explain ?? undefined,
    whyWorth: row.why_worth ?? undefined,
    category: row.category ?? undefined,
    season: row.season ?? undefined,
    duration: row.duration ?? undefined,
    difficulty: row.difficulty ?? undefined,
    relatedBooks: row.related_books ?? undefined,
    points: row.points
      .slice()
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
      .map(p => {
        const id = (p as { id?: string }).id
        const media = id ? cardByPoint.get(id) : undefined
        return {
          seq: p.seq ?? 0,
          name: p.name,
          address: p.address ?? '',
          lng: p.lng ?? 0,
          lat: p.lat ?? 0,
          excerpt: p.excerpt ?? '',
          excerptSource: p.excerpt_source ?? '',
          excerptConfidence: (['verified', 'derived', 'pending'].includes(p.excerpt_confidence)
            ? p.excerpt_confidence
            : 'pending') as ExcerptConfidence,
          interpretation: p.interpretation ?? '',
          checkinTask: p.checkin_task ?? '',
          panorama: p.panorama ?? undefined,
          panoramaSource: p.panorama_source ?? undefined,
          photo: p.photo || media?.photo || undefined,
          illustration: p.illustration || media?.illustration || undefined,
          baikeSummary: p.baike_summary ?? undefined,
          history: p.history ?? undefined,
          culturalStatus: p.cultural_status ?? undefined,
          culturalTag: p.cultural_tag ?? undefined,
          openInfo: p.open_info ?? undefined,
          transport: p.transport ?? undefined,
          nearby: p.nearby ?? undefined,
          bestTime: p.best_time ?? undefined,
          sceneMatch: p.scene_match ?? undefined,
          pitfallGuide: p.pitfall_guide ?? undefined,
          tips: p.tips ?? undefined,
          foodRecommend: p.food_recommend ?? undefined,
          photoSpots: p.photo_spots ?? undefined,
          visitDuration: p.visit_duration ?? undefined,
        }
      }),
  }

  return mergeRouteGuide(remote, getRouteDetail(slug))
}

/** Haversine 距离（米），用于点位列表距离显示与打卡 GPS 验证 */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(s)))
}

/** 打卡允许半径（米）— 任务书 T4 规定 100 米 */
export const CHECKIN_RADIUS_METERS = 100
