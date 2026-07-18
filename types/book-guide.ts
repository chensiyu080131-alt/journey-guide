import { BudgetLevel, Guide, InterestTag } from './index'

/** 用户通过浮窗提交的书籍旅行请求 */
export interface BookGuideRequest {
  bookTitle: string
  author: string
  /** 可选；未填时 AI 根据书名/摘录推断主要城市 */
  city?: string
  days: number
  interests: InterestTag[]
  budget: BudgetLevel
  /** 旅游偏好（自由描述） */
  preferences?: string
  /** 书籍摘录（可选，有助于提取地点） */
  bookExcerpt?: string
}

/** 从书中提取、经 POI 验证的地点对照项 */
export interface BookLocation对照 {
  /** 书中称呼 */
  bookName: string
  /** 现实 POI 名称 */
  realName: string
  /** 景点 / 餐厅 / 街道 / 茶馆 / 博物馆 等 */
  category: string
  /** 书中原文引用 */
  originalText: string
  /** 出处（篇目/章节） */
  originalSource?: string
  /** 验证后的地址 */
  address?: string
  /** 开放时间 */
  openingHours?: string
  /** 门票/消费参考 */
  ticketInfo?: string
  /** 是否通过 POI 搜索验证 */
  verified: boolean
  location?: { lat: number; lng: number }
}

/** 每日行程交通摘要 */
export interface DayTransportSummary {
  day: number
  segments: Array<{
    from: string
    to: string
    mode: string
    duration: string
  }>
}

/** 书籍攻略生成结果 */
export interface BookGuideResponse {
  guide: Guide
  /** 书中地点 ↔ 现实对照表 */
  location对照: BookLocation对照[]
  /** 餐饮推荐（书中 + 本地） */
  diningRecommendations: Array<{
    name: string
    desc: string
    bookReference?: string
    address?: string
    budgetHint?: string
  }>
  /** 每日交通摘要 */
  dayTransports: DayTransportSummary[]
  meta: {
    mock: boolean
    extractedCount: number
    verifiedCount: number
    bookTitle: string
    author: string
    /** 行程中含书中原文的点位数 */
    linkedSpotCount?: number
    /** 用户是否提供了摘录 */
    hasExcerpt?: boolean
  }
}

export const BOOK_GUIDE_STORAGE_KEY = 'xuncheng-book-guide-result'
