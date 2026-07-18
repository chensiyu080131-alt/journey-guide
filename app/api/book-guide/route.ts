import { NextResponse } from 'next/server'
import { BookGuideRequest } from '@/types/book-guide'
import { generateBookGuideServer } from '@/lib/book-guide-server'
import { getMockReason, shouldUseMock } from '@/lib/llm-server'
import { BudgetLevel, InterestTag } from '@/types'

export const maxDuration = 120

const VALID_INTERESTS: InterestTag[] = ['文化', '美食', '自然', '体验']
const VALID_BUDGETS: BudgetLevel[] = ['穷游', '舒适', '轻奢']

/** 查询当前是否为演示模式（未配置 LLM 或 USE_MOCK=true） */
export async function GET() {
  return NextResponse.json({
    mock: shouldUseMock(),
    reason: getMockReason(),
  })
}

/**
 * 书籍文学旅行攻略生成
 *
 * body: BookGuideRequest
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    const bookTitle = String(body.bookTitle ?? '').trim()
    const author = String(body.author ?? '').trim()
    const city = String(body.city ?? '').trim()

    if (!bookTitle) {
      return NextResponse.json({ error: '请填写书名' }, { status: 400 })
    }

    const days = Math.min(Math.max(Number(body.days) || 2, 1), 7)
    const interests: InterestTag[] = Array.isArray(body.interests)
      ? body.interests.filter((i: string) => VALID_INTERESTS.includes(i as InterestTag))
      : ['文化', '美食']
    const budget: BudgetLevel = VALID_BUDGETS.includes(body.budget)
      ? body.budget
      : '舒适'

    const req: BookGuideRequest = {
      bookTitle,
      author: author || '佚名',
      city: city || undefined,
      days,
      interests: interests.length ? interests : ['文化', '美食'],
      budget,
      preferences: body.preferences ? String(body.preferences) : undefined,
      bookExcerpt: body.bookExcerpt ? String(body.bookExcerpt) : undefined,
    }

    const result = await generateBookGuideServer(req)
    return NextResponse.json(result)
  } catch (error) {
    console.error('book-guide API error:', error)
    const message = error instanceof Error ? error.message : '攻略生成失败，请稍后重试'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
