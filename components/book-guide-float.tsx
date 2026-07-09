'use client'

import { useState, useCallback, useEffect } from 'react'
import { BudgetLevel, InterestTag } from '@/types'
import { BookGuideRequest, BookGuideResponse } from '@/types/book-guide'
import { BookGuideResultView, saveBookGuideAndNavigate } from './book-guide-result-view'
import { cn } from '@/lib/utils'

type Step = 'book' | 'trip' | 'excerpt' | 'generating' | 'done'

const INTERESTS: InterestTag[] = ['文化', '美食', '自然', '体验']
const BUDGETS: BudgetLevel[] = ['穷游', '舒适', '轻奢']

const STAGES = [
  '正在阅读书籍信息…',
  '提取书中地点与原文…',
  '调用地图搜索验证 POI…',
  '规划每日行程与交通…',
  '整理餐饮推荐与贴士…',
]

const INITIAL: BookGuideRequest = {
  bookTitle: '',
  author: '',
  city: '',
  days: 2,
  interests: ['文化', '美食'],
  budget: '舒适',
  preferences: '',
  bookExcerpt: '',
}

/** 全局浮窗 —— 跟书旅行 AI 向导 */
export function BookGuideFloat() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('book')
  const [form, setForm] = useState<BookGuideRequest>(INITIAL)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BookGuideResponse | null>(null)

  const reset = useCallback(() => {
    setStep('book')
    setForm(INITIAL)
    setStage(0)
    setError(null)
    setResult(null)
  }, [])

  // 首页等位置可通过事件打开浮窗
  useEffect(() => {
    const openPanel = () => {
      reset()
      setOpen(true)
    }
    window.addEventListener('xuncheng:open-book-guide', openPanel)
    return () => window.removeEventListener('xuncheng:open-book-guide', openPanel)
  }, [reset])

  const close = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const patch = (partial: Partial<BookGuideRequest>) => {
    setForm(prev => ({ ...prev, ...partial }))
  }

  const toggleInterest = (tag: InterestTag) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag],
    }))
  }

  const generate = async () => {
    setStep('generating')
    setError(null)
    setStage(0)

    const interval = setInterval(() => {
      setStage(s => Math.min(s + 1, STAGES.length - 1))
    }, 1800)

    try {
      const res = await fetch('/api/book-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `请求失败 ${res.status}`)
      }
      const data = (await res.json()) as BookGuideResponse
      setResult(data)
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
      setStep('excerpt')
    } finally {
      clearInterval(interval)
    }
  }

  const canNextBook = form.bookTitle.trim().length > 0
  const canNextTrip = form.city.trim().length > 0

  return (
    <>
      {/* 浮窗按钮 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="xc-book-guide-fab animate-pulse-soft"
          aria-label="跟书旅行 AI 向导"
        >
          <span className="text-xl leading-none">📖</span>
          <span className="xc-book-guide-fab-label">跟书旅行</span>
        </button>
      )}

      {/* 面板 */}
      {open && (
        <div className="xc-book-guide-panel" role="dialog" aria-label="跟书旅行向导">
          {/* 顶栏 */}
          <div className="xc-book-guide-header">
            <div>
              <p className="text-[10px] tracking-widest text-literary-wine uppercase">寻城 AI</p>
              <h2 className="font-serif font-semibold text-literary-ink text-sm">
                跟书旅行向导
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="w-8 h-8 rounded-full hover:bg-literary-sand/60 flex items-center justify-center text-literary-muted"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {/* 步骤指示 */}
          {step !== 'generating' && step !== 'done' && (
            <div className="flex gap-1 px-4 pb-3">
              {(['book', 'trip', 'excerpt'] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    (['book', 'trip', 'excerpt'].indexOf(step) >= i)
                      ? 'bg-literary-wine'
                      : 'bg-literary-sand'
                  )}
                />
              ))}
            </div>
          )}

          <div className="xc-book-guide-body">
            {/* Step 1: 书籍 */}
            {step === 'book' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-literary-muted leading-relaxed">
                  告诉我你想跟着哪本书去旅行，我会从书中提取地点，并对照现实世界生成攻略。
                </p>
                <label className="block">
                  <span className="text-xs text-literary-ink font-medium">书名 *</span>
                  <input
                    type="text"
                    value={form.bookTitle}
                    onChange={e => patch({ bookTitle: e.target.value })}
                    placeholder="如：人间滋味、桨声灯影里的秦淮河"
                    className="xc-book-guide-input mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-literary-ink font-medium">作者</span>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => patch({ author: e.target.value })}
                    placeholder="如：汪曾祺、朱自清"
                    className="xc-book-guide-input mt-1"
                  />
                </label>
                <button
                  type="button"
                  disabled={!canNextBook}
                  onClick={() => setStep('trip')}
                  className="xc-book-guide-btn w-full"
                >
                  下一步 →
                </button>
              </div>
            )}

            {/* Step 2: 行程偏好 */}
            {step === 'trip' && (
              <div className="space-y-4 animate-fade-in">
                <label className="block">
                  <span className="text-xs text-literary-ink font-medium">目标城市 *</span>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => patch({ city: e.target.value })}
                    placeholder="如：高邮、南京、扬州"
                    className="xc-book-guide-input mt-1"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-literary-ink font-medium">旅行天数</span>
                    <span className="text-xs text-literary-wine font-medium">{form.days} 天</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={form.days}
                    onChange={e => patch({ days: Number(e.target.value) })}
                    className="w-full accent-literary-wine"
                  />
                </div>

                <div>
                  <span className="text-xs text-literary-ink font-medium">兴趣方向</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESTS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs border transition-colors',
                          form.interests.includes(tag)
                            ? 'bg-literary-wine text-white border-literary-wine'
                            : 'bg-white border-literary-sand text-literary-muted hover:border-literary-wine/40'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-literary-ink font-medium">预算</span>
                  <div className="flex gap-2 mt-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => patch({ budget: b })}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-xs border transition-colors',
                          form.budget === b
                            ? 'bg-literary-wine text-white border-literary-wine'
                            : 'bg-white border-literary-sand text-literary-muted'
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs text-literary-ink font-medium">旅游偏好（可选）</span>
                  <textarea
                    value={form.preferences}
                    onChange={e => patch({ preferences: e.target.value })}
                    placeholder="如：想多走老街、少去网红店、带老人节奏慢…"
                    rows={2}
                    className="xc-book-guide-input mt-1 resize-none"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('book')}
                    className="flex-1 py-2.5 rounded-full border border-literary-sand text-xs text-literary-muted"
                  >
                    ← 上一步
                  </button>
                  <button
                    type="button"
                    disabled={!canNextTrip}
                    onClick={() => setStep('excerpt')}
                    className="xc-book-guide-btn flex-[2]"
                  >
                    下一步 →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 摘录（可选） */}
            {step === 'excerpt' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-literary-muted">
                  粘贴书中段落（可选），AI 将从中精准提取地点与原文引用。
                </p>
                <textarea
                  value={form.bookExcerpt}
                  onChange={e => patch({ bookExcerpt: e.target.value })}
                  placeholder="粘贴书中描写地点的段落…"
                  rows={5}
                  className="xc-book-guide-input resize-none"
                />
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('trip')}
                    className="flex-1 py-2.5 rounded-full border border-literary-sand text-xs text-literary-muted"
                  >
                    ← 上一步
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    className="xc-book-guide-btn flex-[2]"
                  >
                    ✨ 生成攻略
                  </button>
                </div>
              </div>
            )}

            {/* 生成中 */}
            {step === 'generating' && (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="text-3xl animate-pulse">📖</div>
                <p className="font-serif text-sm text-literary-ink">
                  正在为《{form.bookTitle}》规划 {form.city} 之旅…
                </p>
                <div className="space-y-2 text-left px-4">
                  {STAGES.map((text, i) => (
                    <p
                      key={text}
                      className={cn(
                        'text-xs transition-opacity duration-500',
                        i <= stage ? 'text-literary-ink opacity-100' : 'text-literary-muted opacity-30'
                      )}
                    >
                      {i <= stage ? '✓' : '○'} {text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 完成 */}
            {step === 'done' && result && (
              <div className="animate-fade-in">
                <BookGuideResultView result={result} compact />
                <div className="flex gap-2 mt-4 sticky bottom-0 bg-white/95 pt-2 pb-1">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex-1 py-2.5 rounded-full border border-literary-sand text-xs text-literary-muted"
                  >
                    重新规划
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveBookGuideAndNavigate(result)
                    }}
                    className="xc-book-guide-btn flex-[2]"
                  >
                    查看完整攻略 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
