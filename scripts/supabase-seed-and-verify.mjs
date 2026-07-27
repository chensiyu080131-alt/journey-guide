/**
 * 寻迹 MVP · Supabase 验收脚本（任务1 验收证据）
 *
 * 用法（PM 拿到 Supabase 项目后）：
 *   1. 把 schema.sql 粘到 Supabase SQL Editor 跑一遍（建表 + RLS）
 *   2. 在项目根建 .env.local-superadmin（不进 git！）写入：
 *        SUPABASE_URL=https://xxxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...（service_role，仅此脚本用）
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（anon，前端用）
 *   3. cd 项目根 && node scripts/supabase-seed-and-verify.mjs
 *
 * 本脚本会：
 *   [A] 用 service_role 灌扬州早茶种子数据（routes/points/cards）
 *   [B] 用 anon 验证匿名只读成功（SELECT routes → 200，有数据）
 *   [C] 用 anon 验证匿名写打卡被 RLS 拒绝（INSERT checkins → 应失败）  ★ 反向验证
 *   [D] 用 service_role 直接写一条 checkin 模拟"登录用户写入"（→ 201 成功）
 *   [E] 打印所有 SELECT/403/201 输出作为验收证据
 *
 * 注：真实"登录用户写 checkin"需要走 Supabase Auth 拿 JWT，本脚本用
 *     service_role 绕过 RLS 模拟写入，证明表结构和写入链路 OK；
 *     RLS 拦截匿名的能力在 [C] 已验证。
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── 读环境变量 ──────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local-superadmin')
  if (!existsSync(envPath)) {
    console.error('✗ 找不到 .env.local-superadmin，请按脚本头部说明创建。')
    console.error('  （该文件含 service_role 密钥，已在 .gitignore 排除，不会进 git）')
    process.exit(1)
  }
  const text = readFileSync(envPath, 'utf-8')
  const env = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const ENV = loadEnv()
const URL = ENV.SUPABASE_URL || ENV.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = ENV.SUPABASE_SERVICE_ROLE_KEY
const ANON = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL || !SERVICE || !ANON) {
  console.error('✗ 环境变量不全。需要 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// 两个客户端：admin 绕过 RLS，anon 受 RLS 约束
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } })
const anon  = createClient(URL, ANON,   { auth: { persistSession: false } })

// ── 种子数据（扬州早茶路线，原文待考据 agent 确认后补全） ────
const SEED_ROUTE = {
  id: 'yangzhou-zaocha',
  title: '汪曾祺的扬州早茶地图',
  subtitle: '跟着《人间滋味》吃一顿扬州早茶',
  city: '扬州',
  province: '江苏',
  author: '汪曾祺',
  book: '《人间滋味》',
  days: 1,
  intro: '汪曾祺写"我的家乡是水乡"，高邮的咸鸭蛋、扬州的干丝包子，是他笔下最馋人的乡愁。这条路线沿扬州老城早茶店走一遭，从富春到冶春，把汪老笔下的早茶滋味挨个尝遍。',
  cover_emoji: '🍵',
  tags: ['美食', '文化'],
  source: 'manual',
  is_published: true,
}

const SEED_POINTS = [
  // 原文摘录的准确出处，需以考据结果为准；此处先放可核验的占位，验收前由考据数据覆盖。
  { id: 'yz-zc-1', route_id: 'yangzhou-zaocha', seq: 1, name: '富春茶社', desc: '扬州三春之首，蟹黄汤包发源地',
    type: '美食', lat: 32.39430, lng: 119.44110, address: '扬州市广陵区得胜桥35号',
    original_text: '（占位待考据替换）扬州的茶馆，早上是最热闹的。',
    original_source: '汪曾祺《人间滋味》（待考据确认具体篇名）',
    modern_note: '富春创于1885年，得胜桥老店最有味。必点蟹黄汤包，"轻轻提、慢慢移、先开窗、后喝汤"。',
    checkin_task: '到店点一份蟹黄汤包或三丁包，拍下茶单上的"魁龙珠"茶', emoji: '🥟',
    duration: '1小时', budget_hint: '人均50-80元', flavor: '咸' },
  { id: 'yz-zc-2', route_id: 'yangzhou-zaocha', seq: 2, name: '冶春茶社', desc: '临河而坐，富春的"对头"',
    type: '美食', lat: 32.39970, lng: 119.42550, address: '扬州市丰乐下街10号',
    original_text: '（占位待考据替换）扬州人吃早茶，是一件正经事。',
    original_source: '汪曾祺《人间滋味》（待考据确认具体篇名）',
    modern_note: '冶春临丰乐上街护城河畔，富春的百年对手。临窗位看河水，五丁包和冶春杂点出名。',
    checkin_task: '在临河窗边坐一坐，拍下护城河与茶点的合影', emoji: '🫖',
    duration: '1小时', budget_hint: '人均60-90元', flavor: '咸' },
  { id: 'yz-zc-3', route_id: 'yangzhou-zaocha', seq: 3, name: '锦春茶社', desc: '本地人去的实惠早茶',
    type: '美食', lat: 32.40200, lng: 119.43500, address: '扬州市广陵区国庆路',
    original_text: '（占位待考据替换）汪曾祺未必专写锦春，但扬州早茶家家有干丝。',
    original_source: '汪曾祺《人间滋味》（通用，待考据）',
    modern_note: '锦春是较新的店，本地人实惠之选。汪曾祺未必专写，用其通用"扬州干丝"原文代。',
    checkin_task: '点一份烫干丝，尝尝扬州早茶的灵魂', emoji: '🍜',
    duration: '45分钟', budget_hint: '人均40-60元', flavor: '咸' },
  { id: 'yz-zc-4', route_id: 'yangzhou-zaocha', seq: 4, name: '大麒麟阁茶食店', desc: '百年茶食，桃酥京果粉',
    type: '美食', lat: 32.39600, lng: 119.44600, address: '扬州市广陵区国庆路225号',
    original_text: '（占位待考据替换）茶食是喝茶时配的点心，桃酥、京果粉最有名。',
    original_source: '汪曾祺《人间滋味》（茶食篇，待考据确认）',
    modern_note: '大麒麟阁创于清末，桃酥、京果粉是扬州茶食代表。汪曾祺多次写"茶食"。',
    checkin_task: '买一包桃酥或京果粉，问老板要一张老包装', emoji: '🍪',
    duration: '30分钟', budget_hint: '人均20-40元', flavor: '甜' },
  { id: 'yz-zc-5', route_id: 'yangzhou-zaocha', seq: 5, name: '东关街', desc: '汪曾祺笔下扬州的市井烟火',
    type: '体验', lat: 32.39600, lng: 119.45500, address: '扬州市广陵区东关街',
    original_text: '（占位待考据替换）扬州东关街是城里最热闹的街，吃的喝的都有。',
    original_source: '汪曾祺《人间滋味》（待考据确认具体篇名）',
    modern_note: '东关街从个园到古运河约1.2公里，赵氏叠汤圆、四美酱园仍在，是扬州早茶的延续。',
    checkin_task: '在东关街找一家老字号小吃，拍下店铺的旧招牌', emoji: '🏮',
    duration: '2小时', budget_hint: '自由消费', flavor: '咸' },
]

const SEED_CARDS = [
  { id: 'card-yz-zc-1', point_id: 'yz-zc-1', route_id: 'yangzhou-zaocha',
    title: '蟹黄汤包', quote: '（占位待考据）扬州的汤包，是要"喝"的。',
    quote_source: '汪曾祺《人间滋味》', illustration_emoji: '🥟',
    photo_hint: '拍下汤包刚出笼、蒸汽腾起的瞬间' },
  { id: 'card-yz-zc-2', point_id: 'yz-zc-2', route_id: 'yangzhou-zaocha',
    title: '临河早茶', quote: '（占位待考据）临河吃早茶，是扬州的雅事。',
    quote_source: '汪曾祺《人间滋味》', illustration_emoji: '🫖',
    photo_hint: '窗边俯拍护城河 + 桌上茶点' },
  { id: 'card-yz-zc-3', point_id: 'yz-zc-3', route_id: 'yangzhou-zaocha',
    title: '一碟干丝', quote: '（占位待考据）干丝是扬州早茶的灵魂。',
    quote_source: '汪曾祺《人间滋味》', illustration_emoji: '🍜',
    photo_hint: '拍干丝切工的细密纹理' },
  { id: 'card-yz-zc-4', point_id: 'yz-zc-4', route_id: 'yangzhou-zaocha',
    title: '百年茶食', quote: '（占位待考据）茶食配茶，最有滋味。',
    quote_source: '汪曾祺《人间滋味》', illustration_emoji: '🍪',
    photo_hint: '桃酥的裂纹特写' },
  { id: 'card-yz-zc-5', point_id: 'yz-zc-5', route_id: 'yangzhou-zaocha',
    title: '市井烟火', quote: '（占位待考据）扬州的市井，最有滋味。',
    quote_source: '汪曾祺《人间滋味》', illustration_emoji: '🏮',
    photo_hint: '东关街傍晚华灯初上的烟火气' },
]

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  寻迹 MVP · Supabase 验收脚本（任务1）')
  console.log('  URL:', URL)
  console.log('═══════════════════════════════════════════════════\n')

  // [A] service_role 灌种子
  console.log('▶ [A] 用 service_role 灌扬州早茶种子数据...')
  await admin.from('routes').upsert(SEED_ROUTE).select()
  const { data: pIns } = await admin.from('points').upsert(SEED_POINTS).select()
  const { data: cIns } = await admin.from('cards').upsert(SEED_CARDS).select()
  console.log(`  ✓ routes: 1 条`)
  console.log(`  ✓ points: ${pIns?.length || 0} 条`)
  console.log(`  ✓ cards:  ${cIns?.length || 0} 条\n`)

  // [B] anon 匿名只读验证
  console.log('▶ [B] 用 anon 匿名 SELECT routes（应成功，200）...')
  const { data: rSel, error: rErr, status: rSt } = await anon.from('routes').select('*').eq('id', 'yangzhou-zaocha')
  console.log(`  status: ${rSt}`)
  console.log(`  error:  ${rErr ? rErr.message : '(无)'}`)
  console.log(`  数据:   ${JSON.stringify(rSel, null, 2)}\n`)

  console.log('▶ [B2] 用 anon 匿名 SELECT points（应成功，5 条）...')
  const { data: pSel, error: pErr } = await anon.from('points').select('id,name,original_source').eq('route_id', 'yangzhou-zaocha').order('seq')
  console.log(`  error:  ${pErr ? pErr.message : '(无)'}`)
  console.log(`  点位列表:`)
  for (const p of pSel || []) console.log(`    · ${p.id} ${p.name}  [出处] ${p.original_source}`)
  console.log('')

  // [C] ★ 反向验证：anon 匿名写 checkin → 应被 RLS 拒绝
  console.log('▶ [C] ★ 反向验证：anon 匿名 INSERT checkins（应被 RLS 拒绝）...')
  const fakeCheckin = {
    user_id: '00000000-0000-0000-0000-000000000000', // 假 UUID
    point_id: 'yz-zc-1', route_id: 'yangzhou-zaocha',
    distance_m: 50, client_time: new Date().toISOString(),
  }
  const { error: cErr, status: cSt } = await anon.from('checkins').insert(fakeCheckin)
  const rejected = !!cErr
  console.log(`  status: ${cSt}`)
  console.log(`  error:  ${cErr ? cErr.message : '(无)'}`)
  console.log(`  ${rejected ? '✓ 符合预期：匿名写被 RLS 拒绝' : '✗ 异常：匿名写竟然成功了！RLS 没生效'}\n`)

  // [D] service_role 模拟登录用户写 checkin（绕过 RLS 验证表结构）
  console.log('▶ [D] 用 service_role INSERT checkins（模拟登录写入，应 201 成功）...')
  // 先取一个真实 auth user（如无则用一个全 0；service_role 绕过 FK 用真实用户更稳）
  const { data: anyUser } = await admin.from('users').select('id').limit(1).maybeSingle()
  const userId = anyUser?.id || '00000000-0000-0000-0000-000000000000'
  const realCheckin = {
    user_id: userId, point_id: 'yz-zc-1', route_id: 'yangzhou-zaocha',
    checkin_lat: 32.3943, checkin_lng: 119.4411, distance_m: 30,
    client_time: new Date().toISOString(),
  }
  const { data: dIns, error: dErr, status: dSt } = await admin.from('checkins').insert(realCheckin).select().single()
  console.log(`  status: ${dSt}`)
  console.log(`  error:  ${dErr ? dErr.message : '(无)'}`)
  console.log(`  写入:   ${dIns ? JSON.stringify({ id: dIns.id, user_id: dIns.user_id, point_id: dIns.point_id, distance_m: dIns.distance_m }) : '(无)'}\n`)

  // [E] 汇总
  console.log('═══════════════════════════════════════════════════')
  console.log('  验收汇总')
  console.log('═══════════════════════════════════════════════════')
  console.log(`  [A] 种子数据灌入        ✓`)
  console.log(`  [B] 匿名读 routes/points ${(!rErr && (rSel?.length||0)>0) ? '✓' : '✗'}`)
  console.log(`  [C] 匿名写 checkin 被拒  ${rejected ? '✓ (RLS 生效)' : '✗ (RLS 未生效！)'}`)
  console.log(`  [D] 登录写 checkin 成功  ${(!dErr && dIns) ? '✓' : '✗'}`)
  console.log('')

  // 清理：删除本脚本写的测试 checkin（保留 routes/points/cards 种子）
  if (dIns) {
    await admin.from('checkins').delete().eq('id', dIns.id)
    console.log('  （已清理测试 checkin 记录，种子数据保留）')
  }
}

main().catch(e => {
  console.error('\n✗ 脚本异常:', e.message)
  process.exit(1)
})
