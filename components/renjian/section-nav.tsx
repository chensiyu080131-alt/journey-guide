'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/renjian', label: '封面', exact: true },
  { href: '/renjian/gaoyou', label: '高邮深度' },
  { href: '/renjian/map', label: '全国美食地图' },
  { href: '/renjian/timeline', label: '人生轨迹' },
]

export function RenjianNav() {
  const pathname = usePathname()
  return (
    <div className="border-b border-ink-100 bg-paper">
      <div className="xc-container flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <span className="mr-3 hidden sm:flex h-7 w-7 items-center justify-center rounded-md bg-[#A65D5D] font-serif text-sm font-bold text-white">
          味
        </span>
        {tabs.map(t => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'relative whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors',
                active ? 'text-[#A65D5D]' : 'text-ink-500 hover:text-charcoal'
              )}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#A65D5D]" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
