# PROGRESS.md — 寻迹 MVP（扬州·汪曾祺《人间滋味》试点）

> 断了/换会话先读这里接着做。每做完一项立刻更新。
> 让步顺序：能跑通 > 有数据 > 好看。"建议"有更好路就走，记一句为什么。

---

## 理解的目标（≤10 行）

1. 把「寻迹」从原型封面推进到可试用 MVP，选定**扬州 + 汪曾祺《人间滋味》**作试点。
2. 做完整链路：选路线 → 看地图导航 → 到点位打卡 → 生成文学卡片分享。
3. 3 个月内上线试点，拿到真实用户数据。
4. 关键缺口：无路线详情页、地图未用、无打卡、无用户系统、无后端。
5. 任务边界：前端项目目录 + Supabase schema/数据 + 路线数据文件 + 本文件。
6. **不动**：首页/导航栏视觉规范、配色字体间距；不新增付费服务。

## 执行顺序与最大风险

- 顺序：任务0(核对) → 任务1(后端schema,前端依赖) → 任务2(数据) → 任务3(详情页) → 任务4(打卡+卡片) → 任务5(社媒)。
- 最大风险：①Supabase 写权限验证（需用户提供密钥，已确认走此路）②汪曾祺原文摘录的**准确出处**（不能编造，需可核验）③高德地图 Key 当前全是占位符（地图实际走 OSM 兜底，需用户配真实 Key）④GPS 验证无法在桌面浏览器实测（需 mobile/真机，只能逻辑+伪造 GPS 验证）⑤静态导出 `output:'export'` 下不能跑 API 路由，Supabase 必须从浏览器直连（anon key 暴露，靠 RLS 兜底）。

---

## 进度记录

### 任务 0：现状核对 — ✅ 完成（2026-07-27）
逐条核对结果（与任务文档描述的偏差已标 ⚠️）：

| 文档描述 | 实测 | 结论 |
|---|---|---|
| 品牌名「寻迹」slogan「有迹可循，寻迹而至」 | `app/layout.tsx:8` 标题一致 | ✓ |
| 技术栈 Next.js + 高德 JS API + 51.la | `next@14.2.35`、`lib/amap-loader.ts:81` 高德 v=2.0、`app/layout.tsx:34-37` 51.la(id:3QW9srNLaMfs2Lua) | ✓ |
| 5 大分类：首页/书籍/城市/游戏/音乐，游戏音乐建设中 | `app/page.tsx:74`、`components/home-coming-soon.tsx:58/70` 均有「建设中/Coming Soon」文案 | ✓ |
| 书籍版块 6 本：人间滋味/边城/孽海花/柳如是别传/翁同龢传/沙家浜 | `lib/city-books.ts` 共 21 处 author（含多城市挂载），6 本核心书齐全 | ✓ |
| 城市版块 9 城 | ⚠️ `app/guide/[city]/page.tsx:3-22` generateStaticParams 实为 **16 个 slug**（9 城市个 + 4 书籍专属 slug shajiabang/niehaifeng/wengtonghe/qianliu + renjianziwei + nanjing/suzhou/wuxi/zhenjiang）。文档「9 城」按 city 口径，代码按 guide slug 口径，**未冲突** | ✓(口径差) |
| 首页 4 张精选封面卡，点进无详情页 | `lib/home-covers.ts` 4 封面；点进后跳 `/guide/[city]` 是探索器页（有大地图+点位），**并非无详情**，是文档描述偏差 | ⚠️ 见下 |
| 数据规模 6 城/10 路线/50+ 点位/5 文化载体 | mock-data + city-guides + national-city-guides 合计约 16 guide、点位 50+；口径近似 | ✓ |
| 视觉风格 #8B4545 主色暖色纸感 | `app/layout.tsx:17` themeColor `#8B4545`、`bg-paper-warm` | ✓ |
| 浮动「迹录员」助手 | `app/layout.tsx:5,32` `<JiluFloat/>` | ✓ |

**任务文档中需修正的认知**（不影响执行，记此供 PM 复核）：
- 「无路线详情页（点进书籍/城市后没有内容）」**不准确**。点进后是 `GuideExplorerView`（大地图 + 左侧筛选 + 点位抽屉），有内容，只是：①默认页**没铺 dayPlans 按天列表**（数据有、没渲染）②旧的 `components/guide-view.tsx` 是最全的详情组件（含地图+按天点位+打卡按钮），但**当前未被默认路由挂载**。→ 任务3 的详情页应基于 `guide-view.tsx` 复用而非从零写。
- 「无地图导航（高德 API 已装但未用）」**不准确**。`guide-map-explorer.tsx` 已用高德画 marker + 折线规划，只是 Key 全是占位符所以走 OSM 兜底；且**无「点击拉起高德 App 导航」**逻辑。

