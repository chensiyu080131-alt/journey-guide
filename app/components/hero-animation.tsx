'use client'

/**
 * 寻迹首页首屏动效（原型 prototypes/hero-animation 的 Next.js 迁移版）
 * - 纯 CSS animation + SVG 滤镜 + 原生 JS（useEffect），零新增 npm 依赖
 * - 配色对齐品牌 token：paper #F7F3EB / ink #3D2E2E / wine #8B4545（见 tailwind.config）
 * - 全部样式 scope 在 .xunji-hero 下，不污染全局 Tailwind
 * - 渐进增强：禁用 JS 时标题(SMIL)/副标题/按钮/数字均可见，不白屏
 * - 动效不阻断交互：导航与按钮始终可点（动画仅作用于 transform/opacity）
 */
import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface HeroRoute {
  slug: string
  cat: string
  title: string
  city: string
  desc: string
  spots: string
  motif: 0 | 1 | 2 | 3
}

const ROUTES: HeroRoute[] = [
  {
    slug: 'yangzhou-wangzengqi-zaocha',
    cat: '书籍 · 汪曾祺《人间滋味》',
    title: '茶汽升腾的人间',
    city: '扬州 · 前门早茶',
    desc: '从富春的题字到东关街的市声，用一顿早茶走完汪老笔下的扬州烟火。',
    spots: '5 个点位 · 约半日',
    motif: 0,
  },
  {
    slug: 'suzhou-hanshansi-fengqiao',
    cat: '书籍 · 张继《枫桥夜泊》',
    title: '夜半钟声到客船',
    city: '苏州 · 寒山寺',
    desc: '一首二十八字的小诗，让城外的寺院响了千年。沿姑苏水路寻那夜钟声。',
    spots: '5 个点位 · 约半日',
    motif: 1,
  },
  {
    slug: 'hangzhou-sudi-sushi',
    cat: '书籍 · 苏轼《饮湖上初晴后雨》',
    title: '淡妆浓抹总相宜',
    city: '杭州 · 西湖苏堤',
    desc: '他疏浚西湖筑起长堤，又把西湖写成了西子。走一遍晴雨皆宜的湖山。',
    spots: '5 个点位 · 约一日',
    motif: 2,
  },
  {
    slug: 'nanjing-qinhuaihe-zhuziqing',
    cat: '书籍 · 朱自清《桨声灯影里的秦淮河》',
    title: '桨声灯影里的河',
    city: '南京 · 秦淮河',
    desc: '1923 年夏夜的画舫，从夫子庙到桃叶渡，走一段民国文人的秦淮。',
    spots: '5 个点位 · 约半日',
    motif: 3,
  },
]

