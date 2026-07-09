// ===== 核心类型定义 - 寻城 v2 "跟着书本去旅行" =====

/** 兴趣标签 */
export type InterestTag = '文化' | '美食' | '自然' | '体验'

/** 预算级别 */
export type BudgetLevel = '穷游' | '舒适' | '轻奢'

/** 时段 */
export type TimeSlot = '上午' | '中午' | '下午' | '晚上'

/** 入口类型 */
export type EntryType = '书籍' | '人物' | '目的地'

/** 互动任务类型 */
export type InteractiveTaskType = '诗词诵读' | '知识问答' | '古籍寻宝' | '书法临摹'

/** 互动任务 */
export interface InteractiveTask {
  type: InteractiveTaskType
  title: string
  description: string
  /** 知识问答专用 */
  questions?: { question: string; options: string[]; answer: number }[]
  /** 诗词诵读专用 */
  poem?: string
  /** 书法临摹专用 */
  calligraphyText?: string
  /** 古籍寻宝专用：原文和含错字的版本 */
  treasureOriginal?: string
  treasureTampered?: string
}

/** 景点/美食卡片 */
export interface Spot {
  id: string
  name: string
  /** 一句话描述 */
  desc: string
  /** 推荐停留时间 */
  duration: string
  /** 标签 */
  tags: string[]
  /** 时段 */
  timeSlot: TimeSlot
  /** 经纬度 */
  location?: { lat: number; lng: number }
  /** 地址 */
  address?: string
  /** 历史文化故事 */
  story?: string
  /** 类型: 景点 or 美食 */
  type: '景点' | '美食' | '体验'
  /** 预算提示 */
  budgetHint?: string
  /** 时间感知：现在适合去？ */
  goodNow?: boolean
  /** 时间感知原因 */
  goodNowReason?: string
  /** 适合拍照？ */
  photoSpot?: boolean
  /** 图片（可选，mock用emoji代替） */
  emoji: string
  /** ★ v2新增：原文片段 —— 书中描写或人物相关文献 */
  originalText?: string
  /** ★ v2新增：原文出处 */
  originalSource?: string
  /** 实景对照说明 */
  realityNote?: string
  /** 历史照片（AI 对照用） */
  historicalImage?: string
  /** 实景照片 */
  realityImage?: string
  /** 互动任务（可选） */
  interactiveTask?: InteractiveTask
  /** 书中篇目（如《五味》） */
  essay?: string
  /** 地域（如高邮、昆明） */
  region?: string
  /** 五味标签：酸/甜/苦/辣/咸 */
  flavor?: '酸' | '甜' | '苦' | '辣' | '咸'
}

/** 一天的行程 */
export interface DayPlan {
  day: number
  title: string
  spots: Spot[]
  /** 当日预算估算 */
  budgetEstimate?: string
}

/** 行程时段类型 */
export type ScheduleBlockType = '集合' | '上午' | '午饭' | '下午' | '晚饭' | '晚间'

/** 时段内单个点位摘要 */
export interface ScheduleSpotRef {
  spotId: string
  name: string
  emoji: string
  duration: string
  highlight: string
  travelTime?: string
  type: Spot['type']
}

/** 一天中的行程段落 */
export interface ScheduleBlock {
  type: ScheduleBlockType
  label: string
  timeRange?: string
  travelTime?: string
  spots: ScheduleSpotRef[]
  activity?: string
  highlight?: string
}

/** 结构化单日行程（按天数探索） */
export interface ItineraryDayDetail {
  day: number
  title: string
  meetingPoint: ScheduleBlock
  blocks: ScheduleBlock[]
  budgetEstimate?: string
  /** 地图路线顺序（含可选项） */
  spotIds: string[]
}

/** 路线方案（不同天数/预算/喜好） */
export interface RouteVariant {
  id: string
  days: number
  title: string
  summary: string
  pace: '悠闲' | '适中' | '紧凑'
  budgetHint: string
}

/** 沿途可选推荐点位（非遗/历史文化） */
export interface OptionalRecommendSpot {
  id: string
  name: string
  emoji: string
  desc: string
  duration: string
  category: '非遗文化' | '历史文化' | '民俗体验'
  heritage?: string
  location?: { lat: number; lng: number }
  address?: string
  /** 插入到哪个主点位之后 */
  insertAfterSpotId?: string
  insertDay?: number
  originalText?: string
  originalSource?: string
  story?: string
  tags?: InterestTag[]
  budgetHint?: string
}

/** 完整攻略 */
export interface Guide {
  id: string
  /** 攻略标题 */
  title: string
  /** 副标题 */
  subtitle: string
  /** 城市 */
  city: string
  /** 省份 */
  province: string
  /** 天数 */
  days: number
  /** 兴趣标签 */
  interests: InterestTag[]
  /** 预算级别 */
  budget: BudgetLevel
  /** 每日行程 */
  dayPlans: DayPlan[]
  /** 方言速查 */
  dialect?: DialectItem[]
  /** 在地体验 */
  localExperiences?: LocalExperience[]
  /** 攻略生成时间 */
  createdAt: string
  /** 旅行贴士 */
  tips?: string[]
  /** ★ v2新增：入口类型 */
  entryType: EntryType
  /** ★ v2新增：关联书籍/人物 */
  relatedBook?: string
  relatedAuthor?: string
  relatedCharacter?: string
  /** ★ v2新增：路线引言（放在攻略顶部） */
  routeIntro?: string
}

/** 方言速查 */
export interface DialectItem {
  dialect: string
  meaning: string
  scenario: string
}

/** 在地体验 */
export interface LocalExperience {
  name: string
  desc: string
  type: '赶集' | '时令' | '民俗' | '手艺' | '体验'
  schedule?: string
}

/** 搜索参数 */
export interface SearchParams {
  city: string
  days: number
  interests: InterestTag[]
  budget: BudgetLevel
}

/** 首页入口卡片 */
export interface EntryCard {
  id: string
  type: EntryType
  title: string
  subtitle: string
  emoji: string
  /** 书籍/人物/目的地名 */
  target: string
  /** 卡片描述 */
  desc: string
  /** 标签 */
  tags: string[]
  /** 路由路径 */
  route: string
  /** 背景渐变色 */
  gradient: string
  /** 封面图 */
  coverImage: string
  /** 行程天数 */
  days: number
  /** 预算提示 */
  priceHint: string
}

/** LLM请求配置 */
export interface LLMConfig {
  apiKey: string
  baseUrl: string
  model: string
  useMock: boolean
}
