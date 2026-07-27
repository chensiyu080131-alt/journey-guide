const service = require('../../utils/service.js')
const geo = require('../../utils/geo.js')
const store = require('../../utils/store.js')

const CHECKIN_RADIUS = 200 // 米：进入景点 200m 内允许 GPS 打卡（可调）

Page({
  data: {
    routeId: '',
    routeTitle: '',
    poemBody: '',
    poemTitle: '',
    center: { lat: 31.317, lng: 120.586 },
    markers: [],
    spots: [],
    total: 0,
    unlockedCount: 0
  },

  _d: null, // 全量数据缓存（来自 service）

  onLoad(opt) {
    const self = this
    service.fetchData().then(function (d) {
      self._d = d
      self.load(opt && opt.id ? opt.id : '')
    })
  },

  load(id) {
    const d = this._d
    if (!d) return
    const route = d.routes.find(function (r) { return r.id === id })
    if (!route) {
      wx.showToast({ title: '路线不存在', icon: 'none' })
      return
    }
    const poem = (d.poems.find(function (p) { return p.id === route.poem_id }) || {})
    const unlockedSet = d.unlockedSpotIds || []

    const spots = route.route_spots.map(function (rs, i) {
      const spot = (d.spots.find(function (s) { return s.id === rs.spot_id }) || {})
      return {
        spotId: rs.spot_id,
        index: i + 1,
        name: spot.name || '',
        city: spot.city || '',
        address: spot.address || '',
        lat: spot.lat,
        lng: spot.lng,
        original_text: rs.original_text,
        ai_interpret: rs.ai_interpret,
        history_bg: rs.history_bg,
        checkin_task: rs.checkin_task,
        card_image: rs.card_image,
        unlocked: unlockedSet.indexOf(rs.spot_id) > -1
      }
    })

    const center = spots[0]
      ? { lat: spots[0].lat, lng: spots[0].lng }
      : this.data.center

    const markers = spots.map(function (s, i) {
      return {
        id: i,
        latitude: s.lat,
        longitude: s.lng,
        title: s.name,
        width: 24,
        height: 24,
        callout: {
          content: (i + 1) + '. ' + s.name,
          color: '#7c2d12',
          fontSize: 12,
          borderRadius: 4,
          padding: 4,
          bgColor: '#ffffff',
          display: 'ALWAYS'
        }
      }
    })

    const total = spots.length
    const unlockedCount = spots.filter(function (s) { return s.unlocked }).length

    // 周边好店：取该路线景点对应的商户（商户 near_spot 命中本路线 spot）
    const routeSpotIds = new Set(route.route_spots.map(function (rs) { return rs.spot_id }))
    const visitedMap = {}
    ;(store.getMerchantVisits && store.getMerchantVisits() || []).forEach(function (v) { visitedMap[v.merchantId] = true })
    const merchants = (d.merchants || [])
      .filter(function (m) { return routeSpotIds.has(m.near_spot) })
      .map(function (m) {
        return {
          merchantId: m.id, name: m.name, city: m.city, category: m.category,
          desc: m.desc, reward: m.reward || 0, nearSpot: m.near_spot,
          visited: !!visitedMap[m.id]
        }
      })

    this.setData({
      routeId: id,
      routeTitle: route.title,
      poemBody: poem.body,
      poemTitle: poem.title,
      center: center,
      markers: markers,
      spots: spots,
      total: total,
      unlockedCount: unlockedCount,
      merchants: merchants
    })
  },

  navigateToSpot(e) {
    const idx = Number(e.currentTarget.dataset.idx)
    const s = this.data.spots[idx]
    if (!s) return
    wx.openLocation({
      latitude: s.lat,
      longitude: s.lng,
      name: s.name,
      address: s.address
    })
  },

  checkin(e) {
    const idx = Number(e.currentTarget.dataset.idx)
    const s = this.data.spots[idx]
    if (!s) return
    if (s.unlocked) {
      wx.showToast({ title: '已解锁', icon: 'none' })
      return
    }
    const self = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const dist = geo.haversine(res.latitude, res.longitude, s.lat, s.lng)
        if (dist <= CHECKIN_RADIUS) {
          self.doCheckin(idx)
        } else {
          wx.showModal({
            title: '还没到景点',
            content: '你距「' + s.name + '」约 ' + Math.round(dist) + ' 米，需进入 ' + CHECKIN_RADIUS + ' 米内才能打卡。可点「演示打卡」体验解锁。',
            confirmText: '演示打卡',
            cancelText: '知道了',
            success(r) { if (r.confirm) self.doCheckin(idx) }
          })
        }
      },
      fail() {
        wx.showModal({
          title: '定位未开启',
          content: '无法获取定位，可点「演示打卡」直接体验解锁（真机请在设置中开启定位权限）。',
          confirmText: '演示打卡',
          cancelText: '取消',
          success(r) { if (r.confirm) self.doCheckin(idx) }
        })
      }
    })
  },

  demoCheckin(e) {
    this.doCheckin(Number(e.currentTarget.dataset.idx))
  },

  // 商户联动：标记「到店」，写入本地/云端，刷新本页好店状态
  visitMerchant(e) {
    const mid = e.currentTarget.dataset.mid
    const m = (this.data.merchants || []).find(function (x) { return x.merchantId === mid })
    if (!m) return
    const self = this
    service.visitMerchant(mid, m.nearSpot, m.city).then(function (res) {
      if (!res || res.ok === false) { wx.showToast({ title: '到店记录失败', icon: 'none' }); return }
      const merchants = self.data.merchants.slice()
      const i = merchants.findIndex(function (x) { return x.merchantId === mid })
      if (i >= 0) merchants[i] = Object.assign({}, merchants[i], { visited: true })
      self.setData({ merchants: merchants })
      wx.showToast({ title: '已记录到店 · 分润估算 +' + (m.reward || 0) + '元', icon: 'success' })
    })
  },

  // 统一解锁入口：本地写 Storage / 云端走 checkin 云函数，回调里刷新本页状态
  doCheckin(idx) {
    const s = this.data.spots[idx]
    if (!s) return
    const self = this
    service.checkin(self.data.routeId, s.spotId, s.city).then(function (res) {
      const unlockedList = (res && res.unlockedSpotIds) || []
      const spots = self.data.spots.slice()
      spots[idx] = Object.assign({}, spots[idx], {
        unlocked: unlockedList.length ? unlockedList.indexOf(s.spotId) > -1 : true
      })
      const unlockedCount = spots.filter(function (x) { return x.unlocked }).length
      self.setData({ spots: spots, unlockedCount: unlockedCount })
      wx.showToast({ title: '解锁「' + s.name + '」卡片', icon: 'success' })
    })
  }
})
