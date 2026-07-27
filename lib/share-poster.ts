// T4 集卡分享图生成（Canvas，纯前端零依赖）
// 内容：品牌名 + 路线名 + 已打卡点位数 + 一句汪曾祺原文（任务书建议项）
// 风格：暖色纸感 #F7F1E5 / 主色 #8B4545 / 墨色 #2F2A26，与站点视觉一致

export interface PosterInput {
  routeTitle: string
  author: string
  city: string
  checkedCount: number
  totalCount: number
  quote: string
  quoteSource: string
}

const W = 750
const H = 1200

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 生成分享图，返回 PNG dataURL；失败返回 null（如 canvas 不可用） */
export function generateSharePoster(input: PosterInput): string | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const serif = '"Noto Serif SC", "Songti SC", "STSong", serif'

  // 纸感底色 + 细腻噪点感（用半透明色块模拟）
  ctx.fillStyle = '#F7F1E5'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(139,69,69,0.03)'
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2)
  }

  // 外框（双线，书卷感）
  ctx.strokeStyle = '#8B4545'
  ctx.lineWidth = 3
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.lineWidth = 1
  ctx.strokeRect(40, 40, W - 80, H - 80)

  // 品牌名
  ctx.fillStyle = '#8B4545'
  ctx.font = `bold 64px ${serif}`
  ctx.textAlign = 'center'
  ctx.fillText('寻 迹', W / 2, 150)
  ctx.font = `24px ${serif}`
  ctx.fillStyle = '#6B5D52'
  ctx.fillText('有迹可循 · 寻迹而至', W / 2, 196)

  // 分隔线
  ctx.strokeStyle = 'rgba(139,69,69,0.35)'
  ctx.beginPath()
  ctx.moveTo(120, 240)
  ctx.lineTo(W - 120, 240)
  ctx.stroke()

  // 路线名
  ctx.fillStyle = '#2F2A26'
  ctx.font = `bold 44px ${serif}`
  const titleLines = wrapText(ctx, input.routeTitle, W - 180)
  let y = 330
  for (const l of titleLines) {
    ctx.fillText(l, W / 2, y)
    y += 62
  }
  ctx.font = `26px ${serif}`
  ctx.fillStyle = '#6B5D52'
  ctx.fillText(`${input.author} · ${input.city}`, W / 2, y + 8)
  y += 70

  // 打卡进度徽章
  const done = input.checkedCount >= input.totalCount
  ctx.fillStyle = done ? '#8B4545' : 'rgba(139,69,69,0.12)'
  const badgeW = 340
  const badgeH = 72
  const bx = (W - badgeW) / 2
  ctx.beginPath()
  ctx.roundRect(bx, y, badgeW, badgeH, 36)
  ctx.fill()
  ctx.fillStyle = done ? '#F7F1E5' : '#8B4545'
  ctx.font = `bold 30px ${serif}`
  ctx.fillText(
    done
      ? `已集齐 ${input.totalCount} 枚文学印记`
      : `已打卡 ${input.checkedCount} / ${input.totalCount} 个点位`,
    W / 2,
    y + 47
  )
  y += badgeH + 90

  // 汪曾祺原文引用
  ctx.fillStyle = '#8B4545'
  ctx.font = `bold 90px ${serif}`
  ctx.fillText('「', 130, y)
  ctx.fillStyle = '#2F2A26'
  ctx.font = `32px ${serif}`
  const quoteLines = wrapText(ctx, input.quote, W - 220)
  let qy = y + 40
  for (const l of quoteLines.slice(0, 6)) {
    ctx.fillText(l, W / 2, qy)
    qy += 54
  }
  ctx.fillStyle = '#6B5D52'
  ctx.font = `24px ${serif}`
  ctx.fillText(`—— ${input.quoteSource}`, W / 2, qy + 26)

  // 底部落款
  ctx.strokeStyle = 'rgba(139,69,69,0.35)'
  ctx.beginPath()
  ctx.moveTo(120, H - 190)
  ctx.lineTo(W - 120, H - 190)
  ctx.stroke()
  ctx.fillStyle = '#6B5D52'
  ctx.font = `24px ${serif}`
  ctx.fillText('跟着文学去旅行 · 到点位打卡解锁文学卡片', W / 2, H - 136)
  ctx.fillStyle = '#8B4545'
  ctx.font = `bold 26px ${serif}`
  ctx.fillText('寻迹 XUNJI', W / 2, H - 90)

  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}
