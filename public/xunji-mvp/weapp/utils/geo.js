// 地理工具：Haversine 距离（米）
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371000
  function toRad(d) { return d * Math.PI / 180 }
  var dLat = toRad(lat2 - lat1)
  var dLng = toRad(lng2 - lng1)
  var a = Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(dLng / 2), 2)
  return 2 * R * Math.asin(Math.sqrt(a))
}

module.exports = { haversine: haversine }
