import { Spot } from '@/types'
import { RenjianFlavor, RenjianRegion } from './renjianziwei-guide'

export const GAOYOU_POI_CATEGORIES = {
  anchor: { label: '锚点 · 汪曾祺纪念馆', color: '#4A3530', dot: '#4A3530' },
  food: { label: '美食打卡点（点击查看原文）', color: '#A65D5D', dot: '#A65D5D' },
  nature: { label: '高邮湖 · 野菜', color: '#7A8C5A', dot: '#7A8C5A' },
  canal: { label: '大运河', color: '#B8A060', dot: '#B8A060' },
} as const

export type GaoyouPoiCategory = keyof typeof GAOYOU_POI_CATEGORIES

const GAOYOU_POI_MAP: Record<string, GaoyouPoiCategory> = {
  'rjz-gy-1': 'anchor',
  'rjz-gy-2': 'nature',
  'rjz-gy-3': 'canal',
  'rjz-gy-4': 'food',
  'rjz-gy-5': 'food',
  'rjz-gy-6': 'canal',
  'rjz-gy-7': 'food',
  'rjz-gy-8': 'food',
}

export function getGaoyouPoiCategory(spotId: string): GaoyouPoiCategory {
  return GAOYOU_POI_MAP[spotId] ?? 'food'
}

export const GAOYOU_ROUTE_STOPS = [
  { spotId: 'rjz-gy-1', time: '9:00', note: '起点' },
  { spotId: 'rjz-gy-2', time: '10:30', note: '咸鸭蛋 · 河鲜' },
  { spotId: 'rjz-gy-3', time: '13:00', note: '古驿站' },
  { spotId: 'rjz-gy-4', time: '15:00', note: '茶干' },
  { spotId: 'rjz-gy-5', time: '17:30', note: '炒米 · 焦屑 · 蒲包肉' },
] as const

export const FLAVOR_FILTERS: { id: RenjianFlavor | null; label: string; icon: string }[] = [
  { id: null, label: '全部', icon: '◎' },
  { id: '酸', label: '酸', icon: '🍋' },
  { id: '甜', label: '甜', icon: '🍯' },
  { id: '苦', label: '苦', icon: '🍵' },
  { id: '辣', label: '辣', icon: '🌶️' },
  { id: '咸', label: '咸', icon: '🧂' },
]

const REGION_ZONE: Record<RenjianRegion, string> = {
  '高邮': '华东',
  '昆明': '西南',
  '北京': '华北',
  '张家口': '华北',
  '漫游': '漫游',
}

const ROAM_CITY_NAMES: Record<string, string> = {
  'rjz-rm-1': '长沙',
  'rjz-rm-2': '杭州',
  'rjz-rm-3': '镇江',
  'rjz-rm-4': '淮安',
  'rjz-rm-5': '徽州',
}

export interface RenjianCityCard {
  id: string
  city: string
  zone: string
  foods: { dish: string; place: string }[]
  flavors: RenjianFlavor[]
  spotIds: string[]
}

export function buildCityFoodCards(spots: Spot[]): RenjianCityCard[] {
  const cards = new Map<string, RenjianCityCard>()

  for (const spot of spots) {
    const region = spot.region as RenjianRegion | undefined
    if (!region) continue

    let city: string
    let zone: string

    if (region === '漫游') {
      city = ROAM_CITY_NAMES[spot.id] ?? spot.name.slice(0, 2)
      zone = '漫游'
    } else {
      city = region === '高邮' ? '高邮' : region
      zone = REGION_ZONE[region]
    }

    const key = city
    const dish = spot.name.includes('·') ? spot.name.split('·')[0].trim() : spot.name
    const place = spot.address?.split(/省|市/).pop()?.replace(/区.*/, '')?.trim() || spot.name

    const existing = cards.get(key)
    if (existing) {
      existing.foods.push({ dish, place })
      existing.spotIds.push(spot.id)
      if (spot.flavor && !existing.flavors.includes(spot.flavor)) {
        existing.flavors.push(spot.flavor)
      }
    } else {
      cards.set(key, {
        id: key,
        city,
        zone,
        foods: [{ dish, place }],
        flavors: spot.flavor ? [spot.flavor] : [],
        spotIds: [spot.id],
      })
    }
  }

  return Array.from(cards.values())
}

export const CHAPTER_NUMERALS = ['一', '二', '三', '四'] as const

export const LIFE_PHASE_DETAILS: Record<string, { location: string; summary: string }> = {
  '高邮童年': {
    location: '江苏高邮 · 水乡',
    summary: '炒米、咸鸭蛋与故乡野菜，构成了汪曾祺一生味觉记忆的底色。',
  },
  '昆明联大': {
    location: '云南昆明 · 联大七年',
    summary: '汽锅鸡、菌子与茶馆，西南联大岁月里的烟火与风骨。',
  },
  '上海/北京': {
    location: '京沪之间 · 初识四方',
    summary: '各地风味初识，为后来的《四方食事》埋下伏笔。',
  },
  '张家口下放': {
    location: '河北张家口 · 坝上',
    summary: '马铃薯、沽源莜面，荒凉岁月里的诗意与坚韧。',
  },
  '北京定居': {
    location: '北京 · 定居之地',
    summary: '豆汁儿、豆腐与四方食事，晚年笔耕不辍的美食散文高峰。',
  },
}
