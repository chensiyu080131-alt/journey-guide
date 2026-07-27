import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 城市名转URL友好slug */
export function cityToSlug(city: string): string {
  return city.replace(/\s+/g, '-').toLowerCase()
}

/** 格式化预算 */
export function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    '穷游': '💰 人均<200/天',
    '舒适': '💰💰 人均200-500/天',
    '轻奢': '💰💰💰 人均500+/天',
  }
  return map[budget] || budget
}
