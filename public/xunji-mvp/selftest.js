/*
 * 本地版自检模拟器（Node）
 * 作用：在没有微信开发者工具的环境下，用 mock 的 wx / Page / getApp 真实执行页面逻辑，
 *      跑通「免费试点演示」的最短路径，并验证云端模式切换不崩。
 * 用法：node selftest.js            （本地模式：直读 data + 本地 Storage）
 *       node selftest.js --cloud    （模拟云端模式：wx.cloud.callFunction 走 mock）
 * 这不是小程序运行时代码，仅开发自检用，不进小程序包。
 */
'use strict'
const path = require('path')

const storage = {}
const calls = { toast: [], modal: [], preview: [], openLocation: [], navigateTo: [], cloud: [] }

function makeWx(cloudMode) {
  const wx = {
    getStorageSync: (k) => (k in storage ? storage[k] : ''),
    setStorageSync: (k, v) => { storage[k] = v },
    // 默认模拟「未授权定位」→ 走 fail → 演示打卡弹窗（自动确认）
    getLocation: (o) => { if (o && o.fail) o.fail({ errMsg: 'getLocation:fail auth deny (mock)' }) },
    showToast: (o) => calls.toast.push(o),
    showModal: (o) => { calls.modal.push(o); if (o && o.success) o.success({ confirm: true }) },
    openLocation: (o) => calls.openLocation.push(o),
    navigateTo: (o) => calls.navigateTo.push(o),
    previewImage: (o) => calls.preview.push(o),
    getWindowInfo: () => ({ pixelRatio: 2 }),
    // 旧版 canvas（保留兼容；cards 已迁 Canvas 2D）
    createCanvasContext: () => ({
      setFillStyle() {}, fillRect() {}, setTextAlign() {}, setFontSize() {}, fillText() {},
      draw(shouldRender, cb) { if (typeof cb === 'function') cb() }
    }),
    // Canvas 2D：selectorQuery 取 node + 2d context
    createSelectorQuery: () => ({
      select: () => ({
        fields: () => ({
          exec: (cb) => {
            const dpr = 2
            const c2d = { fillStyle: '#000', font: '', textAlign: 'left', fillRect() {}, fillText() {}, scale() {} }
            cb([{ node: { width: 300 * dpr, height: 420 * dpr, getContext: () => c2d } }])
          }
        })
      })
    }),
    canvasToTempFilePath: (o) => { if (o && o.success) o.success({ tempFilePath: 'mock://poster.png' }) },
    cloud: undefined
  }
  if (cloudMode) {
    wx.cloud = {
      callFunction: (req) => {
        calls.cloud.push({ name: req.name, data: req.data })
        if (req.name === 'getRoutes') {
          const data = require('./weapp/data/routes.js')
          return Promise.resolve({
            result: {
              poems: data.DATA.poems,
              spots: data.DATA.spots,
              routes: data.getRoutes(),
              merchants: data.DATA.merchants,
              unlockedSpotIds: ['spot_hanshan', 'spot_fengqiao']
            }
          })
        }
        if (req.name === 'checkin') {
          return Promise.resolve({ result: { ok: true, unlockedSpotIds: ['spot_hanshan', 'spot_fengqiao', req.data.spotId] } })
        }
        if (req.name === 'stats') {
          return Promise.resolve({ result: {
            participants: 5, totalCheckins: 12,
            heat: { spot_xihu: 8, spot_hanshan: 3 },
            city: { 杭州: 8, 苏州: 4 },
            merchantHeat: { m_hanshan_food: 3, m_xihu_food: 2 },
            totalMerchantVisits: 5
          } })
        }
        return Promise.resolve({ result: {} })
      }
    }
  }
  return wx
}

const cloudMode = process.argv.includes('--cloud')
global.wx = makeWx(cloudMode)
global.getApp = () => ({ globalData: { useCloud: cloudMode, cloudEnv: cloudMode ? 'mock-env' : '', version: '0.1.0', openid: 'mock-openid' } })

let pageObj = null
global.Page = (o) => { pageObj = o }
global.App = () => {}

function loadPage(rel) {
  pageObj = null
  const full = path.resolve(__dirname, rel)
  delete require.cache[full]
  require(full)
  if (!pageObj) throw new Error('页面未注册 Page(): ' + rel)
  return pageObj
}
function freshCtx(obj) {
  const ctx = { data: JSON.parse(JSON.stringify(obj.data)), setData(patch) { Object.assign(this.data, patch) }, _obj: obj }
  Object.keys(obj).forEach((k) => { if (typeof obj[k] === 'function') ctx[k] = obj[k].bind(ctx) })
  return ctx
}
const flush = () => new Promise((r) => setImmediate(r))

let pass = 0, fail = 0
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg) } else { fail++; console.log('  ✗ FAIL: ' + msg) } }
function section(t) { console.log('\n=== ' + t + ' ===') }

