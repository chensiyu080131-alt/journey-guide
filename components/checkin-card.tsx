'use client'

import { useState } from 'react'
import type { Spot } from '@/types'
import { doCheckin, CHECKIN_RADIUS_M } from '@/lib/checkin'
import { Badge } from './ui'

interface Props {
  spot: Spot
  guideId: string
  checkedIn: boolean
  onChecked: () => void
}

type Status = 'idle' | 'locating' | 'success' | 'denied' | 'error'

/**
 * 打卡卡片（任务4 核心 UI）
 *
 * 流程：
 *   点击"去打卡" → 取 GPS → 算距离 → ≤100m 写后端 → 解锁文学卡片
 *   失败（超距离/无 GPS/拒绝权限）→ 显示原因，可重试
 *
 * 任务4 死规矩：打卡记录走 lib/checkin.doCheckin → 优先 Supabase，刷新不丢。
 * 分享图：用 Canvas 生成（任务4 建议：logo+路线名+已打卡数+一句汪曾祺原文）。
 */
export function CheckinCard({ spot, guideId, checkedIn, onChecked }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [msg, setMsg] = useState('')
  const [distance, setDistance] = useState<number | null>(null)
  const [showCard, setShowCard] = useState(false)

  const handleCheckin = async () => {
    setStatus('locating')
    setMsg('正在获取定位…')
    setDistance(null)

    // 取一个 demo uid（接入登录后替换为真实 auth.uid）
    const userId = typeof window !== 'undefined'
      ? localStorage.getItem('xunji:demo-uid')
      : null

    const result = await doCheckin({
      pointId: spot.id,
      routeId: guideId,
      pointLat: spot.location?.lat || 0,
      pointLng: spot.location?.lng || 0,
      userId,
    })

    if (result.ok) {
      setStatus('success')
      setDistance(result.distanceM ?? null)
      const storedHint = result.storedAt === 'backend'
        ? '已记录到云端'
        : result.storedAt === 'local'
          ? '已记录（登录后同步到云端）'
          : '记录失败'
      setMsg(`打卡成功！距点位 ${result.distanceM} 米 · ${storedHint}`)
      onChecked()
      setShowCard(true)
    } else {
      // 距离过远 = denied；其他（无 GPS/拒绝权限）= error
      setStatus(result.reason?.includes('超出') ? 'denied' : 'error')
      setDistance(result.distanceM ?? null)
      setMsg(result.reason || '打卡失败')
    }
  }

  // 已打卡状态：显示文学卡片入口
  if (checkedIn && status !== 'locating') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-jade/15 text-jade text-sm font-medium">
            ✓ 已打卡
          </span>
          {distance != null && (
            <span className="text-xs text-ink-400">当时距点位 {distance} 米</span>
          )}
          <button
            onClick={() => setShowCard(s => !s)}
            className="ml-auto text-xs text-xuncheng-600 hover:text-xuncheng-700 underline"
          >
            {showCard ? '收起卡片' : '查看文学卡片'}
          </button>
        </div>
        {showCard && <LiteraryCard spot={spot} guideId={guideId} />}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckin}
        disabled={status === 'locating'}
        className="w-full py-2.5 rounded-xl bg-xuncheng-500 text-white text-sm font-medium hover:bg-xuncheng-600 transition-all disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
      >
        {status === 'locating' ? (
          <>📡 定位中…</>
        ) : (
          <>📍 到店打卡（{CHECKIN_RADIUS_M}米内）</>
        )}
      </button>

      {/* 距离/结果提示 */}
      {status === 'denied' && (
        <div className="text-xs text-vermilion bg-vermilion/10 rounded-lg px-3 py-2">
          ⚠ {msg}
          {distance != null && (
            <span className="block mt-1 text-ink-400">
              需走到点位 {CHECKIN_RADIUS_M} 米范围内，当前位置还差 {distance} 米
            </span>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="text-xs text-ink-500 bg-ink-50 rounded-lg px-3 py-2">
          ℹ {msg}
          <span className="block mt-1 text-ink-400">
            提示：桌面浏览器无 GPS，可用 Chrome DevTools → Sensors 面板伪造坐标到点位附近测试
          </span>
        </div>
      )}
      {status === 'success' && (
        <div className="space-y-2">
          <div className="text-xs text-jade bg-jade/10 rounded-lg px-3 py-2">🎉 {msg}</div>
          <LiteraryCard spot={spot} guideId={guideId} />
        </div>
      )}
    </div>
  )
}

/**
 * 文学卡片（任务4：打卡后解锁）
 * 任务文档要求：汪曾祺原文 + 手绘插图位 + 地点照片位
 * MVP 用 emoji 占位插图/照片位（免版权），后续替换为设计出图。
 */
