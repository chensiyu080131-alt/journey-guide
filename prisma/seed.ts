/**
 * 将现有 TS/JSON 文旅内容导入 Postgres。
 * 用法：DATABASE_URL=... npx tsx prisma/seed.ts
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { mockGuides } from '../lib/mock-data'
import { cityBooksMap } from '../lib/city-books'
import {
  guideToDbPayload,
  spotToDbPayload,
  guessCitySlug,
} from '../lib/content-mapper'
import type { Guide } from '../types'

const prisma = new PrismaClient()

async function ensureCityFromGuide(guide: Guide) {
  const slug = guessCitySlug(guide.city, guide.id)
  const existing = await prisma.city.findUnique({ where: { id: slug } })
  if (existing) return existing.id

  const bookMeta = Object.values(cityBooksMap).find(
    c => c.cityName === guide.city || c.citySlug === slug
  )

  await prisma.city.create({
    data: {
      id: slug,
      name: guide.city,
      province: guide.province || bookMeta?.province || '',
      tagline: bookMeta?.tagline ?? null,
      intro: bookMeta?.intro ?? null,
    },
  })
  return slug
}

async function upsertGuide(guide: Guide, cityId: string) {
  await prisma.spot.deleteMany({ where: { dayPlan: { guideId: guide.id } } })
  await prisma.dayPlan.deleteMany({ where: { guideId: guide.id } })

  await prisma.guide.upsert({
    where: { id: guide.id },
    create: { ...guideToDbPayload(guide, cityId), source: 'seed' },
    update: { ...guideToDbPayload(guide, cityId), source: 'seed', updatedAt: new Date() },
  })

  for (const day of guide.dayPlans) {
    const dp = await prisma.dayPlan.create({
      data: {
        guideId: guide.id,
        day: day.day,
        title: day.title,
        budgetEstimate: day.budgetEstimate ?? null,
      },
    })
    if (day.spots.length) {
      await prisma.spot.createMany({
        data: day.spots.map((s, i) =>
          spotToDbPayload({ ...s, trustLevel: s.trustLevel ?? 'verified' }, dp.id, i)
        ),
      })
    }
  }
}

async function seedCityBooks() {
  for (const meta of Object.values(cityBooksMap)) {
    await prisma.city.upsert({
      where: { id: meta.citySlug },
      create: {
        id: meta.citySlug,
        name: meta.cityName,
        province: meta.province,
        tagline: meta.tagline,
        intro: meta.intro,
      },
      update: {
        name: meta.cityName,
        province: meta.province,
        tagline: meta.tagline,
        intro: meta.intro,
      },
    })

    await prisma.cityBook.deleteMany({ where: { cityId: meta.citySlug } })
    await prisma.cityBook.createMany({
      data: meta.books.map((b, i) => ({
        id: `${meta.citySlug}__${b.id}`,
        cityId: meta.citySlug,
        guideId: b.guideId,
        title: b.title,
        author: b.author,
        intro: b.intro,
        styleJson: b.style as unknown as Prisma.InputJsonValue,
        sortOrder: i,
      })),
    })
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('请先设置 DATABASE_URL（Neon/Supabase 连接串）')
  }

  console.log('→ seeding cities & guides from mockGuides…')
  const guides = Object.values(mockGuides)
  let guideCount = 0
  for (const guide of guides) {
    const cityId = await ensureCityFromGuide(guide)
    await upsertGuide(guide, cityId)
    guideCount++
    process.stdout.write(`  ✓ ${guide.id} (${guide.city})\n`)
  }

  console.log('→ seeding city books…')
  await seedCityBooks()

  const [cities, spots, books] = await Promise.all([
    prisma.city.count(),
    prisma.spot.count(),
    prisma.cityBook.count(),
  ])

  console.log('\nSeed done:')
  console.log(`  cities: ${cities}`)
  console.log(`  guides: ${guideCount}`)
  console.log(`  spots:  ${spots}`)
  console.log(`  books:  ${books}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
