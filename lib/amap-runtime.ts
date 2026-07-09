/**
 * 高德 Key 运行时注入（解决 standalone 部署时 build 阶段未写入 NEXT_PUBLIC_* 的问题）
 *
 * layout.tsx 在服务端每次请求时从 process.env 注入到 window，
 * pm2 的 .env.production 在运行期即可生效，无需重新 build。
 */

declare global {
  interface Window {
    __XUNCHENG_AMAP_KEY__?: string
    __XUNCHENG_AMAP_SECURITY__?: string
  }
}

export function getRuntimeAmapKey(): string {
  if (typeof window !== 'undefined' && window.__XUNCHENG_AMAP_KEY__) {
    return window.__XUNCHENG_AMAP_KEY__
  }
  return process.env.NEXT_PUBLIC_AMAP_KEY || ''
}

export function getRuntimeAmapSecurity(): string {
  if (typeof window !== 'undefined' && window.__XUNCHENG_AMAP_SECURITY__) {
    return window.__XUNCHENG_AMAP_SECURITY__
  }
  return process.env.NEXT_PUBLIC_AMAP_SECURITY || ''
}
