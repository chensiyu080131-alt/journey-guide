const service = require('../../utils/service.js')

Page({
  data: {
    cards: [],
    unlocked: 0,
    total: 0
  },
  onShow() {
    const self = this
    service.fetchData().then(function (d) { self.build(d) })
  },
  build(d) {
    const unlockedSet = (d && d.unlockedSpotIds) || []
    const all = []
    d.routes.forEach(function (r) {
      r.route_spots.forEach(function (rs) {
        const spot = (d.spots.find(function (s) { return s.id === rs.spot_id }) || {})
        all.push({
          spotId: rs.spot_id,
          name: spot.name || '',
          city: spot.city || '',
          routeTitle: r.title,
          original: rs.original_text,
          unlocked: unlockedSet.indexOf(rs.spot_id) > -1
        })
      })
    })
    const list = all.filter(function (c) { return c.unlocked })
    this.setData({ cards: list, unlocked: list.length, total: all.length })
  },
  // 生成可分享的文学卡片海报（Canvas 2D 绘制 → 预览/保存）
  generatePoster() {
    const cards = this.data.cards
    if (!cards.length) return
    const self = this
    const query = wx.createSelectorQuery()
    query.select('#poster').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0] || !res[0].node) {
        wx.showToast({ title: '画布初始化失败', icon: 'none' })
        return
      }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      // 适配高分屏：绘制缓冲按 dpr 放大，坐标系仍用 300×420
      const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio
        : (wx.getSystemInfoSync ? wx.getSystemInfoSync().pixelRatio : 2)) || 2
      const W = 300
      const H = 420
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)

      // 背景
      ctx.fillStyle = '#7c2d12'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#faf7f2'
      ctx.fillRect(0, 70, W, H - 70)
      // 标题
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px sans-serif'
      ctx.fillText('寻迹 · 我的文学卡片', W / 2, 40)
      ctx.font = '13px sans-serif'
      ctx.fillText('已收集 ' + self.data.unlocked + ' / ' + self.data.total + ' 张', W / 2, 60)
      // 卡片列表
      ctx.textAlign = 'left'
      let y = 100
      const max = Math.min(cards.length, 6)
      for (let i = 0; i < max; i++) {
        const c = cards[i]
        ctx.fillStyle = '#7c2d12'
        ctx.font = '17px sans-serif'
        ctx.fillText(c.name, 24, y)
        ctx.fillStyle = '#444444'
        ctx.font = '12px sans-serif'
        const ori = c.original.length > 15 ? c.original.slice(0, 15) + '…' : c.original
        ctx.fillText('「' + ori + '」', 24, y + 22)
        y += 46
      }
      if (cards.length > max) {
        ctx.fillStyle = '#888888'
        ctx.font = '12px sans-serif'
        ctx.fillText('…还有 ' + (cards.length - max) + ' 张', 24, y)
      }
      // 底部
      ctx.textAlign = 'center'
      ctx.fillStyle = '#7c2d12'
      ctx.font = '12px sans-serif'
      ctx.fillText('传统文学 + 现代文旅', W / 2, H - 22)

      wx.canvasToTempFilePath({
        canvas: canvas,
        success: function (r) {
          wx.previewImage({ urls: [r.tempFilePath], current: r.tempFilePath })
        },
        fail: function () {
          wx.showToast({ title: '生成失败', icon: 'none' })
        }
      })
    })
  }
})
