# BLOCKED.md — 寻迹 扩量任务

## 受环境限制、未能完成的验证项（如实记录）

1. **线上截图无法获取**
   任务书任务 0 要求访问 `http://47.109.91.112:8080` 确认首页/版块状态并贴截图。本执行环境无浏览器截图能力（WebFetch 会将 HTTP 强制升级 HTTPS，对 IP:8080 不可用；无 agent-browser 工具）。线上状态以代码仓库为准推断，见 PROGRESS.md。各验收截图项均以此原因无法提供视觉截图，改以**构建产物 + curl HTML 输出 + 数据文件计数**作为"能跑通/有数据"的证据。

2. **Supabase SELECT COUNT 无法执行**
   任务书未提供 Supabase 凭证（`.env` 不在仓库；`.env.example` 仅有占位）。本轮路线数据写入本地 JSON 文件（`public/xunji-mvp/db/*.json`）+ 注册到 `route-detail-data.ts`，与现有扬州路线同机制。`/routes` 页 live 路线计数由 `routes-catalog.ts` 驱动，可由构建产物验证（≥6 条）。"SELECT COUNT"以 `routes-catalog.ts` 中 `status:'live'` 条目数 + JSON 文件数替代证据。

3. **PR 合并不由执行者完成**
   任务书要求"开 PR 评审合并"。执行者仅提交 PR 供评审，不自行合并（合并需人工评审）。PR 链接 + build 输出作为交付证据。

4. **移动端 375px / 禁用 JS 的视觉截图无法提供**
   同原因 1。已通过 `prefers-reduced-motion` 兜底、动效不阻断交互（nav/button 非 animation 元素）、CSS 渐进增强（内容在静态导出 HTML 中可见）保证不白屏；构建产物 HTML 含全部内容文本可证。

## 明确不做（任务书"不做顺手活"）
- 用户登录、文创商城、B 端面板 v2、申请域名 —— 均不在本轮范围。
- 不新增 Supabase 表，不改商家看板/评价代码，不改现有配色/字体/品牌元素。

## 待人工后续
- 坐标 GCJ-02 二次核对（在高德地图逐点验证）。
- 文徵明《拙政园三十一景图咏》逐句逐字校核（已标 derived/pending）。
- PR1 合并后，PR2（base 指向 PR1 分支）需 rebase 到 main。
