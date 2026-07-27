// B 端数据面板
// 云端模式：service.fetchStats() 返回真实统计（参与人数 / 总打卡 / 各景点热力 / 各城市分布）。
// 本地模式 或 云函数不可用：用 MOCK 数据演示，页面顶部标「演示」。
const service = require('../../utils/service.js')

// —— 以下为本地模拟数据，用于 demo 与给景区 / 文旅局演示 ——
const MOCK_PARTICIPANTS = 1286
const MOCK_CITY = [
  { city: '苏州', pct: 22 }, { city: '杭州', pct: 19 }, { city: '南京', pct: 17 },
  { city: '武汉', pct: 12 }, { city: '南昌', pct: 9 }, { city: '其他', pct: 21 }
]
const MOCK_AGE = [
  { age: '18-25', pct: 28 }, { age: '26-35', pct: 41 }, { age: '36-45', pct: 19 }, { age: '46+', pct: 12 }
]
const MOCK_HEAT = {
  spot_hanshan: 320, spot_fengqiao: 280, spot_huanghelou: 410, spot_tengwangge: 260,
  spot_xihu: 520, spot_sudi: 300, spot_xianglu: 180, spot_sandie: 150,
  spot_qinhuai: 360, spot_fuzimiao: 340, spot_wuyi: 210, spot_gongyuan: 190,
  spot_baidi: 290, spot_gushan: 240, spot_guanque: 170, spot_pujin: 120,
  spot_shouxihu: 230, spot_guazhou: 140, spot_shantang: 160, spot_qingchuan: 150
}

Page({
  data: {
    participants: 0, totalRoutes: 0, totalSpots: 0, myCheckins: 0, totalCheckins: 0,
    heat: [], maxHeat: 1, city: [], age: [], isReal: false
  },
  onShow() {
    const self = this
    service.fetchData().then(function (d) { self.build(d) })
  },
  build(d) {
    const self = this
    const routes = d.routes
    const totalSpots = routes.reduce(function (n, r) { return n + r.route_spots.length }, 0)
    const unlockedSet = d.unlockedSpotIds || []
    const nameOf = {}
    const cityOf = {}
    d.spots.forEach(function (s) { nameOf[s.id] = s.name; cityOf[s.id] = s.city })

    // 本地兜底热力（含本人已打卡 +1，便于 demo 看到差异）
    const heat = []
    routes.forEach(function (r) {
      r.route_spots.forEach(function (rs) {
        const base = MOCK_HEAT[rs.spot_id] || 0
        const mine = unlockedSet.indexOf(rs.spot_id) > -1 ? 1 : 0
        heat.push({ name: nameOf[rs.spot_id] || rs.spot_id, city: cityOf[rs.spot_id] || '', count: base + mine, mine: mine })
      })
    })
    heat.sort(function (a, b) { return b.count - a.count })
    heat.forEach(function (h, i) { h.rank = i + 1 })
    const maxHeat = heat.length ? heat[0].count : 1
    const mockTotal = heat.reduce(function (n, h) { return n + h.count }, 0)

    const mock = {
      participants: MOCK_PARTICIPANTS,
      totalRoutes: routes.length,
      totalSpots: totalSpots,
      myCheckins: unlockedSet.length,
      totalCheckins: mockTotal,
      heat: heat,
      maxHeat: maxHeat,
      city: MOCK_CITY,
      age: MOCK_AGE,
      isReal: false
    }

    // 云端真实统计：聚合自 checkins 集合；拿不到则退回模拟
    service.fetchStats().then(function (stats) {
      if (!stats) { self.setData(mock); return }
      const realHeat = []
      Object.keys(stats.heat || {}).forEach(function (spotId) {
        realHeat.push({ name: nameOf[spotId] || spotId, city: cityOf[spotId] || '', count: stats.heat[spotId], mine: 0 })
      })
      realHeat.sort(function (a, b) { return b.count - a.count })
      realHeat.forEach(function (h, i) { h.rank = i + 1 })
      const realMax = realHeat.length ? realHeat[0].count : 1

      const cityArr = Object.keys(stats.city || {}).map(function (c) { return { city: c, raw: stats.city[c] } })
      const cityTotal = cityArr.reduce(function (n, x) { return n + x.raw }, 0) || 1
      cityArr.forEach(function (x) { x.pct = Math.round(x.raw / cityTotal * 100) })
      cityArr.sort(function (a, b) { return b.pct - a.pct })

      self.setData({
        participants: stats.participants,
        totalCheckins: stats.totalCheckins,
        heat: realHeat.length ? realHeat : heat,
        maxHeat: realHeat.length ? realMax : maxHeat,
        city: cityArr.length ? cityArr.map(function (x) { return { city: x.city, pct: x.pct } }) : MOCK_CITY,
        age: MOCK_AGE,
        totalRoutes: routes.length,
        totalSpots: totalSpots,
        myCheckins: unlockedSet.length,
        isReal: true
      })
    }).catch(function () { self.setData(mock) })
  }
})
