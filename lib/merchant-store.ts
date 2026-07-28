// 商家数据看板 · 数据层（Step2 反馈回路）
// 架构说明：当前站点为 Next.js 静态导出 + nginx，无 Node 运行时，无法运行 Next.js API routes。
// 故本层直接调用 Supabase（与 reviews-store 同一模式）：聚合走 merchant_stats RPC（真·后端聚合），
// 密码校验用 bcryptjs 在浏览器比对 merchant_auth 中的哈希（明文密码不离开浏览器）。
// 所有读取均按 pointId 过滤，商家只能看到自己点位数据。

import bcrypt from 'bcryptjs'
import { supabaseRest, supabaseConfigured } from '@/lib/supabase-rest'

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------
export interface MerchantStats {
  weekCheckins: number
  totalCheckins: number
  avgRating: number
}

export interface MerchantReview {
  id: string
  rating: number
  text: string | null
  photoUrl: string | null
  createdAt: string
}

export interface MerchantSession {
  pointId: string
  seq: number
}

export interface HighFreqWord {
  word: string
  count: number
}

// ---------------------------------------------------------------------------
// 点位解析：seq → point(uuid)
// ---------------------------------------------------------------------------
export async function resolvePointBySeq(
  routeSlug: string,
  seq: number
): Promise<{ id: string; name: string } | null> {
  const rres = await supabaseRest<{ id: string }[]>(
    `routes?select=id&slug=eq.${encodeURIComponent(routeSlug)}&limit=1`
  )
  const routeId = rres.ok && Array.isArray(rres.data) ? rres.data[0]?.id : undefined
  if (!routeId) return null
  const pres = await supabaseRest<{ id: string; name: string }[]>(
    `points?select=id,name&route_id=eq.${routeId}&seq=eq.${seq}&limit=1`
  )
  const p = pres.ok && Array.isArray(pres.data) ? pres.data[0] : undefined
  return p ?? null
}

// ---------------------------------------------------------------------------
// 密码校验：取 merchant_auth 哈希，浏览器 bcrypt 比对
// ---------------------------------------------------------------------------
export async function verifyMerchantPassword(
  pointId: string,
  password: string
): Promise<boolean> {
  const res = await supabaseRest<{ password_hash: string }[]>(
    `merchant_auth?select=password_hash&point_id=eq.${pointId}&limit=1`
  )
  if (!res.ok || !Array.isArray(res.data) || !res.data[0]?.password_hash) return false
  try {
    return await bcrypt.compare(password, res.data[0].password_hash)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// 该点位是否开通商家看板（有 merchant_auth 记录）
// ---------------------------------------------------------------------------
export async function merchantAuthExists(pointId: string): Promise<boolean> {
  const res = await supabaseRest<{ point_id: string }[]>(
    `merchant_auth?select=point_id&point_id=eq.${pointId}&limit=1`
  )
  return res.ok && Array.isArray(res.data) && res.data.length > 0
}

// ---------------------------------------------------------------------------
// 看板数据：3 个数字（后端 RPC 聚合）
// ---------------------------------------------------------------------------
export async function fetchMerchantStats(pointId: string): Promise<MerchantStats | null> {
  if (!supabaseConfigured()) return null
  const res = await supabaseRest<MerchantStats>('rpc/merchant_stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: { p_point_id: pointId },
  })
  if (!res.ok || !res.data) return null
  return {
    weekCheckins: Number((res.data as MerchantStats).weekCheckins ?? 0),
    totalCheckins: Number((res.data as MerchantStats).totalCheckins ?? 0),
    avgRating: Number((res.data as MerchantStats).avgRating ?? 0),
  }
}

// ---------------------------------------------------------------------------
// 评价列表：该点位最新 limit 条
// ---------------------------------------------------------------------------
interface ReviewRow {
  id: string
  rating: number
  text: string | null
  photo_url: string | null
  created_at: string
}

export async function fetchMerchantReviews(
  pointId: string,
  limit = 5
): Promise<MerchantReview[]> {
  const res = await supabaseRest<ReviewRow[]>(
    `reviews?select=id,rating,text,photo_url,created_at&point_id=eq.${pointId}&order=created_at.desc&limit=${limit}`
  )
  if (!res.ok || !Array.isArray(res.data)) return []
  return res.data.map(r => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    photoUrl: r.photo_url,
    createdAt: r.created_at,
  }))
}

