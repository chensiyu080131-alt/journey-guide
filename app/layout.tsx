import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AmapSecurityBootstrap } from '@/components/amap-security-bootstrap'
import { BookGuideFloat } from '@/components/book-guide-float'

export const metadata: Metadata = {
  title: '寻迹 - 跟着书本去旅行',
  description: 'AI驱动的文学旅行攻略。选一本书，跟着故事走到现场，让文字照进现实。',
  keywords: ['跟着书本去旅行', '文学旅行', 'AI攻略', '寻迹'],
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
  return (
    <html lang="zh-CN">
      <head>
        <AmapSecurityBootstrap />
      </head>
      <body className="min-h-screen bg-paper-warm">
        {children}
        <BookGuideFloat />
      </body>
    </html>
  )
}
