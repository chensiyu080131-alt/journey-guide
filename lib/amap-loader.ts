declare global {
  interface Window {
    AMap?: typeof AMap
  }
}

export interface AMapMarker {
  name: string
  location: { lat: number; lng: number }
  emoji?: string
}

let loadPromise: Promise<void> | null = null

export function loadAmapScript(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_AMAP_KEY || '20903bacc9ffd51b2e57b969992e533c'
  if (!key) {
    return Promise.reject(new Error('未配置 NEXT_PUBLIC_AMAP_KEY'))
  }

  if (typeof window !== 'undefined' && window.AMap) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('高德地图脚本加载失败'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export function hasAmapKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_AMAP_KEY || '20903bacc9ffd51b2e57b969992e533c')
}
