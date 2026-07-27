import Link from 'next/link'
import { YichengShell } from '@/components/yicheng/yicheng-shell'
import { Badge, Card } from '@/components/ui'
import { heritages, masters, toneBg, toneGrad } from '@/lib/yicheng-data'

export const metadata = {
  title: '遗承 · 虞山非遗手作 — 寻城',
  description: '常熟非遗传承手作体验平台:虞山琴派、白茆山歌、常熟花边、明式家具。在线预约工坊、AR手作教学、传承人直播。',
}

const stats = [
  { n: '4', l: '项 国家级·省级非遗' },
  { n: '11', l: '家 共建工坊' },
  { n: '6', l: '位 领衔传承人' },
  { n: '3阶', l: '小学/中学/高中任务' },
]

const steps = [
  { stage: '小学阶段', title: '非遗小侦探 · 基础认知', desc: '花边图案拼图游戏、古琴减字谱描红,完成"五感任务卡",领取电子研学徽章。' },
  { stage: '中学阶段', title: '跨学科探究 · 关联分析', desc: '"花边纹样与地理气候关联报告",融合历史、地理、美术,产出探究小论文。' },
  { stage: '高中阶段', title: '创新设计 · 推荐官认证', desc: '非遗创新设计工作坊,参与纹样再创作,可申报"小小非遗推荐官"并获得证书。' },
]

export default function YichengPage() {
  return (
    <YichengShell>
      {/* Hero */}
      <section className="bg-paper">
        <div className="xc-container py-16 sm:py-20">
          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
            <div className="animate-fade-in">
              <span className="inline-block text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">
                国家级 · 省级非遗 · 11 家共建工坊
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-wide text-charcoal">
                让<span className="text-vermilion">非遗</span>可触可感
                <br />千年技艺触手可及
              </h1>
              <p className="mt-6 max-w-xl text-base text-ink-500 leading-relaxed">
                整合虞山琴派、白茆山歌、常熟花边、明式家具等常熟非遗资源,在线预约工坊、AR 手作教学、传承人直播,打造"行走的非遗课堂"。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/yicheng/booking" className="xc-pill bg-charcoal text-white hover:bg-charcoal-50">
                  预约非遗工坊 →
                </Link>
                <Link href="/yicheng/ar" className="xc-pill border-2 border-ink-200 bg-white text-ink-700 hover:bg-ink-50">
                  体验 AR 教学
                </Link>
              </div>
            </div>

            {/* 印章拼贴卡 */}
            <div className="relative aspect-[4/3.4] rounded-3xl border border-ink-200 bg-gradient-to-br from-ink-50 to-paper shadow-xl overflow-hidden">
              <div className={`absolute left-[10%] top-[8%] h-[40%] w-[30%] rounded-2xl grid place-items-center font-serif text-7xl text-white shadow-lg bg-vermilion`}>琴</div>
              <div className={`absolute right-[9%] top-[14%] h-[30%] w-[30%] rounded-2xl grid place-items-center font-serif text-5xl text-white shadow-lg bg-charcoal`}>歌</div>
              <div className={`absolute left-[26%] bottom-[9%] h-[36%] w-[34%] rounded-2xl grid place-items-center font-serif text-5xl text-white shadow-lg bg-jade`}>边</div>
              <div className={`absolute right-[10%] bottom-[12%] h-[26%] w-[22%] rounded-2xl grid place-items-center font-serif text-3xl shadow-lg bg-xuncheng-500 text-white`}>具</div>
              <div className="absolute inset-x-0 bottom-0 bg-charcoal/80 px-5 py-2.5 text-xs tracking-wide text-white backdrop-blur">
                非遗传承 · 手作体验平台 · 常熟先行落地
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 数据条 */}
      <section className="bg-white border-y border-ink-100">
        <div className="xc-container py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-ink-100">
            {stats.map(s => (
              <div key={s.l} className="px-4 py-6 text-center">
                <div className="font-serif text-3xl font-bold text-vermilion">{s.n}</div>
                <div className="mt-1 text-xs text-ink-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 四大非遗 */}
      <section className="bg-white">
        <div className="xc-container py-16">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Four Heritages</span>
            <h2 className="xc-section-title mt-2">四大非遗 · 一站体验</h2>
            <p className="xc-section-subtitle">国家级与省级非遗资源,具名传承人领衔授课</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {heritages.map(h => (
              <Card key={h.id} className="p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-xl font-serif text-3xl font-bold text-white ${toneBg[h.tone]}`}>
                    {h.char}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">{h.title}</h3>
                    <Badge variant={h.level === '国家级' ? '美食' : '自然'} className="mt-1">
                      {h.level}非遗
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-ink-500 leading-relaxed flex-1">{h.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-xuncheng-600">▶ {h.activity}</span>
                  <Link href={h.href} className="text-sm font-medium text-vermilion hover:underline">
                    {h.id === 'guqin' ? 'AR 教学 →' : '预约 →'}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 三阶任务 */}
      <section className="bg-paper">
        <div className="xc-container py-16">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Three-Stage Tasks</span>
            <h2 className="xc-section-title mt-2">三阶任务模型 · 全年龄可参与</h2>
            <p className="xc-section-subtitle">按年龄分层设计任务梯度,从认知到创新,层层递进</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.stage} className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-6">
                <div className="font-serif text-xl text-vermilion">{s.stage}</div>
                <h4 className="mt-1 font-serif text-lg font-bold text-charcoal">{s.title}</h4>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 传承人 */}
      <section className="bg-white">
        <div className="xc-container py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Masters</span>
              <h2 className="xc-section-title mt-2">传承人领衔 · 名师亲授</h2>
            </div>
            <Link href="/yicheng/community" className="text-sm text-ink-500 hover:text-vermilion">
              传承人直播预告 →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {masters.map(m => (
              <Card key={m.id} className="p-6 flex items-center gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-2xl font-bold text-white bg-gradient-to-br ${toneGrad[m.tone]}`}>
                  {m.initial}
                </span>
                <div>
                  <h4 className="font-serif text-base font-bold text-charcoal">
                    {m.name} <span className="text-xs font-medium text-xuncheng-600">· {m.role}</span>
                  </h4>
                  <p className="mt-1 text-sm text-ink-400 leading-relaxed">{m.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper">
        <div className="xc-container py-16">
          <div className="rounded-3xl border border-ink-200 bg-gradient-to-br from-vermilion/10 to-jade/10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-charcoal">成为「小小非遗推荐官」</h3>
              <p className="mt-2 text-sm text-ink-500">完成三阶任务,获得区块链存证的电子研学证书,作品可入选"虞韵新生"线上展览。</p>
            </div>
            <Link href="/yicheng/booking" className="xc-pill bg-charcoal text-white hover:bg-charcoal-50 shrink-0">
              立即预约工坊 →
            </Link>
          </div>
        </div>
      </section>
    </YichengShell>
  )
}