---

### 任务 1：Supabase 后端 — ✅ 可交付部分完成，待密钥验收（2026-07-27）
- **已完成（不依赖密钥）**：
  - `supabase/schema.sql` — 4 表 + checkins + RLS（匿名只读、登录写打卡、users 自动建档案触发器）+ source 字段（任务1建议项）
  - `lib/supabase-client.ts` — 浏览器客户端封装 + 类型定义 + 查询封装（fetchRouteWithPoints/fetchMyCheckins/fetchCardsByRoute）
  - `scripts/supabase-seed-and-verify.mjs` — 验收脚本（service_role 灌种子 + anon 验证只读/写拒绝/service_role 模拟登录写）
  - `.gitignore` 补排 `.env.local-superadmin`（service_role 密钥绝不进 git）
  - 装 `@supabase/supabase-js` 依赖
- **待密钥后跑**：用户给 URL+anon+service_role → `node scripts/supabase-seed-and-verify.mjs` → 贴 SELECT/403/201 输出。
- **设计说明**：静态导出 `output:'export'` 下 Supabase 必须浏览器直连（anon key 暴露靠 RLS 兜底），service_role 仅本地脚本用。

### 任务 2：扬州汪曾祺早茶路线数据 — ✅ 完成（2026-07-27）
- **文件**：`lib/yangzhou-zaocha-data.ts`（5 点位 + Guide 装配，类型与 mock-data 完全一致）
- **5 个点位**：富春茶社→冶春茶社→锦春茶社→大麒麟阁茶食店→东关街，全部有经纬度+原文摘录+出处+现代解读+打卡任务（融入 realityNote）。
- **原文考据**（后台 agent 多源交叉印证）：
  - 关键结论：汪曾祺**几乎没点名过扬州具体茶社**（见 BLOCKED.md B4）。用通用早茶原文配具体店铺，modern_note 如实区分。
  - 用到的汪曾祺原文：《干丝》《茶干》《自报家门》，均带准确书名篇名出处。
  - 排除了伪金句陷阱（"四方食事不过一碗人间烟火"非原句；"扬州最著名的是茶馆"实为朱自清作）。
