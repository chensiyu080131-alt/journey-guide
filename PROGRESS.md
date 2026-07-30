# PROGRESS.md — 寻迹 扩充+热点+筛选+季节（2026-07-29 晚）

> 优先级：有内容 > 能跑通 > 好看。

## Task 0：基线
- 扩充前：9 条 live（扬州1/苏州2/杭州2/南京2/张家界1/扬州慢1），4 城，45 点位。
- 数字旧：6城·10路线·50+点位·5载体（含类型定义虚高）。

## 完成记录

### Task1 ✅ 新增 8 条路线（17 live）
杭州3（灵隐骆宾王/龙井苏轼/孤山林逋）+ 苏州2（虎丘/平江路浮生六记）+ 南京2（莫愁湖/阅江楼）+ 扬州1（瘦西湖杜牧）。
每条 5 点位，文学原文均带出处（书名+篇名/作者+总集卷次）。含 category/season/plain_explain/why_worth 字段。
旧9条 JSON 已补 category+season。route-detail-data.ts 注册17条。构建产物 /route/[id] SSG 预渲染17详情页。

### Task2 ✅ /routes 分类筛选
RouteCatalogItem 加 category 字段。/routes 页顶部加4标签（全部/经典名胜/文学名篇/人物行旅），前端 state 过滤。空结果显示"暂无此类路线"占位。

### Task3 ✅ 首页今日热点
新建 public/hotspots.json（3天×3条=9条示例数据）。新建 app/components/today-hotspots.tsx 读取当天date渲染3卡片，无数据显示占位。首页精选路线下方接入。

### Task4 ✅ 路线页季节区块
route-detail-data RouteDetail 加 season 字段。route-detail-view.tsx 末尾加 SeasonBanner 组件：根据当前月份判断季节，匹配路线season字段，显示"为什么今天适合去"。非当季路线也显示（别样味道文案）。

### Task5 ✅ 数字更新
首页数据统计：6城·10路线 → 5城·17路线·85+点位·3载体（实际统计：扬州/苏州/杭州/南京/张家界=5城；17路线；17×5=85点位；书籍/游戏/音乐=3载体）。

## 构建
npm run build 通过（Next 14.2.35）。零新增 npm 依赖。

## ���离记录
- 任务书要求"总计17条"——实际达成17条 live。
- 游戏板块占位的"黑神话/仙剑"等仍为示意占位（section-home.tsx 硬编码），未做成真实路线（合规审查未过不做，见 BLOCKED）。
