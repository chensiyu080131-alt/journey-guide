import { NextResponse } from 'next/server'
import {
  getContentStats,
  getGuideByIdFromRepo,
  getCityBooksFromRepo,
  listGuidesFromRepo,
  updateSpotInRepo,
} from '@/lib/content-repo'
import { isDatabaseConfigured } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** GET /api/content — 列表 / 单条 / 书单 / 统计 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('stats') === '1') {
    const stats = await getContentStats()
    return NextResponse.json({
      databaseConfigured: isDatabaseConfigured(),
      ...stats,
    })
  }

  const booksCity = searchParams.get('books')
  if (booksCity) {
    const { meta, source } = await getCityBooksFromRepo(booksCity)
    if (!meta) return NextResponse.json({ error: '未找到城市书单' }, { status: 404 })
    return NextResponse.json({ source, meta })
  }

  const id = searchParams.get('id')
  if (id) {
    const { guide, source } = await getGuideByIdFromRepo(id)
    if (!guide) return NextResponse.json({ error: '未找到攻略' }, { status: 404 })
    return NextResponse.json({ source, guide })
  }

  const list = await listGuidesFromRepo()
  return NextResponse.json({
    databaseConfigured: isDatabaseConfigured(),
    ...list,
  })
}

/** PATCH /api/content — 更新点位 { spotId, ...fields } */
export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL 未配置，无法写入。请先接入 Neon/Supabase。' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const spotId = String(body.spotId ?? '').trim()
    if (!spotId) {
      return NextResponse.json({ error: '缺少 spotId' }, { status: 400 })
    }

    const spot = await updateSpotInRepo(spotId, {
      name: body.name,
      desc: body.desc,
      address: body.address,
      originalText: body.originalText,
      originalSource: body.originalSource,
      realityNote: body.realityNote,
      trustLevel: body.trustLevel,
      story: body.story,
      budgetHint: body.budgetHint,
      lat: body.lat === '' || body.lat === undefined ? undefined : Number(body.lat),
      lng: body.lng === '' || body.lng === undefined ? undefined : Number(body.lng),
    })

    return NextResponse.json({ ok: true, spot })
  } catch (error) {
    console.error('content PATCH error:', error)
    const message = error instanceof Error ? error.message : '更新失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
