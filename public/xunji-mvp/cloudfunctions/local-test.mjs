// 寻迹云函数 · 本地操作/测试脚本（Node，零依赖）
// 在命令行完整跑通 getRoutes / checkin / stats 逻辑，验证云函数行为。
// 用法：node cloudfunctions/local-test.mjs   （在 public/xunji-mvp 目录下执行）
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const datasetPath = fileURLToPath(new URL('../db/literary-routes.json', import.meta.url));
const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));

// ---- 用内存数组模拟云数据库的集合 checkins / collections ----
let checkins = [];
const collections = {}; // openid -> { openid, unlockedSpotIds }

// 复刻 checkin 云函数逻辑
function checkin(openid, routeId, spotId, city) {
  if (!openid || !spotId) return { ok: false, msg: 'missing openid or spotId' };
  const dup = checkins.find(c => c.openid === openid && c.spotId === spotId);
  if (!dup) {
    checkins.push({ openid, routeId, spotId, city: city || '', createdAt: new Date().toISOString(), geoVerified: true });
  }
  if (!collections[openid]) collections[openid] = { openid, unlockedSpotIds: [] };
  const col = collections[openid];
  if (col.unlockedSpotIds.indexOf(spotId) === -1) col.unlockedSpotIds.push(spotId);
  return { ok: true, unlockedSpotIds: col.unlockedSpotIds };
}

// 复刻 getRoutes 云函数逻辑
function getRoutes(openid) {
  const col = collections[openid];
  return {
    poems: dataset.poems,
    spots: dataset.spots,
    routes: dataset.routes,
    unlockedSpotIds: col ? col.unlockedSpotIds : []
  };
}

// 复刻 stats 云函数逻辑
function stats() {
  const users = new Set();
  const heat = {};
  const city = {};
  checkins.forEach(r => {
    if (r.openid) users.add(r.openid);
    if (r.spotId) heat[r.spotId] = (heat[r.spotId] || 0) + 1;
    if (r.city) city[r.city] = (city[r.city] || 0) + 1;
  });
  return { participants: users.size, totalCheckins: checkins.length, heat, city };
}

// ---- 模拟一次多用户试点 ----
console.log('=== 数据源 ===');
console.log(`诗词 ${dataset.poems.length} 首 / 景点 ${dataset.spots.length} 个 / 路线 ${dataset.routes.length} 条`);

const demo = [
  { openid: 'user_A', routeId: 'route_fengqiao', spotId: 'spot_hanshan', city: '苏州' },
  { openid: 'user_A', routeId: 'route_fengqiao', spotId: 'spot_fengqiao', city: '苏州' },
  { openid: 'user_A', routeId: 'route_fengqiao', spotId: 'spot_hanshan', city: '苏州' }, // 重复，应去重
  { openid: 'user_B', routeId: 'route_huanghe', spotId: 'spot_huanghelou', city: '武汉' },
  { openid: 'user_B', routeId: 'route_huanghe', spotId: 'spot_qingchuan', city: '武汉' },
  { openid: 'user_C', routeId: 'route_xihu', spotId: 'spot_xihu', city: '杭州' }
];

console.log('\n=== checkin 调用（逐条） ===');
demo.forEach(d => {
  const r = checkin(d.openid, d.routeId, d.spotId, d.city);
  console.log(`${d.openid} 打卡 ${d.spotId} -> ok=${r.ok} 已解锁${r.unlockedSpotIds.length}个`);
});

console.log('\n=== getRoutes(user_A) ===');
console.log(JSON.stringify(getRoutes('user_A').unlockedSpotIds));

console.log('\n=== stats（B 端聚合） ===');
console.log(JSON.stringify(stats(), null, 2));
