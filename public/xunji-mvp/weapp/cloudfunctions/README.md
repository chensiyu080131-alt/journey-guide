# 微信云开发后端（脚手架）

> 本目录为「接云开发真后端」的脚手架。**默认未启用**：小程序仍以本地模式运行（`app.js` 中 `USE_CLOUD=false`）。需你提供小程序 AppID 并开通云环境后启用。
> 该依赖属任务书「必须加的写 BLOCKED.md」项，当前记录在 `xunji-mvp/BLOCKED.md`。

## 前置条件（需你提供）
1. 一个微信小程序 AppID（注册/获取：https://mp.weixin.qq.com ）。
2. 微信开发者工具中对该项目「开通云开发」，创建一个云环境，记下**环境 ID**（形如 `xunji-1gabc12345`）。
3. 在云开发控制台新建 **4 个集合**：`poems`、`spots`、`routes`、`collections`（另含 `checkins`、`merchantVisits` 由函数自动写入，可选预建）。

## 导入内容数据
将 `../db/literary-routes.json` 拆成三个数组，分别导入 `poems` / `spots` / `routes` 三个集合（JSON 导入需为数组格式，可临时包一层 `[...]`）。
`literary-routes.json` 另含 `merchants` 数组（周边好店），可在云开发控制台建 `merchants` 集合导入，或直接由前端静态读取（小程序已用本地数据中的 merchants，无需额外云集合）。
`collections` 无需预导入，首个用户打卡时由 `checkin` 自动创建，结构：`{ openid, unlockedSpotIds: [], sharedAt: null }`。
`checkins` 无需预导入，首次打卡由 `checkin` 自动写入，结构：`{ openid, routeId, spotId, city, createdAt, geoVerified }`（`city` 为打卡景点所在城市，供 `stats` 按城市聚合）。
`merchantVisits` 无需预导入，首次「标记到店」由 `checkin` 自动写入，结构：`{ openid, merchantId, merchantCity, spotId, createdAt }`（按 openid+merchantId 去重），供 `stats` 聚合商户到访。

## 部署云函数
对每个子目录右键 → 「上传并部署：云端安装依赖（不上传 node_modules）」：
- `getRoutes`：返回 `poems`/`spots`/`routes` 全量数据，并**按当前 openid 一并返回 `unlockedSpotIds`**（前端据此渲染卡片/进度，无需额外请求）。
- `checkin`：写入一次打卡（`checkins` 集合，按 openid+spotId 去重，记录 `city`），合并到 `collections.unlockedSpotIds`，**返回最新 `unlockedSpotIds`**；若带 `merchantId` 参数则同时写入 `merchantVisits`（`merchantCity`/`spotId`），**返回 `merchantVisits` 计数**，实现「商户联动」。
- `stats`：聚合 `checkins` 与 `merchantVisits`，返回 B 端真实统计 `{ participants(去重用户), totalCheckins, heat(各景点), city(各城市), merchantHeat(各商户到店), totalMerchantVisits }`，供数据面板在云端模式渲染真实数据（本地模式面板用模拟兜底 + 本地商户到店记录）。

## 前端切换到云模式
> 页面代码已通过 `utils/service.js` 完成上述切换，**无需再改页面**，只需：
1. `app.js`：`USE_CLOUD = true`，`CLOUD_ENV = '<你的环境ID>'`。
2. 其余逻辑（fetchData / checkin）由 `service.js` 自动走 `wx.cloud.callFunction`。
3. 打卡距离校验（`utils/geo.js`）逻辑不变，仍在前端完成 GPS 核验后再调用云端。

## 说明
- 本脚手架未实跑（缺乏真实 AppID + 云环境），代码为微信云开发标准写法。
- 云开发在免费额度内运行（数据库 2GB、云函数调用免费层），**不属付费第三方服务**；超出免费额度后的费用需你评估。
