// 云函数 checkin：记录打卡 / 商户到店，更新用户收集进度，返回最新已解锁列表。
// 部署：微信开发者工具右键本目录 → 上传并部署（云端安装依赖）
// 数据库：需集合 checkins（打卡）、collections（用户收集进度）、merchantVisits（商户到店）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function getUnlocked(openid) {
  const col = await db.collection('collections').where({ openid: openid }).get()
  return (col.data[0] && col.data[0].unlockedSpotIds) || []
}

exports.main = async (event) => {
  const { routeId, spotId, city, merchantId, merchantCity } = event
  const openid = cloud.getWXContext().OPENID
  if (!openid) return { ok: false, msg: 'missing openid' }

  // —— 商户联动：记录「到店」到 merchantVisits 集合（按 openid+merchantId 去重）——
  let merchantVisits = 0
  if (merchantId) {
    const mc = await db.collection('merchantVisits').where({ openid: openid, merchantId: merchantId }).count()
    if (mc.total === 0) {
      await db.collection('merchantVisits').add({
        data: {
          openid: openid,
          merchantId: merchantId,
          merchantCity: merchantCity || '',
          spotId: spotId || '',
          createdAt: db.serverDate()
        }
      })
    }
    const mv = await db.collection('merchantVisits').where({ openid: openid }).get()
    merchantVisits = mv.data.length
  }

  // 纯商户到店（未带景点）也能返回当前进度
  if (!spotId) {
    return { ok: true, merchantVisits: merchantVisits, unlockedSpotIds: await getUnlocked(openid) }
  }

  // —— 景点打卡：去重 + 更新 collections ——
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

  const unlockedSpotIds = await getUnlocked(openid)
  return { ok: true, merchantVisits: merchantVisits, unlockedSpotIds: unlockedSpotIds }
}
