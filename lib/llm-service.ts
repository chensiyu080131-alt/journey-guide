import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuideById } from './mock-data'

/** 通过路线ID获取攻略（预设路线走 Mock） */
export async function getGuideById(id: string): Promise<Guide | null> {
  await simulateDelay(600 + Math.random() * 600)
  return getMockGuideById(id)
}

/** 生成自定义目的地攻略 */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  const response = await fetch('/api/generate-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, days, interests, budget }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '攻略生成失败' }))
    throw new Error(error.error || '攻略生成失败')
  }

  const data = await response.json()
  return data.guide as Guide
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
