import {
  BookGuideRequest,
  BookGuideResponse,
  BookLocation对照,
  DayTransportSummary,
} from '@/types/book-guide'
import { Guide, InterestTag, BudgetLevel, Spot } from '@/types'
import { getMockGuide } from './mock-data'
import { shouldUseMock } from './llm-server'
import { searchPoi, PoiSearchResult } from './poi-search'

const SYSTEM = `你是"寻城"AI 文学旅行规划师——专门把书籍里的地点变成可落地的旅行攻略。
原则：每个景点必须关联书中原文；推荐本地人真正会去的地方；行程安排考虑地理距离与时间合理性。
你必须返回合法 JSON，不要包含 markdown 代码块。`

async function callLLM(user: string): Promise<string> {
  // llm-server 未导出 callLLM，在此复用相同逻辑
  if (shouldUseMock()) throw new Error('mock')
  const apiKey = process.env.LLM_API_KEY!
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai-next.com/v1'
  const model = process.env.LLM_MODEL || 'gpt-4o-mini'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM API: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('empty response')
  return content
}

function parseJson<T>(content: string): T {
  let jsonStr = content.trim()
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) jsonStr = match[1].trim()
  return JSON.parse(jsonStr) as T
}

interface ExtractedLocation {
  bookName: string
  searchKeyword: string
  category: string
  originalText: string
  originalSource?: string
}

interface GeneratedPayload {
  title: string
  subtitle: string
  province: string
  routeIntro: string
  location对照: ExtractedLocation[]
  dayPlans: Guide['dayPlans']
  diningRecommendations: BookGuideResponse['diningRecommendations']
  dayTransports: DayTransportSummary[]
  dialect?: Guide['dialect']
  localExperiences?: Guide['localExperiences']
  tips: string[]
}

function buildPrompt(req: BookGuideRequest, poiHints: string): string {
  return `请为以下书籍生成「跟着书本去旅行」结构化攻略：

【书籍信息】
- 书名：《${req.bookTitle}》
- 作者：${req.author}
- 目标城市：${req.city}
- 旅行天数：${req.days} 天
- 兴趣偏好：${req.interests.join('、')}
- 预算：${req.budget}
${req.preferences ? `- 其他偏好：${req.preferences}` : ''}
${req.bookExcerpt ? `\n【书籍摘录】\n${req.bookExcerpt.slice(0, 2000)}` : ''}

${poiHints ? `\n【已验证 POI 参考】\n${poiHints}` : ''}

请返回 JSON（字段名必须使用 location对照 而非其他变体）：
{
  "title": "攻略标题",
  "subtitle": "副标题",
  "province": "省份",
  "routeIntro": "路线引言 100-200字",
  "location对照": [
    {
      "bookName": "书中称呼",
      "searchKeyword": "用于地图搜索的关键词",
      "category": "景点/餐厅/街道/茶馆/博物馆",
      "originalText": "书中原文片段",
      "originalSource": "出处"
    }
  ],
  "dayPlans": [
    {
      "day": 1,
      "title": "第1天标题",
      "budgetEstimate": "当日预算",
      "spots": [
        {
          "id": "唯一id",
          "name": "地点名",
          "desc": "20字内描述",
          "duration": "停留时长",
          "tags": ["文化","美食"],
          "timeSlot": "上午/中午/下午/晚上",
          "address": "地址",
          "story": "50-100字故事",
          "type": "景点/美食/体验",
          "budgetHint": "花费",
          "emoji": "一个emoji",
          "originalText": "书中原文",
          "originalSource": "出处",
          "realityNote": "实景对照",
          "location": { "lat": 32.0, "lng": 119.0 }
        }
      ]
    }
  ],
  "diningRecommendations": [
    { "name": "餐厅/小吃", "desc": "推荐理由", "bookReference": "书中关联", "address": "地址", "budgetHint": "人均" }
  ],
  "dayTransports": [
    {
      "day": 1,
      "segments": [
        { "from": "A", "to": "B", "mode": "步行/公交/打车", "duration": "约15分钟" }
      ]
    }
  ],
  "dialect": [{ "dialect": "方言", "meaning": "意思", "scenario": "场景" }],
  "localExperiences": [{ "name": "体验", "desc": "描述", "type": "赶集/时令/民俗/手艺", "schedule": "时间" }],
  "tips": ["贴士1", "贴士2", "贴士3", "贴士4"]
}

要求：
- location对照 至少 5 项，涵盖景点、餐饮、街道等类型
- 每个 spot 必须有 originalText 和 realityNote
- dayPlans 共 ${req.days} 天，每天 3-5 个点位，含交通合理的 timeSlot
- diningRecommendations 至少 3 项
- tips 至少 4 条实用贴士`
}

