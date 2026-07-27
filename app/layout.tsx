import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { AmapSecurityBootstrap } from '@/components/amap-security-bootstrap'
import { JiluFloat } from '@/components/jilu-float'

export const metadata: Metadata = {
  title: '寻迹 - 有迹可循，寻迹而至',
  description: 'AI驱动的文化旅行攻略。书籍·游戏·音乐——跟着文化载体去旅行，让文字照进现实。',
  keywords: ['跟着书本去旅行', '文学旅行', '文化旅行', '寻迹', 'AI攻略'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B4545',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <AmapSecurityBootstrap />
      </head>
      <body className="min-h-screen bg-paper-warm">
        {children}
        <JiluFloat />
        {/* 51.LA 网站统计 */}
        <Script id="la-collect" src="https://sdk.51.la/js-sdk-pro.min.js" strategy="afterInteractive" />
        <Script id="la-init" strategy="afterInteractive">
          {`LA.init({id:"3QW9srNLaMfs2Lua",ck:"3QW9srNLaMfs2Lua"})`}
        </Script>
      </body>
    </html>
  )
}
