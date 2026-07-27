// 统一数据 / 打卡服务层
// 设计：页面只调用本模块，不直接 require 数据层 / store，便于在「本地模式 ↔ 云端模式」间切换。
// - 本地模式（useCloud=false，默认）：直读 data/routes.js + 本地 Storage，游客模式即跑、零依赖。
// - 云端模式（useCloud=true）：走微信云开发。数据来自 getRoutes 云函数，打卡来自 checkin 云函数。
//   需自有 AppID + 已开通云环境，详见 cloudfunctions/README.md。
const localData = require('../data/routes.js')
const store = require('./store.js')

function cloudEnabled() {
  try {
    const app = getApp()
    return !!(app && app.globalData && app.globalData.useCloud)
  } catch (e) { return false }
}

let _cache = null // 云端模式缓存最近一次 getRoutes 结果（含 unlockedSpotIds）

// 拉取全量数据：{ poems, spots, routes, merchants, unlockedSpotIds }
function fetchData() {
  if (!cloudEnabled()) {
    return Promise.resolve({
      poems: localData.DATA.poems,
      spots: localData.DATA.spots,
      routes: localData.getRoutes(),
      merchants: localData.DATA.merchants || [],
      unlockedSpotIds: store.getUnlocked()
    })
  }
  return wx.cloud.callFunction({ name: 'getRoutes' }).then(function (res) {
    _cache = res.result || {}
    return _cache
  })
}

// 打卡：云端走 checkin 云函数（返回最新 unlockedSpotIds）；本地写 Storage。
// city 为打卡景点所在城市，供 B 端真实统计（stats 云函数）按城市聚合，本地模式忽略。
function checkin(routeId, spotId, city) {
  if (!cloudEnabled()) {
    store.unlock(spotId)
    return Promise.resolve({ ok: true, local: true, unlockedSpotIds: store.getUnlocked() })
  }
  return wx.cloud.callFunction({
    name: 'checkin',
    data: { routeId: routeId, spotId: spotId, city: city || '' }
  }).then(function (res) {
    const r = res.result || {}
    if (_cache) _cache.unlockedSpotIds = r.unlockedSpotIds || []
    return r
  })
}

// 商户联动：标记「到店」。本地写 Storage（merchantVisits）；云端走 checkin 云函数并带 merchantId。
// 返回 { ok, local, count }（count=截至当前的到店记录数），供页面/看板刷新。
function visitMerchant(merchantId, spotId, city) {
  if (!cloudEnabled()) {
    const list = store.recordMerchantVisit(merchantId, spotId, city)
    return Promise.resolve({ ok: true, local: true, count: list.length })
  }
  return wx.cloud.callFunction({
    name: 'checkin',
    data: { merchantId: merchantId, merchantCity: city || '', spotId: spotId || '', city: city || '' }
  }).then(function (res) {
    const r = res.result || {}
    return { ok: r.ok !== false, count: (r.merchantVisits) || 0 }
  })
}

// B 端真实统计：云端走 stats 云函数（参与人数/总打卡/各景点热力/各城市分布/商户到访）；
// 本地模式无后端，返回 null，由页面用模拟数据 + 本地商户到店记录兜底。
function fetchStats() {
  if (!cloudEnabled()) return Promise.resolve(null)
  return wx.cloud.callFunction({ name: 'stats' }).then(function (res) {
    return res.result || null
  })
}

module.exports = {
  fetchData: fetchData,
  checkin: checkin,
  visitMerchant: visitMerchant,
  fetchStats: fetchStats,
  cloudEnabled: cloudEnabled
}
