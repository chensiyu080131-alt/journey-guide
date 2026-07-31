// Supabase 匿名会话（Anonymous Sign-in）管理 — 零依赖
// 用途：T4 打卡记录写入 checkins 表需要 auth.uid()（RLS 要求登录身份）。
// 微信登录属后续任务，试点期先用 Supabase 匿名用户承载打卡身份：
//   同一浏览器 = 同一匿名用户（会话持久化 localStorage），后续接微信登录可升级绑定。
// 前提：Supabase 控制台 → Authentication → Sign In / Up → 开启 Anonymous sign-ins。

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
const SESSION_KEY = 'xunji.sb.session.v1'

export interface SbSession {
  accessToken: string
  refreshToken: string
  /** epoch 秒 */
  expiresAt: number
  userId: string
}

function readSession(): SbSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as SbSession
    return s && s.accessToken && s.userId ? s : null
  } catch {
    return null
  }
}

function writeSession(s: SbSession | null): void {
  if (typeof window === 'undefined') return
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* 隐私模式静默 */
  }
}

interface AuthResponse {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  expires_in?: number
  user?: { id?: string }
  error_description?: string
  msg?: string
  error_code?: string
}

async function authFetch(path: string, body: unknown): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return (await res.json()) as AuthResponse
  } catch {
    return null
  }
}

function toSession(r: AuthResponse | null): SbSession | null {
  if (!r?.access_token || !r.refresh_token || !r.user?.id) return null
  return {
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    expiresAt: r.expires_at ?? Math.floor(Date.now() / 1000) + (r.expires_in ?? 3600),
    userId: r.user.id,
  }
}

/**
 * 确保有可用的登录会话（匿名）。
 * 返回 null 的常见原因：控制台未开启 Anonymous sign-ins / 网络失败。
 */
export async function ensureAnonSession(): Promise<SbSession | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  const cached = readSession()
  const now = Math.floor(Date.now() / 1000)
  // 有效期富余 60 秒
  if (cached && cached.expiresAt - 60 > now) return cached
  // 尝试刷新
  if (cached?.refreshToken) {
    const refreshed = toSession(
      await authFetch('token?grant_type=refresh_token', { refresh_token: cached.refreshToken })
    )
    if (refreshed) {
      writeSession(refreshed)
      return refreshed
    }
  }
  // 新建匿名用户（需控制台开启 Anonymous sign-ins）
  const fresh = toSession(await authFetch('signup', {}))
  if (fresh) writeSession(fresh)
  return fresh
}
