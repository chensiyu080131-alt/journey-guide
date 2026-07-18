import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuideById } from './mock-data'

/** 通过路线ID获取攻略（预设路线走本地 Mock，无需网络） */
export async function getGuideById(id: string): Promise<Guide | null> {
  await simulateDelay(600 + Math.random() * 600)
  return getMockGuideById(id)
}

/**
 * 生成自定义目的地攻略 —— 走服务端 API 路由，密钥不在客户端。
 * 服务端在未配置密钥/调用失败时会自动回退 Mock，因此正常情况下不会抛错。
 */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  try {
    const res = await fetch('/api/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, days, interests, budget }),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json()) as Guide
  } catch (error) {
    console.error('AI生成攻略失败，使用 fallback:', error)
    const fallback = getMockGuideById('shajiabang')
    if (fallback) return fallback
    throw new Error('攻略生成失败，请稍后重试')
  }
}

/** 从一段书籍文字识别并生成攻略 —— 走服务端 API 路由 */
export async function recognizeAndGenerateGuide(bookText: string): Promise<Guide> {
  try {
    const res = await fetch('/api/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'recognize', bookText }),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json()) as Guide
  } catch (error) {
    console.error('识别书籍生成攻略失败，使用 fallback:', error)
    const fallback = getMockGuideById('shajiabang')
    if (fallback) return fallback
    throw new Error('识别失败，请稍后重试')
  }
}

/** 从书籍信息生成文学旅行攻略 —— 走 /api/book-guide */
export async function generateBookGuide(
  request: import('@/types/book-guide').BookGuideRequest
): Promise<import('@/types/book-guide').BookGuideResponse> {
  const res = await fetch('/api/book-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API ${res.status}`)
  }
  return res.json()
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

