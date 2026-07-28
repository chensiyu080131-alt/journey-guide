// 反馈回路 Step1 · 评价数据层
// 死规矩（同 checkin-store）：评价必须落后端，不只在本地。
// 设计：「待同步队列」——优先写 Supabase reviews 表；Supabase 未配置 / 网络失败 / 表未建
// 时降级落 localStorage（synced=false），联网且后端就绪后由 syncPendingReviews() 补传。
// 匿名身份复用 lib/supabase-auth（同一浏览器=同一匿名用户）。

import { supabaseRest, supabaseConfigured } from '@/lib/supabase-rest'
import { ensureAnonSession } from '@/lib/supabase-auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------
export interface Review {
  id: string
  routeId: string
  pointId: string
  userId: string
  rating: number
  text: string | null
  photoUrl: string | null
  createdAt: string
  // 展示用嵌入字段（时间线 / 点位卡片）
  routeSlug?: string
  routeTitle?: string
  city?: string
  pointName?: string
}

export interface PointReviews {
  avg: number | null
  count: number
  items: Review[]
}

export interface SubmitResult {
  ok: boolean
  id?: string
  /** true=仅存本地（后端不可用），待 syncPendingReviews 补传 */
  local?: boolean
  reason?: string
}

// ---------------------------------------------------------------------------
// 本地兜底队列（Supabase 不可用时的演示态）
// ---------------------------------------------------------------------------
interface LocalReview {
  id: string
  routeSlug: string
  pointSeq: number
  rating: number
  text: string | null
  photoUrl: string | null
  createdAt: string
  synced: boolean
}

const LOCAL_KEY = 'xunji.reviews.v1'

function readLocal(): LocalReview[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeLocal(list: LocalReview[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    /* 静默 */
  }
}

function saveReviewLocal(input: {
  routeSlug: string
  pointSeq: number
  rating: number
  text?: string | null
  photoUrl?: string | null
}): LocalReview {
  const rec: LocalReview = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    routeSlug: input.routeSlug,
    pointSeq: input.pointSeq,
    rating: input.rating,
    text: input.text ?? null,
    photoUrl: input.photoUrl ?? null,
    createdAt: new Date().toISOString(),
    synced: false,
  }
  const all = readLocal()
  all.push(rec)
  writeLocal(all)
  return rec
}

// ---------------------------------------------------------------------------
// 路由 / 点位 UUID 解析（slug + seq → route_id / point_id）
// ---------------------------------------------------------------------------
interface RouteIdRow {
  id: string
  slug: string
  points: Array<{ id: string; seq: number | null }>
}

async function resolveRoutePoint(
  slug: string,
  seq: number
): Promise<{ routeId: string; pointId: string } | null> {
  const res = await supabaseRest<RouteIdRow[]>(
    `routes?select=id,slug,points(id,seq)&slug=eq.${encodeURIComponent(slug)}&limit=1`
  )
  const row = res.ok && Array.isArray(res.data) ? res.data[0] : undefined
  if (!row) return null
  const p = row.points?.find(p => p.seq === seq)
  if (!p) return null
  return { routeId: row.id, pointId: p.id }
}

// ---------------------------------------------------------------------------
// 照片上传（Supabase Storage · review-photos 公共桶）
// ---------------------------------------------------------------------------
export async function uploadReviewPhoto(
  file: File,
  userId: string,
  accessToken: string
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/review-photos/${path}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true',
      },
      body: file,
    })
    if (!res.ok) return null
    return `${SUPABASE_URL}/storage/v1/object/public/review-photos/${path}`
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// 提交评价
// ---------------------------------------------------------------------------
export async function submitReview(
  input: { routeSlug: string; pointSeq: number; rating: number; text?: string | null },
  photoFile?: File
): Promise<SubmitResult> {
  // 后端不可用 → 本地兜底（演示态）
  if (!supabaseConfigured()) {
    const local = saveReviewLocal(input)
    return { ok: true, id: local.id, local: true, reason: 'SUPABASE_NOT_CONFIGURED' }
  }

  const ids = await resolveRoutePoint(input.routeSlug, input.pointSeq)
  if (!ids) {
    const local = saveReviewLocal(input)
    return { ok: true, id: local.id, local: true, reason: 'RESOLVE_FAILED' }
  }

  const session = await ensureAnonSession()
  if (!session) {
    const local = saveReviewLocal(input)
    return { ok: true, id: local.id, local: true, reason: 'ANON_UNAVAILABLE' }
  }

  // 有照片先传（失败则无图提交，不阻断评价）
  let photoUrl: string | null = null
  if (photoFile) {
    photoUrl = await uploadReviewPhoto(photoFile, session.userId, session.accessToken)
  }

  const res = await supabaseRest('reviews', {
    method: 'POST',
    accessToken: session.accessToken,
    headers: { Prefer: 'return=representation' },
    body: {
      user_id: session.userId,
      route_id: ids.routeId,
      point_id: ids.pointId,
      rating: input.rating,
      text: input.text || null,
      photo_url: photoUrl,
    },
  })

  if (res.ok && Array.isArray(res.data) && res.data[0]?.id) {
    return { ok: true, id: (res.data[0] as { id: string }).id }
  }
  // 后端写失败 → 本地兜底
  const local = saveReviewLocal(input)
  return { ok: true, id: local.id, local: true, reason: `SUPABASE_${res.status}` }
}

// ---------------------------------------------------------------------------
// 读取：某点位评价（avg + 最新若干条）
// ---------------------------------------------------------------------------
interface ReviewRow {
  id: string
  user_id: string
  rating: number
  text: string | null
  photo_url: string | null
  created_at: string
}

