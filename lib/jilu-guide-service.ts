/**
 * 迹录员攻略生成服务 —— 客户端直连 LLM
 * 将用户自然语言输入转化为结构化 Guide，支持增量修改
 */
import { Guide, Spot, InterestTag, BudgetLevel, DayPlan } from '@/types'
import { callLLM, isMockMode, searchPoi, parseJson } from './llm-client'
import { getMockGuideById, getMockGuide } from './mock-data'

// ── sessionStorage 键 ──
export const JILU_GUIDE_KEY = 'xuncheng-jilu-guide'
export const JILU_GUIDE_UPDATED_EVENT = 'jilu-guide-updated'

// ── 用户意图分析 ──
export interface ParsedIntent {
  city?: string
  bookTitle?: string
  author?: string
  days: number
  interests: InterestTag[]
  budget: BudgetLevel
  rawInput: string
}

/** 从用户输入中提取旅行意图 */
export async function parseUserIntent(input: string): Promise<ParsedIntent> {
  if (isMockMode()) {
    return simpleParseIntent(input)
  }

  try {
    const result = await callLLM(
      [
        {
          role: 'system',
          content: `你是旅行意图分析器。从用户的自然语言中提取旅行规划参数，返回 JSON。
如果用户提到了书名，提取 bookTitle 和 author（如果能识别）。
如果用户提到了城市，提取 city。
如果用户提到了天数或时间范围，提取 days。
如果用户提到了兴趣方向，提取 interests（从"文化""美食""自然""体验"中选择）。
如果用户提到了预算水平，提取 budget（从"穷游""舒适""轻奢"中选择）。
无法确定的字段留空。days 默认2，interests 默认 ["文化","美食"]，budget 默认 "舒适"。`,
        },
        {
          role: 'user',
          content: `分析以下输入，返回 JSON：\n${input}\n\n格式：{ "city": "", "bookTitle": "", "author": "", "days": 2, "interests": ["文化","美食"], "budget": "舒适" }`,
        },
      ],
      { temperature: 0.3, max_tokens: 300 }
    )
    const parsed = parseJson<Partial<ParsedIntent>>(result)
    return {
      city: parsed.city || undefined,
      bookTitle: parsed.bookTitle || undefined,
      author: parsed.author || undefined,
      days: Math.min(Math.max(parsed.days || 2, 1), 7),
      interests: parsed.interests?.length ? parsed.interests : ['文化', '美食'],
      budget: parsed.budget || '舒适',
      rawInput: input,
    }
  } catch {
    return simpleParseIntent(input)
  }
}

/** 简单正则解析（兜底） */
function simpleParseIntent(input: string): ParsedIntent {
  const cityMatch = input.match(/([\u4e00-\u9fa5]{2,4})(?:玩|旅游|旅行|走一趟|逛逛|去看看)/)
  const daysMatch = input.match(/(\d)\s*[天日]/)
  const bookMatch = input.match(/[《「]([^》」]+)[》」]/)

  return {
    city: cityMatch?.[1] || undefined,
    bookTitle: bookMatch?.[1] || undefined,
    days: daysMatch ? Math.min(parseInt(daysMatch[1]), 7) : 2,
    interests: ['文化', '美食'],
    budget: '舒适',
    rawInput: input,
  }
}

// ── 攻略生成 ──

const GUIDE_SYSTEM_PROMPT = `你是"寻迹"的AI旅行规划师——专门生成"跟着书本去旅行"的全面攻略。

核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献，原文引用必须真实
2. 推荐本地人真正会去的地方，不推网红店
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 信息尽量全面：景点、美食、在地体验、方言、贴士都不可少
6. 美食推荐至少占30%的spot
7. 每天安排4-8个spot，包含景点、美食、体验的合理搭配

你必须返回合法 JSON，不要包含 markdown 代码块。`

