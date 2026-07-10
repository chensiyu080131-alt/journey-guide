'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { streamLLM, isMockMode, type LLMMessage } from '@/lib/llm-client'
import {
  parseUserIntent,
  generateJiluGuide,
  modifyJiluGuide,
  saveJiluGuide,
  loadJiluGuide,
  clearJiluGuide,
  classifyIntent,
  JILU_GUIDE_KEY,
  JILU_GUIDE_UPDATED_EVENT,
  type ParsedIntent,
  type JiluIntent,
} from '@/lib/jilu-guide-service'
import { Guide } from '@/types'
import { cn } from '@/lib/utils'

/* ============================================================
 *  迹录员 · 可拖拽浮窗智能体 v2
 *  - Q弹果冻感吉祥物（SVG）
 *  - 多巴胺配色
 *  - 随意拖拽
 *  - 攻略生成 → 自动跳转带地图的攻略页
 *  - 攻略页内继续对话 → 实时修改攻略
 *  - 普通聊天模式（非攻略类问题）
 * ============================================================ */

// ── 对话消息 ──
interface ChatMsg {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  /** 消息类型标记 */
  type?: 'text' | 'guide-generating' | 'guide-ready' | 'guide-modifying' | 'guide-updated' | 'guide-error'
}

// ── 多巴胺配色 ──
const DOPAMINE = {
  primary: '#FF6B9D',
  secondary: '#C084FC',
  accent: '#FBBF24',
  teal: '#34D399',
  blue: '#60A5FA',
  orange: '#FB923C',
  bg: 'linear-gradient(135deg, #FFF1F2 0%, #FDF4FF 50%, #EFF6FF 100%)',
  bubbleUser: 'linear-gradient(135deg, #FF6B9D 0%, #C084FC 100%)',
  bubbleBot: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
}

