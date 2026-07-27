/**
 * Supabase 浏览器客户端封装
 *
 * 设计说明（重要）：
 * - 本项目是 Next.js `output: 'export'` 静态导出，不能跑服务端 API 路由，
 *   所以 Supabase 必须从浏览器直连，anon key 会暴露在前端 bundle 里。
 * - 安全靠 RLS 兜底：anon 只能读已发布数据，写打卡记录必须登录。
 *   （见 supabase/schema.sql 的 RLS 策略）
 * - service_role key 绝不可出现在本文件或任何前端代码 —— 它只在本地脚本
 *   scripts/supabase-seed-and-verify.mjs 中通过环境变量读取。
 *
 * 环境变量（写到 .env.local，Vercel 同名）：
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（anon public，可暴露）
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/** 是否已配置 Supabase（未配置时降级到本地 mock 数据，不阻断渲染） */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** 单例客户端（未配置时为 null，调用方需先判 hasSupabase） */
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _client
}

// ──────────────────────────────────────────────────────────────
//  数据类型（与 supabase/schema.sql 对齐，供任务3/4 使用）
// ──────────────────────────────────────────────────────────────

export interface RouteRow {
  id: string
  title: string
  subtitle: string | null
  city: string
  province: string
  author: string | null
  book: string | null
  days: number
  intro: string | null
  cover_emoji: string | null
  tags: string[] | null
  source: 'manual' | 'ai'
  is_published: boolean
  created_at: string
}

export interface PointRow {
  id: string
  route_id: string
  seq: number
  name: string
  desc: string | null
  type: '景点' | '美食' | '体验'
  lat: number
  lng: number
  address: string | null
  original_text: string | null     // ★ 汪曾祺原文摘录
  original_source: string | null   // ★ 出处
  modern_note: string | null       // ★ 现代解读
  checkin_task: string | null      // ★ 打卡任务
  emoji: string | null
  duration: string | null
  budget_hint: string | null
  flavor: string | null
}

export interface CardRow {
  id: string
  point_id: string
  route_id: string
  title: string
  quote: string
  quote_source: string
  illustration_emoji: string | null
  photo_hint: string | null
}

export interface CheckinRow {
  id: number
  user_id: string
  point_id: string
  route_id: string
  checkin_lat: number | null
  checkin_lng: number | null
  distance_m: number | null
  created_at: string
}

// ──────────────────────────────────────────────────────────────
//  查询封装（任务3 路线详情页、任务4 打卡用）
// ──────────────────────────────────────────────────────────────

/** 取一条路线 + 其下所有点位（按 seq 排序） */
export async function fetchRouteWithPoints(routeId: string) {
  const sb = getSupabase()
  if (!sb) return null

  const { data: route, error: e1 } = await sb
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .eq('is_published', true)
    .maybeSingle()

  if (e1 || !route) return null

  const { data: points, error: e2 } = await sb
    .from('points')
    .select('*')
    .eq('route_id', routeId)
    .order('seq', { ascending: true })

  if (e2) return { route: route as RouteRow, points: [] }

  return { route: route as RouteRow, points: (points || []) as PointRow[] }
}

/** 取当前用户在某条路线的所有打卡记录 */
export async function fetchMyCheckins(routeId: string) {
  const sb = getSupabase()
  if (!sb) return []
  const { data } = await sb
    .from('checkins')
    .select('*')
    .eq('route_id', routeId)
  return (data || []) as CheckinRow[]
}

/** 取一条路线下所有卡片（用于"集齐卡片生成分享图"） */
export async function fetchCardsByRoute(routeId: string) {
  const sb = getSupabase()
  if (!sb) return []
  const { data } = await sb
    .from('cards')
    .select('*')
    .eq('route_id', routeId)
  return (data || []) as CardRow[]
}
