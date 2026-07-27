// 云函数 stats：B 端真实统计。聚合 checkins 集合，输出：
//   participants   累计参与人数（按 openid 去重）
//   totalCheckins  累计打卡次数
//   heat           { spotId: 打卡次数 } 各景点打卡热力
//   city           { 城市: 打卡次数 }   按打卡景点所在城市累计
// 部署：微信开发者工具右键本目录 → 上传并部署（云端安装依赖）
// 数据库：依赖 checkins 集合（由 checkin 云函数写入，含 openid/spotId/city 字段）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const PAGE = 1000 // 云函数单次读取上限；demo 量级足够，超量需分页游标

exports.main = async () => {
  const res = await db.collection('checkins').limit(PAGE).get()
  const records = res.data || []
  const users = new Set()
  const heat = {} // spotId -> count
  const city = {} // 城市 -> count
  records.forEach(function (r) {
    if (r.openid) users.add(r.openid)
    if (r.spotId) heat[r.spotId] = (heat[r.spotId] || 0) + 1
    if (r.city) city[r.city] = (city[r.city] || 0) + 1
  })
  return {
    participants: users.size,
    totalCheckins: records.length,
    heat: heat,
    city: city
  }
}
