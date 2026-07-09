/**
 * 高德路径规划 — 逐段沿道路规划，合并为完整折线
 * @see https://lbs.amap.com/api/javascript-api-v2/guide/services/navigation
 */

import { loadAmapScript, ensureAmapSecurityConfig } from './amap-loader'

export type RouteMode = 'walking' | 'driving' | 'riding' | 'auto'
export type DrivingPolicy = 'fastest' | 'least_fee' | 'shortest'

export interface RouteStepSummary {
  instruction: string
  road?: string
  distance: number
  time: number
  action?: string
}

export interface RouteSummary {
  distance: number
  time: number
  steps: RouteStepSummary[]
  tolls?: number
}

export interface NavigationRouteResult {
  path: AMap.LngLatLike[]
  mode: 'walking' | 'driving' | 'riding'
  summary?: RouteSummary
  warning?: string
}

type LngLatPoint = { lng: number; lat: number }

const DRIVING_POLICY: Record<DrivingPolicy, number> = {
  fastest: 0,
  least_fee: 1,
  shortest: 2,
}

const SEGMENT_DRIVING_KM = 4

/** 加载路径规划插件 */
export function loadAmapRoutePlugins(): Promise<void> {
  ensureAmapSecurityConfig()
  return loadAmapScript().then(
    () =>
      new Promise((resolve, reject) => {
        if (!window.AMap?.plugin) {
          reject(new Error('高德 plugin 不可用'))
          return
        }
        window.AMap.plugin(['AMap.Walking', 'AMap.Driving', 'AMap.Riding'], () => resolve())
      })
  )
}

function haversineKm(a: LngLatPoint, b: LngLatPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function toSearchPoint(p: LngLatPoint): AMap.LngLatLike {
  return [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))]
}

function toPathPair(p: unknown): AMap.LngLatLike | null {
  if (Array.isArray(p) && p.length >= 2) {
    const lng = Number(p[0])
    const lat = Number(p[1])
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat]
    return null
  }
  if (!p || typeof p !== 'object') return null

  const pt = p as {
    lng?: number
    lat?: number
    Q?: number
    R?: number
    getLng?: () => number
    getLat?: () => number
    toArray?: () => number[]
  }

  if (typeof pt.toArray === 'function') {
    const arr = pt.toArray()
    if (arr.length >= 2) return [Number(arr[0]), Number(arr[1])]
  }

  const lng = pt.lng ?? pt.Q ?? pt.getLng?.()
  const lat = pt.lat ?? pt.R ?? pt.getLat?.()
  if (lng != null && lat != null && Number.isFinite(lng) && Number.isFinite(lat)) {
    return [lng, lat]
  }
  return null
}

function decodePolylineString(encoded: string): AMap.LngLatLike[] {
  const util = (window.AMap as unknown as {
    GeometryUtil?: { decodePolyline?: (s: string) => unknown[] }
  })?.GeometryUtil

  if (!util?.decodePolyline) return []

  try {
    return util
      .decodePolyline(encoded)
      .map(toPathPair)
      .filter((p): p is AMap.LngLatLike => p != null)
  } catch {
    return []
  }
}

/** 从单条 route 对象提取沿道路的折线坐标（兼容 path / polyline 多种返回格式） */
function extractPathFromRoute(route: unknown): AMap.LngLatLike[] {
  if (!route || typeof route !== 'object') return []

  const r = route as {
    steps?: Array<{ path?: unknown[]; polyline?: string }>
    polyline?: string
  }

  const path: AMap.LngLatLike[] = []

  if (r.steps?.length) {
    for (const step of r.steps) {
      if (step.path?.length) {
        for (const p of step.path) {
          const pair = toPathPair(p)
          if (pair) path.push(pair)
        }
      } else if (step.polyline) {
        path.push(...decodePolylineString(step.polyline))
      }
    }
  }

  if (path.length === 0 && r.polyline) {
    path.push(...decodePolylineString(r.polyline))
  }

  return dedupeAdjacentPoints(path)
}

