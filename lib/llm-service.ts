import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuide, getMockGuideById } from './mock-data'

/**
 * LLM服务 - 支持Mock和真实API双模式
 * 默认使用Mock数据，配置API_KEY后自动切换为真实LLM调用
 */

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://api.deepseek.com/v1'
const MODEL = process.env.NEXT_PUBLIC_LLM_MODEL || 'deepseek-chat'

/** 通过路线ID获取攻略（v2主入口） */
export async function getGuideById(id: string): Promise<Guide | null> {
  if (USE_MOCK || !API_KEY) {
    await simulateDelay(800 + Math.random() * 1200)
    return getMockGuideById(id)
  }
  // TODO: 真实API模式
  return getMockGuideById(id)
}

/** 生成攻略 - 兼容旧接口 */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  if (USE_MOCK || !API_KEY) {
    await simulateDelay(800 + Math.random() * 1200)
    return getMockGuide(city, days, interests, budget)
  }

  return callLLMApi(city, days, interests, budget)
}

/** 调用真实LLM API */
async function callLLMApi(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  const prompt = buildPrompt(city, days, interests, budget)

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error('API返回内容为空')

    return parseLLMResponse(content, city, days, interests, budget)
  } catch (error) {
    console.error('LLM API调用失败，回退到Mock数据:', error)
    return getMockGuide(city, days, interests, budget)
  }
}

const SYSTEM_PROMPT = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

你的核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献
2. 不推荐网红店，推荐本地人真正去的地方
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 用温暖但不夸张的语言

你必须返回JSON格式的攻略数据。`

function buildPrompt(city: string, days: number, interests: InterestTag[], budget: BudgetLevel): string {
  return `请为"${city}"生成一份"跟着书本去旅行"的${days}天攻略。

用户偏好：
- 旅行天数：${days}天
- 兴趣方向：${interests.join('、')}
- 预算级别：${budget}

请返回以下JSON格式（不要包含markdown代码块标记）：
{
  "title": "攻略标题",
  "subtitle": "副标题",
  "entryType": "书籍/人物/目的地",
  "relatedBook": "关联书籍（如有）",
  "relatedAuthor": "关联作者（如有）",
  "relatedCharacter": "关联人物（如有）",
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
          "realityNote": "实景对照说明（现实中的对应）"
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
- 每个景点必须有originalText和realityNote字段
- originalText必须是真实的文学/历史原文（不可编造）
- 美食推荐至少占30%
- 方言至少5个
- 在地体验至少3个
- 贴士至少4个`
}

/** 解析LLM返回的JSON */
function parseLLMResponse(
  content: string,
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Guide {
  try {
    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    const parsed = JSON.parse(jsonStr)

    return {
      id: `${city}-${Date.now()}`,
      title: parsed.title || `${city}旅行攻略`,
      subtitle: parsed.subtitle || '',
      city: parsed.city || city,
      province: parsed.province || '',
      days,
      interests,
      budget,
      dayPlans: parsed.dayPlans || [],
      dialect: parsed.dialect || [],
      localExperiences: parsed.localExperiences || [],
      createdAt: new Date().toISOString(),
      tips: parsed.tips || [],
      entryType: parsed.entryType || '目的地',
      relatedBook: parsed.relatedBook,
      relatedAuthor: parsed.relatedAuthor,
      relatedCharacter: parsed.relatedCharacter,
      routeIntro: parsed.routeIntro,
    }
  } catch (error) {
    console.error('解析LLM响应失败:', error)
    return getMockGuide(city, days, interests, budget)
  }
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
