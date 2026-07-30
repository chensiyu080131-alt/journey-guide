'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * 360° 全景查看器组件（Pannellum via CDN，'use client'）
 *
 * 决策（PROGRESS）：不 npm install pannellum，改用 CDN 动态加载。
 * 理由：pannellum npm 包依赖 jQuery，与 Next.js SSR 兼容差，需额外配置。
 * CDN 方案零新增 npm 依赖（符合"不超过2个依赖"硬约束），SSR 安全，仅在使用时按需加载脚本。
 * 静态导出（output:'export'）下正常工作。
 */

declare global {
  interface Window { [key: string]: any }
}

interface PanoramaViewerProps {
  imageUrl: string
  title?: string
  source?: string  // 全景图来源标注
  onClose: () => void
}

export function PanoramaViewer({ imageUrl, title, source, onClose }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading-script' | 'ready' | 'error'>('loading-script')

  useEffect(() => {
    let viewer: any = null
    let cancelled = false

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('script load failed: ' + src))
        document.head.appendChild(s)
      })

    const loadCss = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }

    ;(async () => {
      try {
        loadCss('https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css')
        await loadScript('https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js')
        // pannellum 依赖 jQuery，加载 jQuery 兜底
        await loadScript('https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js')
        if (cancelled || !containerRef.current) return
        if (!window.pannellum) throw new Error('pannellum not found after load')

        viewer = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: imageUrl,
          autoLoad: true,
          showControls: true,
          compass: false,
          title: title || '',
          author: source || '',
        })
        viewer.on('load', () => { if (!cancelled) setStatus('ready') })
        viewer.on('error', () => { if (!cancelled) setStatus('error') })
      } catch (e) {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      try { viewer?.destroy?.() } catch {}
    }
  }, [imageUrl, title, source])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl">
        <div className="flex items-center justify-between bg-white rounded-t-xl px-4 py-2">
          <div className="font-serif text-sm font-bold text-charcoal truncate">
            {title || '360° 全景浏览'} · 拖动可旋转
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-vermilion text-xl leading-none px-2" aria-label="关闭">✕</button>
        </div>
        <div className="relative bg-white rounded-b-xl overflow-hidden" style={{ height: '60vh' }}>
          {status === 'loading-script' && (
            <div className="absolute inset-0 grid place-items-center text-sm text-ink-400">
              全景图加载中，请稍候…
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 grid place-items-center text-center px-6">
              <div>
                <p className="text-sm text-ink-500">全景图加载失败</p>
                <p className="mt-1 text-xs text-ink-400">可能是网络问题或图片源不可用，请稍后再试</p>
              </div>
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" style={{ display: status === 'ready' ? 'block' : 'none' }} />
        </div>
        {source && (
          <div className="mt-2 text-center text-[11px] text-white/70">全景图来源：{source}（原型阶段，后期替换为实拍）</div>
        )}
      </div>
    </div>
  )
}
