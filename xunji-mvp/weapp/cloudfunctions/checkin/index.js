// 云函数 checkin：记录一次 GPS 打卡，并更新用户收集进度，返回最新已解锁列表。
// 部署：微信开发者工具右键本目录 → 上传并部署（云端安装依赖）
// 数据库：需集合 checkins（打卡记录）、collections（用户收集进度）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { routeId, spotId, city } = event
  const openid = cloud.getWXContext().OPENID
  if (!openid || !spotId) return { ok: false, msg: 'missing openid or spotId' }

  // 去重：同一用户同一景点只记一次
  const cnt = await db.collection('checkins').where({ openid: openid, spotId: spotId }).count()
  if (cnt.total === 0) {
    await db.collection('checkins').add({
      data: {
        openid: openid,
        routeId: routeId,
        spotId: spotId,
        city: city || '',
        createdAt: db.serverDate(),
        geoVerified: true
      }
    })
  }

  // 更新收集进度
  const col = await db.collection('collections').where({ openid: openid }).get()
  if (col.data.length === 0) {
    await db.collection('collections').add({
      data: { openid: openid, unlockedSpotIds: [spotId], sharedAt: null }
    })
  } else {
    const cur = col.data[0]
    if (cur.unlockedSpotIds.indexOf(spotId) === -1) {
      await db.collection('collections').doc(cur._id).update({
        data: { unlockedSpotIds: _.push(spotId) }
      })
    }
  }

  // 返回最新已解锁列表，前端据此刷新卡片/进度
  const fresh = await db.collection('collections').where({ openid: openid }).get()
  const unlockedSpotIds = (fresh.data[0] && fresh.data[0].unlockedSpotIds) || []
  return { ok: true, unlockedSpotIds: unlockedSpotIds }
}
