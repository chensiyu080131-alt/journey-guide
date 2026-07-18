import {
  BookGuideRequest,
  BookGuideResponse,
  BookLocation对照,
  DayTransportSummary,
} from '@/types/book-guide'
import { Guide, InterestTag, BudgetLevel, Spot } from '@/types'
import { shouldUseMock, callLLMChat, formatLlmError } from './llm-server'
import { searchPoi, PoiSearchResult } from './poi-search'

const SYSTEM = `你是"寻城"AI 文学旅行规划师——专门把书籍里的地点变成可落地的旅行攻略。
核心原则：
1. 每个景点必须关联书中真实原文，禁止编造不存在的引文
2. 行程只能使用已给定的「书中地点对照表」中的地点，不得擅自添加无关网红景点
3. 推荐本地人真正会去的地方；行程安排考虑地理距离与时间合理性
你必须返回合法 JSON，不要包含 markdown 代码块。`

async function callLLM(user: string): Promise<string> {
  return callLLMChat(
    [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: user },
    ],
    { max_tokens: 6000 }
  )
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
  city?: string
  routeIntro: string
  location对照?: ExtractedLocation[]
  dayPlans: Guide['dayPlans']
  diningRecommendations: BookGuideResponse['diningRecommendations']
  dayTransports: DayTransportSummary[]
  dialect?: Guide['dialect']
  localExperiences?: Guide['localExperiences']
  tips: string[]
}

interface ScheduleSpot extends Spot {
  bookNameRef?: string
}

function buildExtractPrompt(req: BookGuideRequest, cityHint: string): string {
  const excerptBlock = req.bookExcerpt?.trim()
    ? `【用户提供的摘录 —— 优先从中提取，originalText 必须来自此摘录或你确知该书的真实原文】
${req.bookExcerpt.slice(0, 3500)}`
    : `【无摘录 —— 请根据你对《${req.bookTitle}》的真实了解提取。originalText 必须是书中真实存在的句子，禁止编造。若无法确认逐字原文，可引用你确知的关键句，并在 originalSource 标注章节。`

  return `分析《${req.bookTitle}》（${req.author}），${cityHint}。

${excerptBlock}

返回 JSON：
{
  "location对照": [
    {
      "bookName": "书中对该地的称呼（地名/店铺/风景，不要填书名）",
      "searchKeyword": "用于地图搜索的关键词（建议含城市/区县名）",
      "category": "景点/餐厅/街道/茶馆/博物馆",
      "originalText": "书中描写该地的原文（30-120字，必须是真实原文）",
      "originalSource": "篇名/章节"
    }
  ]
}

要求：
- 至少 6 个地点，必须确实与本书内容相关（人物活动地、地名、店铺、风景等）
- originalText 不可为空，必须是真实引文，不可泛泛描述
- bookName 必须是地点在书中的称呼，不能填书名《${req.bookTitle}》
- 地点应分布在本书主要故事发生的城市/区域`
}

function formatLocationTable(rows: BookLocation对照[]): string {
  return rows
    .map(
      (r, i) =>
        `${i + 1}. bookName「${r.bookName}」→ 现实「${r.realName}」(${r.category})
   原文：「${r.originalText}」
   出处：${r.originalSource || '—'}${r.address ? `\n   地址：${r.address}` : ''}`
    )
    .join('\n\n')
}

