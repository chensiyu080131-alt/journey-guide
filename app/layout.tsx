import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BookGuideFloat } from '@/components/book-guide-float'

export const metadata: Metadata = {
  title: '寻城 - 跟着书本去旅行',
  description: 'AI驱动的文学旅行攻略。选一本书，跟着故事走到现场，让文字照进现实。常熟先行落地。',
  keywords: ['跟着书本去旅行', '文学旅行', '常熟', '沙家浜', '孽海花', '翁同龢', 'AI攻略'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A1A1A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 运行期从 pm2/.env.production 读取，注入客户端（不依赖 build 时 NEXT_PUBLIC_*）
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY || process.env.AMAP_WEB_KEY || ''
  const amapSecurity = process.env.NEXT_PUBLIC_AMAP_SECURITY || ''

  const runtimeBootstrap =
    amapKey || amapSecurity
      ? `window.__XUNCHENG_AMAP_KEY__=${JSON.stringify(amapKey)};window.__XUNCHENG_AMAP_SECURITY__=${JSON.stringify(amapSecurity)};${amapSecurity ? `window._AMapSecurityConfig={securityJsCode:${JSON.stringify(amapSecurity)}};` : ''}`
      : ''

  return (
    <html lang="zh-CN">
      <head>
        {runtimeBootstrap ? (
          <script id="xuncheng-amap-runtime" dangerouslySetInnerHTML={{ __html: runtimeBootstrap }} />
        ) : null}
      </head>
      <body className="min-h-screen bg-paper-warm">
        {children}
        <BookGuideFloat />
      </body>
    </html>
  )
}
