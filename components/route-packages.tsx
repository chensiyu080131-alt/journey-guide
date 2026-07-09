'use client'

import Link from 'next/link'
import { entryCards } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function RoutePackages() {
  return (
    <section id="routes" className="bg-charcoal py-20 sm:py-28">
      <div className="xc-container">
        <div className="text-center mb-14">
          <p className="text-xuncheng-400 text-sm font-medium tracking-widest uppercase mb-3">
            Our Tour Package
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            常熟 · 三条文学路线
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-lg mx-auto">
            每一条路都有书里的原文、脚下的实景。黑客松 Demo 可落地，常熟文旅局合作洽谈中。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {entryCards.map((card, i) => (
            <Link
              key={card.id}
              href={card.route}
              className={cn(
                'xc-dark-card group hover:-translate-y-1 hover:shadow-2xl',
                i === 1 ? 'xc-dark-card-light md:-mt-4 md:mb-4' : 'xc-dark-card-dark'
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn(
                  'text-3xl font-serif font-bold',
                  i === 1 ? 'text-charcoal' : 'text-white'
                )}>
                  {card.priceHint}
                </span>
                <span className={cn(
                  'text-xs font-medium px-3 py-1 rounded-full',
                  i === 1 ? 'bg-ink-100 text-ink-600' : 'bg-white/10 text-white/70'
                )}>
                  {card.days}天行程
                </span>
              </div>

              <h3 className={cn(
                'mt-6 text-xl font-serif font-bold',
                i === 1 ? 'text-charcoal' : 'text-white'
              )}>
                {card.title}
              </h3>
              <p className={cn(
                'mt-2 text-sm leading-relaxed',
                i === 1 ? 'text-ink-500' : 'text-white/60'
              )}>
                {card.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full',
                      i === 1 ? 'bg-ink-50 text-ink-500' : 'bg-white/10 text-white/70'
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className={cn(
                'mt-8 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all',
                i === 1 ? 'text-xuncheng-600' : 'text-xuncheng-400'
              )}>
                查看路线 <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
