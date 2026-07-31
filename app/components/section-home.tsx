'use client'

/**
 * 灵感/音乐板块首页（Task2/3）
 * 不再只是封面轮播，而是：一句白话解释 + live 路线 + soon 占位
 * 让用户 10 秒内看懂这个板块是干什么的。
 */
import Link from 'next/link'
import type { HomeTab } from '@/lib/home-covers'
import { routesCatalog, type RouteCatalogItem } from '@/lib/routes-catalog'

interface SectionConfig {
  tab: HomeTab
  explain: string
  liveFilter: (r: RouteCatalogItem) => boolean
  soonFilter: (r: RouteCatalogItem) => boolean
  soonPlaceholders: { title: string; book: string; city: string }[]
  /** 栏目免责声明（灵感栏目必加，音乐栏目可选） */
  disclaimer?: string
}

const SECTIONS: Record<'🎐 东方美学' | '🎵 音乐', SectionConfig> = {
  '🎐 东方美学': {
    tab: '🎐 东方美学',
    explain:
      '跟着东方山水、楼阁与古典审美，去寻找那些启发了虚构世界的现实灵感地。不是按图索骥找"取景地"，而是去看真实的山川、水巷与飞檐——它们本身就是最了不起的创作原型。',
    liveFilter: r => r.category === 'inspiration' && r.status === 'live',
    soonFilter: r => false,
    soonPlaceholders: [
      { title: '东方楼阁与中式建筑美学', book: '东方美学·古建飞檐', city: '苏州/杭州' },
      { title: '古塔与长桥的空间美学', book: '东方美学·雷峰塔/宝带桥', city: '杭州/苏州' },
      { title: '石窟与造像的东方��象', book: '东方美学·石窟艺术', city: '待定' },
    ],
    disclaimer:
      '本栏目关注东方审美与现实地景对虚构世界创作的启发关系，不代表与任何游戏或影视品牌存在合作或授权关系。',
  },
  '🎵 音乐': {
    tab: '🎵 音乐',
    explain:
      '这不是听歌打卡，而是跟着一首词、一首歌里写到的地名和意境，去走一座城。词里的二十四桥、歌里的玉林路，都能变成脚下真实的路线。',
    liveFilter: r => r.slug === 'yangzhou-man-jiangkui',
    soonFilter: r => false,
    soonPlaceholders: [
      { title: '赵雷《成都》 · 玉林路慢慢走', book: '音乐·赵雷《成都》', city: '成都' },
      { title: '《金陵塔》 · 跟着曲儿逛南京', book: '音乐·金陵塔', city: '南京' },
      { title: '《苏州好风光》 · 一首歌里的苏州', book: '音乐·苏州好风光', city: '苏州' },
    ],
  },
}

export function SectionHome({ tab }: { tab: '🎐 东方美学' | '🎵 音乐' }) {
  const cfg = SECTIONS[tab]
  const live = routesCatalog.filter(r => r.status === 'live' && cfg.liveFilter(r))
  const soon = cfg.soonPlaceholders

  return (
    <section className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
      {/* 一句白话解释 */}
      <div className="rounded-2xl bg-white/70 border border-literary-wine/20 px-5 sm:px-8 py-5 sm:py-6">
        <h2 className="font-serif text-base sm:text-lg font-bold text-literary-ink leading-relaxed">
          {cfg.explain}
        </h2>
      </div>

      {/* 已上线路线 */}
      <div className="mt-6 flex items-end justify-between">
        <h3 className="font-serif text-lg font-bold text-literary-ink">已上线路线</h3>
        <span className="text-[11px] tracking-[0.2em] text-literary-wine uppercase">Live · {live.length}</span>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {live.map(r => (
          <Link
            key={r.slug}
            href={`/route/${r.slug}/`}
            className="group rounded-2xl border border-literary-wine/30 bg-white p-5 transition-all hover:border-literary-wine hover:shadow-md"
          >
            <div className="text-3xl">{r.emoji}</div>
            <h4 className="mt-2 font-serif text-lg font-bold text-literary-ink group-hover:text-literary-wine">
              {r.title}
            </h4>
            <p className="mt-1 text-xs text-literary-muted">{r.book} · {r.city}</p>
            <p className="mt-2 text-sm text-literary-muted leading-relaxed">{r.blurb}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-literary-muted">{r.pointsCount} 个点位</span>
              <span className="text-xs font-semibold text-literary-wine">进入路线 →</span>
            </div>
          </Link>
        ))}
        {live.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-5 text-sm text-ink-400">
            该板块路线正在筹备，敬请期待。
          </div>
        )}
      </div>

      {/* 即将上线占位 */}
      <h3 className="mt-8 font-serif text-lg font-bold text-literary-ink">即将上线</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {soon.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/60 p-5 opacity-80"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl grayscale">💡</span>
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-400">筹备中</span>
            </div>
            <h4 className="mt-2 font-serif text-base font-bold text-literary-ink">{s.title}</h4>
            <p className="mt-1 text-xs text-literary-muted">{s.book} · {s.city}</p>
          </div>
        ))}
      </div>

      {/* 免责声明（灵感栏目底部） */}
      {cfg.disclaimer && (
        <div className="mt-8 rounded-xl border border-literary-wine/15 bg-literary-paper/30 px-5 py-4">
          <p className="text-xs text-literary-muted leading-relaxed font-serif">
            {cfg.disclaimer}
          </p>
        </div>
      )}
    </section>
  )
}
