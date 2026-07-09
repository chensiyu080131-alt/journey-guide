/** 点位配图 — 与文字描述对应的实景/历史影像 */

export interface SpotMedia {
  historicalImage?: string
  realityImage?: string
  historicalCaption?: string
  realityCaption?: string
}

const SPOT_MEDIA: Record<string, SpotMedia> = {
  // ── 扬州 ──
  'yz-1': {
    historicalImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Five_Pavilion_Bridge_at_Slender_West_Lake.jpg/640px-Five_Pavilion_Bridge_at_Slender_West_Lake.jpg',
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Five_Pavilion_Bridge_in_Yangzhou%27s_Slender_West_Lake.jpg/800px-Five_Pavilion_Bridge_in_Yangzhou%27s_Slender_West_Lake.jpg',
    historicalCaption: '瘦西湖五亭桥历史影像',
    realityCaption: '瘦西湖五亭桥实景',
  },
  'yz-2': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Geyuan_Garden.jpg/640px-Geyuan_Garden.jpg',
    historicalCaption: '个园四季假山古籍记载',
    realityCaption: '个园四季假山实景',
  },
  'yz-3': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Daming_Temple_Yangzhou.jpg/640px-Daming_Temple_Yangzhou.jpg',
    realityCaption: '大明寺栖灵塔实景',
  },
  'yz-4': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Dongguan_Street%2C_Yangzhou.jpg/640px-Dongguan_Street%2C_Yangzhou.jpg',
    realityCaption: '东关街古街实景',
  },
  'yz-5': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Xiaolongbao.jpg/640px-Xiaolongbao.jpg',
    realityCaption: '淮扬茶点·汤包示意',
  },
  'yz-6': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/He_Yuan_Yangzhou.jpg/640px-He_Yuan_Yangzhou.jpg',
    realityCaption: '何园复道回廊实景',
  },
  'yz-7': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Shi_Kefa_Memorial_Hall.jpg/640px-Shi_Kefa_Memorial_Hall.jpg',
    realityCaption: '史可法纪念馆·梅花岭',
  },
  // ── 《人间滋味》──
  'rjz-gy-1': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Salted_duck_egg.jpg/640px-Salted_duck_egg.jpg',
    realityCaption: '高邮咸鸭蛋',
  },
  'rjz-gy-2': {
    realityCaption: '高邮湖景',
  },
  'rjz-gy-5': {
    realityCaption: '东大街烟火气',
  },
  'nj-1': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Qinhuai_River_Night_View.jpg/640px-Qinhuai_River_Night_View.jpg',
    realityCaption: '秦淮河畔夜景',
  },
  'nj-2': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Jiming_Temple_Nanjing.jpg/640px-Jiming_Temple_Nanjing.jpg',
    realityCaption: '鸡鸣寺实景',
  },
  // ── 苏州 ──
  'sz-1': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Humble_Administrator%27s_Garden.jpg/640px-Humble_Administrator%27s_Garden.jpg',
    realityCaption: '拙政园实景',
  },
  'sz-2': {
    realityImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Pingjiang_Road_Suzhou.jpg/640px-Pingjiang_Road_Suzhou.jpg',
    realityCaption: '平江路水巷实景',
  },
}

export function getSpotMedia(spotId: string): SpotMedia | undefined {
  return SPOT_MEDIA[spotId]
}

export function enrichSpotMedia<T extends { id: string; historicalImage?: string; realityImage?: string }>(spot: T): T {
  const media = getSpotMedia(spot.id)
  if (!media) return spot
  return {
    ...spot,
    historicalImage: spot.historicalImage || media.historicalImage,
    realityImage: spot.realityImage || media.realityImage,
  }
}
