import Link from 'next/link'
import { RenjianShell } from '@/components/renjian/renjian-shell'
import { chapters } from '@/lib/renjian-data'

const entries = [
  { href: '/renjian/gaoyou', num: '方案 A · 推荐', title: '高邮单城深度版', desc: '汪曾祺的故乡,点位最密集。咸鸭蛋、炒米、蒲包肉……手绘地图 + 书中原文 + 一日美食路线。' },
  { href: '/renjian/map', num: '方案 B', title: '全国美食地图版', desc: '一本书走成一张中国地图,18 座城市按食物标注。用「五味」筛选——酸、甜、苦、辣、咸各有所归。' },
  { href: '/renjian/timeline', num: '方案 C', title: '人生轨迹版', desc: '汪曾祺五段人生,对应五段食物记忆:高邮童年、昆明联大、张家口下放、北京定居……吃出一生。' },
]

const stats = [
  { n: '4', s: '章节 · 四方食事' },
  { n: '30+', s: '篇美食散文' },
  { n: '9', s: '高邮可打卡点位' },
  { n: '18', s: '座城市 · 食物标注' },
]

export default function RenjianHome() {
  return (
    <RenjianShell>
      {/* 封面 */}
      <section className="bg-paper">
        <div className="xc-container py-14 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-[0.4em] text-vermilion uppercase">汪曾祺 · 美食散文集</span>
            <h1 className="mt-3 font-serif text-6xl sm:text-7xl font-bold tracking-wide text-charcoal">
              人间<span className="text-vermilion">滋味</span>
            </h1>
            <p className="mt-2 font-serif text-ink-400 tracking-[0.2em]">汪曾祺 著 · 四方食事，明心见性</p>
            <p className="mt-6 max-w-md font-serif text-base text-ink-500 leading-relaxed">
              四方食事，不过一碗人间烟火。跟着汪曾祺的笔触，从高邮的咸鸭蛋出发，把一本书走成一张可打卡的中国美食地图。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/renjian/gaoyou" className="xc-pill bg-charcoal text-white hover:bg-charcoal-50">跟着汪老吃高邮 →</Link>
              <Link href="/renjian/map" className="xc-pill border-2 border-ink-200 bg-white text-ink-700 hover:bg-ink-50">全国美食地图</Link>
            </div>
          </div>

          {/* 书本 */}
          <div className="relative mx-auto w-full max-w-[320px] aspect-[3/4.2] rounded-[6px_14px_14px_6px] p-10 pb-8 text-[#F4E6D8] flex flex-col"
            style={{ background: 'linear-gradient(135deg,#9c5454,#7d3c3c)', boxShadow: '0 24px 46px rgba(58,53,47,.18), inset 6px 0 0 rgba(0,0,0,.18)' }}>
            <div className="font-serif text-5xl leading-tight tracking-widest">人间<br />滋味</div>
            <div className="mt-3 font-serif text-sm tracking-widest opacity-80">安身之本 · 必资于食</div>
            <div className="absolute right-6 bottom-16 h-12 w-12 grid place-items-center rounded-lg border-2 border-white/50 font-serif text-2xl rotate-6">味</div>
            <div className="mt-auto font-serif text-2xl tracking-widest">汪曾祺</div>
          </div>
        </div>
      </section>

      {/* 数据 */}
      <section className="bg-white">
        <div className="xc-container py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-ink-100 border border-ink-100 rounded-2xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={i} className="p-6 text-center">
                <div className="font-serif text-3xl font-bold text-vermilion">{s.n}</div>
                <div className="mt-1 text-xs text-ink-400">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 三入口 */}
      <section className="bg-paper">
        <div className="xc-container py-14">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Three Ways to Explore</span>
            <h2 className="xc-section-title mt-2">三种打开方式</h2>
            <p className="xc-section-subtitle">单城深度 / 全国漫游 / 人生轨迹，选一种开始</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {entries.map(e => (
              <Link key={e.href} href={e.href} className="block rounded-2xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md hover:border-vermilion">
                <div className="font-serif text-sm tracking-widest text-vermilion">{e.num}</div>
                <h3 className="mt-2 font-serif text-xl font-bold text-charcoal">{e.title}</h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{e.desc}</p>
                <div className="mt-4 text-sm font-semibold text-vermilion">进入 →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 四章 */}
      <section className="bg-white">
        <div className="xc-container py-14">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-[0.3em] text-vermilion uppercase">Four Chapters</span>
            <h2 className="xc-section-title mt-2">全书四章 · 安身之本</h2>
            <p className="xc-section-subtitle">从食材本味到四方食事，层层递进</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {chapters.map(c => (
              <div key={c.no} className="rounded-2xl border border-ink-100 bg-paper p-6">
                <div className="font-serif text-4xl text-vermilion opacity-50 leading-none">{c.no}</div>
                <h4 className="mt-3 font-serif text-lg font-bold text-charcoal">{c.title}</h4>
                <div className="mt-1 text-xs font-semibold text-[#B8923C]">{c.theme}</div>
                <p className="mt-2 text-xs text-ink-400 leading-relaxed">{c.essays}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper">
        <div className="xc-container py-14">
          <div className="rounded-3xl border border-ink-100 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg,rgba(229,77,66,.08),rgba(184,146,60,.08))' }}>
            <div>
              <h3 className="font-serif text-2xl font-bold text-charcoal">「四方食事，不过一碗人间烟火」</h3>
              <p className="mt-2 text-sm text-ink-500">从一颗高邮咸鸭蛋开始，跟着汪曾祺吃遍中国。</p>
            </div>
            <Link href="/renjian/gaoyou" className="xc-pill bg-charcoal text-white hover:bg-charcoal-50 shrink-0">开始高邮之旅 →</Link>
          </div>
        </div>
      </section>
    </RenjianShell>
  )
}
