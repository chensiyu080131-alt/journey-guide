import type {
  Guide,
  Spot,
  DayPlan,
  DialectItem,
  LocalExperience,
  SpotTrustLevel,
  InterestTag,
  BudgetLevel,
  EntryType,
  InteractiveTask,
} from '@/types'
import type {
  Guide as DbGuide,
  DayPlan as DbDayPlan,
  Spot as DbSpot,
  CityBook as DbCityBook,
  City as DbCity,
} from '@prisma/client'
import { Prisma } from '@prisma/client'
import type { CityBooksMeta, CityBookEntry } from '@/lib/city-books'
import type { CoverStyle } from '@/lib/home-covers'

type DbGuideFull = DbGuide & {
  dayPlans: (DbDayPlan & { spots: DbSpot[] })[]
}

function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === null || value === undefined) return Prisma.DbNull
  return value as Prisma.InputJsonValue
}

export function guideToDbPayload(guide: Guide, cityId?: string | null) {
  return {
    id: guide.id,
    cityId: cityId ?? null,
    title: guide.title,
    subtitle: guide.subtitle,
    cityName: guide.city,
    province: guide.province,
    days: guide.days,
    interests: guide.interests as string[],
    budget: guide.budget,
    dialectJson: toJson(guide.dialect ?? null),
    experiencesJson: toJson(guide.localExperiences ?? null),
    tipsJson: toJson(guide.tips ?? null),
    entryType: guide.entryType,
    relatedBook: guide.relatedBook ?? null,
    relatedAuthor: guide.relatedAuthor ?? null,
    relatedCharacter: guide.relatedCharacter ?? null,
    routeIntro: guide.routeIntro ?? null,
    trustDefault: 'verified',
    source: 'seed',
    published: true,
  }
}

export function spotToDbPayload(spot: Spot, dayPlanId: string, sortOrder: number) {
  const extras: Record<string, unknown> = {}
  if (spot.interactiveTask) extras.interactiveTask = spot.interactiveTask
  if (spot.goodNow !== undefined) extras.goodNow = spot.goodNow
  if (spot.goodNowReason) extras.goodNowReason = spot.goodNowReason
  if (spot.photoSpot !== undefined) extras.photoSpot = spot.photoSpot
  if (spot.flavor) extras.flavor = spot.flavor

  return {
    id: spot.id,
    dayPlanId,
    name: spot.name,
    desc: spot.desc,
    duration: spot.duration,
    tags: spot.tags,
    timeSlot: spot.timeSlot,
    lat: spot.location?.lat ?? null,
    lng: spot.location?.lng ?? null,
    address: spot.address ?? null,
    story: spot.story ?? null,
    type: spot.type,
    budgetHint: spot.budgetHint ?? null,
    emoji: spot.emoji,
    originalText: spot.originalText ?? null,
    originalSource: spot.originalSource ?? null,
    realityNote: spot.realityNote ?? null,
    trustLevel: spot.trustLevel ?? 'verified',
    culturalTag: spot.culturalTag ?? null,
    culturalTagDetail: spot.culturalTagDetail ?? null,
    essay: spot.essay ?? null,
    region: spot.region ?? null,
    historicalImage: spot.historicalImage ?? null,
    realityImage: spot.realityImage ?? null,
    extrasJson: Object.keys(extras).length ? (extras as Prisma.InputJsonValue) : Prisma.DbNull,
    sortOrder,
  }
}

export function dbSpotToSpot(row: DbSpot): Spot {
  const extras = (row.extrasJson ?? {}) as Record<string, unknown>
  return {
    id: row.id,
    name: row.name,
    desc: row.desc,
    duration: row.duration,
    tags: row.tags,
    timeSlot: row.timeSlot as Spot['timeSlot'],
    location:
      row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    address: row.address ?? undefined,
    story: row.story ?? undefined,
    type: row.type as Spot['type'],
    budgetHint: row.budgetHint ?? undefined,
    emoji: row.emoji,
    originalText: row.originalText ?? undefined,
    originalSource: row.originalSource ?? undefined,
    realityNote: row.realityNote ?? undefined,
    trustLevel: (row.trustLevel as SpotTrustLevel) || 'verified',
    culturalTag: (row.culturalTag as Spot['culturalTag']) ?? undefined,
    culturalTagDetail: row.culturalTagDetail ?? undefined,
    essay: row.essay ?? undefined,
    region: row.region ?? undefined,
    historicalImage: row.historicalImage ?? undefined,
    realityImage: row.realityImage ?? undefined,
    interactiveTask: extras.interactiveTask as InteractiveTask | undefined,
    goodNow: extras.goodNow as boolean | undefined,
    goodNowReason: extras.goodNowReason as string | undefined,
    photoSpot: extras.photoSpot as boolean | undefined,
    flavor: extras.flavor as Spot['flavor'],
  }
}

export function dbGuideToGuide(row: DbGuideFull): Guide {
  const dayPlans: DayPlan[] = [...row.dayPlans]
    .sort((a, b) => a.day - b.day)
    .map(dp => ({
      day: dp.day,
      title: dp.title,
      budgetEstimate: dp.budgetEstimate ?? undefined,
      spots: [...dp.spots]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(dbSpotToSpot),
    }))

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    city: row.cityName,
    province: row.province,
    days: row.days,
    interests: row.interests as InterestTag[],
    budget: row.budget as BudgetLevel,
    dayPlans,
    dialect: (row.dialectJson as DialectItem[] | null) ?? undefined,
    localExperiences: (row.experiencesJson as LocalExperience[] | null) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    tips: (row.tipsJson as string[] | null) ?? undefined,
    entryType: row.entryType as EntryType,
    relatedBook: row.relatedBook ?? undefined,
    relatedAuthor: row.relatedAuthor ?? undefined,
    relatedCharacter: row.relatedCharacter ?? undefined,
    routeIntro: row.routeIntro ?? undefined,
  }
}

export function dbCityBooksToMeta(
  city: DbCity,
  books: DbCityBook[]
): CityBooksMeta {
  return {
    citySlug: city.id,
    cityName: city.name,
    province: city.province,
    tagline: city.tagline ?? '',
    intro: city.intro ?? '',
    books: [...books]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(
        (b): CityBookEntry => ({
          id: b.id,
          guideId: b.guideId ?? b.id,
          title: b.title,
          author: b.author,
          intro: b.intro,
          style: b.styleJson as unknown as CoverStyle,
        })
      ),
  }
}

/** 从城市中文名推断 slug */
export function guessCitySlug(cityName: string, guideId: string): string {
  const map: Record<string, string> = {
    常熟: 'changshu',
    扬州: 'yangzhou',
    南京: 'nanjing',
    苏州: 'suzhou',
    无锡: 'wuxi',
    镇江: 'zhenjiang',
    南通: 'nantong',
    淮安: 'huaian',
    盐城: 'yancheng',
    泰州: 'taizhou',
    徐州: 'xuzhou',
    连云港: 'lianyungang',
    宿迁: 'suqian',
    高邮: 'gaoyou',
    北京: 'beijing',
    上海: 'shanghai',
    杭州: 'hangzhou',
    绍兴: 'shaoxing',
    成都: 'chengdu',
    西安: 'xian',
    昆明: 'kunming',
    凤凰: 'fenghuang',
    湘西: 'xiangxi',
  }
  if (map[cityName]) return map[cityName]
  // 常见 guide id 即 slug
  if (/^[a-z0-9-]+$/.test(guideId) && !guideId.includes('renjian')) return guideId
  return cityName.toLowerCase().replace(/\s+/g, '-') || 'unknown'
}