// ── 果冻吉祥物 SVG ──
function JiluMascot({ size = 56, bouncing = false }: { size?: number; bouncing?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="68" rx="38" ry="40" fill="url(#jellyBody)" style={{ filter: 'drop-shadow(0 6px 12px rgba(255,107,157,0.3))' }}>
        <animate attributeName="ry" values="40;38;40" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="48" cy="50" rx="12" ry="8" fill="white" opacity="0.35" transform="rotate(-15 48 50)" />
      <ellipse cx="48" cy="62" rx="6" ry="7" fill="#2D1B4E">
        <animate attributeName="ry" values="7;1;7" dur="3s" repeatCount="indefinite" keyTimes="0;0.05;1" />
      </ellipse>
      <circle cx="46" cy="59" r="2" fill="white" opacity="0.9" />
      <ellipse cx="72" cy="62" rx="6" ry="7" fill="#2D1B4E">
        <animate attributeName="ry" values="7;1;7" dur="3s" repeatCount="indefinite" keyTimes="0;0.05;1" />
      </ellipse>
      <circle cx="70" cy="59" r="2" fill="white" opacity="0.9" />
      <ellipse cx="38" cy="72" rx="8" ry="5" fill="#FFB3C6" opacity="0.6" />
      <ellipse cx="82" cy="72" rx="8" ry="5" fill="#FFB3C6" opacity="0.6" />
      <path d="M52 76 Q60 84 68 76" stroke="#2D1B4E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M42 38 L60 24 L78 38" fill={DOPAMINE.accent} stroke="#E5A800" strokeWidth="1.5" />
      <rect x="55" y="28" width="10" height="12" rx="1" fill="white" opacity="0.7" />
      <line x1="58" y1="30" x2="62" y2="30" stroke="#E5A800" strokeWidth="0.8" />
      <line x1="58" y1="33" x2="62" y2="33" stroke="#E5A800" strokeWidth="0.8" />
      <line x1="58" y1="36" x2="61" y2="36" stroke="#E5A800" strokeWidth="0.8" />
      <ellipse cx="48" cy="104" rx="10" ry="6" fill="url(#jellyBody)" />
      <ellipse cx="72" cy="104" rx="10" ry="6" fill="url(#jellyBody)" />
      <defs>
        <linearGradient id="jellyBody" x1="22" y1="28" x2="98" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── 快捷标签 ──
const QUICK_TAGS = [
  { icon: '📖', label: '书名', placeholder: '如：人间滋味、边城…' },
  { icon: '🏙️', label: '城市', placeholder: '如：常熟、凤凰…' },
  { icon: '❤️', label: '喜好', placeholder: '如：美食、古建筑…' },
]

// ── 迹录员模式 ──
type JiluMode = 'idle' | 'generating' | 'modifying' | 'chatting'

// ── 主组件 ──
export function JiluFloat() {
  const pathname = usePathname()
  const router = useRouter()

  // 拖拽状态
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const hasMoved = useRef(false)
  const floatRef = useRef<HTMLDivElement>(null)

  // 对话状态
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [streaming, setStreaming] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // 攻略相关状态
  const [mode, setMode] = useState<JiluMode>('idle')
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null)
  const [generatingProgress, setGeneratingProgress] = useState(0)

  // 是否在攻略页面
  const isOnGuidePage = pathname === '/guide/jilu/'

  // 初始化位置（右下角）
  useEffect(() => {
    setPos({ x: window.innerWidth - 90, y: window.innerHeight - 130 })
  }, [])

  // 如果在攻略页面，尝试加载攻略上下文
  useEffect(() => {
    if (isOnGuidePage && !currentGuide) {
      const guide = loadJiluGuide()
      if (guide) {
        setCurrentGuide(guide)
      }
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  // ── 拖拽逻辑 ──
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setDragging(true)
    hasMoved.current = false
    dragStart.current = { x: clientX, y: clientY, posX: pos.x, posY: pos.y }
  }, [pos])

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true
    const newX = Math.max(0, Math.min(window.innerWidth - 70, dragStart.current.posX + dx))
    const newY = Math.max(0, Math.min(window.innerHeight - 70, dragStart.current.posY + dy))
    setPos({ x: newX, y: newY })
  }, [dragging])

  const onDragEnd = useCallback(() => {
    setDragging(false)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onDragStart(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => onDragMove(e.clientX, e.clientY)
    const up = () => onDragEnd()
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [dragging, onDragMove, onDragEnd])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    onDragStart(t.clientX, t.clientY)
  }

  useEffect(() => {
    if (!dragging) return
    const move = (e: TouchEvent) => {
      const t = e.touches[0]
      onDragMove(t.clientX, t.clientY)
    }
    const up = () => onDragEnd()
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [dragging, onDragMove, onDragEnd])

  // ── 点击打开 ──
  const handleClick = () => {
    if (hasMoved.current) return
    setOpen(true)
  }

  // ── 添加消息 ──
  const addMessage = useCallback((role: ChatMsg['role'], content: string, type?: ChatMsg['type']) => {
    const msg: ChatMsg = { id: Date.now().toString() + Math.random(), role, content, type }
    setMessages(prev => [...prev, msg])
    return msg
  }, [])

  // ── 发送消息（核心逻辑） ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || busy) return

    const userText = text.trim()
    addMessage('user', userText)
    setInput('')
    setBusy(true)

    // 判断意图
    const intent: JiluIntent = classifyIntent(userText, !!currentGuide)

    if (intent === 'generate') {
      // ── 生成攻略模式 ──
      await handleGuideGeneration(userText)
    } else if (intent === 'modify') {
      // ── 修改攻略模式 ──
      await handleGuideModification(userText)
    } else {
      // ── 普通聊天模式 ──
      await handleChat(userText)
    }

    setBusy(false)
  }, [busy, currentGuide, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 攻略生成 ──
  const handleGuideGeneration = async (userText: string) => {
    setMode('generating')
    setGeneratingProgress(0)

    const progressMsg = addMessage('assistant', '🎯 好的！正在分析你的需求，生成专属攻略...', 'guide-generating')

    // 进度模拟
    const progressInterval = setInterval(() => {
      setGeneratingProgress(prev => Math.min(prev + 1, 4))
    }, 1200)

    try {
      // 1. 解析用户意图
      const parsedIntent = await parseUserIntent(userText)

      // 2. 生成攻略
      const guide = await generateJiluGuide(parsedIntent)

      clearInterval(progressInterval)
      setGeneratingProgress(5)

      // 3. 保存攻略
      saveJiluGuide(guide)
      setCurrentGuide(guide)
      setMode('idle')

      // 4. 更新消息
      setMessages(prev =>
        prev.map(m =>
          m.id === progressMsg.id
            ? {
                ...m,
                content: `✅ 攻略已生成！「${guide.title}」\n📍 ${guide.city} · ${guide.days}天 · ${guide.dayPlans.flatMap(d => d.spots).length}个地点\n\n正在跳转到攻略页面...`,
                type: 'guide-ready' as const,
              }
            : m
        )
      )

      // 5. 自动跳转（如果不在攻略页面）
      if (!isOnGuidePage) {
        await new Promise(r => setTimeout(r, 800))
        router.push('/guide/jilu/')
      } else {
        // 已在攻略页面，触发更新
        window.dispatchEvent(new CustomEvent(JILU_GUIDE_UPDATED_EVENT, { detail: guide }))
      }
    } catch (error) {
      clearInterval(progressInterval)
      setMode('idle')

      const errorMsg = error instanceof Error ? error.message : '攻略生成失败'
      setMessages(prev =>
        prev.map(m =>
          m.id === progressMsg.id
            ? { ...m, content: `❌ ${errorMsg}\n\n请稍后重试，或换个描述方式试试`, type: 'guide-error' as const }
            : m
        )
      )
    }
  }

  // ── 攻略修改 ──
  const handleGuideModification = async (userText: string) => {
    if (!currentGuide) {
      // 没有攻略，走生成流程
      await handleGuideGeneration(userText)
      return
    }

    setMode('modifying')
    const modifyMsg = addMessage('assistant', '🔧 正在根据你的需求调整攻略...', 'guide-modifying')

    try {
      const modifiedGuide = await modifyJiluGuide(currentGuide, userText)

      // 更新攻略
      saveJiluGuide(modifiedGuide)
      setCurrentGuide(modifiedGuide)
      setMode('idle')

      // 更新消息
      const changeSummary = summarizeChanges(currentGuide, modifiedGuide)
      setMessages(prev =>
        prev.map(m =>
          m.id === modifyMsg.id
            ? {
                ...m,
                content: `✅ 攻略已更新！\n${changeSummary}\n\n页面已自动刷新，继续和我说调整需求吧~`,
                type: 'guide-updated' as const,
              }
            : m
        )
      )

      // 触发页面更新
      window.dispatchEvent(new CustomEvent(JILU_GUIDE_UPDATED_EVENT, { detail: modifiedGuide }))
    } catch (error) {
      setMode('idle')
      const errorMsg = error instanceof Error ? error.message : '攻略调整失败'
      setMessages(prev =>
        prev.map(m =>
          m.id === modifyMsg.id
            ? { ...m, content: `❌ ${errorMsg}\n\n攻略内容未受影响，你可以换个说法再试试`, type: 'guide-error' as const }
            : m
        )
      )
    }
  }

  // ── 普通聊天 ──
  const handleChat = async (userText: string) => {
    setMode('chatting')
    setStreaming('')

    const history: LLMMessage[] = messages.slice(-6).map(m => ({
      role: m.role === 'system' ? 'assistant' : m.role,
      content: m.content,
    }))
    history.push({ role: 'user', content: userText })

    const systemMsg: LLMMessage = {
      role: 'system',
      content: buildChatSystemPrompt(userText, currentGuide),
    }

    const allMsgs: LLMMessage[] = [systemMsg, ...history]
    let fullText = ''

    try {
      await streamLLM(
        allMsgs,
        {
          onToken: (token) => {
            fullText += token
            setStreaming(fullText)
          },
          onDone: () => {
            addMessage('assistant', fullText)
            setStreaming('')
            setMode('idle')
          },
          onError: () => {
            const fallback = generateFallback(userText)
            addMessage('assistant', fallback)
            setStreaming('')
            setMode('idle')
          },
        },
        { max_tokens: 2000, temperature: 0.85 }
      )
    } catch {
      const fallback = generateFallback(userText)
      addMessage('assistant', fallback)
      setStreaming('')
      setMode('idle')
    }
  }

  // ── 聊天系统提示 ──
  function buildChatSystemPrompt(userInput: string, guide: Guide | null): string {
    let prompt = `你是"迹录员"——寻迹APP的智能旅行向导，一个Q弹可爱、博学多才的旅伴。

回复风格：
- 活泼可爱但不浮夸，像一个见多识广的朋友
- 每个景点都要关联文学原文或历史典故
- 推荐本地人真正去的地方，不推网红店
- 回答简洁（一般 120-220 字）`

    if (guide) {
      prompt += `

【当前攻略上下文】
标题：${guide.title}
城市：${guide.city}
天数：${guide.days}
景点：${guide.dayPlans.flatMap(d => d.spots).map(s => s.name).join('、')}

用户正在查看这份攻略，你可以针对攻略中的地点、行程提供更详细的解答。
如果用户的请求涉及修改行程（如加景点、换路线），请提醒用户直接说出修改需求。`
    }

    return prompt
  }

  // ── 变更摘要 ──
  function summarizeChanges(oldGuide: Guide, newGuide: Guide): string {
    const diffs: string[] = []
    if (oldGuide.days !== newGuide.days) diffs.push(`天数 ${oldGuide.days}→${newGuide.days}天`)
    const oldSpotCount = oldGuide.dayPlans.flatMap(d => d.spots).length
    const newSpotCount = newGuide.dayPlans.flatMap(d => d.spots).length
    if (oldSpotCount !== newSpotCount) diffs.push(`地点 ${oldSpotCount}→${newSpotCount}个`)
    if (oldGuide.title !== newGuide.title) diffs.push(`标题已更新`)
    if (diffs.length === 0) diffs.push('行程细节已优化')
    return diffs.join(' · ')
  }

  // ── Mock/兜底回复 ──
  function generateFallback(input: string): string {
    const hasBook = /人间滋味|边城|孽海花|翁同龢|沙家浜|柳如是/.test(input)
    const hasCity = /常熟|凤凰|扬州|上海|北京|西安|成都|张家界|山西|镇江|苏州|杭州/.test(input)

    if (hasBook || /书|阅读|读/.test(input)) {
      return `📖 好呀！让我从书中找找旅行的灵感～

🎯 **推荐路线**：常熟 · 人间滋味之旅
📚 **关联书籍**：《人间滋味》汪曾祺

我可以为你生成一份完整的旅行攻略页面（带地图和详细行程）！直接告诉我你想去的城市或想跟的书就行～

_（配置API Key后可获取更详细的实时攻略）_`
    }

    if (hasCity) {
      return `🏙️ 好眼光！这个城市有好多故事等着你～

告诉我你的偏好（几天、什么兴趣方向），我帮你生成带地图的完整攻略！

_（配置API Key后可获取更详细的实时攻略）_`
    }

    return `✨ 嗨！我是迹录员，你的旅行灵感伙伴～

你可以这样告诉我：
📖 **书名** — 如"人间滋味"，我生成跟着书本旅行的攻略
🏙️ **城市** — 如"苏州两天"，我规划带地图的完整行程
❤️ **喜好** — 如"喜欢古建筑和美食"，我推荐匹配路线

_（配置API Key后可获取更详细的实时攻略）_`
  }

  // ── 快捷标签点击 ──
  const handleQuickTag = (tag: typeof QUICK_TAGS[number]) => {
    setInput(tag.placeholder.replace('如：', '').replace('…', ''))
  }

  // ── 进度文字 ──
  const progressTexts = [
    '📖 翻开这本书...',
    '🗺️ AI 识别原文落点...',
    '🍜 对照现实地理位置...',
    '✨ 攻略即将呈现！',
    '🎉 生成完成！',
  ]

  // ── 欢迎页文案（根据上下文） ──
  const welcomeContent = isOnGuidePage && currentGuide
    ? {
        title: `正在查看「${currentGuide.title}」`,
        subtitle: `💬 随时告诉我调整需求\n如"加一天""多推荐点美食"`,
      }
    : {
        title: '嗨！我是迹录员 🎒',
        subtitle: '输入书名、城市或喜好\n我帮你生成带地图的专属攻略',
      }

  // ── 渲染 ──
  return (
    <>
      {/* === 浮窗球 === */}
      {!open && (
        <div
          ref={floatRef}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            zIndex: 9999,
            cursor: dragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onClick={handleClick}
          className="jilu-float-orb"
        >
          <div className="jilu-mascot-wrap">
            <JiluMascot size={56} bouncing />
          </div>
          <div className="jilu-name-tag">迹录员</div>
          <div className="jilu-aura" />
          {/* 攻略生成中脉冲 */}
          {(mode === 'generating' || mode === 'modifying') && (
            <div className="jilu-working-pulse" />
          )}
        </div>
      )}

      {/* === 对话面板 === */}
      {open && (
        <div className="jilu-chat-panel" role="dialog" aria-label="迹录员智能对话">
          {/* 头部 */}
          <div className="jilu-chat-header">
            <div className="flex items-center gap-2.5">
              <JiluMascot size={36} />
              <div>
                <p className="text-xs font-bold" style={{ color: DOPAMINE.primary }}>迹录员</p>
                <p className="text-[10px] text-gray-400">
                  {mode === 'generating' ? '⏳ 攻略生成中...' :
                   mode === 'modifying' ? '🔧 调整攻略中...' :
                   isOnGuidePage && currentGuide ? '✏️ 可调整当前攻略' :
                   '你的旅行灵感伙伴 ✨'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {/* 消息区域 */}
          <div ref={scrollRef} className="jilu-chat-messages">
            {messages.length === 0 && (
              <div className="jilu-welcome">
                <JiluMascot size={64} />
                <p className="text-sm font-medium mt-3" style={{ color: DOPAMINE.primary }}>
                  {welcomeContent.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed px-4 whitespace-pre-line">
                  {welcomeContent.subtitle}
                </p>
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className="jilu-quick-tag"
                    >
                      {tag.icon} {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'jilu-msg',
                  msg.role === 'user' ? 'jilu-msg-user' : 'jilu-msg-bot'
                )}
              >
                {msg.role !== 'user' && (
                  <div className="jilu-msg-avatar">
                    <JiluMascot size={24} />
                  </div>
                )}
                <div
                  className={cn(
                    'jilu-msg-bubble',
                    msg.role === 'user' ? 'jilu-bubble-user' : 'jilu-bubble-bot',
                    msg.type === 'guide-ready' && 'jilu-bubble-success',
                    msg.type === 'guide-updated' && 'jilu-bubble-success',
                    msg.type === 'guide-error' && 'jilu-bubble-error',
                  )}
                >
                  {/* 攻略生成进度 */}
                  {(msg.type === 'guide-generating' || msg.type === 'guide-modifying') && (
                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                      <div className="flex gap-1.5 items-center">
                        {progressTexts.slice(0, generatingProgress + 1).map((text, i) => (
                          <span key={i} className="text-[10px] text-gray-400">{text.slice(0, 2)}</span>
                        ))}
                        <span className="jilu-dot" />
                        <span className="jilu-dot" style={{ animationDelay: '0.15s' }} />
                        <span className="jilu-dot" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                  )}

                  {/* 攻略就绪/更新/错误消息 */}
                  {(msg.type === 'guide-ready' || msg.type === 'guide-updated' || msg.type === 'guide-error' || msg.type === 'text' || !msg.type) && (
                    <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* 流式输出 */}
            {streaming && (
              <div className="jilu-msg jilu-msg-bot">
                <div className="jilu-msg-avatar">
                  <JiluMascot size={24} />
                </div>
                <div className="jilu-msg-bubble jilu-bubble-bot">
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">{streaming}</div>
                  <span className="jilu-typing-cursor" />
                </div>
              </div>
            )}

            {busy && !streaming && mode !== 'generating' && mode !== 'modifying' && (
              <div className="jilu-msg jilu-msg-bot">
                <div className="jilu-msg-avatar">
                  <JiluMascot size={24} />
                </div>
                <div className="jilu-msg-bubble jilu-bubble-bot">
                  <div className="flex gap-1 items-center py-1">
                    <span className="jilu-dot" />
                    <span className="jilu-dot" style={{ animationDelay: '0.15s' }} />
                    <span className="jilu-dot" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="jilu-chat-input-area">
            <div className="flex gap-1.5 mb-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleQuickTag(tag)}
                  className="jilu-quick-tag-mini"
                >
                  {tag.icon}
                </button>
              ))}
            </div>
            <div className="jilu-input-row">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder={
                  mode === 'generating' ? '攻略生成中，请稍候...' :
                  mode === 'modifying' ? '攻略调整中...' :
                  isOnGuidePage && currentGuide ? '调整攻略：如"加一天""多推荐点美食"...' :
                  '输入书名、城市或喜好…'
                }
                className="jilu-input"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={busy || !input.trim()}
                className="jilu-send-btn"
                aria-label="发送"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
