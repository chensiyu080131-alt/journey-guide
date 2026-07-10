import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { YichengNav } from './section-nav'

export function YichengShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <YichengNav />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  )
}
