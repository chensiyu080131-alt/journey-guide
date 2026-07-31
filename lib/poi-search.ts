/**
 * 高德 POI 文本搜索 —— 服务端验证书中地点的真实信息
 * @see https://lbs.amap.com/api/webservice/guide/api/search
 */

export interface PoiSearchResult {
  name: string
  address: string
  location?: { lat: number; lng: number }
  type?: string
  openingHours?: string
  tel?: string
  /** 是否来自真实 API */
  verified: boolean
}

function getAmapKey(): string {
  return process.env.AMAP_WEB_KEY || process.env.NEXT_PUBLIC_AMAP_KEY || ''
}

/** 搜索 POI（无 Key 时返回 mock） */
export async function searchPoi(
  keywords: string,
  city: string
): Promise<PoiSearchResult | null> {
  const key = getAmapKey()
  if (!key) {
    return mockPoi(keywords, city)
  }

  try {
    const params = new URLSearchParams({
      key,
      keywords,
      city: city.replace(/市$/, ''),
      citylimit: 'true',
      offset: '1',
      page: '1',
      extensions: 'all',
    })

    const res = await fetch(
      `https://restapi.amap.com/v3/place/text?${params.toString()}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) return mockPoi(keywords, city)

    const data = (await res.json()) as {
      status?: string
      pois?: Array<{
        name?: string
        address?: string
        location?: string
        type?: string
        tel?: string
        biz_ext?: { open_time?: string; rating?: string }
      }>
    }

    if (data.status !== '1' || !data.pois?.length) {
      return mockPoi(keywords, city)
    }

    const poi = data.pois[0]
    const [lng, lat] = (poi.location ?? '').split(',').map(Number)

    return {
      name: poi.name || keywords,
      address: poi.address || `${city}${keywords}`,
      location:
        Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined,
      type: poi.type,
      openingHours: poi.biz_ext?.open_time,
      tel: poi.tel,
      verified: true,
    }
  } catch {
    return mockPoi(keywords, city)
  }
}

/** 批量验证地点 */
export async function verifyLocations(
  items: Array<{ bookName: string; searchKeyword: string; city: string }>
): Promise<Map<string, PoiSearchResult | null>> {
  const results = new Map<string, PoiSearchResult | null>()

  for (const item of items) {
    const poi = await searchPoi(item.searchKeyword, item.city)
    results.set(item.bookName, poi)
    // 避免 QPS 限制
    await new Promise(r => setTimeout(r, 120))
  }

  return results
}

function mockPoi(keywords: string, city: string): PoiSearchResult {
  const hash = keywords.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const lat = 32.0 + (hash % 100) / 1000
  const lng = 119.0 + (hash % 200) / 1000

  return {
    name: keywords,
    address: `${city}市${keywords}（演示数据，配置 AMAP Key 后可验证真实 POI）`,
    location: { lat, lng },
    type: '风景名胜',
    openingHours: '08:30-17:30（演示）',
    verified: false,
  }
}