async function main() {
  // ---------- 1. 数据完整性 ----------
  section('1. 数据完整性校验')
  const dataMod = require('./weapp/data/routes.js')
  const D = dataMod.DATA
  const spotIds = new Set(D.spots.map(s => s.id))
  const poemIds = new Set(D.poems.map(p => p.id))
  ok(D.routes.length === 10, 'routes = 10（期望10）实际 ' + D.routes.length)
  ok(D.spots.length === 20, 'spots = 20（期望20）实际 ' + D.spots.length)
  let brokenRef = 0, noCoord = 0, dupSpot = 0
  D.routes.forEach(r => {
    if (!poemIds.has(r.poem_id)) brokenRef++
    const local = new Set()
    r.route_spots.forEach(rs => {
      if (!spotIds.has(rs.spot_id)) brokenRef++
      const sp = dataMod.getSpot(rs.spot_id)
      if (!sp || typeof sp.lat !== 'number' || typeof sp.lng !== 'number') noCoord++
      if (local.has(rs.spot_id)) dupSpot++
      local.add(rs.spot_id)
    })
  })
  ok(brokenRef === 0, '所有 route.poem_id / route_spots.spot_id 都能解析（坏引用=' + brokenRef + '）')
  ok(noCoord === 0, '所有被引用景点都有数值坐标（缺坐标=' + noCoord + '）')
  ok(dupSpot === 0, '同一路线内无重复景点（重复=' + dupSpot + '）')

  // 商户联动：merchants 数据完整性
  const merchants = D.merchants || []
  ok(merchants.length >= 8, 'merchants ≥ 8（期望≥8）实际 ' + merchants.length)
  let badMerchant = 0
  merchants.forEach(function (m) {
    if (!spotIds.has(m.near_spot)) badMerchant++
    if (typeof m.reward !== 'number') badMerchant++
    if (typeof m.lat !== 'number' || typeof m.lng !== 'number') badMerchant++
    if (!m.city) badMerchant++
  })
  ok(badMerchant === 0, '所有 merchant 的 near_spot 能解析、有数值坐标/reward/city（坏=' + badMerchant + '）')

  // ---------- 2. geo ----------
  section('2. 地理距离计算')
  const geo = require('./weapp/utils/geo.js')
  ok(geo.haversine(31.317, 120.586, 31.317, 120.586) === 0, '同一点距离=0')
  const d = geo.haversine(31.317, 120.586, 31.319, 120.583)
  ok(d > 100 && d < 500, '寒山寺↔枫桥 间距 100~500m（实际 ' + Math.round(d) + 'm）')

  // ---------- 3. 首页（经 service 取数） ----------
  section('3. 首页列表 + 搜索（service 取数）')
  const indexObj = loadPage('./weapp/pages/index/index.js')
  const idx = freshCtx(indexObj)
  idx.onLoad()
  await flush()
  ok(idx.data.routes.length === 10, '首页默认列出全部 10 条路线')
  idx.onKeyword({ detail: { value: '苏轼' } })
  ok(idx.data.routes.length >= 1, '搜「苏轼」命中≥1条（实际 ' + idx.data.routes.length + '）')
  idx.onKeyword({ detail: { value: '苏州' } })
  ok(idx.data.routes.length >= 1, '搜「苏州」（按城市）命中≥1条（实际 ' + idx.data.routes.length + '）')
  idx.onKeyword({ detail: { value: '不存在xyz' } })
  ok(idx.data.routes.length === 0, '搜无关键“不存在xyz”返回空列表')

  // ---------- 4. 路线页（经 service 取数 + 打卡） ----------
  section('4. 路线页加载 + 打卡（service）')
  const routeObj = loadPage('./weapp/pages/route/route.js')
  const rt = freshCtx(routeObj)
  rt.onLoad({ id: 'route_fengqiao' })
  await flush()
  ok(rt.data.spots.length === 3, 'route_fengqiao 加载出 3 个景点')
  ok(rt.data.markers.length === 3, '地图 markers = 3')
  ok(typeof rt.data.center.lat === 'number', '地图中心有数值坐标')
  const rtBad = freshCtx(routeObj)
  rtBad.onLoad({ id: 'route_not_exist' })
  await flush()
  ok(calls.toast.some(t => /路线不存在/.test(t.title || '')), '加载不存在路线时 toast 提示')

  const rt2 = freshCtx(routeObj)
  rt2.onLoad({ id: 'route_fengqiao' })
  await flush()
  const targetIdx = rt2.data.spots.findIndex((s) => !s.unlocked)
  ok(targetIdx >= 0, '存在未解锁景点可用于打卡测试（idx=' + targetIdx + '）')
  const before = rt2.data.unlockedCount
  rt2.checkin({ currentTarget: { dataset: { idx: String(targetIdx) } } })
  await flush()
  ok(rt2.data.unlockedCount === before + 1, '打卡后 unlockedCount +1（' + before + '→' + rt2.data.unlockedCount + '）')
  ok(rt2.data.spots[targetIdx].unlocked === true, '该景点标记已解锁')

  // 商户联动：route 页带出周边好店 + 标记到店
  const rtM = freshCtx(routeObj)
  rtM.onLoad({ id: 'route_fengqiao' })
  await flush()
  ok(rtM.data.merchants.length >= 1, 'route_fengqiao 带出周边好店（' + rtM.data.merchants.length + ' 家）')
  const mid = rtM.data.merchants[0].merchantId
  if (cloudMode) {
    const beforeCloud = calls.cloud.filter(function (c) { return c.name === 'checkin' && c.data && c.data.merchantId }).length
    rtM.visitMerchant({ currentTarget: { dataset: { mid: mid } } })
    await flush()
    const afterCloud = calls.cloud.filter(function (c) { return c.name === 'checkin' && c.data && c.data.merchantId }).length
    ok(afterCloud === beforeCloud + 1, '云端：标记到店触发带 merchantId 的 checkin 调用')
  } else {
    const beforeVisits = (storage['xunji_merchant_visits'] || []).length
    rtM.visitMerchant({ currentTarget: { dataset: { mid: mid } } })
    await flush()
    const afterVisits = (storage['xunji_merchant_visits'] || []).length
    ok(afterVisits === beforeVisits + 1, '本地：标记到店后商户到店记录 +1（' + beforeVisits + '→' + afterVisits + '）')
  }
  ok(rtM.data.merchants[0].visited === true, '该商户标记已到店（前端状态）')

  // ---------- 5. 我的卡片 ----------
  section('5. 我的卡片墙（service）')
  const cardsObj = loadPage('./weapp/pages/cards/cards.js')
  const cd = freshCtx(cardsObj)
  cd.onShow()
  await flush()
  ok(cd.data.unlocked >= 1, '卡片墙包含已解锁卡片（' + cd.data.unlocked + ' 张）')
  cd.generatePoster()
  ok(calls.preview.length >= 1, '生成海报调用了 previewImage')

  // ---------- 6. 数据面板 ----------
  section('6. B端数据面板聚合（service）')
  const dashObj = loadPage('./weapp/pages/dashboard/dashboard.js')
  const ds = freshCtx(dashObj)
  ds.onShow()
  await flush()
  ok(ds.data.totalRoutes === 10, '面板“上线路线”=10')
  ok(ds.data.totalSpots === 20, '面板“景点位点”=20')
  ok(ds.data.participants > 0, '面板有累计参与人数（' + ds.data.participants + '）')
  if (cloudMode) {
    ok(ds.data.isReal === true, '云端模式：isReal=true（真实统计）')
    ok(ds.data.participants === 5, '云端真实参与人数=5（来自 stats 云函数）')
    ok(ds.data.totalCheckins === 12, '云端真实累计打卡=12')
    ok(ds.data.heat.length === 2, '云端真实热点榜=2 条（聚合自 checkins）')
  } else {
    ok(ds.data.isReal === false, '本地模式：isReal=false（模拟兜底）')
    ok(ds.data.heat.length === 20, '热点榜聚合 20 个景点（模拟）')
  }
  ok(ds.data.heat[0].rank === 1, '热点榜按 count 降序，榜首 rank=1')
  ok(ds.data.maxHeat >= 1, 'maxHeat 已计算（' + ds.data.maxHeat + '）用于相对比例')

  // 商户联动看板
  if (cloudMode) {
    ok(ds.data.merchantVisits === 5, '云端真实商户到店=5（来自 stats.merchantHeat）')
    ok(ds.data.merchantReward > 0, '云端分润估算>0（' + ds.data.merchantReward + '元）')
  } else {
    ok(ds.data.merchantVisits >= 1, '本地商户到店≥1（本地记录，' + ds.data.merchantVisits + '）')
    ok(ds.data.merchantReward > 0, '本地分润估算>0（' + ds.data.merchantReward + '元）')
  }
  ok(ds.data.merchantRank.length >= 1, '面板商户排行≥1 条')

  // ---------- 7. 云端模式切换验证 ----------
  section('7. 云端模式调用校验')
  const svc = require('./weapp/utils/service.js')
  ok(svc.cloudEnabled() === cloudMode, 'cloudEnabled() = ' + cloudMode)
  if (cloudMode) {
    ok(calls.cloud.some(c => c.name === 'getRoutes'), '请求过 getRoutes 云函数')
    ok(calls.cloud.some(c => c.name === 'checkin'), '请求过 checkin 云函数')
    ok(calls.cloud.some(c => c.name === 'stats'), '请求过 stats 云函数')
    ok(calls.cloud.some(c => c.name === 'checkin' && c.data && c.data.city), 'checkin 云函数携带了 city（供 B 端真实统计）')
  }

  const modeLabel = cloudMode ? '云端模式(模拟)' : '本地模式'
  console.log('\n========== 自检结果（' + modeLabel + '）==========')
  console.log('通过 ' + pass + ' / 失败 ' + fail)
  if (fail > 0) { console.log('有失败项，需修复'); process.exit(1) }
  console.log('全部通过 ✅')
}

main().catch(e => { console.error('自检异常：', e); process.exit(2) })
