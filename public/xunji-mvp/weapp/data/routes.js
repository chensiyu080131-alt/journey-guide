// 数据层：直接复用 ../db/literary-routes.json（单一数据源），仅在此附加查询辅助函数。
// 坐标 GCJ-02（与 wx.getLocation type:'gcj02' 一致）。AI 解读为模板示例，上线前需人工审核。
var DATA = require('../../db/literary-routes.json')

function getRoutes() { return DATA.routes }
function getRoute(id) { return DATA.routes.find(function (r) { return r.id === id }) }
function getSpot(id) { return DATA.spots.find(function (s) { return s.id === id }) }
function getPoem(id) { return DATA.poems.find(function (p) { return p.id === id }) }
function getMerchants() { return DATA.merchants || [] }
function getMerchant(id) { return (DATA.merchants || []).find(function (m) { return m.id === id }) }

module.exports = {
  DATA: DATA,
  getRoutes: getRoutes,
  getRoute: getRoute,
  getSpot: getSpot,
  getPoem: getPoem,
  getMerchants: getMerchants,
  getMerchant: getMerchant
}
