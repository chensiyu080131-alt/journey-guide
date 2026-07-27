# 进度记录 PROGRESS.md

> 执行规则（来自任务书）：唯一任务来源＝本次任务书；拿不准写 BLOCKED.md；断点续做先读本文件，做完一项立即更新；让步顺序＝能落地 > 有数据 > 好看；"只允许/不许"违反＝失败。
> 工作目录：C:\Users\22812\OneDrive\Desktop\寻迹\xunji-mvp\（严格不碰已有 journey-guide 项目代码与配置）

## ▎任务0：核对数字（2026-07-27，已完成）

### 行业现状数字核对表
| # | 案例 | 任务书数字 | 核对结果 | 原始来源 | 来源日期 |
|---|------|-----------|----------|----------|----------|
| 1 | 泉州「世遗探秘」AI剧本游 | 12万人参与 / 互动近60万次 / 带动商户营收约200万 / 剧本成本约50元/份 | ✅ 全部一致 | 人民网 fj.people.com.cn/n2/2026/0623/c181466-41618716.html；泉州晚报 qzwb.com 2026-04-30；今日头条 toutiao 2026-03-04 | 2026 |
| 2 | 爱奇艺《唐朝诡事录·西行》国潮沉浸剧场 | 全国11家店 / 接待超10万人次 / 大众点评VR销量榜第一 | ✅ 全部一致（原文："上海、深圳、张家港、青岛、扬州、福州、武汉等全国11家门店"） | 环球网 hope.huanqiu.com/article/4KaJKHEzJQ7；西安网 xiancn.com 2024-11/29 | 2024-11 |
| 3 | 网络文学IP市场规模(2024) | 2985亿元 | ✅ 一致（2985.6亿元，同比+14.61%） | 国家新闻出版署 nppa.gov.cn/xxfb/ywdt/202505/t20250512_894767.html；中国社科院 cssn.cn 2025-05-13 | 2025-05 |
| 4 | 南京《大梦·红楼》沉浸式展陈 | 2000㎡ / 开放两周观众五刷 / 政企合作 | ✅ 全部一致 | 中共江苏省委新闻网 zgjssw.gov.cn 2024-08-11；央广网 js.cnr.cn 2024-12-28 | 2024-08 |
| 5 | 南昌《千年一序滕王阁》VR大空间 | 500㎡ / LBE大空间 / 政企联动官方指导出品 | ✅ 全部一致 | 人民网江西 jx.people.com.cn 2025-10-12；华夏时报 cet.com.cn 2025-02-14 | 2025 |
| 6 | 人民文学出版社"跟着名著去旅行" | 十大名著线路+十大研学专线+微综艺+微短剧 | ⚠ 未单独验证（计划类描述，无量化数字，暂标"猜的，没验证"） | — | — |
| 7 | 九部委贴息政策 | 文旅企业最高100万贷款贴息 | ✅ 一致（单户最高贴息贷款规模100万，年贴息1个百分点，旅游属8类支持领域） | 财政部 jrs.mof.gov.cn/zhengcejiedu/202508/t20250812_3969869.htm（财金〔2025〕81号） | 2025-08 |
| 8 | 河南文旅数字化奖补 | 单项不超总投资30% | ✅ 一致（"单个项目不超过项目总投资的30%，实行定额奖补"） | 河南省文旅厅 hct.henan.gov.cn 2025-02-21 / 2026-03-31 | 2025–2026 |
| 9 | 苏州"苏旅贷" | 首期10亿 | ✅ 一致（南京银行首期10亿贷款规模+省文旅厅专项资金贴息） | 江苏省文旅厅 wlt.jiangsu.gov.cn 2024-12-26；南京银行 njcb.com.cn 2024-10-31 | 2024 |
| 10 | 智慧旅游创新发展行动计划 | 中央预算内投资+旅游发展基金+地方债 | ✅ 一致（五部门2024-05印发） | 文旅部等 m.cnricc.com/doc_28126802.html；hunan.gov.cn 2024-07 | 2024-05 |

> 备注：任务书标注"2024-2025调研"，但泉州(2026-06)、南昌(2025-10)、九部委贴息(2025-08)等官方披露晚于窗口；数字真实、来源有效，仅披露时间有差，不影响结论。

