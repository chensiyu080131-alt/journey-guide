'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'

/** P1 · 商务合作表单（仅 UI，提交弹 Toast） */
export function ContactForm() {
  const [form, setForm] = useState({ city: '', contact: '', phone: '' })
  const [toast, setToast] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToast(true)
    setForm({ city: '', contact: '', phone: '' })
    setTimeout(() => setToast(false), 3000)
  }

  const valid = form.city.trim() && form.contact.trim() && form.phone.trim()

  return (
    <Card className="p-5 sm:p-6 space-y-4 relative overflow-hidden">
      <div>
        <h2 className="text-lg font-serif font-bold text-ink-900">🤝 商务合作洽谈</h2>
        <p className="text-sm text-ink-500 mt-1">留下信息，商务经理将为贵地量身定制文学旅行方案。</p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          value={form.city}
          onChange={set('city')}
          placeholder="城市 / 地区名称"
          className="px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        <input
          value={form.contact}
          onChange={set('contact')}
          placeholder="联系人"
          className="px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        <input
          value={form.phone}
          onChange={set('phone')}
          placeholder="手机号"
          className="px-4 py-3 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-xuncheng-400"
        />
        <button
          type="submit"
          disabled={!valid}
          className="sm:col-span-3 py-3 rounded-xl bg-xuncheng-500 text-white text-sm font-medium hover:bg-xuncheng-600 disabled:opacity-40 transition-colors"
        >
          提交合作意向
        </button>
      </form>

      {toast && (
        <div className="absolute inset-x-0 bottom-0 p-4 animate-slide-up">
          <div className="rounded-xl bg-jade text-white text-sm font-medium px-4 py-3 shadow-lg text-center">
            ✅ 已提交，商务经理将在 24 小时内联系您
          </div>
        </div>
      )}
    </Card>
  )
}