async function enrichWithPoi(
  extracted: ExtractedLocation[],
  city: string
): Promise<{ rows: BookLocation对照[]; hints: string }> {
  const rows: BookLocation对照[] = []
  const hintLines: string[] = []

  for (const loc of extracted) {
    const poi: PoiSearchResult | null = await searchPoi(loc.searchKeyword, city)
    if (poi) {
      rows.push({
        bookName: loc.bookName,
        realName: poi.name,
        category: loc.category,
        originalText: loc.originalText,
        originalSource: loc.originalSource,
        address: poi.address,
        openingHours: poi.openingHours,
        ticketInfo: poi.tel ? `电话 ${poi.tel}` : undefined,
        verified: poi.verified,
        location: poi.location,
      })
      hintLines.push(
        `- ${loc.bookName} → ${poi.name} | ${poi.address}${poi.openingHours ? ` | ${poi.openingHours}` : ''}`
      )
    } else {
      rows.push({
        bookName: loc.bookName,
        realName: loc.searchKeyword,
        category: loc.category,
        originalText: loc.originalText,
        originalSource: loc.originalSource,
        verified: false,
      })
    }
  }

  return { rows, hints: hintLines.join('\n') }
}

function mergePoiIntoSpots(spots: Spot[], rows: BookLocation对照[]): Spot[] {
  return spots.map(spot => {
    const match = rows.find(
      l =>
        l.realName.includes(spot.name) ||
        spot.name.includes(l.realName) ||
        l.bookName.includes(spot.name)
    )
    if (!match) return spot
    return {
      ...spot,
      address: match.address || spot.address,
      location: match.location || spot.location,
      realityNote: spot.realityNote || `对应书中「${match.bookName}」`,
    }
  })
}

function buildMockResponse(req: BookGuideRequest): BookGuideResponse {
  const base = getMockGuide(req.city, req.days, req.interests, req.budget)
  const guide: Guide = {
    ...base,
    id: `book-${Date.now()}`,
    title: `《${req.bookTitle}》· ${req.city}文学之旅`,
    subtitle: `${req.author} 著 · 跟着书本走 ${req.city}`,
    relatedBook: req.bookTitle,
    relatedAuthor: req.author,
    entryType: '书籍',
    routeIntro:
      base.routeIntro ||
      `跟着${req.author}的《${req.bookTitle}》，在${req.city}寻找文字里的真实坐标。`,
  }

  const spots = guide.dayPlans.flatMap(d => d.spots)
  const location对照: BookLocation对照[] = spots.slice(0, 6).map(s => ({
    bookName: s.name,
    realName: s.name,
    category: s.type === '美食' ? '餐厅' : '景点',
    originalText: s.originalText || s.desc,
    originalSource: s.originalSource,
    address: s.address,
    openingHours: '08:30-17:30（演示）',
    ticketInfo: s.budgetHint,
    verified: false,
    location: s.location,
  }))

  return {
    guide,
    location对照,
    diningRecommendations: spots
      .filter(s => s.type === '美食')
      .slice(0, 4)
      .map(s => ({
        name: s.name,
        desc: s.desc,
        bookReference: s.originalSource,
        address: s.address,
        budgetHint: s.budgetHint,
      })),
    dayTransports: guide.dayPlans.map(d => ({
      day: d.day,
      segments: d.spots.slice(0, -1).map((s, i) => ({
        from: s.name,
        to: d.spots[i + 1].name,
        mode: '步行/公交',
        duration: '约15-25分钟',
      })),
    })),
    meta: {
      mock: true,
      extractedCount: location对照.length,
      verifiedCount: 0,
      bookTitle: req.bookTitle,
      author: req.author,
    },
  }
}

