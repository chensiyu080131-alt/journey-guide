import { NextRequest, NextResponse } from 'next/server'
import { BudgetLevel, InterestTag } from '@/types'
import { generateGuideServer } from '@/lib/llm-server'

const VALID_INTERESTS: InterestTag[] = ['文化', '美食', '自然', '体验']
const VALID_BUDGETS: BudgetLevel[] = ['穷游', '舒适', '轻奢']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const city = String(body.city || '').trim()
    const days = Math.min(Math.max(Number(body.days) || 2, 1), 7)
    const budget = VALID_BUDGETS.includes(body.budget) ? body.budget : '舒适'
    const interests = Array.isArray(body.interests)
      ? body.interests.filter((item: string): item is InterestTag => VALID_INTERESTS.includes(item as InterestTag))
      : ['文化', '美食']

    if (!city) {
      return NextResponse.json({ error: '请提供目的地城市' }, { status: 400 })
    }

    const guide = await generateGuideServer(
      city,
      days,
      interests.length > 0 ? interests : ['文化', '美食'],
      budget
    )

    return NextResponse.json({ guide, mock: process.env.USE_MOCK === 'true' || !process.env.LLM_API_KEY })
  } catch (error) {
    console.error('生成攻略失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '攻略生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
