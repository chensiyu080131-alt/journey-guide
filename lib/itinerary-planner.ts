import {
  BudgetLevel,
  DayPlan,
  Guide,
  InterestTag,
  ItineraryDayDetail,
  OptionalRecommendSpot,
  RouteVariant,
  ScheduleBlock,
  ScheduleSpotRef,
  Spot,
  TimeSlot,
} from '@/types'
import { optionalToSpot, getOptionalSpotsForGuide } from './optional-spots'
import { PlanAspect } from './guide-category'

const SLOT_ORDER: Record<TimeSlot, number> = { 上午: 0, 中午: 1, 下午: 2, 晚上: 3 }

function sortSpots(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => (SLOT_ORDER[a.timeSlot] ?? 0) - (SLOT_ORDER[b.timeSlot] ?? 0))
}

function buildDayPlansFromSpots(spots: Spot[], days: number): DayPlan[] {
  const sorted = sortSpots(spots)
  const spotsPerDay = Math.max(1, Math.ceil(sorted.length / days))
  const dayPlans: DayPlan[] = []
  for (let i = 0; i < days; i++) {
    const daySpots = sorted.slice(i * spotsPerDay, (i + 1) * spotsPerDay)
    if (daySpots.length === 0) continue
    dayPlans.push({
      day: i + 1,
      title: i === 0 ? '经典初探' : i === 1 ? '深度漫游' : '人文拾遗',
      spots: daySpots,
      budgetEstimate: i === 0 ? '约150-250元' : '约100-180元',
    })
  }
  return dayPlans
}

function spotToRef(spot: Spot, travelTime?: string): ScheduleSpotRef {
  return {
    spotId: spot.id,
    name: spot.name,
    emoji: spot.emoji,
    duration: spot.duration,
    highlight: spot.desc.slice(0, 28) + (spot.desc.length > 28 ? '…' : ''),
    travelTime,
    type: spot.type,
  }
}

function estimateTravel(prev?: Spot, next?: Spot): string | undefined {
  if (!prev?.location || !next?.location) return '约15分钟'
  const dlat = Math.abs(prev.location.lat - next.location.lat)
  const dlng = Math.abs(prev.location.lng - next.location.lng)
  const dist = Math.sqrt(dlat * dlat + dlng * dlng)
  if (dist < 0.01) return '步行约10分钟'
  if (dist < 0.03) return '步行约20分钟'
  if (dist < 0.08) return '车程约15分钟'
  return '车程约25分钟'
}

function buildScheduleBlocks(daySpots: Spot[]): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []
  const morning = daySpots.filter(s => s.timeSlot === '上午')
  const noon = daySpots.filter(s => s.timeSlot === '中午' || (s.timeSlot === '下午' && s.type === '美食'))
  const afternoon = daySpots.filter(s => s.timeSlot === '下午' && s.type !== '美食')
  const evening = daySpots.filter(s => s.timeSlot === '晚上')

  if (morning.length > 0) {
    blocks.push({
      type: '上午',
      label: '上午行程',
      timeRange: '09:00 — 12:00',
      travelTime: morning.length > 1 ? '景点间步行/短途接驳' : undefined,
      spots: morning.map((s, i) => spotToRef(s, i > 0 ? estimateTravel(morning[i - 1], s) : undefined)),
      activity: morning.map(s => s.name).join(' → '),
      highlight: morning.map(s => s.tags[0]).filter(Boolean).join(' · ') || '文化探访',
    })
  }

  const lunchSpot = noon[0] || daySpots.find(s => s.type === '美食')
  if (lunchSpot) {
    const prev = morning[morning.length - 1] || daySpots[0]
    blocks.push({
      type: '午饭',
      label: '午饭',
      timeRange: '12:00 — 13:30',
      travelTime: estimateTravel(prev, lunchSpot),
      spots: [spotToRef(lunchSpot)],
      activity: lunchSpot.name,
      highlight: lunchSpot.budgetHint || '在地风味',
    })
  }

  if (afternoon.length > 0) {
    const prev = lunchSpot || morning[morning.length - 1]
    blocks.push({
      type: '下午',
      label: '下午行程',
      timeRange: '13:30 — 17:30',
      travelTime: afternoon.length > 1 ? '沿途步行游览' : estimateTravel(prev, afternoon[0]),
      spots: afternoon.map((s, i) => spotToRef(s, i > 0 ? estimateTravel(afternoon[i - 1], s) : undefined)),
      activity: afternoon.map(s => s.name).join(' → '),
      highlight: afternoon.some(s => s.photoSpot) ? '经典机位 · 园林古街' : '人文漫步',
    })
  }

  const dinnerSpot = daySpots.find(s => s.type === '美食' && s !== lunchSpot)
  if (dinnerSpot) {
    const prev = afternoon[afternoon.length - 1] || lunchSpot || morning[morning.length - 1]
    blocks.push({
      type: '晚饭',
      label: '晚饭',
      timeRange: '18:00 — 19:30',
      travelTime: estimateTravel(prev, dinnerSpot),
      spots: [spotToRef(dinnerSpot)],
      activity: dinnerSpot.name,
      highlight: dinnerSpot.budgetHint || '淮扬风味',
    })
  }

  if (evening.length > 0) {
    const prev = dinnerSpot || afternoon[afternoon.length - 1] || lunchSpot
    blocks.push({
      type: '晚间',
      label: '晚间活动',
      timeRange: '19:30 — 21:00',
      travelTime: estimateTravel(prev, evening[0]),
      spots: evening.map((s, i) => spotToRef(s, i > 0 ? estimateTravel(evening[i - 1], s) : undefined)),
      activity: evening.map(s => s.name).join(' → '),
      highlight: evening[0].goodNowReason || '夜景 · 文化夜读',
    })
  }

  return blocks
}

