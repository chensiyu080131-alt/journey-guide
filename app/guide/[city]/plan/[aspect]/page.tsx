import PlanClient from './plan-client'
import { GUIDE_CITY_IDS, PLAN_ASPECTS } from '@/lib/guide-category'

export function generateStaticParams() {
  return GUIDE_CITY_IDS.flatMap(city =>
    PLAN_ASPECTS.map(aspect => ({ city, aspect }))
  )
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ city: string; aspect: string }>
}) {
  const { city, aspect } = await params
  return (
    <PlanClient
      city={city}
      aspect={aspect as 'days' | 'budget' | 'interests'}
    />
  )
}
