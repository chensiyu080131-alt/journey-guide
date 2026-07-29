// 路线详情数据层 — T3 骨架阶段用本地 mock（JSON），T1 拿到 Supabase 凭证后切换为远端读取
// 切换方式：实现 fetchRouteFromSupabase 并把 getRouteDetail 内部分支打开，页面代码无需改动

import rawYangzhou from '@/public/xunji-mvp/db/yangzhou-wangzengqi-zaocha.json'
import rawSuzhouHanshan from '@/public/xunji-mvp/db/suzhou-hanshansi-fengqiao.json'
import rawSuzhouZhuozheng from '@/public/xunji-mvp/db/suzhou-zhuozhengyuan-wenzhengming.json'
import rawHangzhouSudi from '@/public/xunji-mvp/db/hangzhou-sudi-sushi.json'
import rawHangzhouBaidi from '@/public/xunji-mvp/db/hangzhou-baidi-baijiuyi.json'
import rawNanjingQinhuai from '@/public/xunji-mvp/db/nanjing-qinhuaihe-zhuziqing.json'
import rawNanjingFuzimiao from '@/public/xunji-mvp/db/nanjing-fuzimiao-shishuoxinyu.json'

export type ExcerptConfidence = 'verified' | 'derived' | 'pending'

export interface RoutePoint {
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
}

export interface RouteDetail {
  slug: string
  title: string
  author: string
  city: string
  book: string
  summary: string
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
  }>
}

function normalize(raw: RawRouteFile): RouteDetail {
  return {
    slug: raw.route.slug,
    title: raw.route.title,
    author: raw.route.author,
    city: raw.route.city,
    book: raw.route.book,
    summary: raw.route.summary,
    points: raw.points
      .slice()
      .sort((a, b) => a.seq - b.seq)
      .map(p => ({
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
      })),
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
]

export function getAllRouteSlugs(): string[] {
  return MOCK_ROUTES.map(r => r.slug)
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
  }>
}

/** 从 Supabase 读取路线详情；未配置/失败/无数据返回 null（调用方回退 mock） */
export async function fetchRouteDetailFromSupabase(slug: string): Promise<RouteDetail | null> {
  if (!supabaseConfigured()) return null
  const res = await supabaseRest<DbRouteRow[]>(
    `routes?select=id,slug,title,author,city,book,summary,points(seq,name,address,lng,lat,excerpt,excerpt_source,excerpt_confidence,interpretation,checkin_task)&slug=eq.${encodeURIComponent(slug)}&limit=1`
  )
  const row = res.ok && Array.isArray(res.data) ? res.data[0] : undefined
  if (!row || !row.points?.length) return null
  return {
    slug: row.slug,
    title: row.title,
    author: row.author ?? '',
    city: row.city ?? '',
    book: row.book ?? '',
    summary: row.summary ?? '',
    points: row.points
      .slice()
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
      .map(p => ({
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
      })),
  }
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
