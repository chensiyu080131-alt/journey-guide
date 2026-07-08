'use client'

import { useState } from 'react'
import { Guide, DialectItem, LocalExperience } from '@/types'
import { DayGroup } from './day-group'
import { GuideMap } from './guide-map'
import { Badge, Card } from './ui'

interface GuideViewProps {
  guide: Guide
}

export function GuideView({ guide }: GuideViewProps) {
  const [completed, setCompleted] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleComplete = () => {
    setCompleted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate a cultural badge based on the guide
  const badgeInfo = getCulturalBadge(guide)

  if (completed) {
    return (
      <div className="animate-fade-in space-y-6 py-8">
        {/* 完成卡片 */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-xuncheng-400 to-xuncheng-600 flex items-center justify-center text-4xl shadow-lg shadow-xuncheng-200">
              {badgeInfo.emoji}
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-ink-900">
            旅程完成！
          </h2>
          <p className="text-sm text-ink-500">
            你已完成「{guide.title}」的全部行程
          </p>
        </div>

        {/* 完成信息卡 */}
        <Card className="p-5 space-y-4">
          <div className="text-center space-y-3">
            <h3 className="font-serif font-bold text-lg text-ink-900">
              {guide.title}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-ink-500">
              <span>{guide.city} · {guide.province}</span>
              <span className="text-ink-200">·</span>
              <span>{guide.days}天行程</span>
            </div>
            <p className="text-xs text-ink-400">
              完成时间：{new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>

          <div className="border-t border-ink-100 pt-4">
            <p className="text-center text-sm text-ink-500 mb-3">获得文化勋章</p>
            <div className="flex justify-center">
              <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-br from-xuncheng-50 to-amber-50 border border-xuncheng-200">
                <span className="text-4xl">{badgeInfo.emoji}</span>
                <span className="font-serif font-bold text-ink-900">{badgeInfo.name}</span>
                <span className="text-xs text-ink-500 text-center max-w-[200px]">{badgeInfo.desc}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-3 rounded-xl bg-xuncheng-500 text-white text-sm font-medium hover:bg-xuncheng-600 transition-all"
          >
            {copied ? '✅ 链接已复制' : '🔗 分享路线'}
          </button>
          <button
            onClick={() => setCompleted(false)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-ink-200 bg-white text-ink-700 text-sm font-medium hover:bg-ink-50 transition-all"
          >
            ↩ 返回攻略
          </button>
        </div>

        {/* 鼓励语 */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-ink-400 font-serif">
            "纸上得来终觉浅，绝知此事要躬行。"
          </p>
          <p className="text-xs text-ink-300">—— 陆游《冬夜读书示子聿》</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 攻略头部 */}
      <div className="text-center space-y-3 py-2">
        {/* 入口类型标签 */}
        <div className="flex justify-center">
          <Badge variant={guide.entryType === '书籍' ? '文化' : guide.entryType === '人物' ? '体验' : 'default'}>
            {guide.entryType === '书籍' ? '📖' : guide.entryType === '人物' ? '👤' : '📍'}{' '}
            {guide.entryType === '书籍' ? '跟着书走' : guide.entryType === '人物' ? '跟着人走' : '目的地'}
          </Badge>
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-900">{guide.title}</h2>
          <p className="text-sm text-ink-500 mt-1">{guide.subtitle}</p>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs text-ink-400">{guide.province}</span>
          <span className="text-ink-200">·</span>
          <Badge variant="default">{guide.days}天行程</Badge>
          <Badge variant="default">{guide.budget}</Badge>
          {guide.relatedBook && (
            <Badge variant="文化">📕 {guide.relatedBook}</Badge>
          )}
          {guide.relatedCharacter && (
            <Badge variant="体验">👤 {guide.relatedCharacter}</Badge>
          )}
        </div>
      </div>

      {/* 路线引言 */}
      {guide.routeIntro && (
        <Card className="p-5 bg-gradient-to-br from-xuncheng-50/50 to-paper border-xuncheng-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {guide.entryType === '书籍' ? '📖' : guide.entryType === '人物' ? '👤' : '🗺️'}
            </span>
            <div>
              <h3 className="font-bold text-sm text-xuncheng-700 mb-2">
                {guide.entryType === '书籍' ? '书本里的路' : guide.entryType === '人物' ? '一个人的足迹' : '这条路的故事'}
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">{guide.routeIntro}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 旅行贴士 */}
      {guide.tips && guide.tips.length > 0 && (
        <Card className="p-4 bg-xuncheng-50/50 border-xuncheng-100">
          <h3 className="font-bold text-sm text-xuncheng-700 mb-2">💡 旅行贴士</h3>
          <ul className="space-y-1.5">
            {guide.tips.map((tip, i) => (
              <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                <span className="text-xuncheng-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 路线地图 */}
      <GuideMap guide={guide} />

      {/* 每日行程 */}
      <div className="space-y-8">
        {guide.dayPlans.map(dayPlan => (
          <DayGroup key={dayPlan.day} dayPlan={dayPlan} />
        ))}
      </div>

      {/* 在地体验 */}
      {guide.localExperiences && guide.localExperiences.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-ink-900 flex items-center gap-2">
            🎪 在地体验
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {guide.localExperiences.map((exp, i) => (
              <LocalExperienceCard key={i} experience={exp} />
            ))}
          </div>
        </div>
      )}

      {/* 方言速查 */}
      {guide.dialect && guide.dialect.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-ink-900 flex items-center gap-2">
            🗣️ 方言速查
          </h3>
          <Card className="overflow-hidden">
            <div className="divide-y divide-ink-50">
              {guide.dialect.map((d, i) => (
                <DialectRow key={i} dialect={d} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 完成旅程按钮 */}
      <div className="pt-4 pb-2">
        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-xuncheng-500 to-xuncheng-600 text-white font-bold text-base hover:from-xuncheng-600 hover:to-xuncheng-700 transition-all shadow-lg shadow-xuncheng-200 active:scale-[0.98]"
        >
          🏆 完成旅程，领取文化勋章
        </button>
      </div>

      {/* 底部信息 */}
      <div className="text-center text-xs text-ink-300 pb-8 pt-4 space-y-2">
        <p>攻略由寻城AI生成 · 内容仅供参考</p>
        <p>📝 核心理念：跟着书本去旅行，让文学照进现实</p>
        <p className="text-xuncheng-400">可落地常熟 · 合作洽谈：常熟文旅局</p>
      </div>
    </div>
  )
}

/** 根据攻略内容生成文化勋章 */
function getCulturalBadge(guide: Guide): { emoji: string; name: string; desc: string } {
  const badges: Record<string, { emoji: string; name: string; desc: string }> = {
    'shajiabang': { emoji: '🌾', name: '芦苇荡卫士', desc: '走过了阿庆嫂的茶馆，穿越了新四军的芦苇迷宫' },
    'niehaifeng': { emoji: '📜', name: '藏书楼守望者', desc: '追寻了曾朴的足迹，探访了五代人守的藏书楼' },
    'wengtonghe': { emoji: '🏛️', name: '帝师门生', desc: '走完了两代帝师的一生，感受了虞山的风骨' },
    'qianliu': { emoji: '🌿', name: '红豆知己', desc: '走过了钱柳的乱世情缘，在红豆树下读懂了爱情' },
  }

  if (guide.id && badges[guide.id]) {
    return badges[guide.id]
  }

  // Default badge based on entry type
  if (guide.entryType === '书籍') {
    return { emoji: '📖', name: '文学行者', desc: '跟着书中的文字走到了现实，让文学照进了生活' }
  }
  if (guide.entryType === '人物') {
    return { emoji: '👤', name: '足迹追随者', desc: '追寻了前人的足迹，感受了历史的风骨' }
  }
  return { emoji: '🗺️', name: '寻城行者', desc: '在陌生的城市找到了熟悉的故事' }
}

function LocalExperienceCard({ experience }: { experience: LocalExperience }) {
  const typeEmoji: Record<string, string> = {
    '赶集': '🎪',
    '时令': '🌸',
    '民俗': '🏮',
    '手艺': '🪄',
    '体验': '🎯',
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeEmoji[experience.type] || '✨'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink-900">{experience.name}</span>
            <Badge variant="体验">{experience.type}</Badge>
          </div>
          <p className="text-sm text-ink-600 mt-1">{experience.desc}</p>
          {experience.schedule && (
            <p className="text-xs text-xuncheng-600 mt-1.5">
              📅 {experience.schedule}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

function DialectRow({ dialect }: { dialect: DialectItem }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span className="font-bold text-xuncheng-600 text-lg min-w-[5em]">
        {dialect.dialect}
      </span>
      <span className="text-ink-600 text-sm flex-1">
        = {dialect.meaning}
      </span>
      <span className="text-ink-400 text-xs hidden sm:block">
        {dialect.scenario}
      </span>
    </div>
  )
}