export async function generateBookGuideServer(
  req: BookGuideRequest
): Promise<BookGuideResponse> {
  if (!req.bookTitle?.trim() || !req.city?.trim()) {
    throw new Error('书名和城市为必填项')
  }

  const days = Math.min(Math.max(req.days || 2, 1), 7)
  const interests: InterestTag[] = req.interests?.length
    ? req.interests
    : ['文化', '美食']
  const budget: BudgetLevel = req.budget || '舒适'

  if (shouldUseMock()) {
    return buildMockResponse({ ...req, days, interests, budget })
  }

  try {
    // 第一轮：提取地点
    const extractPrompt = `分析《${req.bookTitle}》（${req.author}），目标城市 ${req.city}。
${req.bookExcerpt ? `摘录：\n${req.bookExcerpt.slice(0, 1500)}` : '（无摘录，请基于你对该书的了解）'}

返回 JSON：{ "location对照": [{ "bookName", "searchKeyword", "category", "originalText", "originalSource" }] }
至少 5 个地点，category 为 景点/餐厅/街道/茶馆/博物馆 之一。`

    let extracted: ExtractedLocation[] = []
    try {
      const extractRaw = await callLLM(extractPrompt)
      const parsed = parseJson<{ location对照: ExtractedLocation[] }>(extractRaw)
      extracted = parsed.location对照 ?? []
    } catch {
      extracted = []
    }

    // POI 验证
    const { rows: poiRows, hints } = await enrichWithPoi(
      extracted.length > 0
        ? extracted
        : [{ bookName: req.city, searchKeyword: req.city, category: '景点', originalText: req.bookTitle, originalSource: req.bookTitle }],
      req.city
    )

    // 第二轮：生成完整攻略
    const genRaw = await callLLM(buildPrompt({ ...req, days, interests, budget }, hints))
    const payload = parseJson<GeneratedPayload>(genRaw)

    const locationRows: BookLocation对照[] =
      payload.location对照?.map(loc => {
        const verified = poiRows.find(p => p.bookName === loc.bookName)
        return (
          verified ?? {
            bookName: loc.bookName,
            realName: loc.searchKeyword,
            category: loc.category,
            originalText: loc.originalText,
            originalSource: loc.originalSource,
            verified: false,
          }
        )
      }) ?? poiRows

    const dayPlans = (payload.dayPlans ?? []).map(plan => ({
      ...plan,
      spots: mergePoiIntoSpots(plan.spots ?? [], locationRows),
    }))

    const guide: Guide = {
      id: `book-${Date.now()}`,
      title: payload.title || `《${req.bookTitle}》· ${req.city}`,
      subtitle: payload.subtitle || `${req.author} 著`,
      city: req.city,
      province: payload.province || '',
      days,
      interests,
      budget,
      dayPlans,
      dialect: payload.dialect,
      localExperiences: payload.localExperiences,
      createdAt: new Date().toISOString(),
      tips: payload.tips ?? [],
      entryType: '书籍',
      relatedBook: req.bookTitle,
      relatedAuthor: req.author,
      routeIntro: payload.routeIntro,
    }

    return {
      guide,
      location对照: locationRows,
      diningRecommendations: payload.diningRecommendations ?? [],
      dayTransports: payload.dayTransports ?? [],
      meta: {
        mock: false,
        extractedCount: locationRows.length,
        verifiedCount: locationRows.filter(l => l.verified).length,
        bookTitle: req.bookTitle,
        author: req.author,
      },
    }
  } catch (error) {
    console.error('书籍攻略生成失败，回退 Mock:', error)
    return buildMockResponse({ ...req, days, interests, budget })
  }
}