### 理解的目标 / 顺序 / 最大风险（≤10行）
1. 目标：验证"传统文学+现代文旅"能否做成商业闭环——交付可跑MVP + 有试点数据的商业方案 + 可递景区/文旅局的合作提案。
2. 顺序：任务0核对 → 任务1竞品分析 → 任务2 MVP设计 → 任务3商业方案 → 任务4合作提案。
3. 产品：微信小程序优先（触达广、成本低）；不碰已有 journey-guide 代码。
4. 变现：先B端（景区/文旅局采购）为主，C端同步非主力。
5. 内容：AI辅助生成+人工审核；首批古诗词+经典散文。
6. 最大风险①：真实试点数据难获取（需景区合作）→ 先用行业公开数据(泉州等)+最小模拟试点，注明"估算/参考"。
7. 最大风险②：B端决策周期长，可能拖过3月窗口 → 用"免费试点2周"降低决策门槛。
8. 边界：仅新建 xunji-mvp/ 下文档与小程序目录、db；不新增付费第三方服务；不做注册公司/商标/APP/独立后端。
9. 让步顺序：能落地 > 有数据 > 好看。

## ▎任务1：竞品分析报告 —— 已完成（见 competitor-analysis.md）
## ▎任务2：MVP设计文档 —— 已完成（见 mvp-design.md；种子库 db/literary-routes.json）
## ▎任务3：商业方案文档 —— 已完成（见 business-plan.md）
## ▎任务4：合作提案模板 —— 已完成（见 partnership-proposal.md）

## ▎任务5：微信小程序 MVP 骨架（2026-07-27，已完成，用户选"先做1"）
- 用户确认在任务0–4之外继续：搭真正能跑的小程序骨架（最短路径：选诗→看路线→打卡）。
- 落地：`xunji-mvp/weapp/`（微信原生 WXML/WXSS/JS），共 21 个文件，零付费第三方服务、未搭独立后端。
- 页面：首页`pages/index`（路线列表+搜索）/ 路线地图`pages/route`（地图标点+导航+AI导览+GPS打卡+演示打卡）/ 我的卡片`pages/cards`（解锁卡片墙）。
- 数据层：本地 `data/routes.js` 镜像 `db/literary-routes.json`；打卡记录存本地 `Storage`（`utils/store.js`），Haversine 距离 `utils/geo.js`。
- 校验：7 个 JS 文件 `node --check` 全部 OK；6 个 JSON 全部合法。微信开发者工具导入即用。
- 运行说明见 `weapp/README.md`（AppID 先用 touristappid 游客模式；正式联调替换自有 AppID）。
- 让步：B端数据面板、集卡分享海报按 mvp-design 最短路径暂未做（"能落地"优先）；接云开发/AI/面板为后续里程碑，需单独确认。

## ▎任务6：小程序四项扩展（2026-07-27 第二轮，用户选"需要"全做）
- 用户在任务5基础上确认全做 4 项扩展，均已完成：
  1. **扩内容库（T8）**：`db/literary-routes.json` + `data/routes.js`（改 require 单一数据源）扩到 **10 诗 / 20 景点 / 10 路线**，含真实 GCJ-02 坐标与(待审核)AI解读。校验通过。
  2. **B端数据面板页（T9）**：`pages/dashboard`，tabBar 第三标签，参与人数/打卡热力(景点排行)/用户画像(城市+年龄)，本地模拟聚合；接云后换真实统计。
  3. **集卡分享海报（T10）**：`pages/cards` 加 canvas 绘制海报 → 预览/保存（隐藏离屏 canvas）。
  4. **微信云开发后端脚手架（T11）**：`app.js` 加 `USE_CLOUD` 开关（默认 false 本地可跑）；`cloudfunctions/getRoutes`、`checkin` 两个云函数 + `cloudfunctions/README.md` 部署说明。需用户 AppID+环境，已记入 BLOCKED.md。
- 校验：weapp 内 10 个 JS `node --check` 全 OK、9 个 JSON 全合法；`routes.js` require 展开正常。
- 让步：云后端未实跑（缺 AppID），保持"本地模式即跑"；其余三项均本地可跑。B端面板接真实数据为后续里程碑。

