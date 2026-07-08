import { Guide, InterestTag, BudgetLevel } from '@/types'
import { getMockGuideById, getMockGuide } from './mock-data'
import { chatCompletion } from './ai-service'

/** 通过路线ID获取攻略（预设路线走 Mock） */
export async function getGuideById(id: string): Promise<Guide | null> {
  await simulateDelay(600 + Math.random() * 600)
  return getMockGuideById(id)
}

/** 生成自定义目的地攻略 - 客户端直连 OpenAI Next Credits API */
export async function generateGuide(
  city: string,
  days: number,
  interests: InterestTag[],
  budget: BudgetLevel
): Promise<Guide> {
  try {
    const systemPrompt = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

你的核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献
2. 不推荐网红店，推荐本地人真正去的地方
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 用温暖但不夸张的语言
6. 原文引用必须真实，不可编造

你必须返回JSON格式的攻略数据。`

    const userPrompt = `请为"${city}"生成一份"跟着书本去旅行"的攻略，天数${days}天，兴趣方向：${interests.join('、')}，预算水平：${budget}。

请返回以下JSON格式（不要包含markdown代码块标记）：
{
  "title": "攻略标题",
  "subtitle": "副标题",
  "entryType": "目的地",
  "relatedBook": "关联书籍（如有）",
  "relatedAuthor": "关联作者（如有）",
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
          "realityNote": "实景对照说明"
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
- 以${city}最具文学气质的路线为线索
- 每个景点必须有originalText和realityNote字段
- 美食推荐至少占30%
- 方言至少5个
- 在地体验至少3个
- 贴士至少4个
- 安排${days}天行程，每天4-8个景点`

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.8, max_tokens: 4000 }
    )

    // 清理可能的markdown代码块标记
    let cleanResult = result.trim()
    if (cleanResult.startsWith('```')) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanResult)
    return parsed as Guide
  } catch (error) {
    console.error('AI生成攻略失败，使用fallback:', error)
    // 回退到mock数据
    const fallback = getMockGuideById('hangzhou-su')
    if (fallback) return fallback
    throw new Error('攻略生成失败，请稍后重试')
  }
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 从书籍片段中识别地点并生成路线
 * 客户端直连 LLM API，分析文字中提到的地点
 */
export async function recognizeAndGenerateGuide(text: string): Promise<Guide> {
  try {
    const systemPrompt = `你是"寻城"的AI旅行顾问——一个"跟着书本去旅行"的平台。

你的核心原则：
1. 每个景点必须关联文学作品中的原文片段或历史文献
2. 不推荐网红店，推荐本地人真正去的地方
3. 每个景点都有"原文片段"+"实景对照"的双重视角
4. 行程安排要考虑地理位置和时间合理性
5. 用温暖但不夸张的语言
6. 原文引用必须真实，不可编造

你必须返回JSON格式的攻略数据。`

    const userPrompt = `以下是用户粘贴的一段书中的文字：

---
${text}
---

请分析这段文字，提取其中提到的地点（城市、景区、街道、建筑等），然后生成一份"跟着书本去旅行"的攻略。

要求：
1. 找出文字中提到的所有可游览地点
2. 如果文字提到的是某个城市/区域，以该城市为核心生成路线
3. 如果文字只提到某个景点，围绕该景点所在城市生成路线
4. 每个景点必须有originalText（优先引用用户提供的原文片段）和realityNote
5. 美食推荐至少占30%

请返回以下JSON格式（不要包含markdown代码块标记）：
{
  "city": "识别出的城市名",
  "province": "省份",
  "title": "攻略标题（关联原文内容）",
  "subtitle": "副标题",
  "entryType": "书籍",
  "relatedBook": "如果文字明显来自某本书，填写书名",
  "relatedAuthor": "作者",
  "routeIntro": "路线引言（关联原文内容，100-200字）",
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
          "story": "故事（50-100字）",
          "type": "景点/美食/体验",
          "budgetHint": "花费提示",
          "emoji": "一个emoji",
          "originalText": "用户原文中相关片段或历史文献",
          "originalSource": "出处",
          "realityNote": "实景对照说明"
        }
      ],
      "budgetEstimate": "当日预算估算"
    }
  ],
  "dialect": [{"dialect": "方言词", "meaning": "意思", "scenario": "使用场景"}],
  "localExperiences": [{"name": "体验名", "desc": "描述", "type": "赶集/时令/民俗/手艺", "schedule": "时间"}],
  "tips": ["实用贴士1", "实用贴士2"]
}`

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7, max_tokens: 4000 }
    )

    let cleanResult = result.trim()
    if (cleanResult.startsWith('```')) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanResult)
    return parsed as Guide
  } catch (error) {
    console.error('文字识别API调用失败，回退到Mock数据:', error)
    return getMockGuide('常熟', 2, ['文化', '美食'], '舒适')
  }
}
