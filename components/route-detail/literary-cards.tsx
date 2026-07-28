'use client'

// T4 文学卡片收集区：打卡解锁卡片（自动生成 SVG 水墨 motif + 摘录预览），
// 集齐 5 枚后可用 html2canvas 生成 1080×1920 分享图（含寻迹品牌 + 路线名），
// html2canvas 不可用时回退既有零依赖 Canvas 生成器。
// 「自动生成适配」：每站卡片视觉由点位序号确定性生成，无需设计师出图；
// 未打卡即展示摘录预览（标注「未打卡」），打卡后解锁全文 + 分享图。

import { useCallback, useRef, useState } from 'react'
import type { RouteDetail, RoutePoint } from '@/lib/route-detail-data'
import { generateSharePoster } from '@/lib/share-poster'

// 5 站配色（茶/墨/朱砂等中式色），按 seq 取
const PALETTE = ['#8B4545', '#3E6B3E', '#8A6D2F', '#9C4A42', '#5A6B8C']

/** 确定性水墨 motif：随序号变化的笔触圆 + 印章方块 */
function CardMotif({ seq, size = 56 }: { seq: number; size?: number }) {
  const color = PALETTE[(seq - 1) % PALETTE.length]
  const seed = seq * 37
  const r1 = 18 + (seed % 5)
  const r2 = 11 + ((seed >> 2) % 4)
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="opacity-90">
      <circle cx="32" cy="32" r={r1} fill="none" stroke={color} strokeWidth="2.5" opacity="0.55" />
      <circle cx="32" cy="32" r={r2} fill={color} opacity="0.12" />
      <path
        d={`M${14 + (seed % 6)} 44 Q32 ${20 + (seed % 8)} ${50 - (seed % 6)} 40`}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect x="42" y="10" width="14" height="14" rx="3" fill={color} opacity="0.85" />
      <text x="49" y="20.5" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">
        {seq}
      </text>
    </svg>
  )
}

