/**
 * 打卡核心逻辑（任务4 核心）
 *
 * 任务4 死规矩：打卡记录必须存后端，不能只存 localStorage。
 * 所以本模块优先写 Supabase checkins 表；仅在未登录或无 Supabase 时，
 * 才临时落 localStorage（并明确提示用户登录后同步）。
 *
 * GPS 验证：navigator.geolocation 取用户位置，与点位经纬度算距离，
 * ≤100 米才允许打卡。距离算法用 Haversine 公式（球面），可被单元测试覆盖。
 */

export const CHECKIN_RADIUS_M = 100 // 任务4 要求：100 米范围内才能打卡

/**
 * Haversine 距离（米）。纯函数，供单元测试覆盖（任务4 反向验证）。
 */
export function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000 // 地球平均半径（米）
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface CheckinResult {
  ok: boolean
  distanceM?: number
  reason?: string
  /** 是否已存在打卡记录（幂等） */
  alreadyCheckedIn?: boolean
  /** 数据落到哪里（任务4 死规矩：success 时优先 backend） */
  storedAt?: 'backend' | 'local' | 'none'
}

/**
 * 取当前 GPS 位置（Promise 封装）。
 * 桌面浏览器无 GPS 时会失败；mobile/Chrome DevTools Sensors 可伪造。
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('当前设备不支持定位（navigator.geolocation 不可用）'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error(gpsErrorMessage(err))),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

function gpsErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case 1: return '定位权限被拒绝，请在浏览器设置允许定位'
    case 2: return '暂时获取不到位置（桌面无 GPS 时常见，可用 Chrome DevTools Sensors 伪造坐标）'
    case 3: return '定位超时，请重试'
    default: return err.message || '定位失败'
  }
}

/**
 * 执行打卡（任务4 主入口）。
 *
 * @param pointId 点位 id
 * @param routeId 路线 id
 * @param pointLat/lng 点位经纬度（用于距离判定）
 * @param user 当前登录用户（无则降级 localStorage）
 */
export async function doCheckin(opts: {
  pointId: string
  routeId: string
  pointLat: number
  pointLng: number
  userId?: string | null
}): Promise<CheckinResult> {
  const { pointId, routeId, pointLat, pointLng, userId } = opts

  // 1) 取 GPS
  let pos: { lat: number; lng: number }
  try {
    pos = await getCurrentPosition()
  } catch (e) {
    return { ok: false, reason: (e as Error).message, storedAt: 'none' }
  }

  // 2) 算距离
  const distanceM = haversineMeters(pos.lat, pos.lng, pointLat, pointLng)

  // 3) ★ 任务4 反向验证核心：>100 米拒绝
  if (distanceM > CHECKIN_RADIUS_M) {
    return {
      ok: false,
      distanceM: Math.round(distanceM),
      reason: `距离点位 ${Math.round(distanceM)} 米，超出 ${CHECKIN_RADIUS_M} 米范围，无法打卡`,
      storedAt: 'none',
    }
  }

  // 4) 距离达标，写记录（优先后端）
  const storedAt = await storeCheckin({
    userId: userId || null,
    pointId, routeId,
    checkinLat: pos.lat, checkinLng: pos.lng,
    distanceM: Math.round(distanceM),
  })

  return {
    ok: true,
    distanceM: Math.round(distanceM),
    storedAt,
  }
}

/** 写打卡记录：优先 Supabase（任务4 死规矩），降级 localStorage */
async function storeCheckin(opts: {
  userId: string | null
  pointId: string
  routeId: string
  checkinLat: number
  checkinLng: number
  distanceM: number
}): Promise<'backend' | 'local' | 'none'> {
  const { userId, pointId, routeId, checkinLat, checkinLng, distanceM } = opts

  // 优先 Supabase（动态 import 避免未配密钥时报错）
  if (userId) {
    try {
      const { getSupabase } = await import('./supabase-client')
      const sb = getSupabase()
      if (sb) {
        const { error } = await sb.from('checkins').insert({
          user_id: userId,
          point_id: pointId,
          route_id: routeId,
          checkin_lat: checkinLat,
          checkin_lng: checkinLng,
          distance_m: distanceM,
          client_time: new Date().toISOString(),
        })
        if (!error) return 'backend'
        // 唯一约束冲突 = 已打卡过，视为幂等成功
        if (error.code === '23505') return 'backend'
      }
    } catch {
      // 落到 local 兜底
    }
  }

  // 降级 localStorage（仅缓存，明确不是最终存储）
  if (typeof window !== 'undefined') {
    try {
      const key = `xunji:checkins:${userId || 'anon'}`
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      if (!arr.find((c: { pointId: string }) => c.pointId === pointId)) {
        arr.push({ pointId, routeId, distanceM, ts: Date.now() })
        localStorage.setItem(key, JSON.stringify(arr))
      }
      return 'local'
    } catch {
      return 'none'
    }
  }
  return 'none'
}

/** 读取某用户在某路线的已打卡点位 id 集合 */
export async function getCheckedInPointIds(userId: string | null, routeId: string): Promise<Set<string>> {
  const set = new Set<string>()

  // Supabase
  if (userId) {
    try {
      const { getSupabase } = await import('./supabase-client')
      const sb = getSupabase()
      if (sb) {
        const { data } = await sb
          .from('checkins')
          .select('point_id')
          .eq('user_id', userId)
          .eq('route_id', routeId)
        ;(data || []).forEach((r: { point_id: string }) => set.add(r.point_id))
      }
    } catch {
      // ignore
    }
  }

  // localStorage 兜底合并
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`xunji:checkins:${userId || 'anon'}`)
      if (raw) {
        const arr = JSON.parse(raw) as { pointId: string; routeId: string }[]
        arr.filter(c => c.routeId === routeId).forEach(c => set.add(c.pointId))
      }
    } catch {
      // ignore
    }
  }

  return set
}
