/**
 * 路线数据聚合层
 *
 * 优先级：Supabase（配了密钥时）→ 本地 mock 数据（含扬州早茶试点）。
 * 让 /route/[id] 在"无后端密钥"时也能完整跑通（符合"能跑通 > 有数据 > 好看"）。
 */

import type { Guide, Spot } from '@/types'
import { hasSupabase, fetchRouteWithPoints, type RouteRow, type PointRow } from './supabase-client'
import { yangzhouZaochaGuide } from './yangzhou-zaocha-data'
import { mockGuides } from './mock-data'

// 把 Supabase 的 PointRow 转回前端 Spot 类型（任务3/4 复用前端组件必须）
export function pointRowToSpot(p: PointRow): Spot {
  return {
    id: p.id,
    name: p.name,
    desc: p.desc || '',
    duration: p.duration || '30分钟',
    tags: ['美食'],
    timeSlot: '上午',
    location: { lat: Number(p.lat), lng: Number(p.lng) },
    address: p.address || undefined,
    type: p.type,
    budgetHint: p.budget_hint || undefined,
    emoji: p.emoji || '📍',
    originalText: p.original_text || undefined,
    originalSource: p.original_source || undefined,
    realityNote: p.modern_note || undefined,   // 现代解读映射到 realityNote
    flavor: p.flavor as Spot['flavor'] || undefined,
    culturalTag: '📖书籍',
    culturalTagDetail: p.original_source || undefined,
    // checkin_task 暂存到 story 字段，供打卡 UI 展示（前端 Spot 没有 checkinTask 字段）
    story: p.checkin_task || undefined,
  }
}

export function routeRowToGuide(r: RouteRow, points: PointRow[]): Guide {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle || '',
    city: r.city,
    province: r.province,
    days: r.days,
    interests: (r.tags as Guide['interests']) || ['文化'],
    budget: '舒适',
    dayPlans: [
      {
        day: 1,
        title: `${r.city}一日游`,
        spots: points.map(pointRowToSpot),
      },
    ],
    createdAt: r.created_at,
    entryType: '书籍',
    relatedBook: r.book || undefined,
    relatedAuthor: r.author || undefined,
    routeIntro: r.intro || undefined,
  }
}

/** 本地路线库（无 Supabase 时降级用）—— 把扬州早茶 + 现有 mock 全纳入 */
function getLocalGuides(): Record<string, Guide> {
  const localGuides: Record<string, Guide> = { ...mockGuides }
  // 试点路线
  localGuides[yangzhouZaochaGuide.id] = yangzhouZaochaGuide
  return localGuides
}

/** 列出所有可用路线 id（用于 generateStaticParams） */
export function listLocalRouteIds(): string[] {
  return Object.keys(getLocalGuides())
}

/**
 * 取一条路线。优先 Supabase，失败/无密钥则降级本地。
 * 返回 null 表示路线不存在（供 404 判断）。
 */
export async function getRouteById(id: string): Promise<{ guide: Guide; fromSupabase: boolean } | null> {
  // 1) 试 Supabase
  if (hasSupabase) {
    try {
      const data = await fetchRouteWithPoints(id)
      if (data && data.points.length > 0) {
        return { guide: routeRowToGuide(data.route, data.points), fromSupabase: true }
      }
      // Supabase 没查到，继续降级本地（可能是本地有、云端还没灌）
    } catch {
      // Supabase 出错不阻断，降级本地
    }
  }

  // 2) 降级本地
  const localGuides = getLocalGuides()
  const guide = localGuides[id]
  if (guide) return { guide, fromSupabase: false }

  return null
}