// ---------------------------------------------------------------------------
// 高频词原料：该点位全部评价文本
// ---------------------------------------------------------------------------
export async function fetchAllReviewTexts(pointId: string): Promise<string[]> {
  const res = await supabaseRest<{ text: string | null }[]>(
    `reviews?select=text&point_id=eq.${pointId}`
  )
  if (!res.ok || !Array.isArray(res.data)) return []
  return res.data.map(r => r.text).filter((t): t is string => Boolean(t))
}

// ---------------------------------------------------------------------------
// 商家回复：写入 merchant_replies（前端已 gate：仅本点位已认证商家可提交）
// ---------------------------------------------------------------------------
export async function submitMerchantReply(
  reviewId: string,
  pointId: string,
  text: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!text || text.trim().length === 0) return { ok: false, reason: 'EMPTY' }
  if (text.length > 100) return { ok: false, reason: 'TOO_LONG' }
  const res = await supabaseRest('merchant_replies', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: { review_id: reviewId, point_id: pointId, text: text.trim() },
  })
  if (res.ok) return { ok: true }
  return { ok: false, reason: `SUPABASE_${res.status}` }
}

// ---------------------------------------------------------------------------
// 取某批评评的商家回复（用于路线详情页同步展示）
// ---------------------------------------------------------------------------
export async function fetchRepliesForReviews(
  reviewIds: string[]
): Promise<Record<string, string>> {
  if (!reviewIds.length) return {}
  const or = reviewIds.map(id => `review_id.eq.${id}`).join(',')
  const res = await supabaseRest<{ review_id: string; text: string }[]>(
    `merchant_replies?select=review_id,text&or=(${or})`
  )
  if (!res.ok || !Array.isArray(res.data)) return {}
  return Object.fromEntries(res.data.map(r => [r.review_id, r.text]))
}

// ---------------------------------------------------------------------------
// 商家会话（sessionStorage，关页面失效 —— 板拍决策 #2）
// ---------------------------------------------------------------------------
const SESSION_KEY = 'xunji.merchant.session'

export function getMerchantSession(): MerchantSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    return s && s.pointId ? s : null
  } catch {
    return null
  }
}

export function setMerchantSession(pointId: string, seq: number): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ pointId, seq }))
  } catch {
    /* 忽略 */
  }
}

export function clearMerchantSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* 忽略 */
  }
}

// ---------------------------------------------------------------------------
// 高频词：前端 2-4 字中文分词（板拍决策 #3：不上 NLP）
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  '的', '了', '是', '在', '我', '你', '他', '她', '它', '和', '与', '也', '都', '就', '很',
  '个', '家', '吃', '点', '茶', '这', '那', '有', '到', '去', '说', '会', '能', '要', '上',
  '下', '不', '人', '一', '们', '啊', '吧', '吗', '呢', '把', '被', '给', '让', '又', '再',
  '还', '最', '多', '好', '小', '大', '儿', '子', '里', '中', '后', '前', '对', '从', '向',
  '以', '及', '等', '之', '其', '为', '于', '而', '但', '却', '因', '所', '如', '没', '着',
  '过', '得', '地', '么', '些', '己', '自', '已', '可', '真', '太', '还', '算', '觉', '想',
])

function isCJK(c: string): boolean {
  return /[一-鿿]/.test(c)
}

export function computeHighFreqWords(texts: string[]): HighFreqWord[] {
  const cnt = new Map<string, number>()
  for (const t of texts) {
    if (!t) continue
    const s = t.trim()
    for (let i = 0; i < s.length; i++) {
      if (!isCJK(s[i])) continue
      for (let n = 2; n <= 4; n++) {
        if (i + n > s.length) break
        const w = s.slice(i, i + n)
        if (!w.split('').every(isCJK)) continue
        if (STOPWORDS.has(w)) continue
        cnt.set(w, (cnt.get(w) ?? 0) + 1)
      }
    }
  }
  return Array.from(cnt.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
