// T4 打卡记录存储层
// 死规矩：打卡记录必须存后端，不能只存 localStorage。
// 设计：「待同步队列」——记录先落 localStorage（synced=false），随后立即调用
// syncPendingToSupabase() 写入 checkins 表并置 synced=true；断网/失败时队列保留，
// 页面加载时补偿重试。Supabase 凭证已于 2026-07-27 接入（.env.local）。

export interface CheckinRecord {
  routeSlug: string
  pointSeq: number
  pointName: string
  checkedAt: string // ISO
  lat: number
  lng: number
  distanceM: number
  synced: boolean // 是否已写入 Supabase checkins 表
}

const STORAGE_KEY = 'xunji.checkins.v1'

function readAll(): CheckinRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as CheckinRecord[]) : []
  } catch {
    return []
  }
}

function writeAll(records: CheckinRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // 存储满/隐私模式：静默失败，内存态仍可用
  }
}

/** 读取某条路线的打卡记录 */
export function loadCheckins(routeSlug: string): CheckinRecord[] {
  return readAll().filter(r => r.routeSlug === routeSlug)
}

/** 追加一条打卡记录（同点位重复打卡以首次为准） */
export function saveCheckin(record: Omit<CheckinRecord, 'synced'>): CheckinRecord {
  const all = readAll()
  const exists = all.find(
    r => r.routeSlug === record.routeSlug && r.pointSeq === record.pointSeq
  )
  if (exists) return exists
  const full: CheckinRecord = { ...record, synced: false }
  all.push(full)
  writeAll(all)
  return full
}

/** 待同步到后端的记录数（全部路线） */
export function pendingSyncCount(): number {
  return readAll().filter(r => !r.synced).length
}

// ---------------------------------------------------------------------------
// Supabase 真同步（2026-07-27 凭证到位后接通）
// 流程：确保匿名会话 → 查路线/点位 UUID 映射 → 逐条 INSERT checkins → 置 synced=true
// 触发时机：打卡成功后立即调用 + 页面加载时补偿重试（route-detail-view 已接）。
// ---------------------------------------------------------------------------
import { supabaseRest, supabaseConfigured } from '@/lib/supabase-rest'
import { ensureAnonSession } from '@/lib/supabase-auth'

interface RouteIdRow {
  id: string
  slug: string
  points: Array<{ id: string; seq: number | null }>
}

/** 把本地待同步打卡批量写入 Supabase checkins 表 */
export async function syncPendingToSupabase(): Promise<{ ok: boolean; synced: number; reason?: string }> {
  if (!supabaseConfigured()) {
    return { ok: false, synced: 0, reason: 'SUPABASE_NOT_CONFIGURED' }
  }
  const all = readAll()
  const pending = all.filter(r => !r.synced)
  if (!pending.length) return { ok: true, synced: 0 }

  const session = await ensureAnonSession()
  if (!session) {
    // 常见原因：控制台未开启 Anonymous sign-ins（见 BLOCKED.md）
    return { ok: false, synced: 0, reason: 'ANON_SIGNIN_UNAVAILABLE' }
  }

  // slug -> {routeId, seq->pointId}
  const slugs = Array.from(new Set(pending.map(r => r.routeSlug)))
  const idMap = new Map<string, { routeId: string; bySeq: Map<number, string> }>()
  for (const slug of slugs) {
    const res = await supabaseRest<RouteIdRow[]>(
      `routes?select=id,slug,points(id,seq)&slug=eq.${encodeURIComponent(slug)}&limit=1`
    )
    const row = res.ok && Array.isArray(res.data) ? res.data[0] : undefined
    if (row) {
      idMap.set(slug, {
        routeId: row.id,
        bySeq: new Map(row.points.map(p => [p.seq ?? 0, p.id])),
      })
    }
  }

  let syncedCount = 0
  for (const rec of pending) {
    const ids = idMap.get(rec.routeSlug)
    const pointId = ids?.bySeq.get(rec.pointSeq)
    if (!ids || !pointId) continue // 后端还没这条路线/点位，留在队列下次再试
    const res = await supabaseRest('checkins', {
      method: 'POST',
      accessToken: session.accessToken,
      headers: { Prefer: 'return=minimal' },
      body: {
        user_id: session.userId,
        route_id: ids.routeId,
        point_id: pointId,
        lng: rec.lng,
        lat: rec.lat,
        distance_m: rec.distanceM,
        source: 'human',
      },
    })
    if (res.ok) {
      rec.synced = true
      syncedCount++
    } else if (res.status === 409) {
      rec.synced = true // 已存在（重复同步），视为成功
    }
  }
  if (syncedCount > 0 || pending.some(r => r.synced)) writeAll(all)
  return { ok: syncedCount > 0 || pending.every(r => r.synced), synced: syncedCount }
}
