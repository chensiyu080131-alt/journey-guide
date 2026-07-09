'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/guide/niehaifeng', label: '读原文' },
  { href: '/#books', label: '选路线' },
]

export function LiteraryNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-center gap-3 sm:gap-5">
      {navItems.map(item => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : item.href !== '/#books' && pathname.startsWith(item.href)

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'xc-nav-tab',
              isActive && 'xc-nav-tab-active'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
