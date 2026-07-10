'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/#routes', label: '路线' },
  { href: '/yicheng', label: '非遗工坊' },
  { href: '/xhs', label: '小红书文案' },
  { href: '/guide/destination', label: '搜目的地' },
]

interface SiteHeaderProps {
  variant?: 'light' | 'dark' | 'transparent'
}

export function SiteHeader({ variant = 'light' }: SiteHeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const style =
    variant === 'transparent'
      ? 'bg-transparent text-white border-transparent'
      : variant === 'dark'
        ? 'bg-charcoal text-white border-white/10'
        : 'bg-white/90 backdrop-blur-md text-charcoal border-ink-100'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors',
        isHome && variant === 'transparent' ? 'absolute inset-x-0 border-transparent bg-transparent' : style
      )}
    >
      <div className="xc-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-xuncheng-500 text-sm font-bold text-white shadow-md group-hover:scale-105 transition-transform">
            寻
          </span>
          <span className={cn('font-serif text-lg font-bold tracking-wide', variant === 'transparent' && isHome ? 'text-white' : '')}>
            寻城
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-xuncheng-500',
                variant === 'transparent' && isHome ? 'text-white/90 hover:text-white' : 'text-ink-500'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/guide/shajiabang"
          className={cn(
            'xc-pill text-xs sm:text-sm',
            variant === 'transparent' && isHome
              ? 'bg-white text-charcoal hover:bg-white/90'
              : 'bg-charcoal text-white hover:bg-charcoal-50'
          )}
        >
          开始探索 →
        </Link>
      </div>
    </header>
  )
}
