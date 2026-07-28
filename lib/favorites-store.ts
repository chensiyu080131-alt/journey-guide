// T6 收藏存储层：localStorage 切换/读取（无登录、无后端，刷新持久）
const KEY = 'xunji.favorites.v1'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug)
}

/** 切换收藏状态，返回切换后的「是否已收藏」 */
export function toggleFavorite(slug: string): boolean {
  const all = getFavorites()
  const has = all.includes(slug)
  const next = has ? all.filter(s => s !== slug) : [...all, slug]
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 隐私模式/存储满：静默失败
  }
  return !has
}
