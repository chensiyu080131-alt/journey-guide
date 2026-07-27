const service = require('../../utils/service.js')

Page({
  data: {
    keyword: '',
    routes: []
  },
  // 全量数据（含已解锁列表），由 service 注入，本地/云端同源
  _d: null,

  onLoad() { this.refresh() },
  onShow() { this.refresh() },

  refresh() {
    const self = this
    service.fetchData().then(function (d) {
      self._d = d
      self.buildList(self.data.keyword)
    })
  },

  onKeyword(e) {
    const kw = e.detail.value
    this.setData({ keyword: kw })
    this.buildList(kw)
  },

  buildList(kw) {
    const d = this._d
    if (!d) return
    const k = (kw || '').trim().toLowerCase()
    const unlockedSet = d.unlockedSpotIds || []
    const list = d.routes.map(function (r) {
      const poem = (d.poems.find(function (p) { return p.id === r.poem_id }) || {})
      const spotCount = r.route_spots.length
      const unlocked = r.route_spots.filter(function (rs) {
        return unlockedSet.indexOf(rs.spot_id) > -1
      }).length
      // 搜索字段额外纳入景点所在城市，使“搜城市”可用（占位符承诺的能力）
      const cities = r.route_spots.map(function (rs) {
        const sp = (d.spots.find(function (s) { return s.id === rs.spot_id }) || {})
        return sp.city || ''
      }).join('')
      return {
        id: r.id,
        title: r.title,
        poemTitle: poem.title || '',
        author: (poem.dynasty ? poem.dynasty + '·' : '') + (poem.author || ''),
        distance: r.distance_km,
        duration: r.duration_min,
        spotCount: spotCount,
        unlocked: unlocked,
        _search: (poem.title + poem.author + (poem.topic_tags || []).join('') + r.title + cities).toLowerCase()
      }
    }).filter(function (r) {
      return !k || r._search.indexOf(k) > -1
    })
    this.setData({ routes: list })
  },

  goRoute(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/route/route?id=' + id })
  }
})
