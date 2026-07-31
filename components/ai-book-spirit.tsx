'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Guide } from '@/types'
import { PERSONA_LIST, buildSystemPrompt, type Persona, type ChatMode } from '@/lib/ai-personas'
import { streamLLM, isMockMode, type LLMMessage } from '@/lib/llm-client'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIBookSpiritProps {
  guide: Guide
}

/** P0 · AI书灵 —— 有人格、有记忆、能挖掘文学关联的对话向导（客户端直连版） */
export function AIBookSpirit({ guide }: AIBookSpiritProps) {
  const [persona, setPersona] = useState<Persona>('文人风骨')
  const [journalOpen, setJournalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const loadedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const storageKey = `xuncheng-bookspirit-${guide.id}`

  const context = {
    title: guide.title,
    city: guide.city,
    intro: guide.routeIntro,
    spots: guide.dayPlans
      .flatMap(d => d.spots)
      .map(s => ({ name: s.name, originalText: s.originalText, originalSource: s.originalSource })),
  }

  // 多轮记忆：挂载时从 sessionStorage 载入
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed)
      }
    } catch { /* ignore */ }
    loadedRef.current = true
  }, [storageKey])

  // 记忆回写
  useEffect(() => {
    if (!loadedRef.current) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages))
    } catch { /* ignore */ }
  }, [messages, storageKey])

  // 新消息滚动到底
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingContent])

  const sendMessage = useCallback(async (userContent: string, mode: ChatMode = 'chat') => {
    if (!userContent.trim() || busy) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: userContent }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setBusy(true)
    setStreamingContent('')

    const systemPrompt = buildSystemPrompt(persona, mode, context)
    const llmMessages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    let fullContent = ''

    await streamLLM(llmMessages, {
      onToken: (token) => {
        fullContent += token
        setStreamingContent(fullContent)
      },
      onDone: () => {
        const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: fullContent }
        setMessages(prev => [...prev, assistantMsg])
        setStreamingContent('')
        setBusy(false)
      },
      onError: (error) => {
        console.error('Stream error:', error)
        const errorMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ 回复失败：${error.message}`,
        }
        setMessages(prev => [...prev, errorMsg])
        setStreamingContent('')
        setBusy(false)
      },
    })
  }, [busy, messages, persona, context])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input, 'chat')
  }

  const findAssociation = () => {
    sendMessage('🔗 找关联：请从本路线里挑两个看似无关的景点，揭示它们隐秘的文学关联。', 'association')
  }

  const copyJournal = async () => {
    const text = buildJournalText(guide.title, messages)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const clearMemory = () => {
    setMessages([])
    try { sessionStorage.removeItem(storageKey) } catch { /* ignore */ }
  }

  const activePersona = PERSONA_LIST.find(p => p.id === persona)!

  // 显示消息：已完成的 + 正在流式的
  const displayMessages = [...messages]
  const lastMsg = displayMessages[displayMessages.length - 1]
  const showStreaming = busy && streamingContent && lastMsg?.role === 'user'

  return (
    <div className="rounded-3xl border border-xuncheng-100 bg-gradient-to-br from-xuncheng-50/40 to-paper overflow-hidden">
      {/* 头部 */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪄</span>
          <h3 className="font-serif font-bold text-ink-900">AI 书灵</h3>
          <span className="text-xs text-ink-400">· {activePersona.hint}</span>
          {isMockMode() && (
            <span className="text-xs text-amber-500 ml-1">（演示模式）</span>
          )}
        </div>

        {/* 人格切换 */}
        <div className="mt-3 flex gap-2">
          {PERSONA_LIST.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersona(p.id)}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all border',
                persona === p.id
                  ? 'bg-xuncheng-500 text-white border-xuncheng-500 shadow-sm'
                  : 'bg-white text-ink-500 border-ink-100 hover:border-xuncheng-200'
              )}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 对话区 */}
      <div ref={scrollRef} className="max-h-80 overflow-y-auto px-5 space-y-3 py-2">
        {messages.length === 0 && !busy && (
          <p className="text-sm text-ink-400 py-6 text-center">
            问我关于「{guide.title}」的一切——文学背景、行程建议、原文出处，或点下方「找关联」。
          </p>
        )}
        {messages.map(m => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-xuncheng-500 text-white rounded-br-sm'
                  : 'bg-white border border-ink-100 text-ink-700 rounded-bl-sm'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {showStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white border border-ink-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
              {streamingContent}
            </div>
          </div>
        )}
        {busy && !showStreaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-ink-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-xuncheng-300 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-xuncheng-300 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-xuncheng-300 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 操作 + 输入 */}
      <div className="px-5 pb-4 pt-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={findAssociation}
            disabled={busy}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo/10 text-indigo hover:bg-indigo/20 disabled:opacity-40 transition-colors"
          >
            🔗 找关联
          </button>
          <button
            type="button"
            onClick={() => setJournalOpen(v => !v)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-ink-100 text-ink-600 hover:bg-ink-200 transition-colors"
          >
            📜 我的文学手账
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMemory}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-ink-400 hover:text-ink-600 transition-colors ml-auto"
            >
              清空记忆
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`以「${activePersona.label}」口吻提问...`}
            className="flex-1 px-4 py-2.5 rounded-full border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="px-4 py-2.5 rounded-full bg-xuncheng-500 text-white text-sm font-medium hover:bg-xuncheng-600 disabled:opacity-40 transition-colors shrink-0"
          >
            {busy ? '...' : '发送'}
          </button>
        </form>
      </div>

      {/* 文学手账面板 */}
      {journalOpen && (
        <div className="border-t border-xuncheng-100 bg-white/60 px-5 py-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink-800">📜 我的文学手账</h4>
            <button
              type="button"
              onClick={copyJournal}
              disabled={messages.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-xuncheng-500 text-white hover:bg-xuncheng-600 disabled:opacity-40 transition-colors"
            >
              {copied ? '✅ 已复制' : '一键复制纯文本'}
            </button>
          </div>
          {messages.length === 0 ? (
            <p className="text-xs text-ink-400">还没有对话记录。开始和书灵聊聊吧。</p>
          ) : (
            <pre className="text-xs text-ink-600 whitespace-pre-wrap max-h-52 overflow-y-auto font-sans leading-relaxed">
              {buildJournalText(guide.title, messages)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function buildJournalText(title: string, messages: { role: string; content: string }[]): string {
  const header = `📜 我的文学手账 · ${title}\n（由寻城 AI 书灵生成）\n${'—'.repeat(20)}\n`
  const body = messages
    .map(m => `${m.role === 'user' ? '【我】' : '【书灵】'} ${m.content}`)
    .join('\n\n')
  return header + body
}
