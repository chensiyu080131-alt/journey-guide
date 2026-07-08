'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { EntryCards } from '@/components/entry-cards'
import { RoutePackages } from '@/components/route-packages'
import { HowItWorks } from '@/components/how-it-works'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=2000&q=80'

const heroThumbs = [
  'https://images.unsplash.com/photo-1501785888041-af3bcb1dd4?w=400&q=80',
  'https://images.unsplash.com/photo-1599579676330-89393406983e?w=400&q=80',
  'https://images.unsplash.com/photo-1529928520614-829854c79449?w=400&q=80',
]

export default function HomePage() {
  return (
    <>
      <SiteHeader variant="transparent" />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="江南山水"
          fill
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 xc-hero-gradient" />

        <div className="relative z-10 w-full xc-container pb-16 sm:pb-24 pt-32">
          <div className="max-w-3xl">
            <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-4">
              跟着书本去旅行 · 常熟先行
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              难忘的
              <br />
              <span className="italic font-normal">文学</span>
              <span className="text-xuncheng-400">小城之旅</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/70 max-w-lg leading-relaxed">
              选一本书、一个人、一座城。AI 把原文和实景连成可落地的旅行路线——2844 个县城，从常熟开始。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/guide/shajiabang" className="xc-pill bg-white text-charcoal hover:bg-white/90 shadow-xl">
                探索常熟路线 →
              </Link>
              <Link href="/guide/destination" className="xc-pill bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur">
                搜一座城
              </Link>
            </div>
          </div>

          {/* 底部缩略图 */}
          <div className="mt-12 flex gap-3">
            {heroThumbs.map((src, i) => (
              <div key={i} className="relative h-16 w-24 sm:h-20 sm:w-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
                <Image src={src} alt="" fill className="object-cover" unoptimized sizes="128px" />
              </div>
            ))}
            <div className="flex items-end pb-1 text-white/50 text-xs ml-2">
              01 / 03
            </div>
          </div>
        </div>
      </section>

      {/* 路线轮播 */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="xc-container">
          <div className="text-center mb-12">
            <p className="text-xuncheng-500 text-sm font-medium tracking-widest uppercase mb-3">
              Featured Routes
            </p>
            <h2 className="xc-section-title">选你的旅行入口</h2>
            <p className="xc-section-subtitle">
              书籍、人物、目的地 — 三种方式进入小城的故事
            </p>
          </div>
          <EntryCards />
        </div>
      </section>

      {/* 深色套餐区 */}
      <RoutePackages />

      {/* 特色 */}
      <section className="py-16 bg-ink-50">
        <div className="xc-container grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '📖', title: '原文对照', desc: '书中写的就是脚下' },
            { icon: '🗺️', title: '路线地图', desc: '高德标记 + 时段排序' },
            { icon: '🍜', title: '在地美食', desc: '本地人吃的，非网红' },
          ].map(item => (
            <div key={item.title} className="p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-charcoal">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />
      <SiteFooter />
    </>
  )
}