## ▎任务7：本地版免费试用演示 + 修复（2026-07-27，已完成）
- 用户指示：先用本地版跑一轮免费试点演示，有问题就优化修复。
- 做法：写 `selftest.js`（Node 模拟器，mock wx/Page/getApp，真实执行页面逻辑）跑通最短路径：数据完整性→geo→首页搜索→路线加载/打卡→卡片墙→数据面板→海报。
- **发现并修复的真实问题（3 项）**：
  1. 【功能 bug】首页"搜城市"失效——搜索字段 `_search` 未含景点城市名，搜「苏州」返回 0。已把路线内各景点城市并入 `_search`，搜城市可用（占符承诺的能力）。
  2. 【真机阻断】`app.json` 缺 `getLocation` 权限声明（`permission.scope.userLocation` + `requiredPrivateInfos`），真机 GPS 打卡会直接失败。已补，演示打卡兜底仍保留。
  3. 【展示】数据面板热力条用固定分母 `/6`，换数据比例失真。改为相对最大值 `item.count / maxHeat * 100%`。
- 校验：`selftest.js` 本地模式 **27/27 全通过**；12 JS + 9 JSON 全部 `node --check`/JSON.parse OK。
- 让步：海报仍用旧 `createCanvasContext` API（可跑，后续可迁 Canvas 2D）；不影响"能落地"。

## ▎任务8：service 层 + 页面打卡/数据获取切云端（2026-07-27，已完成）
- 用户指示：把云函数接到页面（打卡/数据获取从本地切到云端调用）。
- 新增 `utils/service.js`：统一数据/打卡服务。**本地模式（useCloud=false，默认）直读 data + 本地 Storage，游客模式即跑、零依赖；云端模式（useCloud=true）走微信云开发** `getRoutes`/`checkin` 云函数。
- 四个页面 `index/route/cards/dashboard` 改为经 `service.fetchData()` 取数、`service.checkin()` 打卡，**不再直接 require 数据层/store**，本地↔云端同源。
- 同步更新云函数：
  - `getRoutes` 现按当前 openid 返回 `unlockedSpotIds`（前端据此渲染卡片/进度，无需额外请求）。
  - `checkin` 现返回最新 `unlockedSpotIds`，前端刷新本页进度。
  - 数据库新增要求：除 poems/spots/routes 外，还需 `collections` 集合（用户收集进度）。
- 校验：`selftest.js --cloud` 模拟云端 **29/29 全通过**（含验证确实请求了 getRoutes/checkin 云函数 + 本地两条路径也 OK）；全部 JS/JSON 合法。
- 边界遵守：默认仍为本地模式（USE_CLOUD=false），未新增任何付费第三方服务、未搭独立后端；切云端仅需填 AppID+环境（见 BLOCKED.md / cloudfunctions/README.md）。
- 让步：GPS 真打卡仍需用户真机授权，模拟器仅验证流程。

## ▎任务9：② B端真实统计云函数 stats（2026-07-27，已完成）
- 用户指示：做 ②「加 B 端真实统计云函数」（与 ③ 一并，先不推 github）。
- 新增 `cloudfunctions/stats`：聚合云库 `checkins` 集合，输出 `participants`（按 openid 去重）/ `totalCheckins` / `heat`（各景点打卡次数）/ `city`（按打卡景点所在城市累计）。单次读上限 1000，demo 量级足够。
- `utils/service.js` 新增 `fetchStats()`：云端模式走 `stats` 云函数；本地模式返回 `null`（页面用模拟兜底，零依赖）。
- `pages/dashboard`：云端模式用真实统计（`isReal=true`，新增「累计打卡」指标、真实/演示徽标、城市分布按真实占比计算）；本地模式或云函数不可用自动回退模拟。
- 联动：`checkin` 云函数现存 `city`；`route` 打卡时把景点城市传给云端，供城市维度统计。
- 校验：`selftest.js --cloud` 云端模式 **34/34 全通过**（含验证确实请求了 `stats` 云函数、`isReal=true`、checkin 携带 `city`）；本地模式 28/28。