function buildSchedulePrompt(req: BookGuideRequest, rows: BookLocation对照[]): string {
  return `为《${req.bookTitle}》（${req.author}）规划 ${req.days} 天「跟着书本去旅行」行程。

【锁定地点清单 —— dayPlans 中每个 spot 必须对应下表一项，不得新增表外地点】
${formatLocationTable(rows)}

${req.preferences ? `【用户偏好】${req.preferences}` : ''}
兴趣：${req.interests.join('、')} · 预算：${req.budget}

请返回 JSON：
{
  "title": "攻略标题（含书名）",
  "subtitle": "副标题",
  "province": "省份",
  "city": "${req.city}",
  "routeIntro": "100-200字路线引言，必须提及书中情节或人物",
  "dayPlans": [
    {
      "day": 1,
      "title": "第1天主题（可引用书中意象）",
      "budgetEstimate": "当日预算",
      "spots": [
        {
          "id": "d1-s1",
          "bookNameRef": "必须等于上表 bookName",
          "name": "使用上表 realName",
          "desc": "20字内",
          "duration": "停留时长",
          "tags": ["文化"],
          "timeSlot": "上午/中午/下午/晚上",
          "address": "从上表复制或补充",
          "story": "50-100字，结合书中情节说明为何来此地",
          "type": "景点/美食/体验",
          "budgetHint": "花费",
          "emoji": "一个emoji",
          "originalText": "必须从上表原文逐字复制",
          "originalSource": "从上表复制",
          "realityNote": "50-80字：书中描写 vs 现实实景的对照",
          "location": { "lat": 0, "lng": 0 }
        }
      ]
    }
  ],
  "diningRecommendations": [
    { "name": "餐厅名", "desc": "理由", "bookReference": "书中哪段提到或哪类饮食", "address": "地址", "budgetHint": "人均" }
  ],
  "dayTransports": [
    { "day": 1, "segments": [{ "from": "A", "to": "B", "mode": "步行/公交", "duration": "约15分钟" }] }
  ],
  "dialect": [{ "dialect": "方言", "meaning": "意思", "scenario": "场景" }],
  "localExperiences": [{ "name": "体验", "desc": "描述", "type": "赶集/时令/民俗/手艺", "schedule": "时间" }],
  "tips": ["贴士1", "贴士2", "贴士3", "贴士4"]
}

硬性要求：
- 共 ${req.days} 天，每天 3-5 个 spot，全部来自上表
- 每个 spot 的 originalText 必须与上表完全一致
- diningRecommendations 至少 3 项，bookReference 须关联本书
- tips 至少 4 条，至少 2 条提及书中细节`
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

function findLocationRow(
  spot: ScheduleSpot,
  rows: BookLocation对照[]
): BookLocation对照 | undefined {
  const ref = spot.bookNameRef?.trim()
  if (ref) {
    const byRef = rows.find(r => r.bookName === ref || r.realName === ref)
    if (byRef) return byRef
  }

  const name = spot.name?.trim()
  if (!name) return undefined

  return rows.find(
    r =>
      r.realName === name ||
      r.bookName === name ||
      r.realName.includes(name) ||
      name.includes(r.realName) ||
      r.bookName.includes(name) ||
      name.includes(r.bookName)
  )
}

function attachBookContext(spots: ScheduleSpot[], rows: BookLocation对照[]): Spot[] {
  const used = new Set<string>()

  return spots.map(spot => {
    const match = findLocationRow(spot, rows)
    if (!match) return spot as Spot

    used.add(match.bookName)
    return {
      ...spot,
      name: match.realName || spot.name,
      originalText: match.originalText || spot.originalText,
      originalSource: match.originalSource || spot.originalSource,
      address: match.address || spot.address,
      location: match.location || spot.location,
      realityNote:
        spot.realityNote ||
        `书中称「${match.bookName}」，现实对应 ${match.realName}。${match.verified ? '已通过地图验证。' : ''}`,
    }
  })
}

/** 若 LLM 行程未覆盖全部书中地点，按天均匀补入 */
function fillMissingBookSpots(
  dayPlans: Guide['dayPlans'],
  rows: BookLocation对照[],
  days: number,
  bookTitle: string
): Guide['dayPlans'] {
  const scheduled = new Set(
    dayPlans.flatMap(d => d.spots.map(s => s.name))
  )
  const missing = rows.filter(
    r => !scheduled.has(r.realName) && !scheduled.has(r.bookName)
  )
  if (missing.length === 0) return dayPlans

  const plans = dayPlans.length
    ? dayPlans.map(p => ({ ...p, spots: [...p.spots] }))
    : Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `第${i + 1}天`,
        spots: [] as Spot[],
      }))

  missing.forEach((row, idx) => {
    const plan = plans[idx % plans.length]
    plan.spots.push({
      id: `book-extra-${idx}`,
      name: row.realName,
      desc: row.category,
      duration: '约1小时',
      tags: ['文化'],
      timeSlot: '下午',
      address: row.address,
      story: `《${bookTitle}》中与此地相关。`,
      type: row.category.includes('餐') ? '美食' : '景点',
      budgetHint: row.ticketInfo,
      emoji: row.category.includes('餐') ? '🍜' : '📍',
      originalText: row.originalText,
      originalSource: row.originalSource,
      realityNote: `书中称「${row.bookName}」，现实为 ${row.realName}。`,
      location: row.location,
    })
  })

  return plans
}

