import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function RouteNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="bg-paper min-h-[60vh] grid place-items-center">
        <div className="text-center px-6 py-20">
          <div className="font-serif text-6xl text-vermilion opacity-60">迹</div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-charcoal">未找到该路线</h1>
          <p className="mt-3 font-serif text-sm text-ink-400">
            这条迹还没有被写下，或许它正等一位作家路过。
          </p>
          <Link href="/" className="xc-pill mt-8 inline-block bg-charcoal text-white hover:bg-charcoal-50">
            回到首页 →
          </Link>
        </div>
      </main>
    </>
  )
}
