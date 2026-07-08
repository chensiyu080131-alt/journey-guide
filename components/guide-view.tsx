'use client'

import { Guide, DialectItem, LocalExperience } from '@/types'
import { DayGroup } from './day-group'
import { GuideMap } from './guide-map'
import { Badge, Card } from './ui'

interface GuideViewProps {
  guide: Guide
}

export function GuideView({ guide }: GuideViewProps) {
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

      {/* 底部信息 */}
      <div className="text-center text-xs text-ink-300 pb-8 pt-4 space-y-2">
        <p>攻略由寻城AI生成 · 内容仅供参考</p>
        <p>📝 核心理念：跟着书本去旅行，让文学照进现实</p>
        <p className="text-xuncheng-400">可落地常熟 · 合作洽谈：常熟文旅局</p>
      </div>
    </div>
  )
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
