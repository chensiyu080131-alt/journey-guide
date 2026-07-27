'use client'

import { useState } from 'react'
import Link from 'next/link'
import { YichengShell } from '@/components/yicheng/yicheng-shell'
import { Badge, Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { workshops, workshopFilters, toneBg, type Workshop } from '@/lib/yicheng-data'

export default function BookingPage() {
  const [filter, setFilter] = useState<string>('all')
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const filtered = filter === 'all' ? workshops : workshops.filter(w => w.cat === filter)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <YichengShell>
      {/* Header */}
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Workshop Booking</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">非遗工坊 · 在线预约</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-500">
            整合虞林世家非遗馆、常熟花边社等 <b className="text-vermilion">11 家</b> 市级非遗工坊,提供分时段预约、实时名额与材料清单。选择工坊 → 选时段 → 填写信息即可完成预约。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12">
          {/* 筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {workshopFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn('xc-pill text-sm', filter === f.id ? 'xc-pill-active' : 'xc-pill-inactive')}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 工坊列表 */}
          <div className="space-y-4">
            {filtered.map(w => (
              <WorkshopRow key={w.id} w={w} picked={picked[w.id]} onPick={slot => setPicked(p => ({ ...p, [w.id]: slot }))} />
            ))}
          </div>

          {/* 报名表单 */}
          <div id="form" className="mt-16 grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Registration</span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-charcoal">填写报名信息</h2>
              <p className="mt-2 text-sm text-ink-500">请先在上方选择工坊与时段,再填写以下信息完成预约。</p>
              <ul className="mt-5 space-y-2 text-sm text-ink-400">
                <li>· 提前 <b className="text-charcoal">15 天</b> 开放预约,名额有限,先约先得</li>
                <li>· 亲子任务需家长同步到场,提交材料清单</li>
                <li>· 完成工坊即可获 <b className="text-charcoal">电子研学证书</b>(区块链存证)</li>
                <li>· 可叠加 <b className="text-charcoal">常熟一卡通</b> 积分兑换优惠</li>
              </ul>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-paper p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1.5">预约工坊</label>
                <select className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-xuncheng-400">
                  {workshops.map(w => <option key={w.id}>{w.title}</option>)}
                </select>
              </div>
              <Input label="参与者姓名" placeholder="请填写孩子或本人姓名" required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="联系电话" type="tel" placeholder="11 位手机号" />
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-1.5">参与人数</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-xuncheng-400">
                    <option>1 人</option><option>2 人(亲子)</option><option>3 人</option><option>4 人及以上</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1.5">孩子年龄段(用于匹配任务难度)</label>
                <select className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-xuncheng-400">
                  <option>小学低年级(6-9 岁)</option>
                  <option>小学高年级(10-12 岁)</option>
                  <option>初中(13-15 岁)</option>
                  <option>高中及以上</option>
                  <option>成人 / 亲子家庭</option>
                </select>
              </div>
              <Button type="submit" className="w-full rounded-full">提交预约</Button>
              {done && (
                <p className="text-center text-sm text-jade">✓ 预约已提交,我们会短信通知您确认(原型演示)</p>
              )}
              <p className="text-center text-xs text-ink-300">提交即同意《非遗工坊参与须知》,原型演示不会真实保存信息</p>
            </form>
          </div>
        </div>
      </section>
    </YichengShell>
  )
}

function WorkshopRow({ w, picked, onPick }: { w: Workshop; picked?: string; onPick: (s: string) => void }) {
  return (
    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[92px_1fr_auto] gap-4 sm:gap-6 items-center rounded-2xl border border-ink-100 bg-white p-5 transition-all hover:shadow-md">
      <span className={cn('flex h-20 w-20 items-center justify-center rounded-xl font-serif text-4xl font-bold text-white', toneBg[w.tone])}>
        {w.char}
      </span>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-serif text-lg font-bold text-charcoal">{w.title}</h3>
          {w.level && <Badge variant={w.level === '国家级' ? '美食' : '自然'}>{w.level}</Badge>}
        </div>
        <p className="mt-1 text-xs text-ink-400">{w.venue} · {w.master} · {w.duration} · 适合 {w.age}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {w.slots.map(s => (
            <button
              key={s.time}
              disabled={s.full}
              onClick={() => onPick(s.time)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs transition-colors',
                s.full
                  ? 'border-ink-100 text-ink-300 line-through cursor-not-allowed'
                  : picked === s.time
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-vermilion hover:text-vermilion'
              )}
            >
              {s.time}{s.full ? ' 已满' : ''}
            </button>
          ))}
        </div>
      </div>
      <a href="#form" className="hidden sm:block">
        <Button variant="outline" size="sm">选择</Button>
      </a>
    </div>
  )
}