function extractPathFromResult(result: unknown): AMap.LngLatLike[] {
  const routes = (result as { routes?: unknown[] })?.routes
  if (!routes?.length) return []
  return extractPathFromRoute(routes[0])
}

function extractSummaryFromResult(result: unknown): RouteSummary | undefined {
  const route = (result as { routes?: unknown[] })?.routes?.[0] as {
    distance?: number
    time?: number
    tolls?: number
    steps?: Array<{
      instruction?: string
      road?: string
      distance?: number
      time?: number
      action?: string
    }>
  } | undefined

  if (!route) return undefined

  return {
    distance: route.distance ?? 0,
    time: route.time ?? 0,
    tolls: route.tolls,
    steps: (route.steps ?? []).map(s => ({
      instruction: s.instruction ?? '',
      road: s.road,
      distance: s.distance ?? 0,
      time: s.time ?? 0,
      action: s.action,
    })),
  }
}

function dedupeAdjacentPoints(path: AMap.LngLatLike[]): AMap.LngLatLike[] {
  if (path.length < 2) return path
  const out: AMap.LngLatLike[] = [path[0]]
  for (let i = 1; i < path.length; i++) {
    const prev = out[out.length - 1] as [number, number]
    const cur = path[i] as [number, number]
    if (Math.abs(prev[0] - cur[0]) > 1e-7 || Math.abs(prev[1] - cur[1]) > 1e-7) {
      out.push(cur)
    }
  }
  return out.length > 1 ? out : path
}

function mergePaths(segments: AMap.LngLatLike[][]): AMap.LngLatLike[] {
  const merged: AMap.LngLatLike[] = []
  for (const seg of segments) {
    if (seg.length === 0) continue
    if (merged.length === 0) merged.push(...seg)
    else merged.push(...seg.slice(1))
  }
  return dedupeAdjacentPoints(merged)
}

type RouteSearchResult = { path: AMap.LngLatLike[]; summary?: RouteSummary; error?: string }

function runRouteSearch(
  mode: 'walking' | 'driving' | 'riding',
  from: LngLatPoint,
  to: LngLatPoint,
  policy: DrivingPolicy = 'fastest'
): Promise<RouteSearchResult> {
  return new Promise(resolve => {
    if (!window.AMap) {
      resolve({ path: [], error: '高德 JS API 未加载' })
      return
    }

    const origin = toSearchPoint(from)
    const destination = toSearchPoint(to)

    const onResult = (status: string, result: unknown) => {
      if (status === 'complete') {
        const path = extractPathFromResult(result)
        if (path.length > 1) {
          resolve({ path, summary: extractSummaryFromResult(result) })
          return
        }
        resolve({ path: [], error: '规划成功但未返回路线坐标' })
        return
      }

      const info =
        (result as { info?: string })?.info ??
        (result as { message?: string })?.message ??
        (typeof result === 'string' ? result : undefined)
      resolve({ path: [], error: info || `路径规划失败（${status}）` })
    }

    if (mode === 'walking') {
      new window.AMap.Walking({ hideMarkers: true }).search(origin, destination, onResult)
      return
    }

    if (mode === 'riding') {
      new window.AMap.Riding({ hideMarkers: true }).search(origin, destination, onResult)
      return
    }

    new window.AMap.Driving({
      hideMarkers: true,
      policy: DRIVING_POLICY[policy],
    }).search(origin, destination, onResult)
  })
}

function pickSegmentMode(from: LngLatPoint, to: LngLatPoint): 'walking' | 'driving' {
  return haversineKm(from, to) > SEGMENT_DRIVING_KM ? 'driving' : 'walking'
}

function pickPrimaryMode(
  points: LngLatPoint[],
  mode: RouteMode
): 'walking' | 'driving' | 'riding' {
  if (mode === 'walking' || mode === 'driving' || mode === 'riding') return mode
  for (let i = 0; i < points.length - 1; i++) {
    if (haversineKm(points[i], points[i + 1]) > SEGMENT_DRIVING_KM) {
      return 'driving'
    }
  }
  return 'walking'
}

