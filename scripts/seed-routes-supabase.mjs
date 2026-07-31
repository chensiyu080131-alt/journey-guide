#!/usr/bin/env node
/**
 * 用 service_role 把 public/xunji-mvp/db/*.json 写入 Supabase。
 *
 * 用法：
 *   node --env-file=.env.local scripts/seed-routes-supabase.mjs
 *
 * 需要：
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   （publishable key 无法写入 RLS）
 *
 * 扩列：先在 SQL Editor 运行 supabase/migrate-route-enrichment.sql
 * （脚本会自动探测列是否存在，缺列时降级写入基础字段 + cards 图片）
 *
 * 勿把 service_role 提交进仓库。
 */
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('需要 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function rest(path, opts = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...opts,
    headers: { ...headers, ...opts.headers },
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const err = new Error(`${opts.method || 'GET'} ${path} → ${res.status} ${text}`)
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}

function conf(c) {
  return ['verified', 'derived', 'pending'].includes(c) ? c : 'pending'
}

async function columnExists(table, column) {
  const res = await fetch(`${URL}/rest/v1/${table}?select=${column}&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
  if (res.ok) return true
  const text = await res.text()
  if (text.includes('does not exist') || text.includes('42703')) return false
  // other errors: treat as missing to be safe
  console.warn(`column probe ${table}.${column}: HTTP ${res.status} ${text.slice(0, 120)}`)
  return false
}

const routeEnrich = await columnExists('routes', 'plain_explain')
const routeV2 = await columnExists('routes', 'duration')
const pointPhoto = await columnExists('points', 'photo')
const pointPanorama = await columnExists('points', 'panorama')
const pointV2 = await columnExists('points', 'baike_summary')
console.log('columns:', { routeEnrich, routeV2, pointPhoto, pointPanorama, pointV2 })
if (!routeEnrich || !pointPhoto) {
  console.warn(
    '⚠️  enrichment 列未就绪。请在 SQL Editor 运行 supabase/migrate-route-enrichment.sql 后重跑本脚本。'
  )
  console.warn('   本次将写入基础字段，并把 photo/illustration 写入 cards 表。')
}
if (!routeV2 || !pointV2) {
  console.warn(
    '⚠️  V2 导览列未就绪。请在 SQL Editor 运行 supabase/migrate-route-v2.sql 后重跑本脚本。'
  )
  console.warn('   本次跳过 duration/baike_summary 等 V2 字段；前端会用本地 JSON 合并补齐。')
}

const dir = join(process.cwd(), 'public/xunji-mvp/db')
const files = readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'literary-routes.json')

let routes = 0
let points = 0
let cards = 0

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  const r = raw.route
  const pts = (raw.points || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0))

  const routeRow = {
    slug: r.slug,
    title: r.title,
    author: r.author,
    city: r.city,
    book: r.book,
    summary: r.summary,
    cover_image: r.cover_image || '',
    source: r.source === 'ai' ? 'ai' : 'human',
  }
  if (routeEnrich) {
    routeRow.plain_explain = r.plain_explain || null
    routeRow.why_worth = r.why_worth || null
    routeRow.category = r.category || null
    routeRow.season = r.season || null
  }
  if (routeV2) {
    routeRow.duration = r.duration || null
    routeRow.difficulty = r.difficulty || null
    routeRow.related_books = Array.isArray(r.related_books) ? r.related_books : null
  }

  const upserted = await rest('routes?on_conflict=slug', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([routeRow]),
  })
  const routeId = upserted[0].id
  routes++

  await rest(`points?route_id=eq.${routeId}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  })

  if (pts.length) {
    const inserted = await rest('points', {
      method: 'POST',
      body: JSON.stringify(
        pts.map(p => {
          const row = {
            route_id: routeId,
            seq: p.seq,
            name: p.name,
            address: p.address,
            lng: p.lng,
            lat: p.lat,
            excerpt: p.excerpt,
            excerpt_source: p.excerpt_source,
            excerpt_confidence: conf(p.excerpt_confidence),
            interpretation: p.interpretation,
            checkin_task: p.checkin_task,
            source: p.source === 'ai' ? 'ai' : 'human',
          }
          if (pointPanorama) {
            row.panorama = p.panorama || null
            row.panorama_source = p.panorama_source || null
          }
          if (pointPhoto) {
            row.photo = p.photo || null
            row.illustration = p.illustration || null
          }
          if (pointV2) {
            row.baike_summary = p.baike_summary || null
            row.history = p.history || null
            row.cultural_status = p.cultural_status || null
            row.cultural_tag = p.cultural_tag || null
            row.open_info = p.open_info || null
            row.transport = p.transport || null
            row.nearby = p.nearby || null
            row.best_time = p.best_time || null
            row.scene_match = p.scene_match || null
            row.pitfall_guide = p.pitfall_guide || null
            row.tips = p.tips || null
            row.food_recommend = p.food_recommend || null
            row.photo_spots = p.photo_spots || null
            row.visit_duration = p.visit_duration || null
          }
          return row
        })
      ),
    })
    points += inserted.length

    // Map inserted points by seq for card media (from JSON)
    const bySeq = Object.fromEntries(pts.map(p => [p.seq, p]))
    const cardRows = inserted.map(p => {
      const src = bySeq[p.seq] || {}
      return {
        point_id: p.id,
        title: p.name,
        quote: p.excerpt,
        illustration: src.illustration || '',
        photo: src.photo || '',
        template: 'default',
        source: 'human',
      }
    })
    const cardIns = await rest('cards', {
      method: 'POST',
      body: JSON.stringify(cardRows),
    })
    cards += cardIns.length
  }

  console.log(`✓ ${r.slug} (${pts.length} points)`)
}

const all = await rest('routes?select=slug')
const confRows = await rest('points?select=excerpt_confidence')
const counts = confRows.reduce((acc, row) => {
  const k = row.excerpt_confidence || 'unknown'
  acc[k] = (acc[k] || 0) + 1
  return acc
}, {})
const cardSample = await rest('cards?select=photo,illustration&limit=1000')
const withMedia = cardSample.filter(c => (c.photo || '').trim() || (c.illustration || '').trim()).length

console.log(`\nDone. routes=${routes} points=${points} cards=${cards}; db routes now=${all.length}`)
console.log('confidence:', counts)
console.log(`cards with media: ${withMedia}/${cardSample.length}`)
