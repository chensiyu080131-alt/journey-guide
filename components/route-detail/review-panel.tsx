'use client'

// 反馈回路 Step1 · 评价面板：打卡后弹出
// 1-5 星点选（必填）+ ≤50 字一句话感受（选填）+ 1 张到店实拍图（选填）
// 提交走 submitReview（优先 Supabase，失败落本地兜底）

import { useRef, useState } from 'react'
import { submitReview } from '@/lib/reviews-store'

interface Props {
  routeSlug: string
  pointSeq: number
  pointName: string
  onSubmitted?: () => void
}

const MAX_TEXT = 50

export function ReviewPanel({ routeSlug, pointSeq, pointName, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [localNote, setLocalNote] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (rating < 1 || submitting) return
    setSubmitting(true)
    const res = await submitReview(
      { routeSlug, pointSeq, rating, text: text.trim() || null },
      photo ?? undefined
    )
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      if (res.local) setLocalNote(true)
      onSubmitted?.()
    }
  }

  if (done) {
    return (
      <div className="mt-4 rounded-xl border border-[#C6DCC6] bg-[#EAF3EA] px-4 py-3 text-sm text-[#3E6B3E]">
        ✅ 评价已提交，感谢你的分享！
        {localNote && <span className="ml-1 text-xs text-ink-400">（本地暂存，联网后自动同步）</span>}
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-ink-100 bg-paper p-4">
      <p className="text-sm font-semibold text-charcoal">
        给「{pointName}」打个分
      </p>

      {/* 星级 */}
      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="text-2xl leading-none transition-colors"
            aria-label={`${n} 星`}
          >
            <span className={(hover || rating) >= n ? 'text-[#E0A800]' : 'text-ink-200'}>★</span>
          </button>
        ))}
        <span className="ml-2 text-xs text-ink-400">{rating > 0 ? `${rating} 星` : '点选评分'}</span>
      </div>

      {/* 文字 */}
      <textarea
        value={text}
        maxLength={MAX_TEXT}
        onChange={e => setText(e.target.value)}
        placeholder="一句话感受（选填，≤50 字）"
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-vermilion"
      />
      <div className="mt-1 text-right text-[11px] text-ink-400">{text.length}/{MAX_TEXT}</div>

      {/* 照片 */}
      <div className="mt-2 flex items-center gap-3">
        {photoPreview ? (
          <img src={photoPreview} alt="预览" className="h-16 w-16 rounded-lg object-cover border border-ink-100" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-ink-200 text-ink-300 text-xs">
            实拍图
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="xc-pill border border-ink-200 bg-white text-sm text-ink-600 hover:bg-ink-50"
        >
          📷 上传 1 张（选填）
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />
      </div>

      {/* 提交 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating < 1 || submitting}
        className={`xc-pill mt-4 text-sm ${
          rating < 1 || submitting
            ? 'cursor-not-allowed bg-ink-100 text-ink-400'
            : 'bg-vermilion text-white hover:opacity-90'
        }`}
      >
        {submitting ? '提交中…' : '提交评价'}
      </button>
      {rating < 1 && (
        <span className="ml-3 align-middle text-xs text-ink-400">请先点选星级</span>
      )}
    </div>
  )
}