const FALLBACK_MODES: Array<'walking' | 'driving' | 'riding'> = ['walking', 'riding', 'driving']

/** 单段路线：优先指定模式，失败后依次尝试其他交通方式 */
async function searchSegmentWithFallback(
  from: LngLatPoint,
  to: LngLatPoint,
  preferred: 'walking' | 'driving' | 'riding',
  policy: DrivingPolicy
): Promise<RouteSearchResult> {
  const modes = [preferred, ...FALLBACK_MODES.filter(m => m !== preferred)]
  let lastError: string | undefined

  for (const mode of modes) {
    const result = await runRouteSearch(mode, from, to, policy)
    if (result.path.length > 1) {
      return { ...result, summary: result.summary }
    }
    lastError = result.error
  }

  return { path: [], error: lastError || '路径规划失败' }
}

/**
 * 逐段规划并合并 — 每段均调用高德路网，避免直线连接
 */
async function planSegmentRoute(
  points: LngLatPoint[],
  mode: 'walking' | 'driving' | 'riding' | 'auto',
  policy: DrivingPolicy = 'fastest'
): Promise<NavigationRouteResult> {
  const primaryMode = mode === 'auto' ? 'walking' : mode
  const segmentPaths: AMap.LngLatLike[][] = []
  let totalDistance = 0
  let totalTime = 0
  const allSteps: RouteStepSummary[] = []
  const errors: string[] = []
  let usedStraightFallback = false
  let dominantMode: 'walking' | 'driving' | 'riding' =
    mode === 'driving' ? 'driving' : mode === 'riding' ? 'riding' : 'walking'

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i]
    const to = points[i + 1]

    const segMode =
      mode === 'auto'
        ? pickSegmentMode(from, to)
        : primaryMode

    if (segMode === 'driving') dominantMode = 'driving'

    const { path, summary, error } = await searchSegmentWithFallback(
      from,
      to,
      segMode,
      policy
    )

    if (error) errors.push(error)

    if (path.length > 1) {
      segmentPaths.push(path)
      if (summary) {
        totalDistance += summary.distance
        totalTime += summary.time
        allSteps.push(...summary.steps)
      }
      continue
    }

    // 所有交通方式均失败时才直线兜底
    usedStraightFallback = true
    segmentPaths.push([toSearchPoint(from), toSearchPoint(to)] as AMap.LngLatLike[])
  }

  const merged = mergePaths(segmentPaths)

  return {
    path: merged,
    mode: dominantMode,
    summary: allSteps.length
      ? { distance: totalDistance, time: totalTime, steps: allSteps }
      : undefined,
    warning: errors.length
      ? `${errors[0]}${usedStraightFallback ? '（部分路段未能获取道路路线，已用直线示意）' : ''}`
      : usedStraightFallback
        ? '部分路段未能获取道路路线，已用直线示意'
        : undefined,
  }
}

/**
 * 规划导航路线（沿道路）
 *
 * 默认 auto：短距离步行、长距离驾车，逐段调用高德路网后合并
 */
export async function planNavigationRoute(
  points: LngLatPoint[],
  mode: RouteMode = 'auto',
  policy: DrivingPolicy = 'fastest'
): Promise<NavigationRouteResult> {
  if (points.length < 2) {
    return { path: points.map(p => toSearchPoint(p)), mode: 'walking' }
  }

  await loadAmapRoutePlugins()

  const resolvedMode = pickPrimaryMode(points, mode)
  return planSegmentRoute(points, mode === 'auto' ? 'auto' : resolvedMode, policy)
}

export function formatRouteSummary(summary: RouteSummary): string {
  const km = (summary.distance / 1000).toFixed(1)
  const min = Math.ceil(summary.time / 60)
  return `全程约 ${km} km · 预计 ${min} 分钟`
}

export const routeModeLabels: Record<'walking' | 'driving' | 'riding', string> = {
  walking: '步行导航',
  driving: '驾车导航',
  riding: '骑行导航',
}