async function extractBookLocations(
  req: BookGuideRequest,
  cityHint: string,
  resolvedCity: string
): Promise<ExtractedLocation[]> {
  const extractPrompt = buildExtractPrompt(req, cityHint)
  let lastError: unknown = null

  try {
    const extractRaw = await callLLM(extractPrompt)
    const parsed = parseJson<{ location对照: ExtractedLocation[] }>(extractRaw)
    const rows = (parsed.location对照 ?? []).filter(
      loc => loc.bookName?.trim() && loc.originalText?.trim()
    )
    if (rows.length >= 1) return rows
  } catch (error) {
    lastError = error
    console.warn('书籍地点提取失败，尝试简化重试:', error)
  }

  // 简化重试：只要求书名相关的核心地点
  const retryPrompt = `《${req.bookTitle}》（${req.author}）中与 ${resolvedCity} 或主要故事地相关的 6 个可探访地点。
${req.bookExcerpt ? `摘录：\n${req.bookExcerpt.slice(0, 2000)}` : ''}
返回 JSON：{ "location对照": [{ "bookName", "searchKeyword", "category", "originalText", "originalSource" }] }
originalText 必须是书中真实句子。`
  try {
    const raw = await callLLM(retryPrompt)
    const parsed = parseJson<{ location对照: ExtractedLocation[] }>(raw)
    const rows = (parsed.location对照 ?? []).filter(
      loc => loc.bookName?.trim() && loc.originalText?.trim()
    )
    if (rows.length >= 1) return rows
  } catch (error) {
    lastError = error
  }

  if (lastError) {
    throw new Error(formatLlmError(lastError))
  }
  throw new Error(
    '未能从书中提取到有效地点。建议粘贴书中描写地点的段落后重试，或填写更准确的书名/作者。'
  )
}

/** 根据书名/作者/摘录推断城市（用户未填时） */
function inferCityFromTitle(title: string, author: string): string | null {
  const t = `${title}${author}`
  const rules: [RegExp, string][] = [
    [/人间滋味|汪曾祺|高邮/, '高邮'],
    [/桨声灯影|秦淮河|朱自清|南京|金陵/, '南京'],
    [/沙家浜|常熟|翁同龢|孽海花|曾朴/, '常熟'],
    [/浮生六记|沈复|苏州|姑苏/, '苏州'],
    [/扬州慢|扬州|淮左/, '扬州'],
    [/太湖|无锡|鼋头/, '无锡'],
    [/金山|镇江|白蛇/, '镇江'],
  ]
  for (const [re, city] of rules) {
    if (re.test(t)) return city
  }
  return null
}

async function resolveCity(req: BookGuideRequest): Promise<string> {
  const trimmed = req.city?.trim()
  if (trimmed) return trimmed

  const fromTitle = inferCityFromTitle(req.bookTitle, req.author)
  if (fromTitle) return fromTitle

  if (shouldUseMock()) return '常熟'

  try {
    const prompt = `《${req.bookTitle}》（${req.author}）适合「跟着书本去旅行」的主线城市是哪一座？
${req.bookExcerpt ? `参考摘录：\n${req.bookExcerpt.slice(0, 800)}` : '（无摘录，请基于你对该书的了解）'}
只返回一个中国城市名（不含「市」字），不要解释。`
    const raw = await callLLM(prompt)
    const city = raw.trim().replace(/[。，、\s].*$/, '').replace(/市$/, '')
    if (city.length >= 2 && city.length <= 8) return city
  } catch {
    /* fallback */
  }
  return '常熟'
}

