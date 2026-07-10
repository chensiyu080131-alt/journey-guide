/**
 * 客户端 LLM 服务 —— 直连 OpenAI 兼容 API
 * 替代服务端 /api/chat、/api/generate-guide、/api/book-guide
 * 密钥通过 NEXT_PUBLIC_ 前缀环境变量在构建时嵌入（路演演示用途）
 */

// ===== 配置 =====

const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || ''
const BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://api.openai-next.com/v1'
const MODEL = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-4o-mini'
const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY || ''

export function isMockMode(): boolean {
  return !API_KEY || process.env.NEXT_PUBLIC_USE_MOCK === 'true'
}

export function getMockReason(): string | null {
  if (!API_KEY) return '未配置 NEXT_PUBLIC_LLM_API_KEY'
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return 'NEXT_PUBLIC_USE_MOCK=true'
  return null
}

// ===== 通用 LLM 调用 =====

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callLLM(
  messages: LLMMessage[],
  options?: { max_tokens?: number; temperature?: number }
): Promise<string> {
  if (isMockMode()) {
    throw new Error('mock mode - caller should handle fallback')
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM API调用失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('API返回内容为空')
  return content
}

// ===== 流式 LLM 调用（用于 AI 书灵对话） =====

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

export async function streamLLM(
  messages: LLMMessage[],
  callbacks: StreamCallbacks,
  options?: { max_tokens?: number; temperature?: number }
): Promise<void> {
  if (isMockMode()) {
    const { getMockResponse } = await import('./ai-personas')
    const persona: import('./ai-personas').Persona = messages.find(m => m.role === 'system')?.content.includes('茶馆说书人')
      ? '市井幽默'
      : messages.find(m => m.role === 'system')?.content.includes('赛博诗人')
        ? '赛博诗人'
        : '文人风骨'

    const mode: import('./ai-personas').ChatMode = messages.find(m => m.role === 'system')?.content.includes('文学密码')
      ? 'association'
      : messages.find(m => m.role === 'system')?.content.includes('文学侦探')
        ? 'detective'
        : messages.find(m => m.role === 'system')?.content.includes('白皮书')
          ? 'whitepaper'
          : 'chat'

    const text = getMockResponse(mode, persona)
    const chunks = text.match(/[\s\S]{1,6}/g) ?? [text]
    for (const c of chunks) {
      callbacks.onToken(c)
      await new Promise(r => setTimeout(r, 18))
    }
    callbacks.onDone()
    return
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.85,
        max_tokens: options?.max_tokens ?? 2000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LLM API调用失败: ${response.status} ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('无法获取响应流')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const token = json.choices?.[0]?.delta?.content
          if (token) {
            callbacks.onToken(token)
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    callbacks.onDone()
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

// ===== POI 搜索（客户端版本） =====

export interface PoiSearchResult {
  name: string
  address: string
  location?: { lat: number; lng: number }
  type?: string
  openingHours?: string
  tel?: string
  verified: boolean
}

export async function searchPoi(
  keywords: string,
  city: string
): Promise<PoiSearchResult | null> {
  if (!AMAP_KEY) {
    return mockPoi(keywords, city)
  }

  try {
    const params = new URLSearchParams({
      key: AMAP_KEY,
      keywords,
      city: city.replace(/市$/, ''),
      citylimit: 'true',
      offset: '1',
      page: '1',
      extensions: 'all',
    })

    const res = await fetch(
      `https://restapi.amap.com/v3/place/text?${params.toString()}`
    )

    if (!res.ok) return mockPoi(keywords, city)

    const data = await res.json() as {
      status?: string
      pois?: Array<{
        name?: string
        address?: string
        location?: string
        type?: string
        tel?: string
        biz_ext?: { open_time?: string; rating?: string }
      }>
    }

    if (data.status !== '1' || !data.pois?.length) {
      return mockPoi(keywords, city)
    }

    const poi = data.pois[0]
    const [lng, lat] = (poi.location ?? '').split(',').map(Number)

    return {
      name: poi.name || keywords,
      address: poi.address || `${city}${keywords}`,
      location: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined,
      type: poi.type,
      openingHours: poi.biz_ext?.open_time,
      tel: poi.tel,
      verified: true,
    }
  } catch {
    return mockPoi(keywords, city)
  }
}

function mockPoi(keywords: string, city: string): PoiSearchResult {
  const hash = keywords.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const lat = 32.0 + (hash % 100) / 1000
  const lng = 119.0 + (hash % 200) / 1000

  return {
    name: keywords,
    address: `${city}市${keywords}（演示数据，配置高德Key后可验证真实POI）`,
    location: { lat, lng },
    type: '风景名胜',
    openingHours: '08:30-17:30（演示）',
    verified: false,
  }
}

/** JSON 解析辅助 */
export function parseJson<T>(content: string): T {
  let jsonStr = content.trim()
  // 移除 markdown 代码块标记
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) jsonStr = match[1].trim()
  // 尝试提取第一个 { 到最后一个 } 之间的内容
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    // 最后兜底：移除控制字符后再试
    const cleaned = jsonStr.replace(/[\x00-\x1f]/g, '')
    return JSON.parse(cleaned) as T
  }
}
