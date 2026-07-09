/**
 * 寻城 AI 服务 - 旅游攻略生成
 *
 * 项目为纯静态导出(output: 'export'),无服务端,LLM 由浏览器端直连,
 * 故 API Key 通过 NEXT_PUBLIC_ 前缀环境变量注入(会进入前端 bundle)。
 * 切换 provider 只需改环境变量,无需改代码。
 *
 * ===== 免费大模型接入(任选其一,注册后在控制台拿 Key 写入 .env.local) =====
 *   ① 硅基流动 SiliconFlow —— 免费、OpenAI 兼容、国内直连
 *        NEXT_PUBLIC_LLM_BASE_URL = https://api.siliconflow.cn/v1
 *        NEXT_PUBLIC_LLM_MODEL    = Qwen/Qwen2.5-7B-Instruct   (免费模型)
 *   ② 智谱 BigModel —— glm-4-flash 完全免费、质量好
 *        NEXT_PUBLIC_LLM_BASE_URL = https://open.bigmodel.cn/api/paas/v4
 *        NEXT_PUBLIC_LLM_MODEL    = glm-4-flash
 *   ③ 阿里云百炼 DashScope —— qwen-turbo,有免费额度
 *        NEXT_PUBLIC_LLM_BASE_URL = https://dashscope.aliyuncs.com/compatible-mode/v1
 *        NEXT_PUBLIC_LLM_MODEL    = qwen-turbo
 *
 * 默认回退:常熟黑客松 OpenAI-Next(2026-07-10 23:59 前可用),不配 Key 也能跑。
 */

// 有 Key → 用环境变量配置的 provider(如智谱 GLM-4-Flash);无 Key → 整体回退黑客松 OpenAI-Next
const HAS_KEY = !!process.env.NEXT_PUBLIC_LLM_API_KEY
const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || 'sk-VcHfkYaxHXAA2VUW75B771D90032430cA9457c74E2BaF88e'
const BASE_URL = (HAS_KEY ? process.env.NEXT_PUBLIC_LLM_BASE_URL : undefined) || 'https://api.openai-next.com/v1'
const MODEL = (HAS_KEY ? process.env.NEXT_PUBLIC_LLM_MODEL : undefined) || 'gpt-4o-mini'

/** 通用聊天补全 */
export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`API调用失败(${response.status}): ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/** 流式聊天补全 */
export async function chatCompletionStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  options?: { temperature?: number; max_tokens?: number }
): Promise<void> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      stream: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`API调用失败(${response.status}): ${err}`)
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
        const content = json.choices?.[0]?.delta?.content
        if (content) onChunk(content)
      } catch {
        // 忽略解析错误
      }
    }
  }
}

/** 路线AI对话 - 针对当前攻略路线回答问题 */
export async function chatAboutRoute(
  routeInfo: { title: string; city: string; intro: string },
  userQuestion: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const systemPrompt = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

当前路线信息：
- 路线名称：${routeInfo.title}
- 城市：${routeInfo.city}
- 路线简介：${routeInfo.intro}

你的原则：
1. 回答要结合路线和文学背景，让用户感受到"文学照进现实"
2. 推荐本地人真正去的地方，不推荐网红店
3. 用温暖但不夸张的语言，像一个熟悉当地的朋友
4. 如果问到文学原文/历史细节，尽量准确回答
5. 回答简洁，100-200字为宜
6. 如果问题与路线无关，友善引导回旅行话题`

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userQuestion },
  ]

  return chatCompletion(messages, { max_tokens: 500 })
}

/** AI生成新路线攻略 */
export async function generateRouteGuide(
  city: string,
  entryType: '书籍' | '人物' | '目的地',
  entryValue: string
): Promise<string> {
  const systemPrompt = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

你的核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献
2. 不推荐网红店，推荐本地人真正去的地方
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 用温暖但不夸张的语言
6. 原文引用必须真实，不可编造。如果不确定具体原文，可以引用相关历史记载或文学描述，但需标明出处性质

你必须返回JSON格式的攻略数据。`

  const userPrompt = `请为"${city}"生成一份"跟着书本去旅行"的攻略，入口方式是"${entryType}"：${entryValue}。

请返回以下JSON格式（不要包含markdown代码块标记）：
{
  "title": "攻略标题",
  "subtitle": "副标题",
  "entryType": "${entryType}",
  "relatedBook": "关联书籍（如有）",
  "relatedAuthor": "关联作者（如有）",
  "relatedCharacter": "关联人物（如有）",
  "routeIntro": "路线引言（100-200字，说明这条路线与文学/历史的关联）",
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
- ${entryType === '书籍' ? `以"${entryValue}"这本书为线索，找到书中写到${city}的地方` : entryType === '人物' ? `以"${entryValue}"这个人物在${city}的足迹为线索` : `为${city}找到最具文学气质的路线`}
- 每个景点必须有originalText和realityNote字段
- originalText优先使用真实的文学/历史原文，若无法确定可引用相关文献记载并标注出处
- 美食推荐至少占30%
- 方言至少5个
- 在地体验至少3个
- 贴士至少4个
- 安排1-2天行程，景点数量4-8个`

  return chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.8, max_tokens: 4000 }
  )
}
