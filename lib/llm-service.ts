import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuideById, getMockGuide } from './mock-data'
import { chatCompletion } from './ai-service'

/** 通过路线ID获取攻略（预设路线走 Mock） */
export async function getGuideById(id: string): Promise<Guide | null> {
  await simulateDelay(600 + Math.random() * 600)
  return getMockGuideById(id)
}

/**
 * 健壮提取 JSON：推理模型（如 step-3.7-flash）可能在 JSON 前后带推理文字、
 * 代码块标记，或因 max_tokens 截断尾部。统一截取首个 { 到末个 } 再解析。
 */
function extractJSON(text: string): string {
  let s = text.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1)
  }
  return s
}

/** 带一次重试的攻略 JSON 生成（首次解析失败则追加强化指令重试一次） */
async function callGuideJSON(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  max_tokens: number
): Promise<Guide> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chatCompletion(messages, { temperature: 0.8, max_tokens })
    try {
      return JSON.parse(extractJSON(raw)) as Guide
    } catch {
      if (attempt === 1) throw new Error('攻略 JSON 解析失败')
      messages = [
        ...messages,
        { role: 'user', content: '上一条回复不是合法 JSON。请只返回一个 JSON 对象，不要任何解释、前后缀或 ``` 代码块标记。' },
      ]
    }
  }
  throw new Error('攻略 JSON 解析失败')
}

const COMMON_SYSTEM = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

核心原则：
1. 优先关联这座城市最具代表性的【文学作品】与【文学景点】，开篇即呈现
2. 每个景点必须有"原文片段"+"实景对照"双重视角
3. 推荐本地人真正去的地方，不推网红店
4. 原文引用须真实，不可编造；不确定则引相关历史记载并标注
5. 行程考虑地理位置与时间合理性，语言温暖不夸张
6. 直接返回 JSON，不要 markdown 代码块、不要解释、不要前后缀`

/** 生成自定义目的地攻略 — 优先当地文学作品与景点，永不抛错（失败兜底 mock） */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  const userPrompt = `请为"${city}"生成一份"跟着书本去旅行"攻略：${days}天，兴趣：${interests.join('、')}，预算：${budget}。

第一步：先确定与${city}最具代表性的文学作品（诗、词、文、小说、戏曲皆可）及其相关的必访文学景点，作为整条路线的灵魂线索。
第二步：围绕这些文学景点安排行程，美食与体验穿插其中。

返回纯 JSON（不要代码块标记）：
{
  "title": "攻略标题", "subtitle": "副标题", "entryType": "目的地",
  "relatedBook": "关联书籍（如有）", "relatedAuthor": "关联作者（如有）",
  "routeIntro": "路线引言（100-200字，点出文学作品与景点）",
  "city": "${city}", "province": "省份",
  "dayPlans": [{ "day": 1, "title": "第1天", "spots": [
    { "id": "", "name": "景点/美食名", "desc": "一句话（≤20字）", "duration": "停留时间", "tags": [], "timeSlot": "上午/下午/晚上", "address": "", "story": "50-100字", "type": "景点/美食/体验", "budgetHint": "", "emoji": "", "originalText": "书中原文/历史文献", "originalSource": "出处", "realityNote": "实景对照" }
  ], "budgetEstimate": "当日预算" }],
  "dialect": [{ "dialect": "", "meaning": "", "scenario": "" }],
  "localExperiences": [{ "name": "", "desc": "", "type": "赶集/时令/民俗/手艺", "schedule": "" }],
  "tips": []
}

要求：每天 3-5 个景点（保证生成速度与稳定）；【首日首个景点必须是该城代表文学作品的相关地点】；美食占比≥30%；方言≥4个；在地体验≥3个；贴士≥3个。`

  try {
    return await callGuideJSON(
      [
        { role: 'system', content: COMMON_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      8000
    )
  } catch (error) {
    console.error('AI 生成攻略失败，使用兜底 mock：', error)
    return getMockGuide(city, days, interests, budget)
  }
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 识别书籍片段并生成攻略 — 优先片段本身的文学作品与地点，失败兜底 */
export async function recognizeAndGenerateGuide(bookText: string): Promise<Guide> {
  const userPrompt = `分析以下书籍片段，识别其中的城市、地点、人物，生成"跟着书本去旅行"攻略。优先提取片段本身涉及的文学作品与地点作为主线。

"""
${bookText.slice(0, 2000)}
"""

返回纯 JSON（不要代码块标记），结构与 generateGuide 相同：title、subtitle、entryType、city、province、routeIntro、dayPlans（每个 spot 含 originalText、originalSource、realityNote）、dialect、localExperiences、tips。每天 3-5 个景点。`

  try {
    return await callGuideJSON(
      [
        { role: 'system', content: COMMON_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      8000
    )
  } catch (error) {
    console.error('AI 识别生成攻略失败，使用兜底：', error)
    return getMockGuide('常熟', 2, ['文化', '美食'], '舒适')
  }
}
