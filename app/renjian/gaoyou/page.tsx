'use client'

import { useState, useEffect } from 'react'
import { RenjianShell } from '@/components/renjian/renjian-shell'
import { gaoPoints, gaoRoute, type GaoPoint } from '@/lib/renjian-data'

export default function GaoyouPage() {
  const [sel, setSel] = useState<GaoPoint | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const labelY = (p: GaoPoint) => (p.y < 380 ? p.y + 30 : p.y - 16)

  return (
    <RenjianShell>
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">方案 A · 单城深度版</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">
            跟着汪曾祺吃<span className="text-vermilion">高邮</span>
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-sm text-ink-500">
            「我的家乡是水乡，出鸭。」汪曾祺的故乡，全书点位最密集的一座城。点击地图上的点位，看书中原文与现代打卡点。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12">
          {/* 手绘地图 */}
          <div className="relative rounded-3xl border border-ink-100 overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 30% 70%, rgba(91,140,90,.16), transparent 45%),' +
                'radial-gradient(circle at 75% 30%, rgba(184,146,60,.12), transparent 40%),' +
                'linear-gradient(160deg,#F1E8D5,#E8DBC0)',
            }}
          >
            <svg viewBox="0 0 820 540" className="w-full h-auto block">
              {/* 高邮湖 */}
              <path d="M60,200 Q40,300 120,360 Q200,400 260,350 Q305,285 270,200 Q200,150 120,170 Q70,180 60,200 Z"
                fill="rgba(91,140,90,.22)" stroke="rgba(94,110,66,.45)" strokeWidth="1.5" />
              <text x="150" y="285" fontFamily="STKaiti,KaiTi,serif" fontSize="20" fill="#5E6E42" letterSpacing="2">高邮湖</text>
              {/* 大运河 */}
              <path d="M430,10 C470,150 415,300 470,420 C500,495 515,520 525,540"
                fill="none" stroke="rgba(184,146,60,.55)" strokeWidth="4" strokeLinecap="round" />
              <text x="500" y="470" fontFamily="STKaiti,KaiTi,serif" fontSize="15" fill="#B8923C" letterSpacing="2">大运河</text>
              {/* 街巷 */}
              <path d="M330,260 L620,260 M360,330 L600,330" fill="none" stroke="rgba(58,53,47,.15)" strokeWidth="1" strokeDasharray="4 5" />
              <text x="635" y="264" fontFamily="STKaiti,KaiTi,serif" fontSize="13" fill="#8A8074">东大街</text>

              {/* 点位 */}
              {gaoPoints.map(p => (
                <g key={p.id} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSel(p)}>
                  <circle cx={p.x} cy={p.y} r={p.anchor ? 20 : 16} fill="rgba(229,77,66,.22)" />
                  <circle cx={p.x} cy={p.y} r={p.anchor ? 11 : 8} fill={p.anchor ? '#1A1A1A' : '#E54D42'} stroke="#fff" strokeWidth="2" />
                  <text x={p.x} y={labelY(p)} textAnchor="middle" fontFamily="STKaiti,KaiTi,serif" fontSize="13"
                    fill="#3A352F" fontWeight={p.anchor ? 700 : 400}>
                    {p.name.replace(/.*·\s*/, '')}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-500">
            <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-charcoal inline-block" /> 锚点 · 汪曾祺纪念馆</span>
            <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-vermilion inline-block" /> 美食打卡点（点击查看原文）</span>
            <span>🟢 高邮湖 · 野菜</span>
            <span>🟡 大运河</span>
          </div>

          {/* 点位卡片 */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gaoPoints.map((p, i) => (
              <button key={p.id} onClick={() => setSel(p)}
                className="text-left rounded-2xl border border-ink-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-vermilion">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-vermilion text-xs font-bold text-white">{i + 1}</span>
                  <h4 className="font-serif text-base font-bold text-charcoal">{p.name}</h4>
                </div>
                <div className="text-xs font-semibold text-[#B8923C] mb-1.5">{p.food}</div>
                <p className="text-xs text-ink-400">{p.spot}</p>
              </button>
            ))}
          </div>

          {/* 一日路线 */}
          <div id="route" className="mt-14">
            <div className="mb-5">
              <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">One-Day Route</span>
              <h2 className="xc-section-title mt-2">「跟着汪曾祺吃高邮」一日路线</h2>
            </div>
            <div className="flex overflow-x-auto pb-2">
              {gaoRoute.map((s, i) => (
                <div key={s.no} className="flex-1 min-w-[140px] text-center px-2 relative">
                  {i < gaoRoute.length - 1 && (
                    <span className="absolute top-5 left-1/2 w-full h-0.5 z-0"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg,#E54D42 0 6px,transparent 6px 12px)' }} />
                  )}
                  <div className="relative z-10 mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-full bg-vermilion font-serif text-base text-white ring-4 ring-white">{s.no}</div>
                  <h5 className="font-serif text-sm font-bold text-charcoal">{s.name}</h5>
                  <p className="text-xs text-ink-400 mt-0.5">{s.time} · {s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 弹窗 */}
      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center p-5" style={{ background: 'rgba(58,53,47,.5)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSel(null)}>
          <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-paper overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-6 pt-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">{sel.name}</h3>
                <div className="mt-1 text-xs font-semibold text-[#B8923C]">{sel.food}</div>
              </div>
              <button onClick={() => setSel(null)} className="text-2xl leading-none text-ink-400 hover:text-charcoal">×</button>
            </div>
            <div className="px-6 pb-6 mt-4">
              <p className="font-serif text-base leading-loose text-charcoal bg-white border-l-[3px] border-vermilion rounded-r-[10px] px-4 py-3">
                「{sel.quote}」
              </p>
              <p className="mt-3 text-sm text-ink-500">现代打卡点 · <b className="text-vermilion">{sel.spot}</b></p>
              <div className="mt-3 grid place-items-center aspect-video rounded-[10px] border border-dashed border-ink-200 text-xs text-ink-400"
                style={{ background: 'linear-gradient(135deg,#E8DBC0,#F1E8D5)' }}>
                📷 {sel.scene}（实景图占位）
              </div>
            </div>
          </div>
        </div>
      )}
    </RenjianShell>
  )
}
