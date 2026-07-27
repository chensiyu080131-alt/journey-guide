// 云函数 getRoutes：返回文学路线全量数据（poems / spots / routes）
// 同时按当前用户 openid 返回其已解锁的 spotId 列表，前端据此渲染卡片/进度，无需额外请求。
// 部署：微信开发者工具右键本目录 → 上传并部署（云端安装依赖）
// 数据库：在云开发控制台建集合 poems / spots / routes / collections，导入 ../db/literary-routes.json 对应数组
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const poems = await db.collection('poems').get()
  const spots = await db.collection('spots').get()
  const routes = await db.collection('routes').get()

  const openid = cloud.getWXContext().OPENID
  let unlockedSpotIds = []
  if (openid) {
    const col = await db.collection('collections').where({ openid: openid }).get()
    if (col.data.length) unlockedSpotIds = col.data[0].unlockedSpotIds || []
  }

  return {
    poems: poems.data,
    spots: spots.data,
    routes: routes.data,
    unlockedSpotIds: unlockedSpotIds
  }
}
