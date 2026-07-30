'use client'

// 埋点实时 HUD：仅在 URL 带 ?track=debug 时渲染，正常用户无感知。
// 主持人可在真人测试时开着它，实时看到"谁看见了/点了什么"，无需后端。

import { useEffect, useState } from 'react'
import { dumpTrack, clearTrack, type TrackEvent } from '@/lib/track'

export default function TrackDebug() {
  const [active, setActive] = useState(false)
  const [events, setEvents] = useState<TrackEvent[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('track') !== 'debug') return
    setActive(true)
    const handler = (e: Event) =>
      setEvents(prev => [...prev.slice(-299), (e as CustomEvent<TrackEvent>).detail])
    window.addEventListener('xunji:track', handler as EventListener)
    setEvents(dumpTrack())
    return () => window.removeEventListener('xunji:track', handler as EventListener)
  }, [])

  if (!active) return null

  const counts: Record<string, number> = {}
  for (const e of events) counts[e.name] = (counts[e.name] || 0) + 1

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xunji-track-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed bottom-3 right-3 z-[99999] max-h-[70vh] w-[320px] overflow-auto rounded-xl bg-charcoal/95 p-3 text-xs text-white shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold">📊 埋点实时 (track=debug)</span>
        <button onClick={() => { clearTrack(); setEvents([]) }} className="underline">清空</button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {Object.entries(counts).map(([k, v]) => (
          <span key={k} className="rounded bg-white/10 px-1.5 py-0.5">{k}: {v}</span>
        ))}
      </div>
      <button onClick={exportJson} className="mb-2 w-full rounded bg-vermilion px-2 py-1 font-semibold">导出 JSON</button>
      <div className="space-y-1">
        {events.slice().reverse().map((e, i) => (
          <div key={i} className="rounded bg-white/5 px-2 py-1">
            <span className="text-vermilion">{e.name}</span>{' '}
            <span className="opacity-60">{new Date(e.t).toLocaleTimeString()}</span>
            <pre className="whitespace-pre-wrap break-all opacity-80">{JSON.stringify(e.props)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
