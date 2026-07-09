import { NextResponse } from 'next/server'
import { InterestTag, BudgetLevel } from '@/types'
import { generateGuideServer, recognizeGuideServer } from '@/lib/llm-server'

// LLM 调用可能较慢，放宽到 60s（Vercel 上按套餐上限生效）
export const maxDuration = 60

/**
 * 攻略生成 API —— 密钥仅存在于服务端，绝不下发到浏览器。
 *
 * body:
 *  - { mode: 'recognize', bookText }                       从书籍文字识别
 *  - { city, days?, interests?, budget? }                  按城市生成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    if (body.mode === 'recognize') {
      if (!body.bookText || typeof body.bookText !== 'string') {
        return NextResponse.json({ error: '缺少 bookText' }, { status: 400 })
      }
      const guide = await recognizeGuideServer(body.bookText)
      return NextResponse.json(guide)
    }

    const city: string = body.city
    if (!city || typeof city !== 'string') {
      return NextResponse.json({ error: '缺少 city' }, { status: 400 })
    }
    const days: number = Number(body.days) || 2
    const interests: InterestTag[] = Array.isArray(body.interests)
      ? body.interests
      : ['文化', '美食']
    const budget: BudgetLevel = body.budget || '舒适'

    const guide = await generateGuideServer(city, days, interests, budget)
    return NextResponse.json(guide)
  } catch (error) {
    console.error('generate-guide API 出错:', error)
    return NextResponse.json({ error: '攻略生成失败，请稍后重试' }, { status: 500 })
  }
}