function buildGuidePrompt(intent: ParsedIntent): string {
  const cityHint = intent.city || '请根据内容推断'
  const bookHint = intent.bookTitle
    ? `关联书籍：《${intent.bookTitle}》${intent.author ? `（${intent.author}）` : ''}`
    : '请推荐与该城市相关的文学作品'

  return `为用户生成一份全面的"跟着书本去旅行"攻略。

${bookHint}
目标城市：${cityHint}
天数：${intent.days}
兴趣方向：${intent.interests.join('、')}
预算：${intent.budget}
用户原始需求：${intent.rawInput}

返回 JSON 格式（不要包含 markdown 代码块标记）：
{
  "title": "攻略标题（文学感，含城市名）",
  "subtitle": "副标题（含关联书籍/作者）",
  "entryType": "目的地",
  "relatedBook": "关联书籍",
  "relatedAuthor": "关联作者",
  "routeIntro": "200-300字路线引言，有画面感，引用文学原文",
  "city": "${intent.city || ''}",
  "province": "省份",
  "dayPlans": [
    {
      "day": 1,
      "title": "第1天主题（可引用书中意象）",
      "budgetEstimate": "当日预算估算",
      "spots": [
        {
          "id": "d1-s1",
          "name": "景点/美食名",
          "desc": "一句话描述（20字以内）",
          "duration": "停留时间",
          "tags": ["标签1","标签2"],
          "timeSlot": "上午/中午/下午/晚上",
          "address": "具体地址",
          "story": "50-100字，这个地方的故事，结合文学/历史",
          "type": "景点/美食/体验",
          "budgetHint": "花费提示",
          "emoji": "一个emoji",
          "originalText": "书中原文片段或历史文献引用（30-120字，必须真实）",
          "originalSource": "出处（篇名/章节）",
          "realityNote": "50-80字：书中描写 vs 现实实景的对照",
          "location": { "lat": 0, "lng": 0 }
        }
      ]
    }
  ],
  "dialect": [
    {"dialect": "方言词", "meaning": "意思", "scenario": "使用场景"}
  ],
  "localExperiences": [
    {"name": "体验名", "desc": "描述", "type": "赶集/时令/民俗/手艺/体验", "schedule": "时间"}
  ],
  "tips": ["实用贴士1", "实用贴士2", ...]
}

硬性要求：
- ${intent.days}天行程，每天4-8个spot
- 美食类spot至少占30%
- 每个spot必须有originalText和realityNote
- 方言至少6个
- 在地体验至少4个
- 贴士至少6条，包含交通/住宿/美食/文化/时节建议
- location填写真实经纬度（如果知道的话），不知道的填 {"lat":0,"lng":0}
- ${intent.city ? `所有地点必须在${intent.city}或周边` : '请推断最相关的城市'}`
}

/** 生成完整攻略 */
export async function generateJiluGuide(intent: ParsedIntent): Promise<Guide> {
  if (isMockMode()) {
    const city = intent.city || '常熟'
    const fallback = getMockGuideById('renjianziwei') || getMockGuide(city, intent.days, intent.interests, intent.budget)
    if (fallback) {
      return {
        ...fallback,
        id: `jilu-${Date.now()}`,
        title: `${city}·文学旅行攻略`,
        city,
        entryType: intent.bookTitle ? '书籍' : '目的地',
        relatedBook: intent.bookTitle,
        relatedAuthor: intent.author,
        routeIntro: fallback.routeIntro || `跟着文学的脚步，走进${city}的街巷与山水。`,
      }
    }
    throw new Error('演示数据不可用')
  }

  try {
    const result = await callLLM(
      [
        { role: 'system', content: GUIDE_SYSTEM_PROMPT },
        { role: 'user', content: buildGuidePrompt(intent) },
      ],
      { temperature: 0.8, max_tokens: 6000 }
    )

    const guide = parseJson<Guide>(result)
    guide.id = `jilu-${Date.now()}`
    guide.createdAt = new Date().toISOString()
    guide.interests = intent.interests
    guide.budget = intent.budget
    guide.days = intent.days
    if (intent.city) guide.city = intent.city
    if (intent.bookTitle) {
      guide.entryType = '书籍'
      guide.relatedBook = intent.bookTitle
      if (intent.author) guide.relatedAuthor = intent.author
    }

    // POI enrichment for spots without real coordinates
    await enrichGuideLocations(guide)

    return guide
  } catch (error) {
    console.error('迹录员攻略生成失败:', error)
    const city = intent.city || '常熟'
    const fallback = getMockGuideById('renjianziwei') || getMockGuide(city, intent.days, intent.interests, intent.budget)
    if (fallback) {
      return {
        ...fallback,
        id: `jilu-${Date.now()}`,
        title: `${city}·文学旅行攻略`,
        city,
        routeIntro: `攻略生成遇到问题，已为你提供参考路线。你可以继续和迹录员对话调整。`,
      }
    }
    throw new Error('攻略生成失败，请稍后重试')
  }
}