function LiteraryCard({ spot, guideId }: { spot: Spot; guideId: string }) {
  return (
    <div className="rounded-2xl border-2 border-xuncheng-200 bg-gradient-to-br from-xuncheng-50/70 to-amber-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-xuncheng-600 font-bold">📖 文学卡片 · 已解锁</span>
        <ShareButton spot={spot} guideId={guideId} />
      </div>

      {/* 卡片标题 */}
      <h4 className="font-serif font-bold text-ink-900 text-lg flex items-center gap-2">
        <span className="text-2xl">{spot.emoji}</span>
        {spot.name}
      </h4>

      {/* 插图位（emoji 占位，设计出图后替换为 <img>） */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-16 h-16 rounded-xl bg-white/70 border border-xuncheng-100 flex items-center justify-center text-3xl">
          🖼️
        </div>
        <div className="w-16 h-16 rounded-xl bg-white/70 border border-xuncheng-100 flex items-center justify-center text-3xl">
          📷
        </div>
        <p className="text-xs text-ink-400 flex-1">
          左：手绘插图位（设计出图后替换）<br />
          右：到店拍照位（用户上传）
        </p>
      </div>

      {/* 原文金句 */}
      {spot.originalText && (
        <blockquote className="pl-3 border-l-2 border-xuncheng-400 py-1">
          <p className="text-sm text-ink-800 font-serif italic leading-relaxed">
            「{spot.originalText}」
          </p>
          {spot.originalSource && (
            <p className="text-xs text-xuncheng-600 mt-1">—— {spot.originalSource}</p>
          )}
        </blockquote>
      )}
    </div>
  )
}

/**
 * 分享图（任务4 建议：Canvas 生成，含 logo+路线名+已打卡数+一句汪曾祺原文）
 * 点击后用 Canvas 绘制 → 转 PNG → 触发下载。
 */
function ShareButton({ spot, guideId }: { spot: Spot; guideId: string }) {
  const [busy, setBusy] = useState(false)

  const handleShare = async () => {
    setBusy(true)
    try {
      const url = await generateShareImage(spot, guideId)
      // 触发下载
      const a = document.createElement('a')
      a.href = url
      a.download = `寻迹-${spot.name}.png`
      a.click()
    } catch (e) {
      alert('分享图生成失败：' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={busy}
      className="text-xs px-2.5 py-1 rounded-full bg-xuncheng-500 text-white hover:bg-xuncheng-600 disabled:opacity-60"
    >
      {busy ? '生成中…' : '🔗 生成分享图'}
    </button>
  )
}

/** Canvas 绘制分享图 */
async function generateShareImage(spot: Spot, guideId: string): Promise<string> {
  const W = 750, H = 1334 // 适合手机竖屏分享的比例
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  // 背景：暖色纸感渐变
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#fdf6ec')
  grad.addColorStop(1, '#f5e6d3')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 顶部品牌
  ctx.fillStyle = '#8B4545'
  ctx.font = 'bold 36px serif'
  ctx.fillText('寻迹', 60, 90)
  ctx.fillStyle = '#9a3412'
  ctx.font = '20px serif'
  ctx.fillText('有迹可循，寻迹而至', 60, 124)

  // 路线名
  ctx.fillStyle = '#3d2817'
  ctx.font = 'bold 40px serif'
  ctx.fillText('汪曾祺的扬州早茶地图', 60, 220)

  // 打卡点位名
  ctx.fillStyle = '#8B4545'
  ctx.font = '32px serif'
  ctx.fillText(`${spot.emoji} ${spot.name}`, 60, 300)

  // 装饰线
  ctx.strokeStyle = '#c9a87c'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, 340)
  ctx.lineTo(W - 60, 340)
  ctx.stroke()

  // 原文金句（自动换行）
  ctx.fillStyle = '#3d2817'
  ctx.font = '28px serif'
  const quote = spot.originalText || '扬州一带的人有吃早茶的习惯。'
  wrapText(ctx, `「${quote}」`, 60, 410, W - 120, 44)

  // 出处
  ctx.fillStyle = '#9a3412'
  ctx.font = '20px serif'
  ctx.fillText(`—— ${spot.originalSource || '汪曾祺《人间滋味》'}`, 60, 700)

  // 打卡状态
  ctx.fillStyle = '#5a7d78'
  ctx.font = '24px serif'
  ctx.fillText('✓ 我在扬州·汪曾祺笔下的早茶地图打卡', 60, 800)

  // 底部 CTA
  ctx.fillStyle = '#8B4545'
  ctx.font = '20px serif'
  ctx.fillText('扫码和我一起寻迹', 60, H - 120)
  ctx.fillStyle = '#9a3412'
  ctx.font = '16px serif'
  ctx.fillText('xunji.app · 跟着书本去旅行', 60, H - 80)

  return canvas.toDataURL('image/png')
}

function wrapText(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
  maxWidth: number, lineHeight: number
) {
  let line = ''
  let curY = y
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = ch
      curY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, curY)
}
