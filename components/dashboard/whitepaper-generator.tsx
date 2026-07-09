'use client'

import { useChat } from '@ai-sdk/react'
import { Card } from '@/components/ui'

/** P1 · 一键生成城市文学白皮书（走 /api/chat，流式） */
export function WhitepaperGenerator() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    id: 'dashboard-whitepaper',
  })

  const busy = status === 'submitted' || status === 'streaming'
  const report = [...messages].reverse().find(m => m.role === 'assistant')?.content ?? ''
  const sections = report
    .split(/\n?---\n?/)
    .map(s => s.trim())
    .filter(Boolean)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || busy) return
    handleSubmit(e, { body: { mode: 'whitepaper' } })
  }

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
          onChange={handleInputChange}
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
