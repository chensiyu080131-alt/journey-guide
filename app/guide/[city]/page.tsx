import GuideClient from './guide-client'

export function generateStaticParams() {
  return [
    { city: 'shajiabang' },
    { city: 'niehaifeng' },
    { city: 'wengtonghe' },
    { city: 'qianliu' },
    { city: 'yangzhou' },
    { city: 'nanjing' },
    { city: 'suzhou' },
    { city: 'wuxi' },
    { city: 'zhenjiang' },
    { city: 'renjianziwei' },
  ]
}

export default async function GuidePage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <GuideClient city={city} />
}
