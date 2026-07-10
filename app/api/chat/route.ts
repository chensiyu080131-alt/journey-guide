import { createOpenAI } from '@ai-sdk/openai'
import {
  streamText,
  convertToCoreMessages,
  createDataStreamResponse,
  formatDataStreamPart,
  type Message,
  type DataStreamWriter,
} from 'ai'
import {
  buildSystemPrompt,
  getMockResponse,
  type Persona,
  type ChatMode,
} from '@/lib/ai-personas'

// LLM 流式响应可能较慢
export const maxDuration = 60

async function writeMockText(
  dataStream: DataStreamWriter,
  text: string,
  reason?: string
) {
  const body = reason ? text.replace(/未配置 LLM_API_KEY/g, reason) : text
  const chunks = body.match(/[\s\S]{1,6}/g) ?? [body]

  for (const c of chunks) {
    dataStream.write(formatDataStreamPart('text', c))
    await new Promise(r => setTimeout(r, 18))
  }
}

/**
 * 统一 AI 流式代理 —— 所有前端 AI 调用都经此后端，密钥仅存在于服务端环境变量。
 *
 * body（由 @ai-sdk/react useChat 发送）：
 *   messages: Message[]            对话历史（含最新一条 user）
 *   persona?: Persona              人格：文人风骨 / 市井幽默 / 赛博诗人
 *   mode?: ChatMode               chat | association | whitepaper | detective
 *   context?: { title, city, intro, spots[] }   当前路线上下文
 */
export async function POST(req: Request) {
  let body: {
    messages?: Message[]
    persona?: Persona
    mode?: ChatMode
    context?: Record<string, unknown>
  }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const messages = body.messages ?? []
  const persona: Persona = body.persona ?? '文人风骨'
  const mode: ChatMode = body.mode ?? 'chat'
  const context = body.context ?? {}

  const system = buildSystemPrompt(persona, mode, context)

  const useMock = process.env.USE_MOCK === 'true' || !process.env.LLM_API_KEY

  // —— 无密钥 / 强制 Mock：返回符合 AI SDK 数据流协议的 mock 流 ——
  if (useMock) {
    const text = getMockResponse(mode, persona)
    return createDataStreamResponse({
      execute: async dataStream => {
        await writeMockText(dataStream, text)
      },
    })
  }

  // —— 有密钥：走 OpenAI 兼容 provider（DeepSeek / OpenAI-Next / 通义 均可）——
  const provider = createOpenAI({
    baseURL: process.env.LLM_BASE_URL || 'https://api.openai-next.com/v1',
    apiKey: process.env.LLM_API_KEY,
  })
  const model = provider(process.env.LLM_MODEL || 'gpt-4o-mini')

  return createDataStreamResponse({
    execute: async dataStream => {
      try {
        const result = streamText({
          model,
          system,
          messages: convertToCoreMessages(messages),
          temperature: 0.85,
          maxTokens: 2000,
        })

        let wroteText = false
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            wroteText = true
            dataStream.write(formatDataStreamPart('text', part.textDelta))
          }

          if (part.type === 'error') {
            throw part.error
          }
        }

        if (!wroteText) {
          await writeMockText(
            dataStream,
            getMockResponse(mode, persona),
            'LLM 未返回内容'
          )
        }
      } catch (error) {
        console.error('chat API 流式生成失败，回退 Mock:', error)
        await writeMockText(
          dataStream,
          getMockResponse(mode, persona),
          'LLM 暂不可用'
        )
      }
    },
  })
}
