'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateXhsNote, type XhsNote } from '@/lib/xhs-service'
import { Button } from '@/components/ui'

const STYLES = ['种草', '探店', '攻略', '避雷', '测评']

export default function XhsPage() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('种草')
  const [field, setField] = useState('')
  const [note, setNote] = useState<XhsNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('请输入主题')
      return
    }
    setLoading(true)
    setError(null)
    setNote(null)
    setCopied(false)
    try {
      const result = await generateXhsNote(topic.trim(), style, field.trim())
      setNote(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  function copyAll() {
    if (!note) return
    const text = `${note.title}\n\n${note.content}\n\n${note.tags.join(' ')}`
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-xuncheng-400'

  return (
    <main className="min-h-screen pb-10">
      <div className="sticky top-1 z-40 bg-paper/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-ink-400 hover:text-ink-600 transition-colors">
            ← 返回
          </Link>
          <div className="flex-1 text-center">
            <span className="font-bold text-ink-900 text-sm">小红书文案生成</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-ink-900">小红书文案生成</h1>
            <p className="text-sm text-ink-500 mt-1">
              基于公开爆款方法论（去AI味·钩子标题·精准标签），step-3.7-flash 生成
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="主题，如：常熟虞山、苏州拙政园、某款防晒…"
              className={inputCls}
            />

            <div>
              <p className="text-sm text-ink-500 mb-2">风格</p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      style === s
                        ? 'bg-xuncheng-500 text-white'
                        : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={field}
              onChange={e => setField(e.target.value)}
              placeholder="领域/场景（选填），如：文旅、美食、科技"
              className={inputCls}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full">
            {loading ? '生成中…' : '生成文案'}
          </Button>
        </section>

        {loading && (
          <div className="text-center py-10 animate-fade-in">
            <p className="text-lg">✍️</p>
            <p className="text-sm text-ink-500 mt-2">正在撰写真实感文案，约 30-40 秒…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center space-y-3">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" onClick={handleGenerate}>
              重试
            </Button>
          </div>
        )}

        {note && !loading && (
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif font-bold text-ink-900 text-lg leading-snug">{note.title}</h2>
              <Button variant="outline" size="sm" onClick={copyAll} className="shrink-0">
                {copied ? '已复制 ✓' : '复制全文'}
              </Button>
            </div>
            <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-ink-100">
                {note.tags.map(t => (
                  <span
                    key={t}
                    className="text-xs text-xuncheng-600 bg-xuncheng-50 px-2 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
