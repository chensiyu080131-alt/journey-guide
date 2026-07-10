import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="xc-home-bg min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        <p className="text-[11px] text-literary-wine tracking-[0.25em] font-serif uppercase">
          Page Not Found
        </p>
        <h1 className="mt-3 text-6xl sm:text-7xl font-serif font-bold text-literary-ink">404</h1>
        <p className="mt-4 text-sm sm:text-base text-literary-muted leading-relaxed">
          未找到这一页 · 也许它还藏在字里行间
        </p>
        <Link
          href="/"
          className="xc-explore-btn mt-8"
        >
          返回首页
          <span className="opacity-80">→</span>
        </Link>
      </div>
    </main>
  )
}
