import { CoverCategory } from './home-covers'

const BOOK_GUIDE_IDS = new Set(['shajiabang', 'niehaifeng', 'wengtonghe', 'qianliu', 'renjianziwei'])
const CITY_GUIDE_IDS = new Set(['yangzhou', 'nanjing', 'suzhou', 'wuxi', 'zhenjiang'])

/** 音乐/游戏封面映射到实际攻略 ID 时的来源分类 */
const MUSIC_GUIDE_IDS = new Set(['yangzhou', 'shajiabang', 'wengtonghe', 'niehaifeng'])

export type GuideCategoryTab = '首页' | CoverCategory

export function getDefaultCategory(guideId: string): CoverCategory {
  if (BOOK_GUIDE_IDS.has(guideId)) return '书籍'
  return '🎬 影视'
}

export function parseCategoryParam(cat: string | null, guideId: string): CoverCategory {
  const validCats: CoverCategory[] = ['书籍', '🎬 影视', '🎮 游戏', '🎵 音乐', '🏃 运动']
  if (cat && validCats.includes(cat as CoverCategory)) return cat as CoverCategory
  // 兼容旧参数 '城市'
  if (cat === '城市') return '书籍'
  return getDefaultCategory(guideId)
}

export function isMusicGuide(guideId: string): boolean {
  return MUSIC_GUIDE_IDS.has(guideId)
}

export const GUIDE_CITY_IDS = [
  'shajiabang', 'niehaifeng', 'wengtonghe', 'qianliu', 'renjianziwei',
  'yangzhou', 'nanjing', 'suzhou', 'wuxi', 'zhenjiang',
] as const

export const PLAN_ASPECTS = ['days', 'budget', 'interests'] as const
export type PlanAspect = typeof PLAN_ASPECTS[number]

export const planAspectLabels: Record<PlanAspect, string> = {
  days: '按天数',
  budget: '按预算',
  interests: '按喜好',
}
