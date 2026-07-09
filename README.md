# 寻城 · journey-guide

**跟着书本去旅行** — AI 驱动的文学旅行攻略平台，让小城故事从书页走进现实。

> IEIIC OPC 人工智能黑客松作品 · 智慧城市民生服务赛道 · 常熟先行落地

## 在线体验

部署后在此填写 Vercel 链接。

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

在 `.env.local` 中配置：

| 变量 | 说明 | 必填 |
|------|------|------|
| `LLM_API_KEY` | DeepSeek / 通义千问 API Key | 否（不配则用 Mock） |
| `LLM_BASE_URL` | API 地址，默认 DeepSeek | 否 |
| `LLM_MODEL` | 模型名，默认 `deepseek-chat` | 否 |
| `USE_MOCK` | 设为 `true` 强制 Mock | 否 |
| `NEXT_PUBLIC_AMAP_KEY` | 高德地图 Web Key | 否（不配则文字路线） |

## 功能

- **三大入口**：选书 / 选人 / 搜目的地
- **常熟 Demo 路线**：《沙家浜》《孽海花》翁同龢
- **原文对照**：文学原文 + 实景说明双重视角
- **AI 生成**：任意县城一键生成攻略
- **路线地图**：高德地图标记 + 连线（需 Key）

## 项目结构

```
app/
  page.tsx                 # 首页
  guide/[city]/page.tsx    # 预设路线详情
  guide/destination/       # 自定义目的地搜索
  api/generate-guide/      # LLM 攻略生成 API
components/
  entry-cards.tsx          # 首页入口卡片
  guide-view.tsx           # 攻略展示
  guide-map.tsx            # 高德地图
lib/
  mock-data.ts             # 常熟三条路线 Mock 数据
  llm-server.ts            # 服务端 LLM 逻辑
  llm-service.ts           # 客户端调用封装
docs/
  路演PPT大纲.md            # 黑客松路演大纲
```

## 部署到 Vercel

1. Fork / 导入 GitHub 仓库到 [Vercel](https://vercel.com)
2. 在 Project Settings → Environment Variables 添加 `LLM_API_KEY` 等
3. Deploy

或使用 CLI：

```bash
npx vercel --prod
```

## 技术栈

- Next.js 14 · TypeScript · Tailwind CSS
- DeepSeek API · 高德地图 JS API 2.0
- Vercel

## License

MIT
