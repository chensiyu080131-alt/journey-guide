// 运行模式开关
// USE_CLOUD = false（默认）：本地模式。数据来自 data/routes.js + 本地 Storage，
//   微信开发者工具游客模式（touristappid）即跑，零依赖、零付费三方服务。
// USE_CLOUD = true：云开发模式。数据来自微信云开发数据库，需自有 AppID + 已开通云环境。
//   详见 cloudfunctions/README.md。
const USE_CLOUD = false
const CLOUD_ENV = '' // 填入你的微信云开发环境 ID，例如 'xunji-1gabc12345'

App({
  globalData: {
    useCloud: USE_CLOUD,
    cloudEnv: CLOUD_ENV,
    version: '0.1.0'
  },
  onLaunch() {
    if (USE_CLOUD && typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({ env: CLOUD_ENV, traceUser: true })
    }
  }
})
