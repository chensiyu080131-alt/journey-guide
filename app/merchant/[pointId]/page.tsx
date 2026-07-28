import MerchantDashboard from './merchant-dashboard'

// 静态导出：预生成试点商家点位（seq 1-5；其中 1=富春、2=冶春 开通看板，3-5 显示未开通）
export function generateStaticParams() {
  return [1, 2, 3, 4, 5].map(seq => ({ pointId: String(seq) }))
}

export default function MerchantPage({ params }: { params: { pointId: string } }) {
  return <MerchantDashboard pointId={params.pointId} />
}
