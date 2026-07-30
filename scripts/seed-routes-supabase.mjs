// ============================================================================
// 寻迹 xunji · 路线 + 点位 seed 脚本
// 把 public/xunji-mvp/db/*.json 的数据 upsert 进 Supabase 的 routes / points 表。
//
// 需要 .env.local（勿提交）含：
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...   // service_role，绕过 RLS 才能写入
//
// 用法：
//   node --env-file=.env.local scripts/seed-routes-supabase.mjs          # 真实写入
//   node --env-file=.env.local scripts/seed-routes-supabase.mjs --dry-run # 只解析+映射，不联网
//
// 注意：发布密钥(publishable/anon)只能 SELECT，写入会被 RLS 拒绝 → 必须用 service_role。
// ============================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRY = process.argv.includes('--dry-run')

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!DRY && (!SUPABASE_URL || !SERVICE_ROLE)) {
  console.error('缺少环境变量：SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（检查 .env.local）')
  process.exit(1)
}

const DB = (p) => `${SUPABASE_URL}/rest/v1/${p}`
const HEAD = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  'Content-Type': 'application/json',
}

async function rest(path, method = 'GET', body = null, extra = {}) {
  const res = await fetch(DB(path), {
    method,
    headers: { ...HEAD, ...extra },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch {}
  return { status: res.status, data, text }
}

const DB_DIR = join(__dirname, '..', 'public', 'xunji-mvp', 'db')
function loadRoutes() {
  const files = readdirSync(DB_DIR).filter((f) => f.endsWith('.json'))
  const routes = []
  for (const f of files) {
    let j
    try {
      j = JSON.parse(readFileSync(join(DB_DIR, f), 'utf8'))
    } catch (e) {
      console.warn(`⚠ 跳过（解析失败）: ${f} -> ${e.message}`)
      continue
    }
    // 只认单路线详情文件：必须有 route.slug；聚合数据(literary-routes.json 等)跳过
    if (!j?.route?.slug) {
      console.warn(`⚠ 跳过（非单路线文件，无 route.slug）: ${f}`)
      continue
    }
    routes.push(j)
  }
  return routes
}

async function upsertRoute(r) {
  const payload = {
    slug: r.route.slug,
    title: r.route.title,
    author: r.route.author ?? null,
    city: r.route.city ?? null,
    book: r.route.book ?? null,
    summary: r.route.summary ?? null,
    plain_explain: r.route.plain_explain ?? null,
    why_worth: r.route.why_worth ?? null,
    category: r.route.category ?? null,
    season: r.route.season ?? null,
    source: 'human',
  }
  if (DRY) {
    console.log(`[DRY] route ${payload.slug} | cat=${payload.category ?? '-'} season=${payload.season ?? '-'} plain=${payload.plain_explain ? 'Y' : 'n'} why=${payload.why_worth ? 'Y' : 'n'}`)
    return { id: 'dry', slug: payload.slug }
  }
  const { status, data } = await rest(
    'routes?on_conflict=slug',
    'POST',
    [payload],
    { Prefer: 'resolution=merge-duplicates' }
  )
  if (status !== 201 && status !== 200) {
    throw new Error(`upsert route ${payload.slug} failed: ${status} ${JSON.stringify(data)}`)
  }
  const got = await rest(`routes?select=id&slug=eq.${encodeURIComponent(payload.slug)}&limit=1`)
  const id = got.data?.[0]?.id
  if (!id) throw new Error(`cannot resolve id for ${payload.slug}`)
  return { id, slug: payload.slug }
}

async function syncPoints(routeId, slug, points) {
  if (DRY) {
    console.log(`[DRY]   ${points?.length ?? 0} points for ${slug}`)
    return
  }
  await rest(`points?route_id=eq.${routeId}`, 'DELETE')
  if (!points?.length) return
  const rows = points.map((p) => ({
    route_id: routeId,
    seq: p.seq,
    name: p.name,
    address: p.address ?? null,
    lng: p.lng ?? null,
    lat: p.lat ?? null,
    excerpt: p.excerpt ?? null,
    excerpt_source: p.excerpt_source ?? null,
    excerpt_confidence: p.excerpt_confidence ?? 'pending',
    interpretation: p.interpretation ?? null,
    checkin_task: p.checkin_task ?? null,
    source: 'human',
  }))
  const { status, data } = await rest('points', 'POST', rows)
  if (status !== 201 && status !== 200) {
    throw new Error(`insert points for ${slug} failed: ${status} ${JSON.stringify(data)}`)
  }
}

async function main() {
  const routes = loadRoutes()
  console.log(`loaded ${routes.length} route json files${DRY ? ' [DRY-RUN, no network]' : ''}`)
  let ok = 0
  for (const r of routes) {
    try {
      const { id, slug } = await upsertRoute(r)
      await syncPoints(id, slug, r.points)
      ok++
      console.log(`✓ ${slug}`)
    } catch (e) {
      console.error(`✗ ${r.route?.slug}: ${e.message}`)
    }
  }
  console.log(`\n完成：${ok}/${routes.length} 条路线已 upsert${DRY ? ' (dry-run，未写入)' : ''}`)
}

main()
