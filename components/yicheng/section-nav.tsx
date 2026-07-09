'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/yicheng', label: '总览', exact: true },
  { href: '/yicheng/booking', label: '工坊预约' },
  { href: '/yicheng/ar', label: 'AR 教学' },
  { href: '/yicheng/community', label: '传承社区' },
]

export function YichengNav() {
  const pathname = usePathname()
  return (
    <div className="border-b border-ink-100 bg-paper">
      <div className="xc-container flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <span className="mr-3 hidden sm:flex h-7 w-7 items-center justify-center rounded-md bg-vermilion font-serif text-sm font-bold text-white">
          遗
        </span>
        {tabs.map(t => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'relative whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors',
                active ? 'text-vermilion' : 'text-ink-500 hover:text-charcoal'
              )}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-vermilion" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
