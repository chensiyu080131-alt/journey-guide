'use client'

import Link from 'next/link'
import { CityBooksMeta } from '@/lib/city-books'
import { CoverCategory } from '@/lib/home-covers'
interface CityBooksViewProps {
  meta: CityBooksMeta
  category: CoverCategory
}

function BookCoverCard({
  book,
  category,
  citySlug,
}: {
  book: CityBooksMeta['books'][0]
  category: CoverCategory
  citySlug: string
}) {
  const { style } = book
  const href = `/guide/${book.guideId}?cat=书籍&from=${citySlug}`

  return (
    <Link
      href={href}
      className="group block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-celadon-400 rounded-xl"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-2xl border border-celadon-200/50 bg-white/70 hover:bg-camel-light/40 hover:border-celadon-300 hover:shadow-md transition-all duration-200">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div
            className="relative ml-2 w-[120px] sm:w-[132px] rounded-r-md border overflow-hidden shadow-md group-hover:shadow-lg transition-shadow"
            style={{
              background: style.bg,
              borderColor: `${style.border}40`,
              aspectRatio: '3 / 4.2',
            }}
          >
            <div
              className="absolute left-0 top-1 bottom-1 w-3 rounded-l-sm"
              style={{ background: style.border }}
            />
            <div className="flex flex-col items-center justify-center h-full py-6 px-3 text-center">
              <h3
                className="font-serif font-semibold text-sm tracking-wide leading-snug"
                style={{ color: style.title }}
              >
                {book.title}
              </h3>
              <p className="mt-2 text-[10px]" style={{ color: style.subtitle }}>
                {book.author}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left">
          <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-1">书籍 · 路线规划</p>
          <h3 className="text-lg font-serif font-bold text-warm-gray group-hover:text-celadon-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-warm-gray-muted mt-1">{book.author}</p>
          <p className="text-sm text-warm-gray-light mt-3 leading-relaxed line-clamp-3">
            {book.intro}
          </p>
          <p className="mt-4 text-xs text-celadon-600 font-medium">进入路线规划 →</p>
        </div>
      </div>
    </Link>
  )
}

export function CityBooksView({ meta, category }: CityBooksViewProps) {
  return (
    <main className="xc-explorer-bg min-h-screen">
      <div className="xc-container max-w-5xl py-6 sm:py-8 pb-12">
        <Link
          href={`/?cat=${category}`}
          className="text-xs text-warm-gray-muted hover:text-celadon-600 no-underline"
        >
          ← 返回封面选择
        </Link>

        <header className="mt-4 mb-8 text-center sm:text-left">
          <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-2">
            {meta.province} · {meta.tagline}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-warm-gray tracking-tight">
            {meta.cityName}
          </h1>
          <p className="mt-4 text-sm text-warm-gray-muted leading-relaxed max-w-xl">
            {meta.intro}
          </p>
        </header>

        <section>
          <p className="text-[10px] text-celadon-600 tracking-widest uppercase mb-4">
            与{meta.cityName}相关的书籍 · 选择一本开始
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {meta.books.map(book => (
              <BookCoverCard
                key={book.id}
                book={book}
                category={category}
                citySlug={meta.citySlug}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