/** 用高德POI补充经纬度和地址 */
async function enrichGuideLocations(guide: Guide): Promise<void> {
  const city = guide.city
  if (!city) return

  const spotsWithoutLocation = guide.dayPlans
    .flatMap(d => d.spots)
    .filter(s => !s.location?.lat && !s.location?.lng)

  if (spotsWithoutLocation.length === 0) return

  // 最多并发5个POI查询
  const batch = spotsWithoutLocation.slice(0, 5)
  const results = await Promise.allSettled(
    batch.map(spot => searchPoi(spot.name, city))
  )

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      const poi = result.value
      const spot = batch[i]
      spot.location = poi.location || undefined
      if (poi.address && !spot.address) spot.address = poi.address
      if (poi.openingHours && !spot.story?.includes('开放')) {
        spot.story = (spot.story || '') + ` 开放时间：${poi.openingHours}`
      }
    }
  })
}

// ── 攻略修改 ──

const MODIFY_SYSTEM_PROMPT = `你是"寻迹"的AI旅行规划师。用户已有旅行攻略，现在要基于对话修改它。

核心原则：
1. 保持已有攻略的结构和格式，只修改用户要求的部分
2. 新增的景点也必须有 originalText 和 realityNote
3. 修改后仍然要保证行程的时间/地理合理性
4. 美食至少占30%
5. 返回完整的修改后攻略 JSON（不要只返回变更部分）
6. 原文引用必须真实

你必须返回合法 JSON，不要包含 markdown 代码块。`

function buildModifyPrompt(currentGuide: Guide, userRequest: string): string {
  // 将当前攻略序列化为参考上下文
  const guideSummary = JSON.stringify({
    title: currentGuide.title,
    city: currentGuide.city,
    days: currentGuide.days,
    dayPlans: currentGuide.dayPlans.map(d => ({
      day: d.day,
      title: d.title,
      spotCount: d.spots.length,
      spotNames: d.spots.map(s => s.name),
    })),
    tips: currentGuide.tips,
  }, null, 2)

  return `用户当前攻略概要：
${guideSummary}

用户的修改需求：${userRequest}

请返回修改后的完整攻略 JSON，格式与生成时相同（包含 title、subtitle、city、province、dayPlans、dialect、localExperiences、tips 等所有字段）。
只修改用户要求的部分，其余保持不变。
city 保持 "${currentGuide.city}"。
天数根据用户需求调整（如果用户说"加一天"则为 ${currentGuide.days + 1} 天）。`
}

/** 基于用户反馈修改攻略 */
export async function modifyJiluGuide(
  currentGuide: Guide,
  userRequest: string
): Promise<Guide> {
  if (isMockMode()) {
    // Mock模式：简单返回原攻略加个标记
    return {
      ...currentGuide,
      id: `jilu-${Date.now()}`,
      routeIntro: currentGuide.routeIntro + '（已根据您的反馈调整）',
    }
  }

  try {
    const result = await callLLM(
      [
        { role: 'system', content: MODIFY_SYSTEM_PROMPT },
        { role: 'user', content: buildModifyPrompt(currentGuide, userRequest) },
      ],
      { temperature: 0.7, max_tokens: 6000 }
    )

    const modified = parseJson<Guide>(result)
    modified.id = `jilu-${Date.now()}`
    modified.createdAt = new Date().toISOString()
    modified.interests = currentGuide.interests
    modified.budget = currentGuide.budget
    if (!modified.city) modified.city = currentGuide.city

    // POI enrichment for new spots
    await enrichGuideLocations(modified)

    return modified
  } catch (error) {
    console.error('迹录员攻略修改失败:', error)
    throw new Error('攻略调整失败，请稍后重试')
  }
}

// ── sessionStorage 操作 ──

export function saveJiluGuide(guide: Guide): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(JILU_GUIDE_KEY, JSON.stringify(guide))
  // 通知页面刷新
  window.dispatchEvent(new CustomEvent(JILU_GUIDE_UPDATED_EVENT, { detail: guide }))
}

export function loadJiluGuide(): Guide | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(JILU_GUIDE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Guide
  } catch {
    return null
  }
}

export function clearJiluGuide(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(JILU_GUIDE_KEY)
}

// ── 意图分类 ──

export type JiluIntent = 'generate' | 'modify' | 'chat'

/** 判断用户消息的意图类型 */
export function classifyIntent(
  message: string,
  hasCurrentGuide: boolean
): JiluIntent {
  if (!hasCurrentGuide) return 'generate'

  const modifyKeywords = /加|减|换|改|调|增加|减少|替换|修改|调整|删|不要|去掉|换掉|多.*点|少.*点|延长|缩短|变更|换成|更|重新|再/
  const chatKeywords = /为什么|什么是|怎么|如何|什么意思|解释|说说|聊聊|介绍一下|讲讲/

  if (modifyKeywords.test(message)) return 'modify'
  if (chatKeywords.test(message)) return 'chat'

  // 默认在有攻略时视为修改意图
  return 'modify'
}
