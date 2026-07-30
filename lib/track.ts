'use client'

// 轻量事件埋点（可用性测试用）。
// 无需后端：事件会 ① console.debug ② 存 localStorage 环形缓冲 ③ 派发 window 自定义事件供实时 HUD
// ④ 若定义了 window.__XUNJI_TRACK_ENDPOINT 则 POST 到该地址。

import { useEffect, useRef } from 'react'

export type TrackEvent = {
  name: string
  props?: Record<string, unknown>
  t: number
}

const KEY = 'xunji_track_events'
const MAX = 1000

function safeRead(): TrackEvent[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function track(name: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const ev: TrackEvent = { name, props: props || {}, t: Date.now() }
  // ① 控制台
  // eslint-disable-next-line no-console
  console.debug('[xunji-track]', name, props || '')
  // ② localStorage 环形缓冲
  const arr = safeRead()
  arr.push(ev)
  if (arr.length > MAX) arr.splice(0, arr.length - MAX)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {
    /* ignore quota errors */
  }
  // ③ 实时 HUD 事件
  try {
    window.dispatchEvent(new CustomEvent('xunji:track', { detail: ev }))
  } catch {
    /* ignore */
  }
  // ④ 可选远程上报
  const ep = (window as unknown as { __XUNJI_TRACK_ENDPOINT?: string }).__XUNJI_TRACK_ENDPOINT
  if (typeof ep === 'string' && ep) {
    try {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
        keepalive: true,
      }).catch(() => {})
    } catch {
      /* ignore */
    }
  }
}

export function dumpTrack(): TrackEvent[] {
  return safeRead()
}

export function clearTrack() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
}

/** 元素进入视口（≥50% 可见）时上报一次。用于测量"是否自然看见"。 */
export function useTrackImpression<T extends HTMLElement>(
  name: string,
  props?: Record<string, unknown>
) {
  const ref = useRef<T | null>(null)
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || fired.current) return
    if (typeof IntersectionObserver === 'undefined') return
    const ob = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting && !fired.current) {
            fired.current = true
            track(name, props)
            ob.disconnect()
          }
        }
      },
      { threshold: 0.5 }
    )
    ob.observe(el)
    return () => ob.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])
  return ref
}
