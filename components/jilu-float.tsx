'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { streamLLM, isMockMode, type LLMMessage } from '@/lib/llm-client'
import { cn } from '@/lib/utils'

/* ============================================================
 *  迹录员 · 可拖拽浮窗智能体
 *  - Q弹果冻感吉祥物（SVG）
 *  - 多巴胺配色
 *  - 随意拖拽
 *  - 点击打开智能对话
 *  - 输入书名/喜好/城市 → LLM生成旅行攻略
 * ============================================================ */

// ── 对话消息 ──
interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// ── 多巴胺配色 ──
const DOPAMINE = {
  primary: '#FF6B9D',    // 粉红
  secondary: '#C084FC',  // 紫罗兰
  accent: '#FBBF24',     // 阳光黄
  teal: '#34D399',       // 薄荷绿
  blue: '#60A5FA',       // 天蓝
  orange: '#FB923C',     // 橙子
  bg: 'linear-gradient(135deg, #FFF1F2 0%, #FDF4FF 50%, #EFF6FF 100%)',
  bubbleUser: 'linear-gradient(135deg, #FF6B9D 0%, #C084FC 100%)',
  bubbleBot: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
}

// ── 果冻吉祥物 SVG ──
function JiluMascot({ size = 56, bouncing = false }: { size?: number; bouncing?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 果冻身体 */}
      <ellipse cx="60" cy="68" rx="38" ry="40" fill="url(#jellyBody)" style={{ filter: 'drop-shadow(0 6px 12px rgba(255,107,157,0.3))' }}>
        <animate attributeName="ry" values="40;38;40" dur="2s" repeatCount="indefinite" />
      </ellipse>
      {/* 高光 */}
      <ellipse cx="48" cy="50" rx="12" ry="8" fill="white" opacity="0.35" transform="rotate(-15 48 50)" />
      {/* 左眼 */}
      <ellipse cx="48" cy="62" rx="6" ry="7" fill="#2D1B4E">
        <animate attributeName="ry" values="7;1;7" dur="3s" repeatCount="indefinite" keyTimes="0;0.05;1" />
      </ellipse>
      <circle cx="46" cy="59" r="2" fill="white" opacity="0.9" />
      {/* 右眼 */}
      <ellipse cx="72" cy="62" rx="6" ry="7" fill="#2D1B4E">
        <animate attributeName="ry" values="7;1;7" dur="3s" repeatCount="indefinite" keyTimes="0;0.05;1" />
      </ellipse>
      <circle cx="70" cy="59" r="2" fill="white" opacity="0.9" />
      {/* 腮红 */}
      <ellipse cx="38" cy="72" rx="8" ry="5" fill="#FFB3C6" opacity="0.6" />
      <ellipse cx="82" cy="72" rx="8" ry="5" fill="#FFB3C6" opacity="0.6" />
      {/* 嘴巴 - 微笑 */}
      <path d="M52 76 Q60 84 68 76" stroke="#2D1B4E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 小帽子（书本造型） */}
      <path d="M42 38 L60 24 L78 38" fill={DOPAMINE.accent} stroke="#E5A800" strokeWidth="1.5" />
      <rect x="55" y="28" width="10" height="12" rx="1" fill="white" opacity="0.7" />
      <line x1="58" y1="30" x2="62" y2="30" stroke="#E5A800" strokeWidth="0.8" />
      <line x1="58" y1="33" x2="62" y2="33" stroke="#E5A800" strokeWidth="0.8" />
      <line x1="58" y1="36" x2="61" y2="36" stroke="#E5A800" strokeWidth="0.8" />
      {/* 小脚 */}
      <ellipse cx="48" cy="104" rx="10" ry="6" fill="url(#jellyBody)" />
      <ellipse cx="72" cy="104" rx="10" ry="6" fill="url(#jellyBody)" />
      {/* 渐变定义 */}
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

// ── 构建系统提示 ──
function buildJiluSystemPrompt(userInput: string): string {
  return `你是"迹录员"——寻迹APP的智能旅行向导，一个Q弹可爱、博学多才的旅伴。

你的核心能力：
1. 根据用户输入的**书名**，识别书中涉及的城市与地点，生成"跟着书本去旅行"的攻略
2. 根据用户输入的**城市**，推荐与该城市相关的文学作品，并生成旅行攻略
3. 根据用户的**喜好/兴趣**，推荐匹配的书籍+城市组合，并生成攻略

回复风格：
- 活泼可爱但不浮夸，像一个见多识广的朋友
- 每个景点都要关联文学原文或历史典故
- 推荐本地人真正去的地方，不推网红店
- 用"原文片段+实景对照"的双重视角

攻略格式要求（回复中必须包含）：
🎯 **目的地**：xxx
📚 **关联书籍**：xxx  
✍️ **作者**：xxx
📝 **路线引言**：100-200字，有画面感

**每日行程**：
Day 1: [主题]
- 📍 景点名 — 原文引用「xxx」+ 实景对照
- 📍 ...

💡 **旅行贴士**：当地特色、最佳时节、交通等

用户输入：${userInput}`
}

// ── 主组件 ──
export function JiluFloat() {
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

  // 初始化位置（右下角）
  useEffect(() => {
    setPos({ x: window.innerWidth - 90, y: window.innerHeight - 130 })
  }, [])

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

  // 鼠标事件
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

  // 触摸事件
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

  // ── 发送消息 ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || busy) return

    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setBusy(true)
    setStreaming('')

    const history: LLMMessage[] = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }))
    history.push({ role: 'user', content: text.trim() })

    const systemMsg: LLMMessage = {
      role: 'system',
      content: buildJiluSystemPrompt(text.trim()),
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
            const botMsg: ChatMsg = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: fullText,
            }
            setMessages(prev => [...prev, botMsg])
            setStreaming('')
            setBusy(false)
          },
          onError: (err) => {
            // Mock模式或错误时，展示友好提示
            const fallback = generateFallback(text.trim())
            const botMsg: ChatMsg = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: fallback,
            }
            setMessages(prev => [...prev, botMsg])
            setStreaming('')
            setBusy(false)
          },
        },
        { max_tokens: 3000, temperature: 0.85 }
      )
    } catch {
      const fallback = generateFallback(text.trim())
      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
      }
      setMessages(prev => [...prev, botMsg])
      setStreaming('')
      setBusy(false)
    }
  }, [messages, busy])

  // ── Mock/兜底回复 ──
  function generateFallback(input: string): string {
    const hasBook = /人间滋味|边城|孽海花|翁同龢|沙家浜|柳如是/.test(input)
    const hasCity = /常熟|凤凰|扬州|上海|北京|西安|成都|张家界|山西|镇江/.test(input)

    if (hasBook || /书|阅读|读/.test(input)) {
      return `📖 好呀！让我从书中找找旅行的灵感～

🎯 **推荐路线**：常熟 · 人间滋味之旅
📚 **关联书籍**：《人间滋味》汪曾祺
✍️ **作者**：汪曾祺
📝 **路线引言**：汪曾祺笔下的高邮和常熟，处处烟火气。从鸭蛋黄的清晨到茴香豆的午后，跟着味蕾走过一条文学与美食交织的小路。

**Day 1: 烟火味道**
- 📍 方塔街 — 「人间滋味写到"炒米是要用开水泡的"」实景：老街上的茶食铺
- 📍 虞山绿茶 — 汪老最爱的碧螺春，在山间茶馆坐一坐
- 📍 兴福寺面馆 — 一碗蕈油面，山野鲜味入喉

💡 **贴士**：常熟节奏慢，建议住一晚老城区的民宿，清晨去方塔街看本地人买菜

_（配置API Key后可获取更详细的实时攻略）_`
    }

    if (hasCity) {
      return `🏙️ 好眼光！这个城市有好多故事等着你～

让我想想与这座城市相关的文学作品和旅行路线…

🎯 **推荐路线**：文学漫步之旅
📚 **关联书籍**：根据城市特色推荐
📝 **路线引言**：每座城市都有自己的文学记忆，跟着文字走过街巷，你会发现不一样的风景。

💡 想要更详细的攻略？告诉我你感兴趣的书籍或偏好，我可以帮你精准匹配！

_（配置API Key后可获取更详细的实时攻略）_`
    }

    return `✨ 好呀！我是迹录员，你的旅行灵感伙伴～

你可以这样问我：
📖 **书名** — 如"人间滋味"，我会从书中提取地点生成攻略
🏙️ **城市** — 如"常熟"，我帮你找相关的书和路线  
❤️ **喜好** — 如"喜欢古建筑"，我推荐匹配的书+城

试试输入一本书名或一个城市吧！

_（配置API Key后可获取更详细的实时攻略）_`
  }

  // ── 快捷标签点击 ──
  const handleQuickTag = (tag: typeof QUICK_TAGS[number]) => {
    setInput(tag.placeholder.replace('如：', '').replace('…', ''))
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
          {/* 果冻弹跳动画 */}
          <div className="jilu-mascot-wrap">
            <JiluMascot size={56} bouncing />
          </div>
          {/* 名牌 */}
          <div className="jilu-name-tag">
            迹录员
          </div>
          {/* 呼吸光圈 */}
          <div className="jilu-aura" />
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
                <p className="text-[10px] text-gray-400">你的旅行灵感伙伴 ✨</p>
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
                  嗨！我是迹录员 🎒
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed px-4">
                  输入书名、喜好或想去的城市<br />
                  我来帮你生成专属旅行攻略
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
                {msg.role === 'assistant' && (
                  <div className="jilu-msg-avatar">
                    <JiluMascot size={24} />
                  </div>
                )}
                <div
                  className={cn(
                    'jilu-msg-bubble',
                    msg.role === 'user' ? 'jilu-bubble-user' : 'jilu-bubble-bot'
                  )}
                >
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</div>
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

            {busy && !streaming && (
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
                placeholder="输入书名、城市或喜好…"
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
