import GuideClient from './guide-client'

export function generateStaticParams() {
  return [
    { city: 'shajiabang' },
    { city: 'niehaifeng' },
    { city: 'wengtonghe' },
    { city: 'qianliu' },
  ]
}

export default async function GuidePage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <GuideClient city={city} />
}
