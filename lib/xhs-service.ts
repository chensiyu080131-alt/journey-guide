import { chatCompletion } from './ai-service'

export interface XhsNote {
  title: string
  content: string
  tags: string[]
}

/** 健壮提取 JSON（推理模型可能在 JSON 前后带文字/代码块） */
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

// 技能来源：网络公开爆款方法论 + wanglin1111111/xiaohongshu-copywriting skill
const XHS_SYSTEM = `你是资深小红书博主兼文案教练，深谙爆款笔记套路。严格遵循以下「小红书高质量文案技能」：

【核心理念】真实 > 营销感。小红书社区对AI味和营销号语气极度敏感，文案必须像真人写的。

【语气规则】
- 像跟朋友聊天一样自然，有观点有态度
- 克制使用 emoji（全文≤5个），不要每段堆 emoji
- 短句+长句交替，不用 AI 式排比
- 承认不确定性
- 禁用：「姐妹们兄弟们」「真的狂喜」「太震撼了」「唯一」「最强」「颠覆」等夸张营销词
- 标题不堆叠感叹号

【篇幅】正文 300-600 字，说完核心观点就停，不贪多。

【结构】
1. 钩子：1-2 句说清为什么值得看（不堆感叹号）
2. 正文：分 3-4 个模块，每模块聚焦一个点，用事实/数据支撑，每段≤3 行，关键词可用【】或「」标注
3. 实用建议：给读者可操作的信息
4. 互动引导：自然邀请讨论，不用「点赞收藏关注三连」

【标题】≤20 字，善用「数字+人群+痛点/效果」钩子（如「3天2晚」「打工人」「亲测」），拒绝标题党与夸张。

【标签】给 5 个精准长尾标签，彼此独立、不粘连（如 #A #B 而非 #A#B）、不重复、不要太泛（如 #AI）。

【事实】所有数据/奖项须真实可核，不确定就写「建议以官方为准」，不编造。

直接返回纯 JSON，不要代码块、不要解释、不要前后缀。`

/** 生成小红书文案 —— 失败兜底，永不抛错 */
export async function generateXhsNote(
  topic: string,
  style: string,
  field: string
): Promise<XhsNote> {
  const userPrompt = `请为以下主题写一篇小红书笔记。
主题：${topic}
风格：${style || '种草'}
${field ? `领域/场景：${field}` : ''}

返回 JSON：
{
  "title": "标题（≤20字，数字+人群+痛点钩子）",
  "content": "正文（300-600字，按【钩子】【正文分3-4模块】【实用建议】【互动引导】结构，全文 emoji≤5）",
  "tags": ["#标签1", "#标签2", "#标签3", "#标签4", "#标签5"]
}`

  try {
    const raw = await chatCompletion(
      [
        { role: 'system', content: XHS_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.85, max_tokens: 3000 }
    )
    const parsed = JSON.parse(extractJSON(raw)) as Partial<XhsNote>
    if (!parsed.title || !parsed.content) throw new Error('字段缺失')
    return {
      title: String(parsed.title),
      content: String(parsed.content),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map(String) : [],
    }
  } catch (error) {
    console.error('小红书文案生成失败：', error)
    return {
      title: `${topic}｜${style || '种草'}笔记`,
      content: `关于「${topic}」，先聊我最在意的几点。\n\n【核心亮点】\n（本次生成异常，这是兜底文案，请点重试）\n\n【实用建议】\n建议实地体验后再做判断。\n\n欢迎在评论区交流你的真实体验～`,
      tags: [`#${topic}`, '#真实分享', '#亲测体验'],
    }
  }
}