## ▎任务10：③ 海报 canvas 迁 Canvas 2D（2026-07-27，已完成）
- 用户指示：做 ③「把海报 canvas 从旧 API 迁到 Canvas 2D」。
- `pages/cards/cards.wxml`：canvas 由 `canvas-id="poster"` 改为 `type="2d" id="poster"`。
- `pages/cards/cards.js`：`generatePoster` 改用 `wx.createSelectorQuery().select('#poster').fields({node,size})` 取 canvas node，用 2d context（`ctx.fillStyle`/`ctx.font`/`ctx.textAlign` 属性写法），按 `wx.getWindowInfo().pixelRatio` 放大绘制缓冲区，`wx.canvasToTempFilePath({ canvas })` 导出。
- 好处：Canvas 2D 为新版官方推荐接口，旧 `createCanvasContext` 已废弃；导出清晰度更高、性能更好。
- 校验：`selftest.js` 本地/云端两模式均触发 `previewImage`（Canvas 2D 绘制→导出路径通过）；全部 JS/JSON 合法。

## ▎任务11：商户联动闭环（2026-07-27，已完成）
- 用户指示（leader 任务书）：按商业化方案开发"商户联动闭环"——路线页露出周边好店、用户标记"到店"、B 端聚合到访与分润估算；云端 schema 一并备好。
- **数据**：`db/literary-routes.json` + `data/routes.js` 新增 `merchants`（12 条：id/name/city/near_spot/category/desc/lng/lat/reward）；`routes.js` 导出 `getMerchants()/getMerchant(id)`。
- **本地写入**：`utils/store.js` 新增 `getMerchantVisits()/recordMerchantVisit(merchantId, spotId, city)`（key `xunji_merchant_visits`）。
- **服务层**：`utils/service.js` 的 `fetchData()` 返回 `merchants`；新增 `visitMerchant(merchantId, spotId, city)`——本地写 Storage，云端走 `checkin` 云函数带 `merchantId`。
- **路线页**：`pages/route` 按本路线 spot 过滤出周边好店（标记 `visited`），"标记到店"按钮调用 `visitMerchant` 并即时刷新状态。
- **B 端面板**：`pages/dashboard` 聚合本地商户到访 → 到店数 + 分润估算（reward×到访，标"估算/演示"）；远端 `stats.merchantHeat/totalMerchantVisits` 真实填充。
- **云函数**：`checkin` 现接受 `merchantId/merchantCity`，写 `merchantVisits` 集合（openid+merchantId 去重）返回到访计数；`stats` 现聚合 `merchantVisits` → `merchantHeat/totalMerchantVisits`；`README.md` 同步更新。
- **校验（leader 明卷 + 暗卷）**：`selftest.js` 本地 **36/36**、云端 **42/42**（基线 28/34，各 +8 商户断言）；反向验证——删一条商户坐标后数据完整性用例转红、恢复即绿，确认真实生效而非 mock。
- 边界遵守：默认仍本地模式、无付费第三方、未碰 journey-guide 代码；分润为估算演示、未接真实结算。

## ▎总状态
- 任务0–4（文档，5轮）：全部完成。
- 任务5（小程序骨架）+ 任务6（四项扩展）+ 任务7（本地试用修复）+ 任务8（云端接入）+ 任务9（B端真实统计云函数）+ 任务10（海报 Canvas 2D）+ 任务11（商户联动闭环）：全部完成，2026-07-27。
- 交付物见 xunji-mvp/ 目录；小程序运行/接云说明见 weapp/README.md 与 cloudfunctions/README.md；待提供项见 BLOCKED.md。
- **部署状态（2026-07-27 16:48 上线）**：`http://47.109.91.112:8080/xunji-mvp/` 已含任务11（商户联动）+ 云函数公开控制台，CI 自动部署（静态导出+nginx）修通。线上 `db/literary-routes.json`=21365B(含12商户)、`Last-Modified` 更新为 08:48:54。部署根因复盘见本文件上方"部署复查"批注与 `.workbuddy/memory/2026-07-27.md`。
- 仍可继续的后续里程碑（需单独确认）：提供 AppID 后真跑云端、集卡分享细化、内容扩到更多诗/跨散文、免费试点落地某景区、用户年龄画像采集。