function buildMockResponse(req: BookGuideRequest, resolvedCity: string): BookGuideResponse {
  const excerpt = req.bookExcerpt?.trim().replace(/\s+/g, ' ').slice(0, 96)
  const originalText = excerpt
    ? `${excerpt}${req.bookExcerpt!.trim().length > 96 ? '…' : ''}`
    : `演示模式：请补充《${req.bookTitle}》中描写${resolvedCity}的原文片段，以生成真实书中地点。`
  const originalSource = excerpt ? `《${req.bookTitle}》用户摘录` : '演示占位'

  const dayTemplates: Array<Array<{
    label: string
    desc: string
    type: Spot['type']
    emoji: string
    timeSlot: Spot['timeSlot']
    tags: InterestTag[]
  }>> = [
    [
      { label: '文学地标', desc: '从书页进入城市现场', type: '景点', emoji: '📖', timeSlot: '上午', tags: ['文化'] },
      { label: '书中街巷', desc: '沿人物足迹慢慢走', type: '体验', emoji: '🚶', timeSlot: '下午', tags: ['文化', '体验'] },
      { label: '在地风味小馆', desc: '用一餐理解地方风土', type: '美食', emoji: '🍜', timeSlot: '晚上', tags: ['美食'] },
    ],
    [
      { label: '河岸与码头', desc: '寻找作品里的水路意象', type: '景点', emoji: '🛶', timeSlot: '上午', tags: ['自然', '文化'] },
      { label: '地方博物馆', desc: '补齐历史与民俗背景', type: '景点', emoji: '🏛️', timeSlot: '下午', tags: ['文化'] },
      { label: '夜间市集', desc: '观察城市的烟火气', type: '美食', emoji: '🏮', timeSlot: '晚上', tags: ['美食', '体验'] },
    ],
    [
      { label: '名人旧居', desc: '理解作者与时代关系', type: '景点', emoji: '🏠', timeSlot: '上午', tags: ['文化'] },
      { label: '山水观景点', desc: '对照文本中的风景描写', type: '景点', emoji: '⛰️', timeSlot: '下午', tags: ['自然'] },
      { label: '老字号食铺', desc: '把地方记忆落到味觉里', type: '美食', emoji: '🥢', timeSlot: '晚上', tags: ['美食'] },
    ],
  ]

  const dayPlans = Array.from({ length: req.days }, (_, dayIndex) => {
    const templates = dayTemplates[dayIndex % dayTemplates.length]
    const spots = templates.map((template, spotIndex): Spot => ({
      id: `book-demo-d${dayIndex + 1}-s${spotIndex + 1}`,
      name: `${resolvedCity}${template.label}`,
      desc: template.desc,
      duration: spotIndex === 2 ? '1.5小时' : '2小时',
      tags: template.tags,
      timeSlot: template.timeSlot,
      address: `${resolvedCity} · 待按真实 POI 核验`,
      story: `围绕${req.author}《${req.bookTitle}》设计的演示点位。LLM 暂不可用时先保留行程结构，恢复后可替换为真实书中地点与地图验证结果。`,
      type: template.type,
      budgetHint: template.type === '美食' ? '人均约50-120元（演示）' : '以现场公示为准（演示）',
      emoji: template.emoji,
      originalText,
      originalSource,
      realityNote: `这是 LLM 不可用时的演示点位，并非已核验的《${req.bookTitle}》真实地点。建议补充书籍摘录或恢复 LLM 后重新生成。`,
      goodNow: true,
      goodNowReason: '演示行程结构可用，真实开放时间需核验',
      photoSpot: template.type !== '美食',
    }))

    return {
      day: dayIndex + 1,
      title: `第${dayIndex + 1}天 · ${resolvedCity}文学寻访`,
      spots,
      budgetEstimate: templateBudget(req.budget),
    }
  })

  const guide: Guide = {
    id: `book-${Date.now()}`,
    title: `《${req.bookTitle}》· ${resolvedCity}文学之旅`,
    subtitle: `${req.author} 著 · 跟着书本走 ${resolvedCity}`,
    city: resolvedCity,
    province: '待核验',
    days: req.days,
    interests: req.interests,
    budget: req.budget,
    dayPlans,
    dialect: [
      { dialect: '本地方言', meaning: '待补充', scenario: 'LLM 恢复后生成真实方言速查' },
    ],
    localExperiences: [
      {
        name: `${resolvedCity}在地走读`,
        desc: `围绕《${req.bookTitle}》做城市文学走读的演示体验。`,
        type: '体验',
        schedule: '建议白天进行',
      },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '当前为 LLM 不可用时的演示攻略，点位需二次核验。',
      '提供书籍摘录可提升地点识别准确度。',
      '出发前请核对景点开放时间、预约和交通。',
      '真实原文引用应以纸质书或权威版本为准。',
    ],
    entryType: '书籍',
    relatedBook: req.bookTitle,
    relatedAuthor: req.author,
    routeIntro: `当前 LLM 暂不可用，以下先生成一份与《${req.bookTitle}》和${resolvedCity}匹配的演示行程结构。恢复模型服务或补充书籍摘录后，可生成真实书中地点、原文对照与 POI 验证结果。`,
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

function templateBudget(budget: BudgetLevel): string {
  switch (budget) {
    case '穷游':
      return '约100-200元（演示）'
    case '轻奢':
      return '约500-900元（演示）'
    case '舒适':
    default:
      return '约250-450元（演示）'
  }
}

export async function generateBookGuideServer(
  req: BookGuideRequest
): Promise<BookGuideResponse> {
  if (!req.bookTitle?.trim()) {
    throw new Error('书名为必填项')
  }

  const days = Math.min(Math.max(req.days || 2, 1), 7)
  const interests: InterestTag[] = req.interests?.length
    ? req.interests
    : ['文化', '美食']
  const budget: BudgetLevel = req.budget || '舒适'

  const resolvedCity = await resolveCity({ ...req, days, interests, budget })
  const filledReq: BookGuideRequest = { ...req, city: resolvedCity, days, interests, budget }

  if (shouldUseMock()) {
    return buildMockResponse(filledReq, resolvedCity)
  }

  try {
    const cityHint = req.city?.trim()
      ? `目标城市 ${resolvedCity}`
      : `用户未指定城市，请从全书内容推断主要区域（当前推断主线：${resolvedCity}）`

    const extracted = await extractBookLocations(filledReq, cityHint, resolvedCity)

    if (extracted.length === 0) {
      throw new Error(
        '未能从书中提取到有效地点。建议粘贴书中描写地点的段落后重试，或填写更准确的书名/作者。'
      )
    }

    const { rows: locationRows } = await enrichWithPoi(extracted, resolvedCity)

    const genRaw = await callLLM(buildSchedulePrompt(filledReq, locationRows))
    const payload = parseJson<GeneratedPayload>(genRaw)

    const finalCity = payload.city?.trim() || resolvedCity

    let dayPlans = (payload.dayPlans ?? []).map(plan => ({
      ...plan,
      spots: attachBookContext((plan.spots ?? []) as ScheduleSpot[], locationRows),
    }))

    dayPlans = fillMissingBookSpots(dayPlans, locationRows, days, req.bookTitle)

    const linkedSpotCount = dayPlans
      .flatMap(d => d.spots)
      .filter(s => s.originalText?.trim()).length

    const guide: Guide = {
      id: `book-${Date.now()}`,
      title: payload.title || `《${req.bookTitle}》· ${finalCity}`,
      subtitle: payload.subtitle || `${req.author} 著`,
      city: finalCity,
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
        linkedSpotCount,
        hasExcerpt: Boolean(req.bookExcerpt?.trim()),
      },
    }
  } catch (error) {
    console.error('书籍攻略生成失败，回退 Mock:', error)
    return buildMockResponse(filledReq, resolvedCity)
  }
}
