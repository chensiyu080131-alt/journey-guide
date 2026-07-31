// 轻量 Supabase REST 客户端（PostgREST 直连，零依赖）
// 为什么不用 @supabase/supabase-js：静态导出站点只需 REST 读 + 匿名受限写，
// 原生 fetch 即可覆盖，省 30KB+ 体积，且避免代理环境安装依赖的不确定性。
// 凭证来自 .env.local（NEXT_PUBLIC_ 前缀 → 构建期内联，publishable key 本就是公开的）。

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

interface RestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** 额外请求头，如 Prefer: return=representation */
  headers?: Record<string, string>
  /** 登录用户 JWT（不传则匿名身份） */
  accessToken?: string
}

export interface RestResult<T> {
  ok: boolean
  status: number
  data: T | null
  error?: { code?: string; message?: string }
}

/**
 * 调用 Supabase PostgREST。
 * @param pathWithQuery 形如 `routes?select=*&slug=eq.xxx`
 */
export async function supabaseRest<T = unknown>(
  pathWithQuery: string,
  opts: RestOptions = {}
): Promise<RestResult<T>> {
  if (!supabaseConfigured()) {
    return { ok: false, status: 0, data: null, error: { message: 'supabase not configured' } }
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathWithQuery}`, {
      method: opts.method ?? 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${opts.accessToken ?? SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...opts.headers,
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    })
    const text = await res.text()
    let parsed: unknown = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }
    if (!res.ok) {
      const err = (parsed ?? {}) as { code?: string; message?: string }
      return { ok: false, status: res.status, data: null, error: err }
    }
    return { ok: true, status: res.status, data: parsed as T }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: { message: e instanceof Error ? e.message : 'network error' },
    }
  }
}
