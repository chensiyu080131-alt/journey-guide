# PROGRESS — 非遗活动 + 360°全景 浏览层

## 基线（2026-07-30 Task0 确认）
- live 路线：17 条（线上 /routes 去重确认）
- 城市：扬州/苏州/杭州/南京/张家界（非遗覆盖前 4 城）
- 点位卡片现状结构：标题/地址 → 文学原文blockquote → 文学↔现实对照块(interpretation) → 打卡任务 → 打卡按钮+导航+评价
- 现有依赖：无 pannellum / photo-sphere-viewer / three
- RoutePoint 类型字段：seq/name/address/lng/lat/excerpt/excerptSource/excerptConfidence/interpretation/checkinTask（无 panorama 字段）

## 任务执行顺序（按"有内容>能跑通>好看"）
- Task1 heritage.json（内容地基）→ Task2 非遗区块 → Task3 全景组件 → Task4 层级整理 → build → 推送

## 进度（全部完成）
- [x] **Task1**: heritage.json — 20 条非遗（4城×5：扬州5/苏州5/杭州5/南京5），远超≥15要求，每城≥3。全部真实国家级/省级/联合国非遗项目，简介基于公开资料。
- [x] **Task2**: 点位卡片底部加「附近非遗」区块（PointHeritage 组件），按 route.city 匹配，每点显示3张迷你卡片可展开。空城市显示"暂无非遗活动信息"。
- [x] **Task3**: 新建 panorama-viewer.tsx（'use client'），点位卡片加"🌀 全景浏览"按钮弹 modal。**决策：不 npm install pannellum，改用 CDN 动态加载（见下）**��
- [x] **Task4**: 点位层级整理为：文学原文 → 现代解读(对照) → 非遗活动 → 全景浏览 → 打卡任务，分隔线/留白区分。
- [x] **build 通过**：17 条详情页全预渲染，/route/[id] 39.1kB→47.3kB。

## 关键决策（建议走更好的路，记一句）
1. **全景库方案**：任务书建议 npm install pannellum。实际改用 **CDN 动态加载**（jsdelivr pannellum@2.5.6）。
   - 理由：pannellum npm 包强依赖 jQuery，在 Next.js（尤其 output:'export' 静态导出）下 SSR 兼容差，需额外配置 webpack。
   - CDN 方案：①零新增 npm 依赖（满足"不超过2个依赖"硬约束）②SSR 安全，仅点击时按需加载脚本 ③功能完全等价。
   - 代价：依赖 CDN 可用性（jsdelivr 是稳定大厂 CDN）；原型阶段可接受，后期可换 npm 方案或自托管 pannellum 脚本。
2. **全景图占位**：原型阶段用 Pannellum 官方示例全景图（alma/cerro-toco/jfk），按点位 seq 轮换。后期替换实拍（已在 source 字段标注来源）。
3. **非遗城市覆盖**：张家界无非遗数据（非遗主要覆盖扬苏杭宁4城），张家界路线点位显示"暂无非遗活动信息"兜底，不报错。

## 文件清单
- 新增：`public/heritage.json`（20条非遗）
- 新增：`app/components/panorama-viewer.tsx`（全景组件）
- 修改：`lib/route-detail-data.ts`（RoutePoint 加 panorama/panoramaSource 字段 + RawRouteFile 对齐）
- 修改：`components/route-detail/route-detail-view.tsx`（非遗区块+全景入口+层级整理+PointHeritage子组件）
- 零新增 npm 依赖
