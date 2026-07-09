import { CITY_BOOK_SLUGS } from '@/lib/city-books'
import CityBooksClient from './books-client'

export function generateStaticParams() {
  return CITY_BOOK_SLUGS.map(city => ({ city }))
}

export default async function CityBooksPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <CityBooksClient city={city} />
}
