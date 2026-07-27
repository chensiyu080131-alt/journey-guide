import Link from 'next/link'
import { RenjianShell } from '@/components/renjian/renjian-shell'
import { stages } from '@/lib/renjian-data'

export default function TimelinePage() {
  return (
    <RenjianShell>
      <section className="bg-paper">
        <div className="xc-container py-12">
          <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">方案 C · 人生轨迹版</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide text-charcoal">
            汪曾祺 · 用<span className="text-vermilion">食物</span>串起的一生
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-sm text-ink-500">
            五段人生，五段食物记忆。从高邮童年的咸鸭蛋，到北京定居的豆汁儿——吃什么，就是过什么日子。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="xc-container py-12 max-w-3xl">
          <div className="relative pl-14">
            <span className="absolute left-[18px] top-1 bottom-1 w-0.5"
              style={{ background: 'linear-gradient(#E54D42,#B8923C,#5B8C5A)' }} />
            {stages.map(s => (
              <div key={s.year} className="relative pb-9 last:pb-0">
                <span className="absolute -left-[36px] top-1 h-4 w-4 rounded-full bg-vermilion ring-4 ring-white shadow-[0_0_0_2px_#E54D42]" />
                <div className="font-serif text-lg tracking-wider text-vermilion">{s.year}</div>
                <h4 className="mt-1 font-serif text-xl font-bold text-charcoal">{s.title}</h4>
                <div className="mt-1 text-xs font-semibold text-[#B8923C]">{s.place}</div>
                <p className="mt-2 max-w-xl text-sm text-ink-500 leading-relaxed">{s.desc}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {s.foods.map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full border border-ink-100 bg-paper text-ink-500">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-ink-100 p-8 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(229,77,66,.08),rgba(184,146,60,.08))' }}>
            <h3 className="font-serif text-2xl font-bold text-charcoal">「四方食事，不过一碗人间烟火」</h3>
            <p className="mt-2 text-sm text-ink-500">从高邮到北京，汪曾祺用一生尝遍中国，也写尽中国。</p>
            <Link href="/renjian/gaoyou" className="xc-pill mt-5 inline-flex bg-charcoal text-white hover:bg-charcoal-50">回到高邮，从头逛起 →</Link>
          </div>
        </div>
      </section>
    </RenjianShell>
  )
}
