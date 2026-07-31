import Link from 'next/link'
import { getDemoRoutes } from '@/lib/demo-carousel-data'
import {
  CarouselCoverflow,
  CarouselPeek,
  CarouselQuoteFade,
  CarouselSnapRail,
} from '@/components/demo/carousel-variants'

export const metadata = {
  title: '轮播方案 Demo · 寻迹',
  description: '首页卡片轮播候选方案对比，请选择后再落地到首页',
}

const VARIANTS = [
  {
    id: 'A',
    name: '杂志 Peek',
    inspiration: 'Vogue / 编辑站 Minimal Hero',
    blurb:
      '主卡占大半，右侧露出下一篇边。像翻杂志时看见下一页——不抢戏，但明确「还有更多」。适合首页左右分栏的右侧位。',
  },
  {
    id: 'B',
    name: 'Coverflow 立体',
    inspiration: 'Apple / 精品电商',
    blurb:
      '中间放大、两侧透视缩小。仪式感强，适合「选一本」的仪式时刻；动效稍重，移动端需注意性能。',
  },
  {
    id: 'C',
    name: '引文焦点淡入',
    inspiration: '杂志 Pull Quote / 品牌故事',
    blurb:
      '金句最大、几乎无卡片堆叠。最克制、最「文学」。适合强调原文气质；信息密度最低。',
  },
  {
    id: 'D',
    name: '横向 Snap 轨道',
    inspiration: 'Airbnb / 内容发现站',
    blurb:
      '可拖拽横向滑动，一屏多卡。发现效率最高；更像「浏览书架」，不像「一张海报」。',
  },
] as const

export default function CarouselDemoPage() {
  const routes = getDemoRoutes()

  return (
    <main className="min-h-screen bg-[#F9F6F1] text-[#3D2E2E]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B4545] font-serif">
              Demo · Do not ship yet
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-wide">
              卡片轮播 · 四套候选
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[#8A7A72] leading-relaxed">
              参考了高端编辑站（杂志 Peek）、Apple 式 Coverflow、Pull Quote 淡入、以及横向 Snap
              轨道。数据用库内真实路线。看完直接回复
              <strong className="text-[#8B4545] font-medium"> A / B / C / D </strong>
              （或组合），我再改首页。
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-[#8B4545] font-serif border border-[#8B4545]/40 rounded-lg px-4 py-2 hover:bg-[#8B4545] hover:text-white transition-colors"
          >
            ← 回首页
          </Link>
        </div>

        <div className="mt-12 space-y-16">
          {VARIANTS.map(v => (
            <section
              key={v.id}
              id={`demo-${v.id}`}
              className="scroll-mt-8 border-t border-[#E8E0D6] pt-10"
            >
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-[#8B4545] text-white font-serif text-sm">
                  {v.id}
                </span>
                <h2 className="font-serif text-2xl font-bold">{v.name}</h2>
                <span className="text-xs text-[#8A7A72]">灵感：{v.inspiration}</span>
              </div>
              <p className="mb-6 max-w-2xl text-sm text-[#8A7A72] leading-relaxed">{v.blurb}</p>

              {v.id === 'A' && <CarouselPeek routes={routes} />}
              {v.id === 'B' && <CarouselCoverflow routes={routes} />}
              {v.id === 'C' && <CarouselQuoteFade routes={routes} />}
              {v.id === 'D' && <CarouselSnapRail routes={routes} />}
            </section>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-[#E8E0D6] text-sm text-[#8A7A72]">
          <p className="font-serif text-[#3D2E2E]">拍板方式</p>
          <p className="mt-2 leading-relaxed">
            回复例如：「用 A」「B 的动效 + C 的大字」「D 但放首页右侧缩小版」。首页在你选定前不会改轮播。
          </p>
        </footer>
      </div>
    </main>
  )
}
