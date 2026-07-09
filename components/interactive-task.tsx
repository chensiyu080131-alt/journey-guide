'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { InteractiveTask as InteractiveTaskType } from '@/types'
import { cn } from '@/lib/utils'

interface InteractiveTaskProps {
  task: InteractiveTaskType
}

export function InteractiveTask({ task }: InteractiveTaskProps) {
  const [expanded, setExpanded] = useState(false)

  const typeConfig: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
    '诗词诵读': { icon: '📜', color: 'text-indigo', bgColor: 'bg-indigo/5', borderColor: 'border-indigo/20' },
    '知识问答': { icon: '❓', color: 'text-xuncheng-600', bgColor: 'bg-xuncheng-50', borderColor: 'border-xuncheng-200' },
    '古籍寻宝': { icon: '🔍', color: 'text-jade', bgColor: 'bg-jade/5', borderColor: 'border-jade/20' },
    '书法临摹': { icon: '✒️', color: 'text-vermilion', bgColor: 'bg-vermilion/5', borderColor: 'border-vermilion/20' },
  }

  const config = typeConfig[task.type] || typeConfig['知识问答']

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full text-left rounded-lg p-3 transition-all duration-300 cursor-pointer border',
          expanded
            ? `${config.bgColor} ${config.borderColor}`
            : 'bg-paper hover:bg-ink-50 border-transparent'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span className={cn('text-sm font-medium', expanded ? config.color : 'text-ink-600')}>
            互动任务：{task.title}
          </span>
          <span className="ml-auto text-xs text-ink-400">
            {expanded ? '▾ 收起' : '▸ 展开'}
          </span>
        </div>
        {!expanded && (
          <p className="text-xs text-ink-400 mt-1 ml-7">{task.description}</p>
        )}
      </button>

      {expanded && (
        <div className={cn('mt-2 rounded-lg p-4 border animate-fade-in', config.bgColor, config.borderColor)}>
          {task.type === '诗词诵读' && task.poem && (
            <PoemTask poem={task.poem} />
          )}
          {task.type === '知识问答' && task.questions && (
            <QuizTask questions={task.questions} />
          )}
          {task.type === '古籍寻宝' && task.treasureOriginal && task.treasureTampered && (
            <TreasureTask original={task.treasureOriginal} tampered={task.treasureTampered} />
          )}
          {task.type === '书法临摹' && task.calligraphyText && (
            <CalligraphyTask text={task.calligraphyText} />
          )}
        </div>
      )}
    </div>
  )
}

/** 诗词诵读 */
function PoemTask({ poem }: { poem: string }) {
  const [speaking, setSpeaking] = useState(false)

  const handleRead = useCallback(() => {
    if (speaking) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(poem.replace(/——.*/g, '').replace(/\n/g, '。'))
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [poem, speaking])

  return (
    <div className="space-y-3">
      <div className="bg-white/60 rounded-lg p-4">
        <p className="text-sm leading-loose font-serif text-ink-700 whitespace-pre-line italic">
          {poem}
        </p>
      </div>
      <button
        onClick={handleRead}
        disabled={speaking}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          speaking
            ? 'bg-indigo/10 text-indigo cursor-wait'
            : 'bg-indigo text-white hover:bg-indigo/90'
        )}
      >
        {speaking ? '🔊 朗读中...' : '🎙️ 朗读'}
      </button>
    </div>
  )
}

