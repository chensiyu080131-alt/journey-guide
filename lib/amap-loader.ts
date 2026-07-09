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

function waitForAmapNamespace(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.AMap) {
        resolve()
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('高德地图命名空间未就绪'))
        return
      }
      setTimeout(check, 50)
    }
    check()
  })
}

export function loadAmapScript(): Promise<void> {
  const key = getAmapKey()
  if (!key) {
    return Promise.reject(new Error('未配置 NEXT_PUBLIC_AMAP_KEY'))
  }

  ensureAmapSecurityConfig()

  if (typeof window !== 'undefined' && window.AMap) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-amap-loader]') as HTMLScriptElement | null
    if (existing) {
      if (window.AMap) {
        resolve()
        return
      }
      existing.addEventListener('load', () => {
        waitForAmapNamespace().then(resolve).catch(reject)
      })
      existing.addEventListener('error', () => reject(new Error('高德地图脚本加载失败')))
      return
    }

    const script = document.createElement('script')
    script.dataset.amapLoader = 'true'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`
    script.async = true
    script.onload = () => {
      waitForAmapNamespace().then(resolve).catch(reject)
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
    return { hasKey, hasSecurity, ready: false, hint: '未配置 NEXT_PUBLIC_AMAP_KEY（本地 .env.local 或 GitHub Actions Secrets）' }
  }
  if (!hasSecurity) {
    return {
      hasKey,
      hasSecurity,
      ready: false,
      hint: '请配置 NEXT_PUBLIC_AMAP_SECURITY（安全密钥），否则地图瓦片与路径规划可能失败',
    }
  }
  return { hasKey, hasSecurity, ready: true }
}

/** 等待地图底图瓦片加载完成 */
export function waitForMapComplete(map: AMap.Map, timeoutMs = 8000): Promise<void> {
  return new Promise(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    map.on('complete', finish)
    setTimeout(finish, timeoutMs)
  })
}

/** 多次触发 resize，解决 flex 布局下容器尺寸延迟就绪的问题 */
export function scheduleMapResize(map: AMap.Map): void {
  const resize = () => {
    try {
      map.resize()
    } catch {
      /* ignore */
    }
  }
  resize()
  requestAnimationFrame(resize)
  setTimeout(resize, 100)
  setTimeout(resize, 400)
  setTimeout(resize, 1000)
}
