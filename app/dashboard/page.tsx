import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { WhitepaperGenerator } from '@/components/dashboard/whitepaper-generator'
import { AssetBoard } from '@/components/dashboard/asset-board'
import { ContactForm } from '@/components/dashboard/contact-form'
import Link from 'next/link'

export const metadata = {
  title: '文旅局工作台 · 寻城',
  description: '为文旅局提供的 AI 文学旅行内容工作台：一键生成城市白皮书、内容资产看板、商务合作。',
}

export default function DashboardPage() {
  return (
    <>
      <SiteHeader variant="light" />

      {/* Hero */}
      <section className="bg-charcoal text-white pt-28 pb-14">
        <div className="xc-container">
          <Link href="/" className="text-white/50 text-sm hover:text-white mb-4 inline-block">
            ← 返回首页
          </Link>
          <p className="text-xuncheng-400 text-sm font-medium tracking-widest uppercase mb-2">
            For Cultural Tourism Bureau
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold">🏛️ 文旅局专属工作台</h1>
          <p className="mt-3 text-white/60 max-w-xl text-sm leading-relaxed">
            把「跟着书本去旅行」变成城市的文化生产力——一键产出文学旅行白皮书，量化内容资产，直达商务合作。
          </p>
        </div>
      </section>

      <main className="xc-container max-w-4xl py-10 space-y-10">
        <AssetBoard />
        <WhitepaperGenerator />
        <ContactForm />
      </main>

      <SiteFooter />
    </>
  )
}