export async function fetchReviewsForPoint(
  routeSlug: string,
  pointSeq: number,
  limit = 3
): Promise<PointReviews> {
  if (!supabaseConfigured()) {
    const local = readLocal().filter(r => r.routeSlug === routeSlug && r.pointSeq === pointSeq)
    return aggregate(local, limit)
  }
  const ids = await resolveRoutePoint(routeSlug, pointSeq)
  if (!ids) return { avg: null, count: 0, items: [] }
  const res = await supabaseRest<ReviewRow[]>(
    `reviews?select=id,user_id,rating,text,photo_url,created_at&point_id=eq.${ids.pointId}&order=created_at.desc&limit=${limit}`
  )
  if (!res.ok || !Array.isArray(res.data)) {
    // 后端异常 → 退本地
    const local = readLocal().filter(r => r.routeSlug === routeSlug && r.pointSeq === pointSeq)
    return aggregate(local, limit)
  }
  return aggregate(
    res.data.map(r => ({
      id: r.id,
      routeSlug,
      pointSeq,
      rating: r.rating,
      text: r.text,
      photoUrl: r.photo_url,
      createdAt: r.created_at,
      synced: true,
    })),
    limit
  )
}

function aggregate(rows: Array<LocalReview & { routeId?: string; pointId?: string }>, limit: number): PointReviews {
  const items: Review[] = rows
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map(r => ({
      id: r.id,
      routeId: r.routeId ?? '',
      pointId: r.pointId ?? '',
      userId: '',
      rating: r.rating,
      text: r.text,
      photoUrl: r.photoUrl,
      createdAt: r.createdAt,
    }))
  const count = rows.length
  const avg = count ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null
  return { avg, count, items }
}

// ---------------------------------------------------------------------------
// 读取：全站评价时间线（/reviews），嵌入 route/city/point 名，支持筛选
// ---------------------------------------------------------------------------
interface EmbeddedReviewRow {
  id: string
  user_id: string
  rating: number
  text: string | null
  photo_url: string | null
  created_at: string
  point: { name: string; route: { slug: string; title: string; city: string } } | null
}

interface ReviewFilter {
  routeSlug?: string
  city?: string
}

export async function fetchAllReviews(filter?: ReviewFilter): Promise<Review[]> {
  if (!supabaseConfigured()) {
    return readLocal()
      .map(r => ({ ...r, routeSlug: r.routeSlug, pointName: `#${r.pointSeq}` }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(r => ({
        id: r.id,
        routeId: '',
        pointId: '',
        userId: '',
        rating: r.rating,
        text: r.text,
        photoUrl: r.photoUrl,
        createdAt: r.createdAt,
        routeSlug: r.routeSlug,
        routeTitle: r.routeSlug,
        city: '',
        pointName: r.pointName,
      }))
  }
  const res = await supabaseRest<EmbeddedReviewRow[]>(
    'reviews?select=id,user_id,rating,text,photo_url,created_at,point:points(name,route:routes(slug,title,city))&order=created_at.desc&limit=200'
  )
  if (!res.ok || !Array.isArray(res.data)) {
    return readLocal().map(r => ({
      id: r.id, routeId: '', pointId: '', userId: '', rating: r.rating,
      text: r.text, photoUrl: r.photoUrl, createdAt: r.createdAt,
      routeSlug: r.routeSlug, routeTitle: r.routeSlug, city: '', pointName: `#${r.pointSeq}`,
    }))
  }
  let rows: Review[] = res.data.map(r => ({
    id: r.id,
    routeId: '',
    pointId: '',
    userId: r.user_id,
    rating: r.rating,
    text: r.text,
    photoUrl: r.photo_url,
    createdAt: r.created_at,
    routeSlug: r.point?.route?.slug,
    routeTitle: r.point?.route?.title,
    city: r.point?.route?.city,
    pointName: r.point?.name,
  }))
  if (filter?.routeSlug) rows = rows.filter(r => r.routeSlug === filter.routeSlug)
  if (filter?.city) rows = rows.filter(r => r.city === filter.city)
  return rows
}

// ---------------------------------------------------------------------------
// 补偿同步：本地待同步评价 → 后端（页面加载时调用一次）
// ---------------------------------------------------------------------------
export async function syncPendingReviews(): Promise<{ ok: boolean; synced: number }> {
  const pending = readLocal().filter(r => !r.synced)
  if (!pending.length) return { ok: true, synced: 0 }
  if (!supabaseConfigured()) return { ok: false, synced: 0 }

  let syncedCount = 0
  for (const rec of pending) {
    const ids = await resolveRoutePoint(rec.routeSlug, rec.pointSeq)
    if (!ids) continue
    const session = await ensureAnonSession()
    if (!session) break
    const res = await supabaseRest('reviews', {
      method: 'POST',
      accessToken: session.accessToken,
      headers: { Prefer: 'return=minimal' },
      body: {
        user_id: session.userId,
        route_id: ids.routeId,
        point_id: ids.pointId,
        rating: rec.rating,
        text: rec.text,
        photo_url: rec.photoUrl,
      },
    })
    if (res.ok) {
      rec.synced = true
      syncedCount++
    } else if (res.status === 409) {
      rec.synced = true
    }
  }
  if (syncedCount > 0 || pending.some(r => r.synced)) writeLocal(readLocal())
  return { ok: syncedCount > 0 || pending.every(r => r.synced), synced: syncedCount }
}
