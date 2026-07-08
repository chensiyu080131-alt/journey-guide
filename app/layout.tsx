import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '寻城 - 跟着书本去旅行',
  description: 'AI驱动的文学旅行攻略。选一本书，跟着故事走到现场，让文字照进现实。常熟先行落地。',
  keywords: ['跟着书本去旅行', '文学旅行', '常熟', '沙家浜', '孽海花', '翁同龢', 'AI攻略'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F97316',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper">
        {/* 顶部装饰线 */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-xuncheng-400 via-vermilion to-xuncheng-600 z-50" />
        {children}
      </body>
    </html>
  )
}
