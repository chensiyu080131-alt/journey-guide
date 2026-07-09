'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getCityBooks } from '@/lib/city-books'
import { parseCategoryParam } from '@/lib/guide-category'
import { CityBooksView } from '@/components/city-books-view'
import { Button } from '@/components/ui'

function CityBooksContent({ citySlug }: { citySlug: string }) {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')
  const category = parseCategoryParam(catParam, citySlug)
  const meta = getCityBooks(citySlug)

  if (!meta) {
    return (
      <main className="xc-explorer-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-warm-gray-muted">未找到该城市的书籍列表</p>
          <Link href="/"><Button variant="outline">返回首页</Button></Link>
        </div>
      </main>
    )
  }

  return <CityBooksView meta={meta} category={category} />
}

export default function CityBooksClient({ city }: { city: string }) {
  const citySlug = decodeURIComponent(city)
  return (
    <Suspense
      fallback={
        <main className="xc-explorer-bg min-h-screen flex items-center justify-center">
          <p className="text-sm text-warm-gray-muted animate-pulse">加载中…</p>
        </main>
      }
    >
      <CityBooksContent citySlug={citySlug} />
    </Suspense>
  )
}
