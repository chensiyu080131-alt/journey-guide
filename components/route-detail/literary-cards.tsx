'use client'

// T4 文学卡片收集区：打卡解锁卡片（原文 + 手绘插图位 + 地点照片位），
// 支持生成 Canvas 分享图（已打卡进度 / 集齐特别版）。

import { useCallback, useState } from 'react'
import type { RouteDetail, RoutePoint } from '@/lib/route-detail-data'
import { generateSharePoster } from '@/lib/share-poster'

export function LiteraryCards({
  route,
  checkedSeqs,
}: {
  route: RouteDetail
  checkedSeqs: number[]
}) {
  const [poster, setPoster] = useState<string | null>(null)
  const [viewCard, setViewCard] = useState<RoutePoint | null>(null)

  const checkedCount = checkedSeqs.length
  const total = route.points.length
  const allCollected = checkedCount >= total

  const makePoster = useCallback(() => {
    // 引用取第一张已解锁卡片的原文；没有则取路线第一个点位
    const src =
      route.points.find(p => checkedSeqs.includes(p.seq)) ?? route.points[0]
    const url = generateSharePoster({
      routeTitle: route.title,
      author: route.author,
      city: route.city,
      checkedCount,
      totalCount: total,
      quote: src.excerpt.length > 80 ? src.excerpt.slice(0, 80) + '…' : src.excerpt,
      quoteSource: src.excerptSource,
    })
    if (url) setPoster(url)
  }, [route, checkedSeqs, checkedCount, total])

  return (
    <section className="bg-white">
      <div className="xc-container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal">文学卡片 · 打卡解锁</h2>
            <p className="mt-1.5 text-sm text-ink-400">
              每到一处打卡，解锁一枚{route.author || '文学'}印记 · 已解锁 {checkedCount}/{total}
              {allCollected && <span className="ml-2 text-vermilion font-semibold">🎉 已集齐！</span>}
            </p>
          </div>
          <button
            onClick={makePoster}
            disabled={checkedCount === 0}
            className={`xc-pill text-sm ${
              checkedCount === 0
                ? 'cursor-not-allowed bg-ink-100 text-ink-400'
                : 'bg-vermilion text-white hover:opacity-90'
            }`}
            title={checkedCount === 0 ? '至少打卡 1 个点位后可生成' : ''}
          >
            {allCollected ? '🖼 生成集卡分享图' : '🖼 生成进度分享图'}
          </button>
        </div>

        {/* 卡片网格 */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {route.points.map(p => {
            const unlocked = checkedSeqs.includes(p.seq)
            return (
              <button
                key={p.seq}
                onClick={() => unlocked && setViewCard(p)}
                className={`group relative aspect-[3/4] overflow-hidden rounded-xl border text-left transition-all ${
                  unlocked
                    ? 'border-vermilion/50 bg-paper shadow-sm hover:shadow-md'
                    : 'cursor-default border-ink-100 bg-ink-50'
                }`}
              >
                {unlocked ? (
                  <div className="flex h-full flex-col p-3">
                    {/* 手绘插图位 */}
                    <div className="relative grid flex-1 place-items-center overflow-hidden rounded-lg bg-[#F0E6D2] text-3xl">
                      {p.illustration || p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.illustration || p.photo}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        '🍵'
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="font-serif text-sm font-bold text-charcoal leading-tight">
                        {p.name}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-400">
                        「{p.excerpt.slice(0, 24)}…」
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full bg-vermilion px-2 py-0.5 text-[10px] text-white">
                      已解锁
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full place-items-center">
                    <div className="text-center">
                      <div className="text-2xl opacity-40">🔒</div>
                      <div className="mt-2 px-2 font-serif text-xs text-ink-400">
                        第 {p.seq} 站打卡解锁
                      </div>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
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
            <div className="text-center text-xs tracking-[0.3em] text-vermilion">
              寻迹 · 文学卡片
            </div>
            {/* 手绘插图位 */}
            <div className="relative mt-4 grid aspect-video place-items-center overflow-hidden rounded-xl bg-[#F0E6D2] text-5xl">
              {viewCard.illustration || viewCard.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewCard.illustration || viewCard.photo}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                '🍵'
              )}
            </div>
            <h3 className="mt-4 text-center font-serif text-xl font-bold text-charcoal">
              {viewCard.name}
            </h3>
            <blockquote className="mt-3 border-l-2 border-vermilion/60 pl-3 font-serif text-sm leading-relaxed text-ink-700">
              「{viewCard.excerpt}」
              <footer className="mt-1 text-xs text-ink-400">—— {viewCard.excerptSource}</footer>
            </blockquote>
            {/* 地点照片位 */}
            <div className="mt-3 overflow-hidden rounded-xl border border-ink-200">
              {viewCard.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewCard.photo} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="grid h-20 place-items-center text-xs text-ink-400">
                  📷 地点照片位（待补正式摄影）
                </div>
              )}
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
