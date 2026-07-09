'use client'

import { useState, useCallback } from 'react'
import { Guide } from '@/types'
import { streamLLM, isMockMode, type LLMMessage } from '@/lib/llm-client'
import { cn } from '@/lib/utils'

interface LiteraryDetectiveProps {
  guide: Guide
}

/** P2 · AI文学侦探 —— 跨文本关联 + 隐藏线索挖掘（客户端直连版） */
export function LiteraryDetective({ guide }: LiteraryDetectiveProps) {
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState('')
  const [started, setStarted] = useState(false)

  const context = {
    title: guide.title,
    city: guide.city,
    intro: guide.routeIntro,
    spots: guide.dayPlans
      .flatMap(d => d.spots)
      .filter(s => s.originalText)
      .map(s => ({ name: s.name, originalText: s.originalText, originalSource: s.originalSource })),
  }

  const cards = parseCards(report)

  const run = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setStarted(true)
    setReport('')

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是"寻迹"的AI文学侦探。用户会给你一条旅行路线的景点原文，你需要：
1. 找出不同景点原文之间的跨文本关联（如同一作者、同一时代、互文）
2. 挖掘隐藏的文学线索（你可能不知道的事实）
3. 每个发现用 --- 分隔，首行为标题
用专业但不枯燥的语言，像侦探一样有趣。`,
      },
      {
        role: 'user',
        content: `🕵️ 启动文学侦探：扫描本路线所有景点原文，找出跨文本关联与隐藏线索。\n\n路线：${context.title}\n城市：${context.city}\n景点原文：${context.spots.map(s => `【${s.name}】${s.originalText}（${s.originalSource}）`).join('\n')}`,
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
          onError: () => {
            if (isMockMode()) {
              setReport(getMockDetectiveReport(guide.title))
            }
            setBusy(false)
          },
        },
        { max_tokens: 2000, temperature: 0.8 }
      )
    } catch {
      if (isMockMode()) {
        setReport(getMockDetectiveReport(guide.title))
      }
      setBusy(false)
    }
  }, [busy, context, guide.title])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-ink-900 flex items-center gap-2">🕵️ AI 文学侦探</h3>
        {started && !busy && (
          <button onClick={run} className="text-xs text-xuncheng-600 hover:text-xuncheng-700 underline">
            重新侦查
          </button>
        )}
      </div>

      {!started && (
        <button
          onClick={run}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo/30 bg-indigo/5 text-indigo text-sm font-medium hover:bg-indigo/10 transition-colors"
        >
          🔍 启动文学侦探 —— 让 AI 做数天的跨文本考据
        </button>
      )}

      {busy && cards.length === 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-400 animate-pulse">
          🕵️ 侦探正在比对原文与经典文本……
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {cards.map((card, i) => {
            const hidden = card.title.includes('你可能不知道')
            return (
              <div
                key={i}
                className={cn(
                  'rounded-2xl border p-4',
                  hidden ? 'bg-jade/5 border-jade/20' : 'bg-indigo/5 border-indigo/20'
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{hidden ? '💡' : '🔗'}</span>
                  <h4 className={cn('text-sm font-bold', hidden ? 'text-jade' : 'text-indigo')}>
                    {card.title}
                  </h4>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{card.body}</p>
              </div>
            )
          })}
          {busy && <p className="text-xs text-ink-400 animate-pulse">侦探还在写……</p>}
        </div>
      )}
    </div>
  )
}

/** 把 --- 分隔的文本解析为卡片（首行为标题） */
function parseCards(text: string): { title: string; body: string }[] {
  return text
    .split(/\n?---\n?/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const lines = block.split('\n')
      const title = (lines[0] || '').replace(/^[【\[]|[】\]]$/g, '').replace(/^#+\s*/, '').trim()
      const body = lines.slice(1).join('\n').trim()
      return { title: title || '线索', body: body || block }
    })
}

function getMockDetectiveReport(title: string): string {
  return `🔗 跨文本关联：「${title}」中的多个景点原文出自同一时期文人之手，形成了独特的文学互文网络
---
💡 你可能不知道：这些看似散落的历史遗址，实际上构成了一个完整的文人社交圈——他们的书信往来记录在同一本笔记中
---
🔗 隐藏线索：书中的某处描写，与另一部经典小说的开篇惊人相似，作者之间可能有过直接交流

_（演示数据，配置API Key后可获取AI分析的详细侦探报告）_`
}
