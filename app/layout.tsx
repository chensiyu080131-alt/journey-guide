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
  themeColor: '#1A1A1A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  )
}
