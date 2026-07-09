/**
 * 高德路径规划 — 对齐 amap-gui route 命令语义
 * @see https://lbs.amap.com/api/cli/map-cli/reference
 * @see https://lbs.amap.com/api/javascript-api-v2/guide/services/navigation
 *
 * CLI: amap-gui route --from lng,lat --to lng,lat --type driving --waypoints p1,p2
 * Web: AMap.Driving.search(start, end, { waypoints }, callback)
 */

import { loadAmapScript } from './amap-loader'

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
  /** 页面可直接展示的错误/警告（无需打开控制台） */
  warning?: string
}

type LngLatPoint = { lng: number; lat: number }

const DRIVING_POLICY: Record<DrivingPolicy, number> = {
  fastest: 0,
  least_fee: 1,
  shortest: 2,
}

/** 加载路径规划插件（与 CLI 支持的 driving/walking/riding 一致） */
export function loadAmapRoutePlugins(): Promise<void> {
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

function pickRouteMode(points: LngLatPoint[]): 'walking' | 'driving' {
  let maxSeg = 0
  for (let i = 0; i < points.length - 1; i++) {
    maxSeg = Math.max(maxSeg, haversineKm(points[i], points[i + 1]))
  }
  return maxSeg > 3 ? 'driving' : 'walking'
}

function toLngLatPair(p: LngLatPoint): AMap.LngLatLike {
  return [p.lng, p.lat]
}

function parseLngLat(p: unknown): AMap.LngLatLike | null {
  if (Array.isArray(p) && p.length >= 2) {
    return [Number(p[0]), Number(p[1])]
  }
  if (p && typeof p === 'object') {
    const pt = p as { lng?: number; lat?: number; getLng?: () => number; getLat?: () => number }
    const lng = pt.lng ?? pt.getLng?.()
    const lat = pt.lat ?? pt.getLat?.()
    if (lng != null && lat != null) return [lng, lat]
  }
  return null
}

/** 从 JS API 规划结果提取折线坐标 */
function extractPathFromResult(result: unknown): AMap.LngLatLike[] {
  const route = (result as { routes?: unknown[] })?.routes?.[0] as {
    steps?: Array<{ path?: unknown[] }>
    polyline?: string
  } | undefined

  if (!route) return []

  const path: AMap.LngLatLike[] = []
  if (route.steps) {
    for (const step of route.steps) {
      if (!step.path) continue
      for (const p of step.path) {
        const pair = parseLngLat(p)
        if (pair) path.push(pair)
      }
    }
  }

  return path
}

/** 提取与 amap-gui route 类似的 summary */
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

type RouteSearchResult = { path: AMap.LngLatLike[]; summary?: RouteSummary; error?: string }

function runRouteSearch(
  mode: 'walking' | 'driving' | 'riding',
  from: LngLatPoint,
  to: LngLatPoint,
  opts?: { waypoints?: AMap.LngLatLike[]; policy?: DrivingPolicy }
): Promise<RouteSearchResult> {
  return new Promise(resolve => {
    if (!window.AMap) {
      resolve({ path: [], error: '高德 JS API 未加载' })
      return
    }

    const origin = toLngLatPair(from)
    const destination = toLngLatPair(to)

    const onResult = (status: string, result: unknown) => {
      if (status === 'complete') {
        const path = extractPathFromResult(result)
        if (path.length > 1) {
          resolve({
            path,
            summary: extractSummaryFromResult(result),
          })
        } else {
          resolve({ path: [], error: '规划成功但未返回路线坐标' })
        }
      } else {
        const info = (result as { info?: string })?.info
        resolve({
          path: [],
          error: info || `路径规划失败（${status}）`,
        })
      }
    }

    if (mode === 'walking') {
      new window.AMap.Walking({ hideMarkers: true }).search(origin, destination, onResult)
      return
    }

    if (mode === 'riding') {
      new window.AMap.Riding({ hideMarkers: true }).search(origin, destination, onResult)
      return
    }

    const driving = new window.AMap.Driving({
      hideMarkers: true,
      policy: DRIVING_POLICY[opts?.policy ?? 'fastest'],
    })

    const searchOpts = opts?.waypoints?.length ? { waypoints: opts.waypoints } : undefined
    if (searchOpts) {
      driving.search(origin, destination, searchOpts, onResult)
    } else {
      driving.search(origin, destination, onResult)
    }
  })
}

/**
 * 驾车一次规划多途经点（对齐 CLI --waypoints，最多 16 个途经点）
 */
async function planDrivingRoute(
  points: LngLatPoint[],
  policy: DrivingPolicy = 'fastest'
): Promise<NavigationRouteResult> {
  if (points.length < 2) {
    return { path: points.map(toLngLatPair), mode: 'driving' }
  }

  const start = points[0]
  const end = points[points.length - 1]
  const waypoints = points.slice(1, -1).map(toLngLatPair).slice(0, 16)

  const { path, summary, error } = await runRouteSearch('driving', start, end, { waypoints, policy })

  if (path.length > 1) {
    return { path, mode: 'driving', summary }
  }

  const fallback = await planSegmentRoute(points, 'driving', policy)
  return {
    ...fallback,
    warning: error ? `驾车规划：${error}，已尝试分段路线` : fallback.warning,
  }
}

/** 步行/骑行：逐段规划后合并（JS API 步行不支持 waypoints） */
async function planSegmentRoute(
  points: LngLatPoint[],
  mode: 'walking' | 'driving' | 'riding',
  policy: DrivingPolicy = 'fastest'
): Promise<NavigationRouteResult> {
  const merged: AMap.LngLatLike[] = []
  let totalDistance = 0
  let totalTime = 0
  const allSteps: RouteStepSummary[] = []
  const errors: string[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const segOpts = mode === 'driving' ? { policy } : undefined
    const { path, summary, error } = await runRouteSearch(
      mode,
      points[i],
      points[i + 1],
      mode === 'driving' ? segOpts : undefined
    )

    if (error) errors.push(error)

    if (path.length === 0) {
      if (merged.length === 0) merged.push(toLngLatPair(points[i]))
      merged.push(toLngLatPair(points[i + 1]))
      continue
    }

    if (merged.length === 0) merged.push(...path)
    else merged.push(...path.slice(1))

    if (summary) {
      totalDistance += summary.distance
      totalTime += summary.time
      allSteps.push(...summary.steps)
    }
  }

  const usedFallbackLine = errors.length > 0 && merged.length > 1

  return {
    path: merged,
    mode,
    summary: allSteps.length
      ? { distance: totalDistance, time: totalTime, steps: allSteps }
      : undefined,
    warning: errors.length
      ? `${errors[0]}${usedFallbackLine ? '（部分路段显示为直线连接）' : ''}`
      : undefined,
  }
}

/**
 * 规划导航路线（沿道路）
 *
 * - driving + 3+ 点：单次 search + waypoints（与 amap-gui 一致）
 * - walking / riding：逐段合并
 */
export async function planNavigationRoute(
  points: LngLatPoint[],
  mode: RouteMode = 'auto',
  policy: DrivingPolicy = 'fastest'
): Promise<NavigationRouteResult> {
  if (points.length < 2) {
    return { path: points.map(toLngLatPair), mode: 'walking' }
  }

  await loadAmapRoutePlugins()
  const resolvedMode = mode === 'auto' ? pickRouteMode(points) : mode

  if (resolvedMode === 'driving' && points.length >= 3) {
    return planDrivingRoute(points, policy)
  }

  if (resolvedMode === 'driving') {
    const { path, summary } = await runRouteSearch('driving', points[0], points[1], { policy })
    if (path.length > 1) return { path, mode: 'driving', summary }
  }

  if (resolvedMode === 'riding') {
    return planSegmentRoute(points, 'riding')
  }

  return planSegmentRoute(points, 'walking')
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