/** 知识问答 */
function QuizTask({ questions }: { questions: { question: string; options: string[]; answer: number }[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-sm font-medium text-ink-700">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi
              const isCorrect = checked[qi] && oi === q.answer
              const isWrong = checked[qi] && isSelected && oi !== q.answer

              return (
                <button
                  key={oi}
                  onClick={() => {
                    if (checked[qi]) return
                    setAnswers(prev => ({ ...prev, [qi]: oi }))
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all border',
                    isCorrect && 'bg-jade/10 border-jade/30 text-jade',
                    isWrong && 'bg-vermilion/10 border-vermilion/30 text-vermilion line-through',
                    !checked[qi] && isSelected && 'bg-xuncheng-50 border-xuncheng-200 text-xuncheng-700',
                    !checked[qi] && !isSelected && 'bg-white border-ink-100 text-ink-600 hover:border-ink-200',
                  )}
                >
                  {String.fromCharCode(65 + oi)}. {opt}
                  {isCorrect && ' ✅'}
                </button>
              )
            })}
          </div>
          {answers[qi] !== undefined && !checked[qi] && (
            <button
              onClick={() => setChecked(prev => ({ ...prev, [qi]: true }))}
              className="text-xs text-xuncheng-600 hover:text-xuncheng-700 underline"
            >
              查看答案
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/** 古籍寻宝 */
function TreasureTask({ original, tampered }: { original: string; tampered: string }) {
  // Generate the diff: find which characters differ
  const chars1 = original.split('')
  const chars2 = tampered.split('')
  const diffIndices: number[] = []
  const maxLen = Math.max(chars1.length, chars2.length)
  for (let i = 0; i < maxLen; i++) {
    if (chars1[i] !== chars2[i]) diffIndices.push(i)
  }

  // If no differences, create an artificial one for the game
  const hasRealDiff = diffIndices.length > 0
  const gameText = hasRealDiff ? tampered : tampered.replace('青山', '青川')
  const hintChar = hasRealDiff ? original[diffIndices[0]] : '山'

  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState('')

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-600">
        下面这段古文中藏着一处错字，找出它！
      </p>
      <div className="bg-white/60 rounded-lg p-4">
        <p className="text-base leading-loose font-serif text-ink-700 tracking-wider">
          {gameText}
        </p>
      </div>
      {!revealed ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="输入你发现的错字..."
            className="flex-1 px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-jade/40"
          />
          <button
            onClick={() => setRevealed(true)}
            className="px-4 py-2 rounded-lg bg-jade text-white text-sm font-medium hover:bg-jade/90 transition-all"
          >
            揭晓
          </button>
        </div>
      ) : (
        <div className="bg-jade/10 rounded-lg p-3 border border-jade/20">
          <p className="text-sm text-jade font-medium">
            ✅ 正确答案：「{hintChar}」字被篡改了！
          </p>
          <p className="text-sm text-ink-600 mt-1">
            原文：{original}
          </p>
        </div>
      )}
    </div>
  )
}

/** 书法临摹 */
function CalligraphyTask({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FDF6EC'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // Draw grid
    ctx.strokeStyle = '#E8E6E1'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    ctx.setLineDash([])
    // Draw ghost text
    ctx.fillStyle = '#D1CDC4'
    ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.6}px "Noto Serif SC", "STSong", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }, [text])

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Set actual canvas dimensions
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(2, 2)
    handleClear()
  }, [handleClear])

  // 挂载时初始化画布（田字格 + 淡色范字），否则展开后是一片空白
  useEffect(() => {
    initCanvas()
  }, [initCanvas])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left),
        y: (e.touches[0].clientY - rect.top),
      }
    }
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top),
    }
  }, [])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getPos])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#2A2623'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [drawing, getPos])

  const handleEnd = useCallback(() => {
    setDrawing(false)
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-600">
        临摹下面的字，感受文人笔墨：
      </p>
      <div className="bg-white/60 rounded-lg p-3 text-center">
        <p className="text-4xl font-serif text-ink-800 tracking-widest">{text}</p>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded-lg border border-ink-200 cursor-crosshair touch-none"
          style={{ background: '#FDF6EC' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            initCanvas()
          }}
          className="px-4 py-2 rounded-lg bg-ink-100 text-ink-600 text-sm font-medium hover:bg-ink-200 transition-all"
        >
          🔄 清除重写
        </button>
      </div>
    </div>
  )
}
