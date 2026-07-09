'use client'

import { useChat } from '@ai-sdk/react'
import { Guide } from '@/types'
import { cn } from '@/lib/utils'

interface LiteraryDetectiveProps {
  guide: Guide
}

/** P2 · AI文学侦探 —— 跨文本关联 + 隐藏线索挖掘 */
export function LiteraryDetective({ guide }: LiteraryDetectiveProps) {
  const context = {
    title: guide.title,
    city: guide.city,
    intro: guide.routeIntro,
    spots: guide.dayPlans
      .flatMap(d => d.spots)
      .filter(s => s.originalText)
      .map(s => ({ name: s.name, originalText: s.originalText, originalSource: s.originalSource })),
  }

  const { messages, append, status, setMessages } = useChat({
    api: '/api/chat',
    id: `detective-${guide.id}`,
  })

  const busy = status === 'submitted' || status === 'streaming'
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  const cards = lastAssistant ? parseCards(lastAssistant.content) : []
  const started = messages.length > 0

  const run = () => {
    if (busy) return
    setMessages([])
    append(
      { role: 'user', content: '🕵️ 启动文学侦探：扫描本路线所有景点原文，找出跨文本关联与隐藏线索。' },
      { body: { mode: 'detective', context } }
    )
  }

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
