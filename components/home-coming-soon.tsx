'use client'

const tabMeta: Record<'音乐' | '游戏', { motif: 'note' | 'game'; hint: string }> = {
  音乐: {
    motif: 'note',
    hint: '江南曲调、古琴雅韵与戏曲唱段，即将在此与你相遇',
  },
  游戏: {
    motif: 'game',
    hint: '诗词诵读、古籍寻宝与书法临摹，互动体验筹备中',
  },
}

function MotifIcon({ type }: { type: 'note' | 'game' }) {
  const stroke = '#8B4545'
  const cls = 'w-20 h-20 sm:w-24 sm:h-24 opacity-30'
  if (type === 'note') {
    return (
      <svg viewBox="0 0 64 64" className={cls} fill="none">
        <ellipse cx="32" cy="44" rx="18" ry="6" stroke={stroke} strokeWidth="1.2" />
        <path d="M18 44 Q32 18 46 44" stroke={stroke} strokeWidth="1.5" />
        <circle cx="18" cy="44" r="2.5" fill={stroke} opacity="0.5" />
        <line x1="46" y1="44" x2="46" y2="28" stroke={stroke} strokeWidth="1.2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className={cls} fill="none">
      <rect x="14" y="22" width="36" height="24" rx="4" stroke={stroke} strokeWidth="1.2" />
      <circle cx="24" cy="34" r="4" stroke={stroke} strokeWidth="1" />
      <circle cx="40" cy="30" r="2" fill={stroke} opacity="0.5" />
      <circle cx="44" cy="36" r="2" fill={stroke} opacity="0.5" />
    </svg>
  )
}

interface HomeComingSoonProps {
  tab: '音乐' | '游戏'
}

export function HomeComingSoon({ tab }: HomeComingSoonProps) {
  const meta = tabMeta[tab]

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-6 py-12 sm:py-16 animate-fade-in">
      <div
        className="relative w-full rounded-2xl border border-literary-sand bg-white/80 shadow-sm overflow-hidden"
        style={{ aspectRatio: '4 / 3' }}
      >
        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-literary-wine/20" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-literary-wine/20" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-literary-wine/20" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-literary-wine/20" />

        <div className="flex flex-col items-center justify-center h-full px-8 py-10 text-center">
          <MotifIcon type={meta.motif} />
          <p className="mt-4 text-[11px] tracking-[0.3em] text-literary-wine font-serif uppercase">
            Coming Soon
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-semibold text-literary-ink tracking-widest">
            待开发
          </h2>
          <p className="mt-4 text-sm text-literary-muted leading-relaxed font-serif">
            {meta.hint}
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-literary-muted tracking-wide font-serif">
        该模块正在筹备中，敬请期待
      </p>
    </div>
  )
}
