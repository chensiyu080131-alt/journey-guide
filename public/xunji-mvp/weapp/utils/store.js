// 本地存储：已解锁的文学卡片（spot_id 列表）+ 商户到店记录
// MVP 阶段用本地 Storage 兜底，无需后端；后续接云开发时替换为云数据库。
var KEY = 'xunji_unlocked'
var MKEY = 'xunji_merchant_visits'

function getUnlocked() {
  return wx.getStorageSync(KEY) || []
}

function isUnlocked(spotId) {
  return getUnlocked().indexOf(spotId) > -1
}

function unlock(spotId) {
  var list = getUnlocked()
  if (list.indexOf(spotId) === -1) {
    list.push(spotId)
    wx.setStorageSync(KEY, list)
  }
  return list
}

// 商户到店记录：[{ merchantId, spotId, city, ts }]
function getMerchantVisits() {
  return wx.getStorageSync(MKEY) || []
}

function recordMerchantVisit(merchantId, spotId, city) {
  var list = getMerchantVisits()
  list.push({ merchantId: merchantId, spotId: spotId || '', city: city || '', ts: Date.now() })
  wx.setStorageSync(MKEY, list)
  return list
}

module.exports = {
  getUnlocked: getUnlocked,
  isUnlocked: isUnlocked,
  unlock: unlock,
  getMerchantVisits: getMerchantVisits,
  recordMerchantVisit: recordMerchantVisit
}
