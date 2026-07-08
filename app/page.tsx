'use client'

import { EntryCards } from '@/components/entry-cards'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Logo区域 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink-900 tracking-wide">
            寻<span className="text-xuncheng-500">城</span>
          </h1>
          <p className="mt-3 text-ink-500 text-base font-serif">
            跟着书本去旅行
          </p>
          <p className="mt-1 text-ink-400 text-sm">
            文学照进现实，每一步都有故事
          </p>
        </div>

        {/* 三大入口 */}
        <EntryCards />

        {/* 底部特色说明 */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm text-center">
          <div>
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xs text-ink-500 font-medium">原文对照</div>
            <div className="text-xs text-ink-300 mt-0.5">书中写的就是脚下</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-xs text-ink-500 font-medium">实景映射</div>
            <div className="text-xs text-ink-300 mt-0.5">文学照进现实</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🚶</div>
            <div className="text-xs text-ink-500 font-medium">可落地路线</div>
            <div className="text-xs text-ink-300 mt-0.5">常熟先行</div>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <footer className="text-center py-6 text-xs text-ink-300 space-y-1">
        <p>44小时黑客松作品 · 跟着书本去旅行</p>
        <p className="text-xuncheng-400">可落地常熟 · 常熟文旅局合作洽谈中</p>
      </footer>
    </main>
  )
}
