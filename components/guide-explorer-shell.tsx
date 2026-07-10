'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GuideExplorerShellProps {
  backHref: string
  backLabel?: string
  title: string
  subtitle?: string
  eyebrow?: string
  sidebar: ReactNode
  /** 地图上方的紧凑筛选条（可选） */
  toolbar?: ReactNode
  children: ReactNode
  /** 地图下方折叠区（路线介绍等） */
  below?: ReactNode
  className?: string
}

/** 攻略页统一外壳：紧凑顶栏 + 左栏 + 首屏地图 */
export function GuideExplorerShell({
  backHref,
  backLabel = '← 返回封面选择',
  title,
  subtitle,
  eyebrow,
  sidebar,
  toolbar,
  children,
  below,
  className,
}: GuideExplorerShellProps) {
  return (
    <main className={cn('xc-explorer-bg min-h-screen flex flex-col', className)}>
      <div className="xc-container w-full flex-1 flex flex-col py-4 sm:py-5 pb-8 min-h-0">
        <header className="flex-shrink-0 mb-3 sm:mb-4">
          <Link
            href={backHref}
            className="text-xs text-warm-gray-muted hover:text-celadon-600 no-underline"
          >
            {backLabel}
          </Link>
          <div className="mt-2 sm:mt-3">
            {eyebrow && (
              <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-1">{eyebrow}</p>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-warm-gray tracking-tight leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm lg:text-base text-warm-gray-muted line-clamp-2 md:line-clamp-none leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-6 flex-1 min-h-0">
          <div className="flex-shrink-0 order-2 md:order-1 md:max-h-[calc(100vh-140px)] md:overflow-y-auto">
            {sidebar}
          </div>
          <div className="flex-1 min-w-0 flex flex-col min-h-0 order-1 md:order-2">
            {toolbar && <div className="flex-shrink-0 mb-2">{toolbar}</div>}
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
            {below && <div className="flex-shrink-0 mt-4">{below}</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