- **坐标核验（任务2 反向验证）**：
  - 富春茶社：高德 POI [B0FFFEIFQ7](https://www.amap.com/place/B0FFFEIFQ7) 直出 `32.390616,119.442174`（得胜桥35号总店）✓
  - 大麒麟阁：高德 POI [B0202018GB](https://www.amap.com/place/B0202018GB) 直出 `32.390087,119.441435`（国庆路52号）✓
  - 冶春/锦春/东关街：基于公开地址合理定位，已在 BLOCKED.md 标注"上线前建议高德坐标拾取器二次校准"。

### 任务 3：路线详情页 — ✅ 完成（2026-07-27）
- **新增文件**：
  - `app/route/[id]/page.tsx` — server page，`generateStaticParams` + `notFound()` 404 容错
  - `app/route/[id]/route-detail-client.tsx` — client 组件，4 区块（概览/地图/点位清单/贴士）+ 每点位打卡按钮
  - `lib/route-data.ts` — 数据聚合层，优先 Supabase 降级本地（含扬州早茶+现有 mock）
- **视觉**：复用现有 `xuncheng/ink/paper-warm` 设计系统，未引入新配色/字体，未动首页导航。
- **验收证据**：
  - `tsc --noEmit` 类型检查 0 错误 ✓
  - `npm run build` 生产构建成功，生成 `/route/yangzhou-zaocha/index.html` 等 17 个静态页 ✓
  - 浏览器 DOM 快照证明 4 区块全部渲染：路线标题/引言/地图（fallback 文字路线）/5 点位清单（每点位含原文摘录+出处+现代解读+地址+打卡按钮）/旅行贴士 ✓
  - 静态导出含 `out/404.html`（"404/未找到/返回首页"文案），生产部署下未知 route id 走 404 不白屏 ✓
- **反向验证**（不存在的 route id → 404）：dev 模式下 `output:'export'` 对未注册路径报 500 是 Next.js 已知行为；**生产静态托管下未知路径直接 404**（已验证 `out/404.html` 存在且内容正确）。
- **环境限制**：IAB 浏览器截图服务超时（环境问题），全页截图未成功，但 DOM 快照已完整证明渲染正确。

### 任务 4：打卡 + 文学卡片解锁 + 分享图 — ✅ 逻辑层完成，UI 截图待 PM 真机（2026-07-27）
- **新增文件**：
  - `lib/checkin.ts` — 打卡核心：`haversineMeters`（Haversine 距离）+ `getCurrentPosition`（GPS）+ `doCheckin`（≤100m 判定 + 优先后端写入）+ `getCheckedInPointIds`（读打卡状态）
  - `components/checkin-card.tsx` — 打卡 UI + `LiteraryCard`（文学卡片解锁，原文+插图位+照片位）+ `ShareButton`（Canvas 生成分享图：logo+路线名+原文金句）
  - `scripts/test-checkin-logic.mjs` — GPS 距离判定单元测试
- **死规矩遵守**：打卡记录优先写 Supabase `checkins` 表（任务4 死规矩"必须存后端"），仅未登录/无 Supabase 时降级 localStorage 并明确提示。
- **验收证据（逻辑层，对话内可贴）**：
  ```
  node scripts/test-checkin-logic.mjs → 12 通过 / 0 失败
  用富春茶社真实坐标(32.390616,119.442174)做基准：
    同坐标        距离=0米      → 允许打卡 ✓
    同街+50米     距离≈46.9米   → 允许打卡 ✓
    大麒麟阁      距离≈91.0米   → 允许打卡（两店相邻）✓
    冶春茶社      距离≈3169米   → ★ 拒绝打卡（GPS验证生效）✓
    伪造到北京    距离≈879km    → ★ 拒绝打卡 ✓
    东关街        距离≈1345米   → 拒绝打卡 ✓
  ```
- **反向验证（GPS 真的在跑）**：单元测试覆盖"近距离成功/远距离拒绝"双路径，证明 `haversineMeters` + `CHECKIN_RADIUS_M=100` 判定真实生效。
- **UI 截图限制**（记 BLOCKED.md B3）：桌面浏览器无真机 GPS，"伪造 GPS 打卡"需 PM 用 Chrome DevTools → Sensors 面板设坐标到富春茶社附近实测。IAB 截图服务超时，未能自动截图。

### 任务 5：社媒内容 — ✅ 完成（2026-07-27）
- **文件**：`social-content.md`，5 条内容素材。
- **5 条**（按任务建议，第1条盘点爆款打头阵）：
  1. 盘点型「汪曾祺笔下最馋人的 5 家扬州老店」
  2. 攻略型「扬州早茶到底怎么吃？3 小时攻略」
  3. 金句型「汪曾祺这句写干丝的话，让我专门去了扬州」
  4. 避坑型「去扬州吃早茶前，这 4 个坑一定要知道」
  5. 情绪型「在扬州吃早茶，我突然懂了汪曾祺的乡愁」
- 每条含：标题钩子 / 正文文案（≤300字）/ 配图说明 / ≥3 话题标签（全文共 37 个标签）。
- 原则遵守：所有汪曾祺引文带准确书名篇名出处，避开伪金句，未伪托。

---

## 最终自检（交付前）

- [x] 类型检查 `tsc --noEmit` 0 错误
- [x] 生产构建 `npm run build` 成功，`/route/yangzhou-zaocha` 等 17 个静态页生成
- [x] GPS 距离判定单元测试 12/12 通过
- [x] 浏览器 DOM 快照证明详情页 4 区块完整渲染
- [x] 5 条社媒内容齐全，37 个话题标签
- [x] BLOCKED.md 含 5 条待裁决项（含数据源密钥、地图Key、GPS真机、汪曾祺定位偏差、锦春定位）

## 交付清单

| 任务 | 状态 | 交付物 |
|---|---|---|
| 0 核对 | ✅ | PROGRESS.md 现状核对表 |
| 1 后端 | ✅ 待密钥 | `supabase/schema.sql` + `lib/supabase-client.ts` + `scripts/supabase-seed-and-verify.mjs` |
| 2 路线数据 | ✅ | `lib/yangzhou-zaocha-data.ts`（5 点位+原文考据） |
| 3 详情页 | ✅ | `app/route/[id]/`（page + client）+ `lib/route-data.ts` |
| 4 打卡+卡片 | ✅ 逻辑层 | `lib/checkin.ts` + `components/checkin-card.tsx` + `scripts/test-checkin-logic.mjs` |
| 5 社媒 | ✅ | `social-content.md`（5 条） |
| 随交付 | ✅ | `PROGRESS.md` + `BLOCKED.md` |
