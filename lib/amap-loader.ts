declare global {
  interface Window {
    AMap?: typeof AMap
    _AMapSecurityConfig?: { securityJsCode?: string }
  }
}

export interface AMapMarker {
  name: string
  location: { lat: number; lng: number }
  emoji?: string
}

let loadPromise: Promise<void> | null = null

function getAmapKey(): string {
  return process.env.NEXT_PUBLIC_AMAP_KEY || ''
}

/** 注入高德安全密钥（2021年后 Web 端 Key 通常需要配对） */
export function ensureAmapSecurityConfig(): void {
  if (typeof window === 'undefined') return
  const code = process.env.NEXT_PUBLIC_AMAP_SECURITY
  if (code) {
    window._AMapSecurityConfig = { securityJsCode: code }
  }
}

export function loadAmapScript(): Promise<void> {
  const key = getAmapKey()
  if (!key) {
    return Promise.reject(new Error('未配置 NEXT_PUBLIC_AMAP_KEY'))
  }

  if (typeof window !== 'undefined' && window.AMap) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  ensureAmapSecurityConfig()

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-amap-loader]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('高德地图脚本加载失败')))
      return
    }

    const script = document.createElement('script')
    script.dataset.amapLoader = 'true'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`
    script.async = true
    script.onload = () => {
      // 等待 AMap 命名空间就绪
      const check = () => {
        if (window.AMap) resolve()
        else setTimeout(check, 50)
      }
      check()
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('高德地图脚本加载失败'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export function hasAmapKey(): boolean {
  return Boolean(getAmapKey())
}

export function hasAmapSecurity(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_AMAP_SECURITY)
}

/** 供页面展示的配置摘要（不含密钥内容） */
export function getAmapConfigStatus(): {
  hasKey: boolean
  hasSecurity: boolean
  ready: boolean
  hint?: string
} {
  const hasKey = hasAmapKey()
  const hasSecurity = hasAmapSecurity()
  if (!hasKey) {
    return { hasKey, hasSecurity, ready: false, hint: '请在 .env.local 配置 NEXT_PUBLIC_AMAP_KEY' }
  }
  if (!hasSecurity) {
    return {
      hasKey,
      hasSecurity,
      ready: false,
      hint: '请配置 NEXT_PUBLIC_AMAP_SECURITY（安全密钥），否则路径规划可能失败',
    }
  }
  return { hasKey, hasSecurity, ready: true }
}