function insertOptionals(
  dayPlans: DayPlan[],
  optionals: OptionalRecommendSpot[],
  selectedIds: Set<string>
): DayPlan[] {
  const selected = optionals.filter(o => selectedIds.has(o.id))
  if (selected.length === 0) return dayPlans

  return dayPlans.map(day => {
    let spots = [...day.spots]
    for (const opt of selected.filter(o => (o.insertDay ?? 1) === day.day)) {
      const spot = optionalToSpot(opt)
      const afterIdx = opt.insertAfterSpotId
        ? spots.findIndex(s => s.id === opt.insertAfterSpotId)
        : spots.length - 1
      const insertAt = afterIdx >= 0 ? afterIdx + 1 : spots.length
      spots = [...spots.slice(0, insertAt), spot, ...spots.slice(insertAt)]
    }
    return { ...day, spots: sortSpots(spots) }
  })
}

export function getAllSpots(guide: Guide): Spot[] {
  return guide.dayPlans.flatMap(d => d.spots)
}

export function getRouteVariants(guide: Guide, aspect: PlanAspect): RouteVariant[] {
  const allSpots = getAllSpots(guide)
  const baseDays = guide.days
  const landmarks = allSpots.filter(s => s.originalText).length || allSpots.length
  const city = guide.city

  if (aspect === 'days') {
    const options = [1, 2, 3].filter(d => d <= Math.max(baseDays, Math.ceil(allSpots.length / 2)))
    return options.map(days => ({
      id: `${days}d`,
      days,
      title: `${days} 天行程`,
      summary:
        days === 1
          ? `一日精华：串联 ${Math.min(landmarks, 5)} 处核心原文落点，适合周末快闪`
          : days === 2
            ? `两日经典：${landmarks} 处落点 + 沿途非遗，节奏舒适`
            : `三日深度：全部落点 + 非遗体验 + 在地美食，悠闲细品`,
      pace: (days === 1 ? '紧凑' : days === 2 ? '适中' : '悠闲') as RouteVariant['pace'],
      budgetHint: days === 1 ? '约200元/天' : days === 2 ? '约180元/天' : '约160元/天',
    }))
  }

  if (aspect === 'budget') {
    const levels: { id: BudgetLevel; hint: string; summary: string }[] = [
      { id: '穷游', hint: '约80-120元/天', summary: `免费落点为主：${city}公共交通 + 平价小吃 + 免费非遗展演` },
      { id: '舒适', hint: '约150-220元/天', summary: '经典门票 + 特色餐饮 + 手作非遗，步行短途接驳' },
      { id: '轻奢', hint: '约300元+/天', summary: '精品体验 + 非遗雅集/手作 + 特色宴席' },
    ]
    return levels.map(l => ({
      id: l.id,
      days: baseDays,
      title: l.id,
      summary: l.summary,
      pace: '适中' as const,
      budgetHint: l.hint,
    }))
  }

  // interests
  const tags: InterestTag[] = ['文化', '美食', '自然', '体验']
  return tags
    .filter(tag => allSpots.some(s => s.tags.includes(tag)))
    .map(tag => {
      const sample = allSpots.filter(s => s.tags.includes(tag)).slice(0, 2).map(s => s.name)
      return {
        id: tag,
        days: Math.min(baseDays, Math.max(1, Math.ceil(allSpots.filter(s => s.tags.includes(tag)).length / 3))),
        title: `偏爱${tag}`,
        summary: `聚焦${tag}：${sample.join('、')}${sample.length ? ' 等' : ''}，优先${tag}相关非遗`,
        pace: '适中' as const,
        budgetHint: guide.budget === '穷游' ? '约100元/天' : '约180元/天',
      }
    })
}

/** 消费档位：依据 budgetHint 关键字稳健判断 */
function spotCostTier(spot: Spot): 'free' | 'low' | 'high' {
  const h = spot.budgetHint || ''
  if (!h || h.includes('免费')) return 'free'
  const nums = (h.match(/\d+/g) || []).map(Number)
  const max = nums.length ? Math.max(...nums) : 0
  if (max === 0) return 'free'
  if (max <= 50) return 'low'
  return 'high'
}

