'use client'

import { useState } from 'react'
import { YichengShell } from '@/components/yicheng/yicheng-shell'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { posts, communityTabs, toneBg, toneGrad, type Post } from '@/lib/yicheng-data'

export default function CommunityPage() {
  const [tab, setTab] = useState<string>('all')
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const filtered = tab === 'all' ? posts : posts.filter(p => p.tag === tab)
  const [toastMsg, setToastMsg] = useState('')
  const toast = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2000) }

  return (
    <YichengShell>
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Heritage Community</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">传承社区 · 虞韵新生</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-500">
            "非遗传承人 + 指导老师 + 大学生主理人 + 小小非遗推荐官" 四级梯队。上传研学成果、参与"虞韵新生"线上展览,作品可获区块链存证电子证书。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12">
          {/* 直播预告 */}
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-ink-100 bg-gradient-to-br from-vermilion/10 to-xuncheng-100/40 p-6 sm:p-8">
            <div>
              <span className="inline-block rounded-full bg-vermilion/10 px-2.5 py-0.5 text-xs font-medium text-vermilion">🔴 传承人直播</span>
              <h3 className="mt-2 font-serif text-xl font-bold text-charcoal">朱晞 · 古琴减字谱公开课</h3>
              <p className="mt-1 text-sm text-ink-500">本周日 19:30 · "读城有理"非遗宣讲开放麦 · 支持弹幕互动与知识问答</p>
            </div>
            <Button variant="outline" className="rounded-full shrink-0" onClick={() => toast('已预约直播提醒 ✓')}>预约直播</Button>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-1 border-b border-ink-100">
            {communityTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  tab === t.id ? 'border-vermilion text-vermilion' : 'border-transparent text-ink-500 hover:text-charcoal'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 作品流 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <PostCard key={p.id} p={p} liked={!!liked[p.id]} onLike={() => setLiked(s => ({ ...s, [p.id]: !s[p.id] }))} />
            ))}
          </div>

          {/* 发布入口 */}
          <div className="mt-12 rounded-3xl border border-ink-100 bg-paper p-8 text-center">
            <h3 className="font-serif text-xl font-bold text-charcoal">分享你的非遗研学成果</h3>
            <p className="mt-2 text-sm text-ink-500">上传作品 / 提问 / 预约直播,优秀作品入选"虞韵新生"线上展览并获电子证书</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full" onClick={() => toast('发布入口(原型占位)')}>＋ 发布作品</Button>
              <Button variant="outline" className="rounded-full" onClick={() => toast('提问入口(原型占位)')}>✎ 发起提问</Button>
            </div>
          </div>
        </div>
      </section>

      {toastMsg && (
        <div className="fixed bottom-9 left-1/2 z-50 -translate-x-1/2 rounded-full bg-charcoal px-6 py-3 text-sm text-white shadow-lg">
          {toastMsg}
        </div>
      )}
    </YichengShell>
  )
}

function PostCard({ p, liked, onLike }: { p: Post; liked: boolean; onLike: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all hover:shadow-md">
      <div className={cn('grid aspect-[4/3] place-items-center font-serif text-6xl text-white bg-gradient-to-br', toneGrad[p.tone])}>
        {p.char}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-ink-400">
          <span className={cn('grid h-6 w-6 place-items-center rounded-full font-serif text-xs text-white', toneBg[p.tone])}>
            {p.author[0]}
          </span>
          {p.authorRole} · {p.author}
        </div>
        <h4 className="font-serif text-base font-bold text-charcoal">{p.title}</h4>
        <p className="mt-1 text-sm text-ink-500">{p.desc}</p>
        <div className="mt-3 flex gap-4 text-sm text-ink-400">
          <button onClick={onLike} className={cn('transition-colors hover:text-vermilion', liked && 'text-vermilion')}>
            {liked ? '❤️' : '🤍'} {p.likes + (liked ? 1 : 0)}
          </button>
          <span>💬 {p.comments}</span>
          <span>⭐ 收藏</span>
        </div>
      </div>
    </div>
  )
}
