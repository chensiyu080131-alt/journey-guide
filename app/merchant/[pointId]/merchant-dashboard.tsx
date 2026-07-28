'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  resolvePointBySeq,
  merchantAuthExists,
  verifyMerchantPassword,
  fetchMerchantStats,
  fetchMerchantReviews,
  fetchAllReviewTexts,
  submitMerchantReply,
  getMerchantSession,
  setMerchantSession,
  clearMerchantSession,
  computeHighFreqWords,
  type MerchantStats,
  type MerchantReview,
  type HighFreqWord,
} from '@/lib/merchant-store'

const ROUTE_SLUG = 'yangzhou-wangzengqi-zaocha'

export default function MerchantDashboard({ pointId }: { pointId: string }) {
  const rawId = pointId
  const [point, setPoint] = useState<{ id: string; name: string } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [seq, setSeq] = useState(0)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [stats, setStats] = useState<MerchantStats | null>(null)
  const [reviews, setReviews] = useState<MerchantReview[]>([])
  const [words, setWords] = useState<HighFreqWord[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyDone, setReplyDone] = useState<Record<string, string>>({})
  const [replyMsg, setReplyMsg] = useState<Record<string, string>>({})

  const loadDashboard = useCallback(async (pointId: string) => {
    setLoading(true)
    const [s, rs, texts] = await Promise.all([
      fetchMerchantStats(pointId),
      fetchMerchantReviews(pointId, 5),
      fetchAllReviewTexts(pointId),
    ])
    setStats(s)
    setReviews(rs)
    setWords(computeHighFreqWords(texts))
    setLoading(false)
  }, [])

  useEffect(() => {
    const n = Number(rawId)
    if (!Number.isInteger(n) || n <= 0) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setSeq(n)
    void resolvePointBySeq(ROUTE_SLUG, n).then(async p => {
      if (!p) {
        setNotFound(true)
        setLoading(false)
        return
      }
      // 是否开通商家看板
      const opened = await merchantAuthExists(p.id)
      if (!opened) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setPoint(p)
      const sess = getMerchantSession()
      if (sess && sess.pointId === p.id) {
        setAuthed(true)
        void loadDashboard(p.id)
      } else {
        setLoading(false)
      }
    })
  }, [rawId, loadDashboard])

  const handleLogin = async () => {
    if (!point || !password) return
    setPwError('')
    const ok = await verifyMerchantPassword(point.id, password)
    if (ok) {
      setMerchantSession(point.id, seq)
      setAuthed(true)
      void loadDashboard(point.id)
    } else {
      setPwError('密码错误')
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!point) return
    const text = (replyText[reviewId] || '').trim()
    if (!text) {
      setReplyMsg(prev => ({ ...prev, [reviewId]: '回复不能为空' }))
      return
    }
    const res = await submitMerchantReply(reviewId, point.id, text)
    if (res.ok) {
      setReplyDone(prev => ({ ...prev, [reviewId]: text }))
      setReplyText(prev => ({ ...prev, [reviewId]: '' }))
      setReplyMsg(prev => ({ ...prev, [reviewId]: '' }))
    } else {
      setReplyMsg(prev => ({
        ...prev,
        [reviewId]: res.reason === 'EMPTY' ? '回复不能为空' : '提交失败，请重试',
      }))
    }
  }

  const handleLogout = () => {
    clearMerchantSession()
    setAuthed(false)
    setStats(null)
    setReviews([])
    setWords([])
    setPassword('')
  }

  // 商家不存在 / 未开通
  if (notFound) {
    return (
      <main className="bg-paper min-h-screen">
        <div className="xc-container py-20 text-center">
          <div className="text-6xl">🍵</div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-charcoal">商家不存在或尚未开通看板</h1>
          <p className="mt-3 text-ink-500">试点阶段仅富春茶社、冶春茶社开通商家数据看板。</p>
          <Link href="/" className="xc-pill mt-8 inline-block border-2 border-ink-200 bg-white text-sm text-ink-700">
            返回首页
          </Link>
        </div>
      </main>
    )
  }

  // 密码输入（未认证）
  if (!authed) {
    return (
      <main className="bg-paper min-h-screen">
        <div className="xc-container py-20">
          <Link href="/" className="text-xs text-ink-400 hover:text-vermilion">首页</Link>
          <div className="mt-8 max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-2xl font-bold text-charcoal">
              {point ? `「${point.name}」商家看板` : '商家数据看板'}
            </h1>
            <p className="mt-2 text-sm text-ink-500">请输入商家密码查看到店与评分数据。</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="商家密码"
              className="mt-5 w-full rounded-xl border border-ink-100 bg-paper px-4 py-3 text-sm outline-none focus:border-vermilion"
            />
            {pwError && <p className="mt-2 text-sm text-vermilion">{pwError}</p>}
            <button
              onClick={handleLogin}
              disabled={!password}
              className={`xc-pill mt-5 w-full text-sm ${
                password ? 'bg-vermilion text-white hover:opacity-90' : 'cursor-not-allowed bg-ink-100 text-ink-400'
              }`}
            >
              进入看板
            </button>
          </div>
        </div>
      </main>
    )
  }

  // 看板（已认证）
  const maxCount = words[0]?.count ?? 1

  return (
    <main className="bg-paper min-h-screen">
      <div className="xc-container py-10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-ink-400">
            <Link href="/" className="hover:text-vermilion">首页</Link>
            <span className="mx-2">/</span>
            <span>商家看板</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-ink-400 hover:text-vermilion">
            退出登录
          </button>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-bold text-charcoal">
          {point?.name} · 数据看板
        </h1>
        <p className="mt-2 text-sm text-ink-500">通过「寻迹」到店与用户反馈一览。</p>

        {loading ? (
          <p className="mt-10 text-center text-ink-400">加载中…</p>
        ) : (
          <>
            {/* 3 个数字卡片（后端聚合） */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="本周打卡人数" value={stats?.weekCheckins ?? 0} unit="人" />
              <StatCard label="累计打卡人数" value={stats?.totalCheckins ?? 0} unit="人" />
              <StatCard label="平均评分" value={stats?.avgRating ?? 0} unit="星" decimals={1} />
            </div>

            {/* 评价列表 + 高频词 */}
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="font-serif text-xl font-bold text-charcoal">最新评价</h2>
                {reviews.length === 0 ? (
                  <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-ink-500">
                    暂无评价
                  </p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {reviews.map(r => (
                      <li key={r.id} className="rounded-2xl border border-ink-100 bg-white p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#E0A800]">
                            {'★'.repeat(r.rating)}
                            <span className="ml-1 text-xs text-ink-400">{r.rating} 星</span>
                          </div>
                          <span className="text-xs text-ink-300">
                            {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        {r.text && <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.text}</p>}
                        {r.photoUrl && (
                          <img src={r.photoUrl} alt="实拍" className="mt-3 h-24 w-24 rounded-lg object-cover" />
                        )}

                        {/* 商家回复区 */}
                        {replyDone[r.id] ? (
                          <div className="mt-3 rounded-xl bg-[#F5EFE0] px-3 py-2 text-sm text-[#8A6D2F]">
                            商家回复：{replyDone[r.id]}
                          </div>
                        ) : (
                          <div className="mt-3">
                            <textarea
                              value={replyText[r.id] || ''}
                              maxLength={100}
                              onChange={e => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                              placeholder="回复用户（≤100 字）"
                              rows={2}
                              className="w-full resize-none rounded-xl border border-ink-100 bg-paper px-3 py-2 text-sm outline-none focus:border-vermilion"
                            />
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[11px] text-ink-400">
                                {(replyText[r.id] || '').length}/100
                              </span>
                              <button
                                onClick={() => handleReply(r.id)}
                                className="xc-pill bg-charcoal text-white text-xs hover:bg-charcoal-50"
                              >
                                提交回复
                              </button>
                            </div>
                            {replyMsg[r.id] && <p className="mt-1 text-xs text-vermilion">{replyMsg[r.id]}</p>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 高频词 */}
              <div>
                <h2 className="font-serif text-xl font-bold text-charcoal">评价高频词</h2>
                {words.length === 0 ? (
                  <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-ink-500">
                    暂无数据
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-ink-100 bg-white p-5">
                    {words.map(w => (
                      <span
                        key={w.word}
                        style={{ fontSize: `${14 + Math.round((w.count / maxCount) * 18)}px` }}
                        className="font-serif text-vermilion"
                        title={`出现 ${w.count} 次`}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  unit,
  decimals = 0,
}: {
  label: string
  value: number
  unit: string
  decimals?: number
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-sm">
      <div className="font-serif text-4xl font-bold text-vermilion">
        {value.toFixed(decimals)}
        <span className="ml-1 text-base font-normal text-ink-400">{unit}</span>
      </div>
      <p className="mt-2 text-sm text-ink-500">{label}</p>
    </div>
  )
}