export function HeroAnimation() {
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const motifRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const walkerRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 副标题逐字
    if (subtitleRef.current) {
      const el = subtitleRef.current
      const text = el.textContent || ''
      el.textContent = ''
      Array.from(text).forEach((ch, i) => {
        const s = document.createElement('span')
        s.className = 'xh-ch' + (ch === '·' ? ' xh-dot' : '')
        s.textContent = ch === ' ' ? '\u00A0' : ch
        s.style.setProperty('--i', String(i))
        el.appendChild(s)
      })
    }

    const deck = deckRef.current
    const nav = navRef.current
    const motif = motifRef.current
    const trail = trailRef.current
    const walker = walkerRef.current

    let deckTimer: ReturnType<typeof setInterval> | null = null
    let deckStart = 0
    let raf = 0
    let walkerStart = 0
    let rafStart: number | null = null

    // 卡组：景深层叠 + 低频游移
    if (deck) {
      const cards = Array.from(deck.querySelectorAll<HTMLElement>('.xh-card'))
      const dots = nav ? Array.from(nav.querySelectorAll<HTMLButtonElement>('button')) : []
      const motifs = motif ? Array.from(motif.querySelectorAll<HTMLElement>('.xh-motif')) : []
      const N = cards.length
      let current = 0
      const cls = ['xh-pos-0', 'xh-pos-1', 'xh-pos-2', 'xh-pos-3', 'xh-pos-out']

      const layout = () => {
        cards.forEach((c, i) => {
          const rel = (i - current + N) % N
          c.classList.remove(...cls)
          if (rel === 0) c.classList.add('xh-pos-0')
          else if (rel === 1) c.classList.add('xh-pos-1')
          else if (rel === 2) c.classList.add('xh-pos-2')
          else if (rel === N - 1) c.classList.add('xh-pos-out')
          else c.classList.add('xh-pos-3')
        })
        dots.forEach((d, i) => d.classList.toggle('xh-on', i === current))
        motifs.forEach((m, i) => m.classList.toggle('xh-active', i === current))
      }
      const goTo = (i: number) => { current = (i + N) % N; layout() }
      const resetTimer = () => {
        if (deckTimer) clearInterval(deckTimer)
        if (reduced) return
        deckTimer = setInterval(() => goTo(current + 1), 8000)
      }

      layout()
      if (!reduced) {
        cards.forEach((c, i) => {
          c.classList.add('xh-enter')
          window.setTimeout(() => c.classList.remove('xh-enter'), 2600 + i * 260)
        })
      }
      cards.forEach((c, i) => {
        c.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('a')) return
          if (i !== current) { goTo(i); resetTimer() }
        })
      })
      dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetTimer() }))
      deckStart = window.setTimeout(resetTimer, 4200)
    }

    // 小圆点沿路径缓行（低频循环）
    if (trail && walker && !reduced) {
      const L = trail.getTotalLength()
      const DUR = 9000
      const tick = (t: number) => {
        if (rafStart === null) rafStart = t
        const p = ((t - rafStart) % (DUR + 3000)) / DUR
        if (p > 1) {
          walker.style.opacity = '0'
        } else {
          walker.style.opacity = p < 0.05 ? String(p * 17) : '0.85'
          const pt = trail.getPointAtLength(Math.min(p, 1) * L)
          walker.setAttribute('cx', String(pt.x))
          walker.setAttribute('cy', String(pt.y))
        }
        raf = requestAnimationFrame(tick)
      }
      walkerStart = window.setTimeout(() => { raf = requestAnimationFrame(tick) }, 6600)
    }

    return () => {
      if (deckTimer) clearInterval(deckTimer)
      if (deckStart) clearTimeout(deckStart)
      if (walkerStart) clearTimeout(walkerStart)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <style>{heroStyles}</style>
      <section className="xunji-hero xh-wrap" aria-label="寻迹首屏">
        <div className="xh-grain" />
        <div className="xh-vignette" />
        <div className="xh-light" />
        <div className="xh-ambient" />

        <div className="xh-stage">
          {/* 左：标题 */}
          <div className="xh-headline">
            <div className="xh-motto">有迹可循 · 寻迹而至</div>

            <div className="xh-title-row">
              <div className="xh-title-wrap">
                <svg className="xh-title" viewBox="0 0 420 190" aria-label="寻迹">
                  <defs>
                    <filter id="xhInkEdge" x="-30%" y="-30%" width="160%" height="160%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="11" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="22" />
                    </filter>
                    <filter id="xhInkBleed" x="-10%" y="-10%" width="120%" height="120%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="4" result="t" />
                      <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" />
                    </filter>
                    <mask id="xhM1">
                      <circle cx="105" cy="98" r="0" fill="#fff" filter="url(#xhInkEdge)">
                        <animate attributeName="r" from="0" to="118" begin="0.9s" dur="1.15s"
                          calcMode="spline" keySplines="0.25 0.6 0.3 1" fill="freeze" />
                      </circle>
                    </mask>
                    <mask id="xhM2">
                      <circle cx="290" cy="98" r="0" fill="#fff" filter="url(#xhInkEdge)">
                        <animate attributeName="r" from="0" to="118" begin="1.55s" dur="1.15s"
                          calcMode="spline" keySplines="0.25 0.6 0.3 1" fill="freeze" />
                      </circle>
                    </mask>
                  </defs>
                  <g filter="url(#xhInkBleed)">
                    <text x="30" y="150" mask="url(#xhM1)">寻</text>
                    <text x="215" y="150" mask="url(#xhM2)">迹</text>
                  </g>
                </svg>
              </div>
              <div className="xh-seal" aria-hidden="true"><span>寻<br/>迹</span></div>
            </div>

            <p className="xh-sub" ref={subtitleRef}>书籍 · 游戏 · 音乐 —— 跟着文化载体去旅行</p>

            <div className="xh-quote">
              <p className="xh-quote-t">「他沿着河沿走过三座桥，<em>在城门下停了一会儿</em>。」—— 而你，可以真的走到那里。</p>
              <svg className="xh-path" viewBox="0 0 340 64" preserveAspectRatio="xMidYMid meet">
                <path className="xh-trail" ref={trailRef}
                  d="M2,10 C60,10 70,44 128,44 S 210,18 258,26 S 320,50 330,50" />
                <circle className="xh-walker" ref={walkerRef} r="3.2" />
                <g className="xh-pin" transform="translate(330,50)">
                  <circle r="4.5" fill="none" stroke="#8B4545" strokeWidth="1" />
                  <circle r="1.6" fill="#8B4545" />
                </g>
              </svg>
            </div>

            <div className="xh-actions">
              <Link href="/routes/" className="xh-btn xh-btn-primary">
                <span className="xh-blot" />
                开始寻迹 <span className="xh-arrow">→</span>
                <span className="xh-underline" />
              </Link>
              <Link href="/route/yangzhou-wangzengqi-zaocha/" className="xh-btn">
                <span className="xh-blot" />
                进入路线 <span className="xh-arrow">→</span>
                <span className="xh-underline" />
              </Link>
            </div>

            <div className="xh-stats">
              <div className="xh-stat"><div className="xh-num">6</div><div className="xh-label">座城市</div><div className="xh-rule" /></div>
              <div className="xh-stat"><div className="xh-num">7</div><div className="xh-label">条文学路线</div><div className="xh-rule" /></div>
              <div className="xh-stat"><div className="xh-num">35<sup>+</sup></div><div className="xh-label">文化点位</div><div className="xh-rule" /></div>
            </div>
          </div>

          {/* 右：路线卡组 */}
          <div className="xh-deckwrap">
            <div className="xh-motiflayer" ref={motifRef}>
              <div className="xh-motif" data-motif="0">
                <svg viewBox="0 0 400 400"><g className="xh-steam" transform="translate(70,120)">
                  <path d="M0,180 C 14,150 -12,128 4,100 C 18,76 -6,58 6,34" />
                  <path d="M40,190 C 52,162 30,140 46,112 C 60,88 38,68 50,44" transform="translate(140,-10)" />
                  <path d="M20,185 C 32,158 12,136 26,110 C 40,86 20,66 32,40" transform="translate(255,15)" />
                </g></svg>
              </div>
              <div className="xh-motif" data-motif="1">
                <svg viewBox="0 0 400 400"><g className="xh-lattice" stroke="#7A6A5A" strokeWidth="1" fill="none" opacity="0.45">
                  <circle cx="200" cy="190" r="130" />
                  <path d="M200,60 V320 M70,190 H330 M112,98 L288,282 M288,98 L112,282" />
                  <circle cx="200" cy="190" r="62" />
                </g></svg>
              </div>
              <div className="xh-motif" data-motif="2">
                <svg viewBox="0 0 400 400"><g className="xh-beam">
                  <polygon points="120,30 190,30 260,370 110,370" fill="#C8B98F" opacity="0.18" />
                  <polygon points="220,30 258,30 330,370 250,370" fill="#C8B98F" opacity="0.12" />
                </g></svg>
              </div>
              <div className="xh-motif" data-motif="3">
                <svg viewBox="0 0 400 400">
                  <path className="xh-miniroute" d="M40,320 C 110,300 90,220 160,210 S 250,250 290,190 S 330,90 360,70" />
                  <circle cx="40" cy="320" r="3" fill="#8B4545" opacity="0.5" />
                  <circle cx="360" cy="70" r="3" fill="#8B4545" opacity="0.5" />
                </svg>
              </div>
            </div>

            <div className="xh-deck" ref={deckRef}>
              {ROUTES.map((r) => (
                <article className="xh-card" key={r.slug}>
                  <div className="xh-cat">{r.cat}</div>
                  <h3>{r.title}</h3>
                  <div className="xh-city">{r.city}</div>
                  <p className="xh-desc">{r.desc}</p>
                  <div className="xh-foot">
                    <span className="xh-spots">{r.spots}</span>
                    <Link href={`/route/${r.slug}/`} className="xh-go">进入路线 <span className="xh-arrow">→</span></Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="xh-decknav" ref={navRef}>
              {ROUTES.map((_, i) => (
                <button key={i} aria-label={`第${i + 1}条路线`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const heroStyles = `
.xunji-hero{position:relative;overflow:hidden;background:#F7F3EB;color:#3D2E2E;border-radius:20px;margin:8px 0 4px;}
.xh-grain{position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.41 0 0 0 0 0.34 0 0 0 0.055 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");}
.xh-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 40%,transparent 55%,#d8ccb43d 100%),radial-gradient(60% 45% at 100% 0%,#cbbfa62e,transparent 70%);}
.xh-light{position:absolute;inset:-20%;pointer-events:none;background:linear-gradient(105deg,transparent 38%,#fffdf3cc 47%,#fff9e8e6 50%,#fffdf3cc 53%,transparent 62%);filter:blur(14px);transform:translateX(-90%);opacity:0;animation:xhSweep 3s cubic-bezier(.33,.12,.22,1) .15s forwards;}
@keyframes xhSweep{0%{opacity:0;transform:translateX(-90%);}18%{opacity:.9;}82%{opacity:.55;}100%{opacity:0;transform:translateX(90%);}}
.xh-ambient{position:absolute;inset:0;pointer-events:none;background:radial-gradient(55% 42% at 68% 22%,#fffbee80,transparent 70%);opacity:0;animation:xhAmbient 22s ease-in-out 3.4s infinite;}
@keyframes xhAmbient{0%,100%{opacity:.25;}50%{opacity:.6;}}
.xh-stage{position:relative;z-index:2;display:grid;grid-template-columns:minmax(380px,46%) 1fr;align-items:center;gap:40px;padding:40px 48px 36px;min-height:560px;}
.xh-headline{position:relative;min-width:0;}
.xh-motto{display:block;font-size:.74rem;letter-spacing:.45em;color:#8A7A7280;opacity:0;animation:xhIn 1.6s ease 2.9s forwards;font-family:'Noto Serif SC','STSong',serif;margin-bottom:10px;}
.xh-title-row{display:flex;align-items:flex-end;gap:14px;flex-wrap:nowrap;}
.xh-title-wrap{flex:0 1 auto;width:300px;max-width:78%;overflow:hidden;line-height:0;border-radius:6px;}
.xh-title{display:block;width:100%;height:auto;overflow:hidden;}
.xh-title text{font-family:'Kaiti SC','STKaiti','KaiTi','DFKai-SB',serif;font-size:150px;fill:#3D2E2E;}
.xh-seal{flex:0 0 auto;width:46px;height:46px;display:grid;place-items:center;border-radius:7px;background:#8B4545;opacity:0;transform:scale(.7) rotate(-8deg);animation:xhSeal 1s cubic-bezier(.2,1.4,.4,1) 2.5s forwards;box-shadow:0 3px 10px #8B454533;}
.xh-seal span{color:#F7F3EB;font-family:'Kaiti SC','STKaiti','KaiTi',serif;font-size:16px;font-weight:700;line-height:1.1;text-align:center;}
@keyframes xhSeal{0%{opacity:0;transform:scale(.7) rotate(-8deg);}55%{opacity:1;transform:scale(1.06) rotate(-3.5deg);}100%{opacity:.92;transform:scale(1) rotate(-4deg);}}
.xh-sub{margin-top:22px;font-size:1.02rem;color:#8A7A72;letter-spacing:.14em;line-height:2;font-family:'Noto Serif SC','STSong',serif;}
.xh-sub .xh-ch{display:inline-block;opacity:0;transform:translateY(8px);animation:xhRise .9s cubic-bezier(.2,.7,.3,1) forwards;animation-delay:calc(1.9s + var(--i) * 0.055s);}
@keyframes xhRise{to{opacity:1;transform:translateY(0);}}
.xh-sub .xh-dot{color:#8B4545;}
.xh-quote{margin-top:34px;opacity:0;animation:xhIn 1.6s ease 3s forwards;}
.xh-quote-t{font-size:.86rem;color:#8A7A72;letter-spacing:.08em;font-family:'Noto Serif SC','STSong',serif;}
.xh-quote-t em{font-style:normal;border-bottom:1px solid #8B454533;padding-bottom:2px;color:#3D2E2E;}
.xh-path{display:block;margin-top:6px;overflow:visible;width:320px;max-width:100%;height:60px;}
.xh-trail{fill:none;stroke:#8B4545;stroke-width:1.1;opacity:.7;stroke-dasharray:420;stroke-dashoffset:420;animation:xhDraw 3.2s cubic-bezier(.3,.2,.2,1) 3.3s forwards;}
@keyframes xhDraw{to{stroke-dashoffset:0;}}
.xh-walker{fill:#8B4545;opacity:0;}
.xh-pin{opacity:0;animation:xhIn 1s ease 6.4s forwards;}
.xh-actions{margin-top:32px;display:flex;gap:18px;align-items:center;opacity:0;animation:xhIn 1.4s ease 3.2s forwards;flex-wrap:wrap;}
.xh-btn{position:relative;overflow:hidden;font-family:'Noto Serif SC','STSong',serif;font-size:.92rem;letter-spacing:.22em;padding:13px 30px 13px 34px;cursor:pointer;border:1px solid #8A7A72;background:transparent;color:#3D2E2E;text-decoration:none;transition:color .6s,border-color .6s;display:inline-flex;align-items:center;gap:10px;border-radius:2px;}
.xh-blot{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 18% 55%,#3D2E2E14 0%,#3D2E2E09 42%,transparent 68%);transform:scale(0);transform-origin:18% 55%;transition:transform 1.1s cubic-bezier(.22,.7,.3,1);border-radius:50%;}
.xh-btn:hover .xh-blot{transform:scale(3.2);border-radius:0;}
.xh-arrow{display:inline-block;transition:transform .7s cubic-bezier(.25,.8,.3,1);}
.xh-btn:hover .xh-arrow{transform:translateX(7px);}
.xh-btn-primary{border-color:#8B4545;color:#8B4545;}
.xh-btn-primary .xh-blot{background:radial-gradient(circle at 18% 55%,#8B454518 0%,#8B45450d 42%,transparent 68%);}
.xh-underline{position:absolute;left:34px;bottom:8px;height:1px;width:0;background:currentColor;opacity:.55;transition:width .7s cubic-bezier(.25,.8,.3,1);}
.xh-btn:hover .xh-underline{width:calc(100% - 68px);}
.xh-stats{margin-top:38px;display:flex;gap:46px;flex-wrap:wrap;}
.xh-stat{opacity:0;transform:translateY(10px);animation:xhRise 1.2s cubic-bezier(.2,.7,.3,1) forwards;}
.xh-stat:nth-child(1){animation-delay:3.4s;}
.xh-stat:nth-child(2){animation-delay:3.6s;}
.xh-stat:nth-child(3){animation-delay:3.8s;}
.xh-num{font-size:1.8rem;color:#3D2E2E;letter-spacing:.05em;font-family:'Kaiti SC','STKaiti','KaiTi',serif;}
.xh-num sup{font-size:.85rem;color:#8B4545;margin-left:2px;}
.xh-label{margin-top:4px;font-size:.78rem;color:#8A7A7280;letter-spacing:.28em;}
.xh-rule{width:22px;height:1px;background:#D1CDC4;margin-top:8px;}
.xh-deckwrap{position:relative;height:500px;display:flex;align-items:center;}
.xh-motiflayer{position:absolute;inset:-30px -10px;z-index:0;pointer-events:none;}
.xh-motif{position:absolute;inset:0;opacity:0;transition:opacity 2.4s ease;display:flex;align-items:center;justify-content:center;}
.xh-motif.xh-active{opacity:1;}
.xh-motif svg{width:84%;height:84%;overflow:visible;}
.xh-steam path{fill:none;stroke:#7A6A5A;stroke-width:1.6;stroke-linecap:round;opacity:0;}
.xh-motif.xh-active .xh-steam path{animation:xhSteam 9s ease-in-out infinite;}
.xh-motif.xh-active .xh-steam path:nth-child(2){animation-delay:3s;}
.xh-motif.xh-active .xh-steam path:nth-child(3){animation-delay:6s;}
@keyframes xhSteam{0%{opacity:0;transform:translateY(14px);}25%{opacity:.35;}70%{opacity:.15;}100%{opacity:0;transform:translateY(-26px);}}
.xh-lattice{opacity:.5;}
.xh-motif.xh-active .xh-lattice{animation:xhLattice 26s ease-in-out infinite alternate;}
@keyframes xhLattice{from{transform:translateX(-8px) skewX(-1deg);opacity:.35;}to{transform:translateX(8px) skewX(1deg);opacity:.55;}}
.xh-beam{opacity:.4;}
.xh-motif.xh-active .xh-beam{animation:xhBeam 18s ease-in-out infinite alternate;}
@keyframes xhBeam{from{opacity:.28;transform:translateX(-6px);}to{opacity:.5;transform:translateX(6px);}}
.xh-miniroute{fill:none;stroke:#8B4545;stroke-width:1.2;opacity:.45;stroke-dasharray:6 7;}
.xh-motif.xh-active .xh-miniroute{animation:xhRoute 30s linear infinite;}
@keyframes xhRoute{to{stroke-dashoffset:-260;}}
.xh-deck{position:relative;z-index:1;width:100%;height:460px;perspective:1200px;}
.xh-card{position:absolute;top:50%;left:50%;width:300px;height:420px;margin:-210px 0 0 -150px;background:linear-gradient(168deg,#fbf7ee,#f3ecdd);border:1px solid #dcd2bd;box-shadow:0 18px 50px -22px #5c503a3d,0 2px 8px #5c503a14;padding:30px 26px;display:flex;flex-direction:column;transition:transform 1.5s cubic-bezier(.3,.1,.18,1),opacity 1.5s ease,box-shadow 1.5s ease;will-change:transform;cursor:pointer;text-decoration:none;color:#3D2E2E;}
.xh-card.xh-enter{opacity:0;transform:translateX(140px) translateY(24px) rotate(5deg) scale(.94);}
.xh-card.xh-pos-0{transform:translateX(0) translateZ(0) rotate(0deg) scale(1);opacity:1;z-index:30;animation:xhBreathe 7s ease-in-out 4.5s infinite;}
@keyframes xhBreathe{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-7px) scale(1.004);}}
.xh-card.xh-pos-1{transform:translateX(140px) translateZ(-120px) rotate(2.2deg) scale(.9);opacity:.72;z-index:20;}
.xh-card.xh-pos-2{transform:translateX(255px) translateZ(-240px) rotate(4deg) scale(.8);opacity:.38;z-index:10;}
.xh-card.xh-pos-3{transform:translateX(340px) translateZ(-360px) rotate(5deg) scale(.72);opacity:0;z-index:5;pointer-events:none;}
.xh-card.xh-pos-out{transform:translateX(-180px) translateZ(-80px) rotate(-4deg) scale(.9);opacity:0;z-index:8;pointer-events:none;}
.xh-cat{font-size:.72rem;letter-spacing:.36em;color:#8B4545;display:flex;align-items:center;gap:8px;}
.xh-cat::after{content:"";flex:1;height:1px;background:#8B454533;}
.xh-card h3{margin-top:18px;font-size:1.6rem;font-weight:500;letter-spacing:.06em;font-family:'Kaiti SC','STKaiti','KaiTi',serif;line-height:1.4;}
.xh-city{margin-top:6px;font-size:.86rem;color:#8A7A72;letter-spacing:.26em;}
.xh-desc{margin-top:18px;font-size:.86rem;line-height:2;color:#8A7A72;letter-spacing:.04em;flex:1;}
.xh-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e4dcc9;padding-top:16px;}
.xh-spots{font-size:.76rem;color:#8A7A7280;letter-spacing:.12em;}
.xh-go{font-size:.8rem;color:#8B4545;letter-spacing:.18em;text-decoration:none;display:inline-flex;align-items:center;gap:6px;position:relative;padding-bottom:3px;}
.xh-go::after{content:"";position:absolute;left:0;bottom:0;height:1px;width:0;background:#8B4545;transition:width .6s cubic-bezier(.25,.8,.3,1);}
.xh-go:hover::after{width:100%;}
.xh-go .xh-arrow{transition:transform .6s cubic-bezier(.25,.8,.3,1);}
.xh-go:hover .xh-arrow{transform:translateX(5px);}
.xh-decknav{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;z-index:40;opacity:0;animation:xhIn 1.4s ease 4s forwards;}
.xh-decknav button{width:24px;height:2px;border:none;background:#D1CDC4;cursor:pointer;transition:background .6s,width .6s;padding:0;}
.xh-decknav button.xh-on{background:#8B4545;width:36px;}
@keyframes xhIn{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion: reduce){.xunji-hero *,.xunji-hero *::before,.xunji-hero *::after{animation-duration:.01ms !important;animation-delay:0s !important;transition-duration:.2s !important;}.xh-light,.xh-ambient{display:none;}.xh-card.xh-enter{opacity:1;transform:none;}.xh-card.xh-pos-0{animation:none;}}
@media (max-width:900px){.xh-stage{grid-template-columns:1fr;gap:24px;padding:28px 22px;min-height:auto;}.xh-deckwrap{height:440px;}.xh-motto{display:none;}.xh-title-wrap{max-width:260px;}.xh-title text{font-size:120px;}.xh-deck{height:420px;}.xh-card{width:260px;height:380px;margin:-190px 0 0 -130px;}.xh-card.xh-pos-1{transform:translateX(120px) translateZ(-120px) rotate(2deg) scale(.9);}.xh-card.xh-pos-2{transform:translateX(220px) translateZ(-240px) rotate(4deg) scale(.8);opacity:.3;}.xh-card.xh-pos-3,.xh-card.xh-pos-out{opacity:0;}}
@media (max-width:480px){.xh-stage{padding:22px 16px;}.xh-title-wrap{max-width:220px;}.xh-title text{font-size:100px;}.xh-sub{font-size:.92rem;letter-spacing:.1em;}.xh-stats{gap:28px;margin-top:30px;}.xh-num{font-size:1.5rem;}.xh-deckwrap{height:400px;}.xh-card{width:240px;height:360px;margin:-180px 0 0 -120px;}}
`
