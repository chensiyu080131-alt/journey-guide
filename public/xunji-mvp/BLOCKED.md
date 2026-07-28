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
- ~~`deploy/*.conf`（nginx）未配 `error_page 404 /404.html`~~ ✅ **2026-07-28 已解除**：PM 指示"继续完成未完成的任务"视为放行，已在 `deploy/nginx-xuncheng.conf` server 块加 `error_page 404 /404.html;`，经 CI 自动上传+reload 生效。未知路线 id 现返回品牌 404 页。

### GitHub 仓库元信息待 admin 更新
- 代码内用户可见的「寻城」已全部改为「寻迹」（2026-07-27 2e47fc9）。
- **GitHub 仓库 description / topics 需 admin 权限**：当前执行账号 `wanglin1111111` 只有 WRITE 权限，`gh repo edit --description` 返回 404。需仓库 owner（`chensiyu080131-alt`）登录 GitHub → 仓库 About（右上角齿轮）填入：`寻迹 · 有迹可循，寻迹而至 — 跟着书本去旅行`。
- 仓库名仍为 `journey-guide`（改名影响部署 URL/Actions/Secrets/本地 remote，风险高，暂不动；如需改为 `xunji` 需单独评估）。

### 反向验证待执行
- T1 的 RLS「匿名写打卡→403 / 登录写→201」需在 Supabase 凭证到位后实跑，本环境目前只能给出 schema 与预期，无法产出真实 curl/SDK 输出。
- T2「点位经纬度地图复核」需在高德地图渲染核对，本环境无地图渲染能力，坐标已给 best-effort（GCJ-02 近似），待真机/浏览器二次核对。
- T4「浏览器 Sensors 面板伪造 GPS 打卡」截图验证：GPS 距离判定逻辑已用 node + 真实坐标数值自测通过（44m→允许 / 2002m→拒绝），但浏览器端伪造 GPS 的实操截图需 GUI 浏览器，待 PM/用户在 Chrome DevTools → Sensors 执行并留证。

### 凭证澄清（两次核实，2026-07-27）
- 用户两次提供 `http://47.109.91.112:8080/xunji-mvp/` 作为「Supabase 凭证」。已实测：该地址是线上静态站点，任意子路径（`config.js`/`.env`/`supabase.json` 等）均回退返回 HTML 页面，页面源码中无 supabase URL / anon key。**Supabase 凭证格式应为：项目 URL `https://xxxx.supabase.co` + `anon` key（JWT，形如 `eyJhbGciOi...`）**，在 Supabase 控制台 → Project Settings → API 页面获取。拿到这两串字符串后 T1/T2/T4 后端部分即可当日完成。

### 高德 Key 根因确认（2026-07-28 产物层反向验证）
- **确认：`NEXT_PUBLIC_AMAP_KEY` 这个 GitHub Secret 本身无可用值。** 重新启用 `deploy.yml` 注入后，线上 route 页 chunk 实测：`securityJsCode`(7c83…) 已成功内联（证明 Secrets 注入机制正常），但 `key=` 后字符数为 **0**、bundle 仍残留 `NEXT_PUBLIC_AMAP_KEY` 字面量（Next 未替换 ⇒ 构建期该环境变量为空）。这正是 Turn B「地图永久加载中」的原始根因——Key 不是「域名受限」，而是**值为空/失效**。
- 当前组件侧 4.5s 超时 + 6s 兜底保证地图自动回退零依赖 SVG 静态图（永不卡死），站点可用。
- **待 PM 提供**：一个有效的「高德地图 JS API」Key（在 高德开放平台 控制台申请，Key 类型=Web端(JS API)，并在「域名白名单」加入 `47.109.91.112:8080` 或正式域名）。配好后取消 `deploy.yml` 中对应该 Key 的注释（现已取消）即自动生效，无需改代码。

### 反馈回路 Step1 待 PM 控制台操作（2026-07-28）
- **必须跑 `supabase/feedback-schema.sql`**：在 Supabase 控制台 → SQL Editor 粘贴运行一次，建 `reviews` / `merchant_replies` 表 + RLS + `review-photos` 公共存储桶。**未跑前**：评价功能仅落 localStorage（演示可用、刷新不丢、联网后 `syncPendingReviews` 自动补传），但 `/reviews` 时间线与其他用户评价看不到；跑后即有全站真实评价流。
- 存储桶 `review-photos` 若当前 publishable key 无 `storage.buckets` 写入权限，脚本会 `on conflict` 忽略建表、但桶需手动在控制台 Storage → New bucket 建名为 `review-photos` 的 Public 桶（策略脚本仍会尝试创建）。
- 商家看板（Step2 `/merchant/[id]`）与分享图叠加评分/照片（Step3）为后续里程碑，schema 已预留（`merchant_replies`），暂不阻塞。

