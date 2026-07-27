'use client'

/** P1 · 内容资产看板（Mock 数据，展示商业想象力） */
const KPIS: { label: string; value: string; hint: string; emoji: string }[] = [
  { emoji: '🏙️', label: '已生成路线城市', value: '3', hint: '常熟 · 松阳 · 婺源' },
  { emoji: '📚', label: '累计生成攻略', value: '87 篇', hint: '含预设 + AI 生成' },
  { emoji: '💰', label: '预估带动文旅消费', value: '¥2.3M', hint: '按引流转化估算' },
  { emoji: '⚡', label: 'AI 内容生产成本', value: '¥47.50', hint: '单篇平均 token 成本' },
]

export function AssetBoard() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-serif font-bold text-ink-900">📊 内容资产看板</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map(k => (
          <div
            key={k.label}
            className="rounded-2xl border border-ink-100 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="text-xl">{k.emoji}</div>
            <div className="mt-2 text-2xl font-serif font-bold text-charcoal">{k.value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{k.label}</div>
            <div className="text-[11px] text-ink-300 mt-1">{k.hint}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-300">* 看板为演示数据，用于说明内容资产的规模与单位成本优势。</p>
    </div>
  )
}