/** 点位基础优先级：书中原文落点 > 景点 > 可拍照 */
function baseScore(spot: Spot): number {
  let s = 0
  if (spot.originalText) s += 3
  if (spot.type === '景点') s += 1
  if (spot.photoSpot) s += 1
  return s
}

/** 保证子集中至少含 n 个美食点（安排正餐），优先平价 */
function ensureMeals(chosen: Spot[], pool: Spot[], n: number): Spot[] {
  const meals = chosen.filter(s => s.type === '美食')
  if (meals.length >= n) return chosen
  const rank = (s: Spot) => (spotCostTier(s) === 'low' ? 0 : spotCostTier(s) === 'free' ? 1 : 2)
  const extra = pool
    .filter(s => s.type === '美食' && !chosen.includes(s))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, n - meals.length)
  return [...chosen, ...extra]
}

/**
 * 按方案（天数/预算/喜好）选择并排序点位——三种分类产生差异的核心。
 */
function selectSpotsForVariant(guide: Guide, aspect: PlanAspect, variantId: string): Spot[] {
  const all = getAllSpots(guide)

  if (aspect === 'days') {
    const days = parseInt(variantId, 10) || guide.days
    if (days >= 3) return all
    const scenicCap = days <= 1 ? 4 : 6
    const mealCap = days <= 1 ? 1 : 2
    const scenic = all.filter(s => s.type !== '美食')
      .sort((a, b) => baseScore(b) - baseScore(a)).slice(0, scenicCap)
    const meals = all.filter(s => s.type === '美食')
      .sort((a, b) => baseScore(b) - baseScore(a)).slice(0, mealCap)
    return [...scenic, ...meals]
  }

  if (aspect === 'budget') {
    const level = variantId as BudgetLevel
    if (level === '穷游') {
      let spots = all.filter(s => spotCostTier(s) !== 'high')
      spots = ensureMeals(spots, all, 1)
      if (spots.filter(s => s.type !== '美食').length === 0) {
        spots = [
          ...all.filter(s => s.type !== '美食').sort((a, b) => baseScore(b) - baseScore(a)).slice(0, 3),
          ...spots,
        ]
      }
      return spots
    }
    if (level === '轻奢') {
      return [...all].sort(
        (a, b) => (spotCostTier(b) === 'high' ? 1 : 0) - (spotCostTier(a) === 'high' ? 1 : 0)
      )
    }
    return all // 舒适
  }

  // interests
  const tag = variantId as InterestTag
  const matched = all.filter(s => s.tags.includes(tag))
  if (matched.length >= 3) {
    return ensureMeals(matched, all, 1)
  }
  return all
}

export function buildItinerary(
  guide: Guide,
  aspect: PlanAspect,
  variantId: string,
  selectedOptionalIds: string[] = []
): { dayPlans: DayPlan[]; itineraryDays: ItineraryDayDetail[]; spotMap: Map<string, Spot> } {
  const spots = selectSpotsForVariant(guide, aspect, variantId)

  const variant = getRouteVariants(guide, aspect).find(v => v.id === variantId)
  const days = aspect === 'days'
    ? (parseInt(variantId, 10) || variant?.days || guide.days)
    : (variant?.days || guide.days)

  let dayPlans = buildDayPlansFromSpots(spots, days)

  const optionals = getOptionalSpotsForGuide(guide.id, guide)
  const selectedSet = new Set(selectedOptionalIds)
  dayPlans = insertOptionals(dayPlans, optionals, selectedSet)

  const spotMap = new Map<string, Spot>()
  for (const s of spots) spotMap.set(s.id, s)
  for (const o of optionals.filter(o => selectedSet.has(o.id))) {
    spotMap.set(o.id, optionalToSpot(o))
  }

  const itineraryDays: ItineraryDayDetail[] = dayPlans.map(day => {
    const meeting = day.spots[0]
    return {
      day: day.day,
      title: day.title,
      meetingPoint: {
        type: '集合',
        label: '集合点',
        timeRange: '08:30',
        spots: meeting ? [spotToRef(meeting)] : [],
        activity: meeting?.address || `${guide.city}行程起点`,
        highlight: meeting ? `从 ${meeting.name} 出发` : '行程集合',
      },
      blocks: buildScheduleBlocks(day.spots),
      budgetEstimate: day.budgetEstimate,
      spotIds: day.spots.map(s => s.id),
    }
  })

  return { dayPlans, itineraryDays, spotMap }
}

export function getSpotsForMap(
  itineraryDays: ItineraryDayDetail[],
  spotMap: Map<string, Spot>,
  day: number
): Spot[] {
  const detail = itineraryDays.find(d => d.day === day)
  if (!detail) return []
  return detail.spotIds
    .map(id => spotMap.get(id))
    .filter((s): s is Spot => Boolean(s && s.location?.lat && s.location?.lng))
}
