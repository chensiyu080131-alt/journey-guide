# 待裁决清单 BLOCKED.md

> 拿不准或超出授权的事写这里，随交付提交。空也写"无"。

## 一、明确不做（任务书"界限"指定，需领导裁决才做）
1. 注册公司 —— 不做。
2. 申请商标 —— 不做。
3. 开发 APP（iOS/Android 原生）—— 不做，先做微信小程序；如需 APP 后续裁决。
4. 搭建独立后端服务器 —— 不做，用微信云开发 / Supabase 免费层等托管方案。

## 二、第三方付费服务
- 当前方案（微信小程序原生 + 微信云开发免费层 / Supabase 免费层）不引入新付费服务。
- 若 MVP 跑通后确需付费服务（如高德地图 API、短信、对象存储），须先写此处待裁决，不擅自开通。

## 三、待裁决问题
- 团队所在地城市未明确 → "首批试点选团队所在地"无法落地到具体城市。当前按"周边1-2小时车程文化景区"思路，在文档中以占位符 {{试点城市}} 处理，待领导确认。
- 真实试点景区合作未落实 → 试点数据先用行业公开案例（泉州12万/200万等）+ 最小模拟试点，凡非一手数据均注明"估算/参考来源"。

## 四、新增阻塞项（待你提供）
- **微信云开发真后端需小程序 AppID + 已开通云环境**：`weapp/cloudfunctions/` 已写好 `getRoutes`、`checkin`、`stats` 三个云函数与部署说明（`cloudfunctions/README.md`），页面已通过 `utils/service.js` 接入，但需你提供 AppID 并在开发者工具开通云环境、建集合、导入数据后才能实跑。当前小程序默认 `USE_CLOUD=false`（本地模式即跑），启用云端需改 `app.js` 的 `USE_CLOUD=true` 并提供 `CLOUD_ENV` 环境 ID。属任务书「必须加的写 BLOCKED.md」项。
- **云数据库需建 5 个集合**（递进依赖）：`poems` / `spots` / `routes`（导入 `db/literary-routes.json` 对应数组）+ `collections`（用户收集进度，结构 `{ openid, unlockedSpotIds:[], sharedAt }`）+ `merchantVisits`（商户联动到访，结构 `{ openid, merchantId, merchantCity, spotId, city, createdAt }`，`checkin` 云函数按 openid+merchantId 去重写入）。`getRoutes` 与 `checkin` 均读写 `collections`，`stats` 只读 `checkins` 与 `merchantVisits`，缺集合则对应统计返回空（首次打卡/到店由 `checkin` 自动写入）。导入数据步骤见 `cloudfunctions/README.md`。
- **用户年龄画像未采集**：B 端面板"年龄分布"目前为示例数据，`stats` 云函数未聚合年龄（checkin 未采集）。如需真实年龄画像，需在打卡流程让用户授权填写——属产品决策，待你裁决，未擅自采集隐私。

## 五、本文件状态
2 项待提供（云开发 AppID/环境；云数据库 5 集合）+ 1 项产品决策（年龄画像采集），其余为任务书既定边界，非新阻塞。
