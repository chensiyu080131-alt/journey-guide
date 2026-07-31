/**
 * 文旅内容仓储：优先读 Postgres，失败/未配置时回退文件 Mock。
 */
import { getPrisma, isDatabaseConfigured } from '@/lib/prisma'
import { getMockGuideById } from '@/lib/mock-data'
import { cityBooksMap, type CityBooksMeta } from '@/lib/city-books'
import {
  dbGuideToGuide,
  dbCityBooksToMeta,
  guideToDbPayload,
  spotToDbPayload,
} from '@/lib/content-mapper'
import type { Guide, Spot } from '@/types'

export type ContentSource = 'database' | 'file'

export async function getGuideByIdFromRepo(
  id: string
): Promise<{ guide: Guide | null; source: ContentSource }> {
  if (isDatabaseConfigured()) {
    try {
      const prisma = getPrisma()
      if (prisma) {
        const row = await prisma.guide.findFirst({
          where: { id, published: true },
          include: {
            dayPlans: { include: { spots: true }, orderBy: { day: 'asc' } },
          },
        })
        if (row) return { guide: dbGuideToGuide(row), source: 'database' }
      }
    } catch (error) {
      console.warn('[content-repo] DB read failed, fallback to file:', error)
    }
  }
  return { guide: getMockGuideById(id), source: 'file' }
}

export async function listGuidesFromRepo(): Promise<{
  guides: Array<{
    id: string
    title: string
    cityName: string
    province: string
    days: number
    entryType: string
    published: boolean
    spotCount: number
    source: string
    updatedAt: string
  }>
  source: ContentSource
}> {
  if (isDatabaseConfigured()) {
    try {
      const prisma = getPrisma()
      if (prisma) {
        const rows = await prisma.guide.findMany({
          orderBy: [{ cityName: 'asc' }, { title: 'asc' }],
          include: {
            dayPlans: { include: { _count: { select: { spots: true } } } },
          },
        })
        return {
          source: 'database',
          guides: rows.map(r => ({
            id: r.id,
            title: r.title,
            cityName: r.cityName,
            province: r.province,
            days: r.days,
            entryType: r.entryType,
            published: r.published,
            source: r.source,
            updatedAt: r.updatedAt.toISOString(),
            spotCount: r.dayPlans.reduce((n, d) => n + d._count.spots, 0),
          })),
        }
      }
    } catch (error) {
      console.warn('[content-repo] listGuides DB failed:', error)
    }
  }

  // file fallback：从 mock 汇总
  const { mockGuides } = await import('@/lib/mock-data')
  return {
    source: 'file',
    guides: Object.values(mockGuides).map(g => ({
      id: g.id,
      title: g.title,
      cityName: g.city,
      province: g.province,
      days: g.days,
      entryType: g.entryType,
      published: true,
      source: 'file',
      updatedAt: g.createdAt,
      spotCount: g.dayPlans.reduce((n, d) => n + d.spots.length, 0),
    })),
  }
}

export async function getCityBooksFromRepo(
  citySlug: string
): Promise<{ meta: CityBooksMeta | null; source: ContentSource }> {
  if (isDatabaseConfigured()) {
    try {
      const prisma = getPrisma()
      if (prisma) {
        const city = await prisma.city.findUnique({
          where: { id: citySlug },
          include: { books: true },
        })
        if (city && city.books.length > 0) {
          return { meta: dbCityBooksToMeta(city, city.books), source: 'database' }
        }
      }
    } catch (error) {
      console.warn('[content-repo] city books DB failed:', error)
    }
  }
  return { meta: cityBooksMap[citySlug] ?? null, source: 'file' }
}

export async function getContentStats(): Promise<{
  source: ContentSource
  cities: number
  guides: number
  spots: number
  books: number
  verifiedSpots: number
}> {
  if (isDatabaseConfigured()) {
    try {
      const prisma = getPrisma()
      if (prisma) {
        const [cities, guides, spots, books, verifiedSpots] = await Promise.all([
          prisma.city.count(),
          prisma.guide.count({ where: { published: true } }),
          prisma.spot.count(),
          prisma.cityBook.count(),
          prisma.spot.count({ where: { trustLevel: 'verified' } }),
        ])
        return { source: 'database', cities, guides, spots, books, verifiedSpots }
      }
    } catch (error) {
      console.warn('[content-repo] stats DB failed:', error)
    }
  }

  const { mockGuides } = await import('@/lib/mock-data')
  const guides = Object.values(mockGuides)
  const spots = guides.reduce((n, g) => n + g.dayPlans.reduce((m, d) => m + d.spots.length, 0), 0)
  return {
    source: 'file',
    cities: new Set(guides.map(g => g.city)).size,
    guides: guides.length,
    spots,
    books: Object.values(cityBooksMap).reduce((n, c) => n + c.books.length, 0),
    verifiedSpots: spots,
  }
}

/** 更新单个点位（dashboard 编辑） */
export async function updateSpotInRepo(
  spotId: string,
  patch: Partial<{
    name: string
    desc: string
    address: string
    originalText: string
    originalSource: string
    realityNote: string
    trustLevel: string
    story: string
    budgetHint: string
    lat: number | null
    lng: number | null
  }>
): Promise<Spot | null> {
  const prisma = getPrisma()
  if (!prisma) throw new Error('DATABASE_URL 未配置，无法写入数据库')

  const row = await prisma.spot.update({
    where: { id: spotId },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.desc !== undefined ? { desc: patch.desc } : {}),
      ...(patch.address !== undefined ? { address: patch.address } : {}),
      ...(patch.originalText !== undefined ? { originalText: patch.originalText } : {}),
      ...(patch.originalSource !== undefined ? { originalSource: patch.originalSource } : {}),
      ...(patch.realityNote !== undefined ? { realityNote: patch.realityNote } : {}),
      ...(patch.trustLevel !== undefined ? { trustLevel: patch.trustLevel } : {}),
      ...(patch.story !== undefined ? { story: patch.story } : {}),
      ...(patch.budgetHint !== undefined ? { budgetHint: patch.budgetHint } : {}),
      ...(patch.lat !== undefined ? { lat: patch.lat } : {}),
      ...(patch.lng !== undefined ? { lng: patch.lng } : {}),
    },
  })
  const { dbSpotToSpot } = await import('@/lib/content-mapper')
  return dbSpotToSpot(row)
}

/** 整本攻略 upsert（seed / 管理写入） */
export async function upsertGuideInRepo(guide: Guide, cityId?: string | null) {
  const prisma = getPrisma()
  if (!prisma) throw new Error('DATABASE_URL 未配置')

  await prisma.$transaction(async tx => {
    await tx.spot.deleteMany({
      where: { dayPlan: { guideId: guide.id } },
    })
    await tx.dayPlan.deleteMany({ where: { guideId: guide.id } })

    await tx.guide.upsert({
      where: { id: guide.id },
      create: guideToDbPayload(guide, cityId),
      update: {
        ...guideToDbPayload(guide, cityId),
        updatedAt: new Date(),
      },
    })

    for (const day of guide.dayPlans) {
      const dp = await tx.dayPlan.create({
        data: {
          guideId: guide.id,
          day: day.day,
          title: day.title,
          budgetEstimate: day.budgetEstimate ?? null,
        },
      })
      if (day.spots.length) {
        await tx.spot.createMany({
          data: day.spots.map((s, i) => spotToDbPayload(s, dp.id, i)),
        })
      }
    }
  })
}