### 反向验证待执行（浏览器 GUI，留 PM/用户端）
- T3 真实 GPS 打卡：>100m 禁用打卡按钮的逻辑已用 node + 真实坐标数值自测通过（44m→允许 / 2002m→拒绝），但浏览器端（Chrome DevTools → Sensors 伪造 GPS）实操截图待 GUI 浏览器验证。
- T4 集齐 5/5 后 html2canvas 生成 1080×1920 分享海报：代码已就位，真机/浏览器截图验证待 PM 端执行。
- 反馈回路 Step1 评价提交→Supabase 真实落库：需先跑 `feedback-schema.sql`，再于浏览器打卡后提交评价、刷新确认评分仍在、并能在 `/reviews` 看到。

### 商家看板 Step2 待 PM 控制台操作（2026-07-28）
- **必须跑 `supabase/merchant-dashboard-schema.sql`**（Supabase 控制台 → SQL Editor 运行一次，幂等可重跑）：建 `merchant_auth`（含富春/冶春 bcrypt 种子）、`merchant_replies`、兜底建 `reviews`、创建聚合 RPC `merchant_stats`。未跑前 `/merchant/1`、`/merchant/2` 显示「商家不存在或尚未开通看板」（因为 merchant_auth 查不到）。
- **试点商家密码（交接给 PM 线下发给商家，勿写入任何前端代码）**：富春茶社（/merchant/1）= `fuchun2026`；冶春茶社（/merchant/2）= `yechun2026`。改密码：bcryptjs 生成新哈希后 UPDATE `merchant_auth.password_hash` 即可，前端无需改动。
- **架构偏差备案（需 PM 知悉）**：本项目为静态导出（无 Node 服务端），任务书「API routes + 服务端 token 校验 + 403」按等价方案实现——聚合走 Postgres RPC（真后端聚合）、密码走 bcrypt 哈希比对（无明文/无硬编码）、跨商家隔离走「会话绑定 point_id + 每次查询按 point_id 过滤」（A 商家打开 B 看板会重新要密码，效果等同 403，但无 403 状态码）。若未来迁移到有服务端的部署（Vercel/自建 Node），可平移为真 API routes + httpOnly cookie。
- **验收留证限制**：本环境无 GUI 浏览器，「密码错误被拒 / 空回复被拒 / 跨商家被拒」的截图需 PM 在浏览器执行（逻辑已在代码层实现并经构建验证）；命令行可验证的部分（页面 200、构建产物、SQL 内容）已在 PROGRESS.md 留输出。

### 首页文字重叠修复 — BLOCKED 项（2026-07-28）
- **768/1280px 右箭头与非活动卡片容器边缘有轻微交集（非文字重叠）**：右箭头(absolute right-0)在 sm+ 断点显示时，与第二/三张非活动卡片(opacity:0.5, scale:0.9)的容器边缘有 11-36px 交集，但**实测不压任何可见文字**（h3/p/span textHits 为空），仅碰到卡片图片(IMG alt)边缘。彻底消除需重构轮播布局（箭头移出滚动容器），超出"不重构首页布局"界限，故记此留待后续。当前不影响阅读。
- **浮球(迹录员)与封面卡片底部轻微层叠**：浮球定位右下角(z-index:9999, 可拖拽)，其"迹录员"标签与封面卡片底部有约47x19px交集。这是浮窗UI控件的正常层叠行为（用户可拖走），非文字重叠 bug。如需完全避让，需给浮球加碰撞检测/自动避让逻辑，超出本轮范围。
- **截图肉眼复核**：本环境当前模型不支持读取图片内容，截图已生成(screenshots/ 目录)但无法由执行者肉眼复核；改用 playwright bounding-box 自动相交检测作为客观验证（检测结果见 PROGRESS.md）。PM 如需肉眼复核截图，文件在 `screenshots/home-{375,768,1280}-after.png`。
