import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuideById, getMockGuide } from './mock-data'
import { callLLM, isMockMode, parseJson } from './llm-client'

/** 通过路线ID获取攻略（预设路线走 Mock） */
export async function getGuideById(id: string): Promise<Guide | null> {
  await simulateDelay(600 + Math.random() * 600)
  return getMockGuideById(id)
}

/** 生成自定义目的地攻略 - 客户端直连 LLM API */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  if (isMockMode()) {
    // Mock模式：返回预设数据
    await simulateDelay(1500)
    const fallback = getMockGuideById('renjianziwei') || getMockGuide(city, days, interests, budget)
    if (fallback) {
      return {
        ...fallback,
        title: `${city}·文学旅行攻略`,
        city,
        routeIntro: `这是${city}的演示路线，配置API Key后可获取AI生成的专属攻略。`,
      }
    }
    throw new Error('演示数据不可用')
  }

  try {
    const systemPrompt = `你是"寻迹"的AI旅行顾问——一个"跟着书本去旅行"的平台。

你的核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献
2. 不推荐网红店，推荐本地人真正去的地方
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 用温暖但不夸张的语言
6. 原文引用必须真实，不可编造

你必须返回JSON格式的攻略数据。`

    const userPrompt = `请为"${city}"生成一份"跟着书本去旅行"的攻略，天数${days}天，兴趣方向：${interests.join('、')}，预算水平：${budget}。

请返回以下JSON格式（不要包含markdown代码块标记）：
{
  "title": "攻略标题",
  "subtitle": "副标题",
  "entryType": "目的地",
  "relatedBook": "关联书籍（如有）",
  "relatedAuthor": "关联作者（如有）",
  "routeIntro": "路线引言（100-200字）",
  "city": "${city}",
  "province": "省份",
  "dayPlans": [
    {
      "day": 1,
      "title": "第1天",
      "spots": [
        {
          "id": "唯一标识",
          "name": "景点/美食名",
          "desc": "一句话描述（20字以内）",
          "duration": "停留时间",
          "tags": ["标签1", "标签2"],
          "timeSlot": "上午/下午/晚上",
          "address": "具体地址",
          "story": "这个地方的故事（50-100字）",
          "type": "景点/美食/体验",
          "budgetHint": "花费提示",
          "emoji": "一个emoji",
          "originalText": "书中原文片段或历史文献",
          "originalSource": "出处",
          "realityNote": "实景对照说明"
        }
      ],
      "budgetEstimate": "当日预算估算"
    }
  ],
  "dialect": [{"dialect": "方言词", "meaning": "意思", "scenario": "使用场景"}],
  "localExperiences": [{"name": "体验名", "desc": "描述", "type": "赶集/时令/民俗/手艺", "schedule": "时间"}],
  "tips": ["实用贴士1", "实用贴士2"]
}

核心要求：
- 以${city}最具文学气质的路线为线索
- 每个景点必须有originalText和realityNote字段
- 美食推荐至少占30%
- 方言至少5个
- 在地体验至少3个
- 贴士至少4个
- 安排${days}天行程，每天4-8个景点`

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.8, max_tokens: 4000 }
    )

    return parseJson<Guide>(result)
  } catch (error) {
    console.error('AI生成攻略失败，使用fallback:', error)
    const fallback = getMockGuideById('renjianziwei') || getMockGuide(city, days, interests, budget)
    if (fallback) {
      return {
        ...fallback,
        title: `${city}·文学旅行攻略`,
        city,
        routeIntro: `这是${city}的演示路线，配置API Key后可获取AI生成的专属攻略。`,
      }
    }
    throw new Error('攻略生成失败，请稍后重试')
  }
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function recognizeAndGenerateGuide(bookText: string): Promise<Guide> {
  if (isMockMode()) {
    await simulateDelay(1500)
    const fallback = getMockGuideById('renjianziwei')
    if (fallback) return fallback
    throw new Error('演示数据不可用')
  }

  try {
    const systemPrompt = `你是"寻迹"的AI旅行顾问——一个"跟着书本去旅行"的平台。
用户会粘贴一段书籍文字，你需要从中识别出城市、地点、人物，并生成一份可落地的旅行攻略 JSON。
每个景点必须关联原文片段和实景对照。返回纯 JSON，不要 markdown 代码块。`

    const userPrompt = `请分析以下书籍片段，识别其中的地点并生成旅行攻略：

"""
${bookText}
"""

返回格式与 generateGuide 相同，包含 title、subtitle、entryType、city、province、routeIntro、dayPlans、dialect、localExperiences、tips 等字段。
dayPlans 中每个 spot 需含 originalText、originalSource、realityNote。`

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.8, max_tokens: 4000 }
    )

    return parseJson<Guide>(result)
  } catch (error) {
    console.error('AI识别生成攻略失败，使用fallback:', error)
    const fallback = getMockGuideById('renjianziwei')
    if (fallback) return fallback
    throw new Error('识别生成攻略失败，请稍后重试')
  }
}
