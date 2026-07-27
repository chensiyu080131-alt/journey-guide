/**
 * 打卡 GPS 距离判定 · 单元测试（任务4 反向验证的逻辑层）
 *
 * 任务文档要求（反向验证）：
 *   "伪造 GPS 位置到点位附近打卡→成功；改到远处打卡→失败，证明 GPS 验证真的在跑"
 *
 * 桌面浏览器无真机 GPS，UI 层的伪造打卡需 PM 用 Chrome DevTools Sensors 实测截图；
 * 这里覆盖纯函数 haversineMeters 的逻辑层验收 —— 用富春茶社真实坐标，
 * 模拟"近/远"多个位置，证明距离判定生效。
 *
 * 注：本脚本自包含 haversine 公式（与 lib/checkin.ts 同源同实现），
 * 不依赖 ts 编译，node 直跑：node scripts/test-checkin-logic.mjs
 */

// ── 与 lib/checkin.ts 完全一致的实现（保持同步） ──
const CHECKIN_RADIUS_M = 100

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 富春茶社真实坐标（高德 POI B0FFFEIFQ7）
const FUCHUN = { lat: 32.390616, lng: 119.442174 }

let pass = 0, fail = 0
function assert(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name}  ${detail}`) }
}

console.log('═══════════════════════════════════════════════')
console.log('  打卡 GPS 距离判定 · 任务4 反向验证（逻辑层）')
console.log(`  打卡半径: ${CHECKIN_RADIUS_M} 米 | 基准点: 富春茶社 ${FUCHUN.lat},${FUCHUN.lng}`)
console.log('  （公式与 lib/checkin.ts 同源，改一处需同步另一处）')
console.log('═══════════════════════════════════════════════\n')

console.log('▶ 用例 1：同一坐标（人在店里）→ 距离 0，应允许打卡')
const d0 = haversineMeters(FUCHUN.lat, FUCHUN.lng, FUCHUN.lat, FUCHUN.lng)
assert('距离 = 0 米', d0 === 0, `实际 ${d0}`)
assert('0 ≤ 100 → 允许打卡', d0 <= CHECKIN_RADIUS_M)

console.log('\n▶ 用例 2：附近约 50 米（同一条街）→ 应允许打卡')
const near = { lat: FUCHUN.lat, lng: FUCHUN.lng + 0.0005 }
const d1 = haversineMeters(FUCHUN.lat, FUCHUN.lng, near.lat, near.lng)
assert(`距离 ≈ ${d1.toFixed(1)} 米（应在 40-70）`, d1 > 30 && d1 < 70, `实际 ${d1}`)
assert(`${d1.toFixed(1)} ≤ 100 → 允许打卡`, d1 <= CHECKIN_RADIUS_M)

console.log('\n▶ 用例 3：大麒麟阁（富春隔壁）→ 距离应 < 150 米')
// 大麒麟阁 32.390087,119.441435（高德 POI B0202018GB）
const d2 = haversineMeters(FUCHUN.lat, FUCHUN.lng, 32.390087, 119.441435)
assert(`富春 → 大麒麟阁 ≈ ${d2.toFixed(1)} 米`, d2 < 150, `实际 ${d2}`)
assert(`距离 ≤ 100 → 允许打卡（两家店相邻）`, d2 <= CHECKIN_RADIUS_M, `实际 ${d2.toFixed(1)}`)

console.log('\n▶ ★ 用例 4：冶春茶社（瘦西湖边，富春 2km+ 外）→ 应拒绝打卡')
// 冶春 32.410500,119.418000
const d3 = haversineMeters(FUCHUN.lat, FUCHUN.lng, 32.410500, 119.418000)
assert(`富春 → 冶春 ≈ ${(d3 / 1000).toFixed(2)} km`, d3 > 1000, `实际 ${d3}`)
assert(`★ ${Math.round(d3)} 米 > 100 → 拒绝打卡（GPS 验证生效）`, d3 > CHECKIN_RADIUS_M)

console.log('\n▶ ★ 用例 5：伪造到北京（彻底异地）→ 应拒绝打卡')
const d4 = haversineMeters(FUCHUN.lat, FUCHUN.lng, 39.9042, 116.4074)
assert(`富春 → 北京 ≈ ${(d4 / 1000).toFixed(0)} km`, d4 > 100000, `实际 ${d4}`)
assert(`★ 距离 > 100 → 拒绝打卡`, d4 > CHECKIN_RADIUS_M)

console.log('\n▶ 用例 6：东关街（富春以东约 1.2km）→ 应拒绝（不在同一点位范围）')
const d5 = haversineMeters(FUCHUN.lat, FUCHUN.lng, 32.396000, 119.455000)
assert(`富春 → 东关街 ≈ ${(d5).toFixed(0)} 米`, d5 > 800 && d5 < 2000, `实际 ${d5}`)
assert(`距离 > 100 → 拒绝打卡（点位独立验证）`, d5 > CHECKIN_RADIUS_M)

console.log('\n═══════════════════════════════════════════════')
console.log(`  结果: ${pass} 通过 / ${fail} 失败`)
console.log('═══════════════════════════════════════════════')
if (fail > 0) {
  console.log('\n✗ GPS 距离判定逻辑有问题，需修复')
  process.exit(1)
} else {
  console.log('\n✓ GPS 距离判定逻辑正确：近允许、远拒绝，任务4 反向验证（逻辑层）通过')
}
