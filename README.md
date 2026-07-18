# 寻迹 · journey-guide

**有迹可循，寻迹而至** — AI 驱动的文化旅行攻略平台，把书籍、城市、游戏、音乐等文化载体里的线索，转化为现实中可行走的旅行路线。

> IEIIC OPC 人工智能黑客松作品 · 智慧城市民生服务赛道 · 常熟先行落地

## 在线体验

演示地址：<http://47.109.91.112:8080/>（黑客松期间可用）

## 本地开发

```bash
git clone https://github.com/chensiyu080131-alt/journey-guide.git
cd journey-guide
npm install
cp .env.example .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 环境变量

在 `.env.local` 中配置。未配置 LLM Key 时，系统会自动使用 Mock 数据，保证 Demo 可运行。

| 变量 | 说明 | 必填 |
|------|------|------|
| `NEXT_PUBLIC_LLM_API_KEY` | OpenAI 兼容接口 API Key | 否（不配则用 Mock） |
| `NEXT_PUBLIC_LLM_BASE_URL` | OpenAI 兼容接口地址 | 否 |
| `NEXT_PUBLIC_LLM_MODEL` | 模型名，默认 `gpt-4o-mini` | 否 |
| `NEXT_PUBLIC_USE_MOCK` | 设为 `true` 强制 Mock | 否 |
| `NEXT_PUBLIC_AMAP_KEY` | 高德地图 Web Key | 否（不配则文字路线） |

## 功能

- **文化载体入口**：从书籍、城市、游戏、音乐等入口进入旅行灵感
- **跟书旅行**：输入书名、作者、城市或摘录，生成文学旅行路线
- **迹录员智能体**：全局可拖拽浮窗，按书名、城市、偏好生成攻略
- **地图路线探索**：地图标记、点位卡片、详情抽屉、原文与实景对照
- **AI 书灵 / 文学侦探**：围绕路线继续追问文学背景与隐藏线索
- **文旅局工作台**：城市文学白皮书、内容资产看板、合作表单
- **结构化常熟数据**：`src/data/changshu-spots.json` 已沉淀 4 条路线、26 个点位，供 P1 白皮书和 P2 探险模式复用

## 项目结构

```
app/
  page.tsx                 # 首页
  guide/[city]/page.tsx    # 预设路线详情
  guide/jilu/page.tsx      # 迹录员生成攻略展示
  guide/destination/       # 自定义目的地搜索
  dashboard/page.tsx       # 文旅局工作台
components/
  jilu-float.tsx           # 迹录员全局智能体
  guide-view.tsx           # 攻略展示
  guide-map-explorer.tsx   # 地图优先探索视图
  dashboard/               # 白皮书、资产看板、合作表单
lib/
  mock-data.ts             # Demo 路线数据
  llm-client.ts            # 客户端 LLM / Mock / POI 适配层
  jilu-guide-service.ts    # 迹录员攻略生成与增量修改
src/data/
  changshu-spots.json      # 常熟结构化点位数据：4 路线 / 26 点位
docs/
  路演PPT大纲.md            # 黑客松路演大纲
  功能报告.md               # 最新功能说明
  产品开发书.md             # 产品定位与开发说明
  商业模式画布.md           # 商业逻辑与阶段规划
  数据流图.md               # 数据源、P1/P2 复用路径
```

> 路演说明：当前版本为了保证服务器演示稳定，LLM 调用通过客户端 OpenAI 兼容接口适配层完成；未配置 Key 时自动回落到 Mock 数据。正式生产版本应将 API Key 下沉到服务端路由或后端服务，避免暴露浏览器环境变量。

## 部署到 Vercel

1. Fork / 导入 GitHub 仓库到 [Vercel](https://vercel.com)
2. 在 Project Settings → Environment Variables 添加 `NEXT_PUBLIC_LLM_API_KEY`、`NEXT_PUBLIC_LLM_BASE_URL`、`NEXT_PUBLIC_AMAP_KEY` 等
3. Deploy

或使用 CLI：

```bash
npx vercel --prod
```

## 技术栈

- Next.js 14 · TypeScript · Tailwind CSS
- OpenAI 兼容 LLM API · 高德地图 JS API 2.0
- Vercel

## License

MIT
