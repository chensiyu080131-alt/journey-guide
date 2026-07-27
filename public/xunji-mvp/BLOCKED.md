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

## 六、本任务书新增阻塞项（web-app MVP，执行者 2026-07-27）

### 必须提供（否则 T1/T2入库/T4 无法执行）
- ~~**Supabase 项目 URL + anon/public key**~~ ✅ **2026-07-27 21:40 已解除**：PM 提供 `https://dnfuqobsgtmyinmruovn.supabase.co` + `sb_publishable_...`（新版 publishable key，等价 anon key）。连通性已实测（REST 返回真实 PGRST 响应），凭证已配入 `.env.local`，前端数据层与打卡同步已接线。
- ~~**【待 PM 控制台两步】**~~ ✅ **2026-07-27 22:20 已解除**：PM 已跑 `setup-once.sql` 并开启 Anonymous sign-ins。实测验收全部通过：routes=1/points=5/cards=5（SELECT 200）；匿名写 checkins → 401 RLS 拒绝；匿名登录后写 → 201 入库并可读回。T1/T2/T4 后端部分完结。
- **Supabase Auth 登录方式未定**：任务书决策「微信登录（猜的）」，但 web 版微信登录需微信开放平台网站应用资质（较重）。建议 web 试点先放「手机号/微信网页授权」或匿名+昵称，落地最快；最终方案待 PM 裁决，未擅自开通付费/外部账号。

### 事实/版权风险（内容授权，待裁决）
- **汪曾祺原文与扬州5点位的强绑定存疑**：富春茶社有 1986 年题字「富春茶点，天下第一」实据；冶春/锦春/大麒麟阁/东关街在汪曾祺已发表文集中未见明确篇目出处。且「东关街」疑似与汪老写的**高邮东大街**混淆（汪是高邮人）。数据已按 `excerpt_confidence`（verified/derived/pending）标注，弱出处点位作「导览延伸」处理，试点阶段风险低，但商业化前需补权威出处或获取授权。
- **图片为网络素材**：现状确认图片来自网络，需替换或标注来源；本任务不处理图片版权，记此待裁决。

### 架构冲突（待裁决，不擅自改）
- 新任务书后端选 **Supabase**；但既有 `public/xunji-mvp/` 小程序与 `index.html` 用的是 **微信云开发**。两套后端并存。执行者按新任务书走 Supabase，小程序保持原样；是否统一后端待 PM 裁决。
- 仓库已有 `app/renjian`（人间滋味/高邮）含打卡 UI 与 `lib/renjian-data.ts` 等，与本次「扬州汪曾祺路线」主题重叠。建议 T3/T4 复用其地图/打卡组件而非新建，待 PM 确认是否并入同一条产品线。

### 部署配置改进（只读区，待裁决）
- `deploy/*.conf`（nginx）用 `try_files ... =404` 但未配 `error_page 404 /404.html`：访问不存在的路线 id 会显示 **nginx 默认 404 页**而非仓库里已有的品牌 404 页（`app/not-found.tsx` → `out/404.html`）。满足"不白屏不报错"的验收下限，但体验欠佳。修复只需在 server 块加一行 `error_page 404 /404.html;`——deploy 目录属只读区，待 PM 确认后再改。

### 反向验证待执行
- T1 的 RLS「匿名写打卡→403 / 登录写→201」需在 Supabase 凭证到位后实跑，本环境目前只能给出 schema 与预期，无法产出真实 curl/SDK 输出。
- T2「点位经纬度地图复核」需在高德地图渲染核对，本环境无地图渲染能力，坐标已给 best-effort（GCJ-02 近似），待真机/浏览器二次核对。
- T4「浏览器 Sensors 面板伪造 GPS 打卡」截图验证：GPS 距离判定逻辑已用 node + 真实坐标数值自测通过（44m→允许 / 2002m→拒绝），但浏览器端伪造 GPS 的实操截图需 GUI 浏览器，待 PM/用户在 Chrome DevTools → Sensors 执行并留证。

### 凭证澄清（两次核实，2026-07-27）
- 用户两次提供 `http://47.109.91.112:8080/xunji-mvp/` 作为「Supabase 凭证」。已实测：该地址是线上静态站点，任意子路径（`config.js`/`.env`/`supabase.json` 等）均回退返回 HTML 页面，页面源码中无 supabase URL / anon key。**Supabase 凭证格式应为：项目 URL `https://xxxx.supabase.co` + `anon` key（JWT，形如 `eyJhbGciOi...`）**，在 Supabase 控制台 → Project Settings → API 页面获取。拿到这两串字符串后 T1/T2/T4 后端部分即可当日完成。
