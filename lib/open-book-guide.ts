/** 打开全局「跟书旅行」浮窗（需在客户端调用） */
export function openBookGuidePanel() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xuncheng:open-book-guide'))
  }
}
