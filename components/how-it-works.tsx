const steps = [
  {
    num: '01',
    title: '选入口',
    desc: '选一本书、一个人，或直接搜一座城。三条常熟路线开箱即用，任意县城可 AI 生成。',
  },
  {
    num: '02',
    title: '读原文',
    desc: '每个景点都有书中原文和实景对照——阿庆嫂的茶馆、曾朴笔下的园子，文字照进现实。',
  },
  {
    num: '03',
    title: '看路线',
    desc: '高德地图标记 + 时段排序，知道上午去哪、中午吃什么、下午逛什么。',
  },
  {
    num: '04',
    title: '出发',
    desc: '方言速查、在地体验、旅行贴士一应俱全。跟着书本，说走就走。',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-28 bg-white">
      <div className="xc-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* 左侧标题 */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xuncheng-500 text-sm font-medium tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="xc-section-title">
              四步<br />跟着书走
            </h2>
            <p className="xc-section-subtitle !mx-0 mt-4 text-left">
              从选书到出发，寻城帮你把文学变成可落地的旅行路线。
            </p>
          </div>

          {/* 右侧步骤 */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {steps.map(step => (
              <div key={step.num} className="group">
                <span className="text-5xl font-serif font-bold text-ink-100 group-hover:text-xuncheng-200 transition-colors">
                  {step.num}
                </span>
                <h3 className="mt-4 text-lg font-bold text-charcoal">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 顶部流程条 */}
        <div className="mt-16 hidden sm:flex items-center justify-center gap-4 text-sm text-ink-400">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center gap-4">
              <span className={i === 0 ? 'text-charcoal font-medium' : ''}>{step.title}</span>
              {i < steps.length - 1 && <span className="text-ink-200">+</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
