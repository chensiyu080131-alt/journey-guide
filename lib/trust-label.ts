import { Spot, SpotTrustLevel, Guide } from '@/types'

export const TRUST_LABELS: Record<
  SpotTrustLevel,
  { short: string; detail: string; className: string }
> = {
  verified: {
    short: '人工核验',
    detail: '该点位来自人工核验的预设路线，原文与实景已经校对。',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  ai: {
    short: 'AI 生成',
    detail: '该点位由 AI 生成，请将引文与出行信息作为灵感参考，出发前请二次确认。',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  unverified: {
    short: 'POI 未验证',
    detail: '该点位尚未通过地图 POI 验证，地址或坐标可能不准确。',
    className: 'bg-stone-100 text-stone-700 border-stone-300',
  },
}

export function resolveSpotTrust(spot: Spot): SpotTrustLevel {
  if (spot.trustLevel) return spot.trustLevel
  if (spot.location?.lat && spot.location?.lng && spot.originalText) return 'ai'
  if (!spot.location) return 'unverified'
  return 'ai'
}

/** 为攻略内全部点位打上统一信任标签 */
export function tagGuideSpots(guide: Guide, level: SpotTrustLevel): Guide {
  return {
    ...guide,
    dayPlans: guide.dayPlans.map(day => ({
      ...day,
      spots: day.spots.map(spot => ({
        ...spot,
        trustLevel: spot.trustLevel ?? level,
      })),
    })),
  }
}
