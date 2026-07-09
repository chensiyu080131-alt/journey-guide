import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="xc-container py-14">
        <div className="rounded-3xl bg-charcoal-50 border border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-serif font-bold">跟着书本，出发吧</h3>
            <p className="mt-2 text-sm text-white/60 max-w-md">
              选一本书、一个人、一座城 — AI 生成可落地的文学旅行路线。常熟先行，2844 县城在路上。
            </p>
          </div>
          <Link
            href="/guide/destination"
            className="xc-pill bg-white text-charcoal hover:bg-white/90 shrink-0"
          >
            搜一座城 →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="font-semibold mb-3 text-white/90">路线</p>
            <ul className="space-y-2 text-white/50">
              <li><Link href="/guide/shajiabang" className="hover:text-xuncheng-400">《沙家浜》</Link></li>
              <li><Link href="/guide/niehaifeng" className="hover:text-xuncheng-400">《孽海花》</Link></li>
              <li><Link href="/guide/wengtonghe" className="hover:text-xuncheng-400">翁同龢</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3 text-white/90">功能</p>
            <ul className="space-y-2 text-white/50">
              <li>原文对照</li>
              <li>路线地图</li>
              <li>AI 生成攻略</li>
            </ul>
          </div>
          <div className="col-span-2">
            <p className="font-semibold mb-3 text-white/90">关于</p>
            <p className="text-white/50 leading-relaxed">
              IEIIC OPC 人工智能黑客松 · 智慧城市民生服务<br />
              跟着书本去旅行 · 常熟文旅局合作洽谈中
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          © 2026 寻城 · journey-guide
        </div>
      </div>
    </footer>
  )
}
