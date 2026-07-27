'use client'

import { useState } from 'react'
import { YichengShell } from '@/components/yicheng/yicheng-shell'
import { Button } from '@/components/ui'

const guanzi = [
  { ch: '散', num: '① 勾' },
  { ch: '挑', num: '② 七弦' },
  { ch: '抹', num: '③ 六弦' },
  { ch: '勾', num: '④ 五弦' },
]

const stages = [
  { stage: '识 · 减字谱', title: 'AR 字符解析', desc: '扫描减字谱字符,即时弹出指法、弦位、徽分的拆解动画与释义。' },
  { stage: '仿 · 指法', title: '三维指法演示', desc: '3D 手型演示勾、挑、抹、剔等指法,可调速、可旋转视角对照模仿。' },
  { stage: '奏 · 成曲', title: '跟弹《流水》', desc: '逐句跟弹并实时音准反馈,完成《流水》前奏即可解锁研学徽章。' },
]

export default function ArPage() {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)

  const start = () => {
    setStarted(true)
    setProgress(0)
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 60) { clearInterval(t); return 60 }
        return p + 2
      })
    }, 40)
  }

  return (
    <YichengShell>
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">AR Handcraft Learning</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">虞山琴派 · 古琴 AR 教学</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-500">
            手机扫描减字谱实物,即可触发历史场景还原与指法三维演示。<b className="text-vermilion">新手掌握《流水》前奏的时间可缩短 60%</b>。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12 grid lg:grid-cols-[1.3fr_.9fr] gap-8 items-start">
          {/* AR 舞台(占位) */}
          <div>
            <div className="relative grid place-items-center min-h-[420px] overflow-hidden rounded-3xl border border-ink-200 text-center text-white"
              style={{
                background:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 14px, transparent 14px 28px), linear-gradient(160deg, #1A1A1A, #3D3733)',
              }}
            >
              <span className="absolute left-4 top-4 rounded-full bg-vermilion/90 px-3 py-1 text-xs tracking-wide text-white">AR · 演示占位</span>
              <div className="text-center">
                <div className="mx-auto mb-5 grid h-[150px] w-[150px] place-items-center rounded-full border-2 border-dashed border-white/50"
                  style={{ animation: 'yc-spin 14s linear infinite' }}
                >
                  <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-vermilion font-serif text-3xl text-white">
                    {started ? '琴' : '▶'}
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold">{started ? 'AR 已启动 · 古琴教学' : '扫描实物 · 开启 AR'}</h3>
                <p className="mt-2 text-sm text-white/70">
                  {started ? '将手机对准减字谱实物,即可看到指法三维演示(原型演示占位)' : '将手机对准古琴 / 减字谱,触发指法三维演示'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={start} disabled={started} className="rounded-full">
                {started ? '演示中…' : '▶ 开启 AR 教学'}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => { window.location.href = '/yicheng/booking' }}>
                到工坊实地体验
              </Button>
            </div>
            <p className="mt-4 text-xs text-ink-400">⚠ 原型演示:AR 与三维渲染为占位效果,正式版将基于 WebXR / 小程序原生 AR 实现。</p>
          </div>

          {/* 进度 + 减字谱 */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-charcoal">《流水》前奏 · 学习进度</h3>
              <p className="mt-1 text-xs text-ink-400">已完成 3 / 5 个指法节点</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-gradient-to-r from-vermilion to-xuncheng-400 transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink-400"><span>减字谱识读</span><span>{progress}%</span></div>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-charcoal">减字谱 · 动态解析</h3>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {guanzi.map((g, i) => (
                  <div key={i} className="relative grid aspect-square place-items-center rounded-xl border border-ink-200 bg-paper">
                    <span className="font-serif text-3xl text-charcoal">{g.ch}</span>
                    <span className="absolute bottom-1.5 right-2 text-[10px] text-ink-400">{g.num}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-400">点击 AR 启动后,每个字符将展示对应的指法三维演示与音频。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 三阶 */}
      <section className="bg-paper">
        <div className="xc-container py-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">AR in Three Stages</span>
            <h2 className="xc-section-title mt-2">AR 教学如何分层</h2>
            <p className="xc-section-subtitle">从识读、模仿到完整演奏,AR 辅助贯穿始终</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {stages.map(s => (
              <div key={s.stage} className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-6">
                <div className="font-serif text-xl text-vermilion">{s.stage}</div>
                <h4 className="mt-1 font-serif text-lg font-bold text-charcoal">{s.title}</h4>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`@keyframes yc-spin{to{transform:rotate(360deg)}}`}</style>
    </YichengShell>
  )
}
