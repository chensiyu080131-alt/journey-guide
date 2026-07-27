import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { RenjianNav } from './section-nav'

export function RenjianShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <RenjianNav />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  )
}
