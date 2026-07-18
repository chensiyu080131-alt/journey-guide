'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui'
import { streamLLM, isMockMode, type LLMMessage } from '@/lib/llm-client'
import changshuSpotData from '@/src/data/changshu-spots.json'

type ChangshuRouteRecord = {
  id: string
  title: string
  sourceWork: string
  sourceCreator: string
  theme: string
  spotCount: number
}

type ChangshuSpotRecord = {
  routeId: string
  name: string
  type: '景点' | '美食' | '体验'
  tags: string[]
  originalSource?: string
  interactiveTask?: unknown
}

const changshuData = changshuSpotData as {
  routeCount: number
  spotCount: number
  routes: ChangshuRouteRecord[]
  spots: ChangshuSpotRecord[]
}

/** P1 · 一键生成城市文学白皮书（客户端直连 LLM，流式） */
export function WhitepaperGenerator() {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sections = report
    .split(/\n?---\n?/)
    .map(s => s.trim())
    .filter(Boolean)

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || busy) return

    setBusy(true)
    setReport('')
    setError(null)

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是"寻迹"的城市文学白皮书生成器。用户输入城市名，你生成结构化报告。
报告格式：每个章节用 --- 分隔，包含：
1. 城市「文化IP定位」—— 最具代表性的文学符号
2. 3条主题路线 —— 每条路线含景点+原文引用+实景对照
3. 商业估算 —— 客源画像、淡旺季、消费水平
用温暖专业的语言，数据真实不可编造。`,
      },
      {
        role: 'user',
        content: `请为"${input.trim()}"生成文学旅行白皮书。`,
      },
    ]

    let fullText = ''

    try {
      await streamLLM(
        messages,
        {
          onToken: (token) => {
            fullText += token
            setReport(fullText)
          },
          onDone: () => {
            setBusy(false)
          },
          onError: (err) => {
            // Mock mode fallback
            if (isMockMode()) {
              setReport(getMockWhitepaper(input.trim()))
            } else {
              setError(err.message)
            }
            setBusy(false)
          },
        },
        { max_tokens: 3000, temperature: 0.7 }
      )
    } catch {
      if (isMockMode()) {
        setReport(getMockWhitepaper(input.trim()))
      } else {
        setError('白皮书生成失败，请重试')
      }
      setBusy(false)
    }
  }, [input, busy])

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-serif font-bold text-ink-900">📄 一键生成文学旅行白皮书</h2>
        <p className="text-sm text-ink-500 mt-1">
          输入城市名，AI 生成「文化IP定位 · 3条主题路线 · 商业估算」结构化报告。
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入城市名，如：常熟、松阳、婺源..."
          className="flex-1 px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-5 py-3 rounded-xl bg-charcoal text-white text-sm font-medium hover:bg-charcoal-50 disabled:opacity-40 transition-colors shrink-0"
        >
          {busy ? '生成中...' : '生成白皮书'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {busy && sections.length === 0 && (
        <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-400 animate-pulse">
          正在撰写白皮书……
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((sec, i) => {
            const lines = sec.split('\n')
            const title = lines[0].replace(/^#+\s*/, '').trim()
            const body = lines.slice(1).join('\n').trim()
            return (
              <div key={i} className="rounded-xl border border-xuncheng-100 bg-xuncheng-50/40 p-4">
                <h3 className="text-sm font-bold text-xuncheng-700 mb-1.5">{title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{body}</p>
              </div>
            )
          })}
          {busy && <p className="text-xs text-ink-400 animate-pulse">继续生成中……</p>}
        </div>
      )}
    </Card>
  )
}

function getMockWhitepaper(city: string): string {
  if (city.includes('常熟')) {
    const routeLines = changshuData.routes
      .map(route => `- **${route.title}**：${route.theme}，关联${route.sourceWork} / ${route.sourceCreator}，已结构化 ${route.spotCount} 个点位`)
      .join('\n')

    const sourceLines = changshuData.spots
      .filter(spot => spot.originalSource)
      .slice(0, 6)
      .map(spot => `- ${spot.name}：${spot.originalSource}`)
      .join('\n')

    const foodCount = changshuData.spots.filter(spot => spot.type === '美食').length
    const experienceCount = changshuData.spots.filter(spot => spot.type === '体验').length
    const interactiveCount = changshuData.spots.filter(spot => spot.interactiveTask).length

    return `# 常熟 · 文化IP定位
常熟适合定位为"书香江南的可步行文化样本"：虞山、尚湖、沙家浜、藏书楼、帝师故居与钱柳故事彼此连接。当前结构化数据已覆盖 ${changshuData.routeCount} 条主题路线、${changshuData.spotCount} 个点位，其中包含 ${foodCount} 个美食点、${experienceCount} 个体验点和 ${interactiveCount} 个可用于探险/互动任务的点位。
---
# 主题路线资产
${routeLines}
---
# 原文与实景依据
${sourceLines}
---
# 商业估算
- **C端客群**：亲子研学、文学旅行爱好者、江南周末游用户、城市文化打卡用户
- **B端场景**：文旅局白皮书、研学路线包装、节庆活动专题、景区联票内容页
- **内容复用**：同一份点位 JSON 可支撑白皮书生成、地图路线、探险任务、点位卡片与讲解词
- **近期落地建议**：先以"沙家浜红色经典"和"钱柳乱世情缘"做两条示范路线，再扩展到虞山书香、尚湖运动与常熟美食专题

_（演示数据来自 src/data/changshu-spots.json；配置 API Key 后可在此基础上生成更细的城市白皮书。）_`
  }

  return `# ${city} · 文化IP定位
${city}是一座深藏文学记忆的城市，从古典诗词到当代散文，处处可寻文人足迹。最具代表性的文化符号是"书香烟火"，既有庙堂之高，也有市井之暖。
---
# 主题路线一：文人故居寻踪
- 📍 **名人故居** — 漫步老城区，寻找文人笔下的街巷与院落
- 📍 **藏书楼/书院** — 千年文脉传承之地
- 📍 **古街茶馆** — 坐下来，像汪曾祺那样喝杯茶
---
# 主题路线二：舌尖上的${city}
- 📍 **早茶/早点** — 本地人清晨的味道
- 📍 **老字号** — 几代人守着一口锅
- 📍 **时令美食** — 不时不食，跟着节气吃
---
# 商业估算
- **客源画像**：25-45岁文化旅行爱好者，本科以上占78%
- **淡旺季**：春季（3-5月）和秋季（9-11月）为旺季
- **人均消费**：舒适型 600-800元/天，轻奢型 1200-1800元/天
- **核心卖点**：文学IP+在地体验的差异化路线

_（演示数据，配置API Key后可获取AI生成的详细白皮书）_`
}