export function LiteraryCards({
  route,
  checkedSeqs,
}: {
  route: RouteDetail
  checkedSeqs: number[]
}) {
  const [poster, setPoster] = useState<string | null>(null)
  const [viewCard, setViewCard] = useState<RoutePoint | null>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  const checkedCount = checkedSeqs.length
  const total = route.points.length
  const allCollected = checkedCount >= total
  // 分享图引用的原文：取第一张已解锁卡片，没有则取路线首站
  const posterSrc = route.points.find(p => checkedSeqs.includes(p.seq)) ?? route.points[0]

  const makePoster = useCallback(async () => {
    // 优先 html2canvas 捕获真实 DOM 海报（1080×1920，含品牌 + 路线名）
    try {
      if (posterRef.current) {
        const { default: html2canvas } = await import('html2canvas')
        const canvas = await html2canvas(posterRef.current, {
          width: 1080,
          height: 1920,
          scale: 1,
          backgroundColor: '#F7F1E5',
          logging: false,
        })
        const url = canvas.toDataURL('image/png')
        if (url) {
          setPoster(url)
          return
        }
      }
    } catch {
      // html2canvas 不可用 → 回退零依赖 Canvas 生成器
    }
    const url = generateSharePoster({
      routeTitle: route.title,
      author: route.author,
      city: route.city,
      checkedCount,
      totalCount: total,
      quote: posterSrc.excerpt.length > 80 ? posterSrc.excerpt.slice(0, 80) + '…' : posterSrc.excerpt,
      quoteSource: posterSrc.excerptSource,
    })
    if (url) setPoster(url)
  }, [route, posterSrc, checkedCount, total])

  return (
    <section className="bg-white">
      <div className="xc-container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal">文学卡片 · 打卡解锁</h2>
            <p className="mt-1.5 text-sm text-ink-400">
              每到一处打卡，解锁一枚汪曾祺文学印记 · 已解锁 {checkedCount}/{total}
              {allCollected && <span className="ml-2 text-vermilion font-semibold">🎉 已集齐！</span>}
            </p>
          </div>
          <button
            onClick={makePoster}
            disabled={!allCollected}
            className={`xc-pill text-sm ${
              !allCollected
                ? 'cursor-not-allowed bg-ink-100 text-ink-400'
                : 'bg-vermilion text-white hover:opacity-90'
            }`}
            title={!allCollected ? `还需解锁 ${total - checkedCount} 个点位` : ''}
          >
            {allCollected ? '🖼 生成集卡分享图' : `还需解锁 ${total - checkedCount} 个点位`}
          </button>
        </div>

        {/* 卡片网格 */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {route.points.map(p => {
            const unlocked = checkedSeqs.includes(p.seq)
            return (
              <button
                key={p.seq}
                onClick={() => setViewCard(p)}
                className={`group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl border text-left transition-all ${
                  unlocked
                    ? 'border-vermilion/50 bg-paper shadow-sm hover:shadow-md'
                    : 'border-ink-100 bg-ink-50 hover:border-ink-200'
                }`}
              >
                {/* 自动生成的水墨 motif 插图位 */}
                <div className="aspect-[4/3] w-full place-items-center bg-gradient-to-b from-[#F0E6D2] to-[#E8Dcc0] grid">
                  <CardMotif seq={p.seq} size={64} />
                </div>
                <div className="flex flex-1 flex-col p-2.5">
                  <div className="font-serif text-[13px] font-bold leading-tight text-charcoal">
                    {p.name.replace(/（.*?）/g, '')}
                  </div>
                  {/* 摘录预览：未打卡也展示，标注「未打卡」 */}
                  <div
                    className={`mt-1 line-clamp-3 text-[10.5px] leading-snug ${
                      unlocked ? 'text-ink-500' : 'text-ink-400'
                    }`}
                  >
                    「{p.excerpt}」
                  </div>
                  <div className="mt-auto">
                    {unlocked ? (
                      <span className="rounded-full bg-vermilion px-2 py-0.5 text-[10px] text-white">
                        已解锁
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-400">
                        第 {p.seq} 站打卡解锁
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-400">
          卡片视觉由点位序号自动生成 · 点击任意卡片查看原文与出处
        </p>
      </div>

      {/* 隐藏的分享图海报 DOM（1080×1920，html2canvas 捕获源） */}
      <div
        ref={posterRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: -10000,
          top: 0,
          width: 1080,
          height: 1920,
          background: '#F7F1E5',
          fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif',
          color: '#2F2A26',
          boxSizing: 'border-box',
          padding: 80,
        }}
      >
        <div style={{ position: 'absolute', inset: 40, border: '3px solid #8B4545', borderRadius: 8 }} />
        <div style={{ position: 'absolute', inset: 52, border: '1px solid rgba(139,69,69,0.4)', borderRadius: 6 }} />
        <div style={{ textAlign: 'center', paddingTop: 56 }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: '#8B4545', letterSpacing: 12 }}>寻 迹</div>
          <div style={{ fontSize: 30, color: '#6B5D52', marginTop: 16, letterSpacing: 4 }}>有迹可循 · 寻迹而至</div>
        </div>
        <div style={{ height: 2, background: 'rgba(139,69,69,0.35)', margin: '56px 60px' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: '#2F2A26', lineHeight: 1.3 }}>{route.title}</div>
          <div style={{ fontSize: 34, color: '#6B5D52', marginTop: 24 }}>{route.author} · {route.city}</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <span
            style={{
              display: 'inline-block',
              background: '#8B4545',
              color: '#F7F1E5',
              fontSize: 38,
              fontWeight: 700,
              padding: '20px 48px',
              borderRadius: 999,
            }}
          >
            已集齐 {total} 枚文学印记
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 60 }}>
          {route.points.map(p => (
            <div key={p.seq} style={{ width: 150, textAlign: 'center' }}>
              <div
                style={{
                  width: 150,
                  height: 200,
                  borderRadius: 12,
                  background: 'linear-gradient(180deg,#F0E6D2,#E8DCC0)',
                  border: '2px solid #8B4545',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 56,
                  color: PALETTE[(p.seq - 1) % PALETTE.length],
                  fontWeight: 700,
                }}
              >
                {p.seq}
              </div>
              <div style={{ fontSize: 24, marginTop: 12, color: '#5A4632' }}>
                {p.name.replace(/（.*?）/g, '').slice(0, 5)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 64, padding: '0 80px' }}>
          <div style={{ fontSize: 110, color: '#8B4545', lineHeight: 1 }}>「</div>
          <div style={{ fontSize: 40, color: '#2F2A26', lineHeight: 1.6, marginTop: -28 }}>
            {posterSrc.excerpt.length > 60 ? posterSrc.excerpt.slice(0, 60) + '…' : posterSrc.excerpt}
          </div>
          <div style={{ fontSize: 30, color: '#6B5D52', marginTop: 24 }}>—— {posterSrc.excerptSource}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ height: 2, background: 'rgba(139,69,69,0.35)', margin: '0 60px 36px' }} />
          <div style={{ fontSize: 30, color: '#6B5D52' }}>跟着文学去旅行 · 到点位打卡解锁文学卡片</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#8B4545', marginTop: 14, letterSpacing: 4 }}>
            寻迹 XUNJI
          </div>
        </div>
      </div>

      {/* 卡片详情弹层 */}
      {viewCard && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setViewCard(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-center text-xs tracking-[0.3em] text-vermilion">寻迹 · 文学卡片</div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  checkedSeqs.includes(viewCard.seq)
                    ? 'bg-vermilion text-white'
                    : 'bg-ink-100 text-ink-400'
                }`}
              >
                {checkedSeqs.includes(viewCard.seq) ? '已解锁' : '未打卡'}
              </span>
            </div>
            {/* 自动生成水墨 motif */}
            <div className="mt-4 grid aspect-video place-items-center rounded-xl bg-gradient-to-b from-[#F0E6D2] to-[#E8Dcc0]">
              <CardMotif seq={viewCard.seq} size={96} />
            </div>
            <h3 className="mt-4 text-center font-serif text-xl font-bold text-charcoal">
              {viewCard.name}
            </h3>
            <blockquote className="mt-3 border-l-2 border-vermilion/60 pl-3 font-serif text-sm leading-relaxed text-ink-700">
              「{viewCard.excerpt}」
              <footer className="mt-1 text-xs text-ink-400">—— {viewCard.excerptSource}</footer>
            </blockquote>
            <div className="mt-3 grid h-20 place-items-center rounded-xl border border-dashed border-ink-200 text-xs text-ink-400">
              📷 地点照片位（打卡照片，后端上线后展示）
            </div>
            <button
              onClick={() => setViewCard(null)}
              className="xc-pill mt-5 w-full bg-charcoal text-sm text-white"
            >
              收好了
            </button>
          </div>
        </div>
      )}

      {/* 分享图弹层 */}
      {poster && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setPoster(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="寻迹集卡分享图" className="w-full rounded-xl" />
            <div className="mt-3 flex gap-3">
              <a
                href={poster}
                download={`寻迹-${route.title}-集卡.png`}
                className="xc-pill flex-1 bg-vermilion text-center text-sm text-white"
              >
                ⬇ 保存图片
              </a>
              <button
                onClick={() => setPoster(null)}
                className="xc-pill flex-1 border-2 border-ink-200 bg-white text-sm text-ink-700"
              >
                关闭
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-ink-400">
              长按或保存后分享到小红书 / 朋友圈
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
