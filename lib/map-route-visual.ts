import { Spot } from '@/types'

/** 散人漫游地图 — 路线与标注视觉常量 */
export const ROUTE_VISUAL = {
  /** 主路线：明亮黄色虚线 */
  stroke: '#FACC15',
  strokeWeight: 7,
  /** 路线白边（底层描边） */
  outline: '#FFFFFF',
  outlineWeight: 11,
  /** 标注：白色药丸标题 */
  labelBg: '#FFFFFF',
  labelText: '#1A1A1A',
  /** 标注：深青绿详情框 */
  detailBg: 'rgba(19, 78, 74, 0.88)',
  detailText: '#FFFFFF',
} as const

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 详情框 bullet 文案：描述 + 标签 */
export function getSpotBullets(spot: Spot): string[] {
  const bullets: string[] = []
  if (spot.desc) bullets.push(spot.desc)
  if (spot.tags?.length) {
    for (const tag of spot.tags) {
      if (bullets.length >= 3) break
      if (!bullets.includes(tag)) bullets.push(tag)
    }
  }
  if (bullets.length === 0 && spot.originalText) {
    const excerpt = spot.originalText.slice(0, 28)
    bullets.push(excerpt + (spot.originalText.length > 28 ? '…' : ''))
  }
  return bullets.slice(0, 3)
}

const PIN_SVG = `
<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#FFFFFF" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>
  <circle cx="14" cy="13" r="5" fill="#134E4A" opacity="0.35"/>
</svg>`

/** 参考图风格：白底药丸标题 + 深青详情框 + 白色定位针 */
export function buildSpotMarkerHtml(spot: Spot, index: number): string {
  const bullets = getSpotBullets(spot)
  const labelAbove = index % 2 === 0
  const bulletItems = bullets
    .map(b => `<li style="margin:0;padding:0;">${escapeHtml(b)}</li>`)
    .join('')

  const labelBlock = `
    <div style="display:flex;flex-direction:column;align-items:center;max-width:168px;">
      <div style="background:${ROUTE_VISUAL.labelBg};border-radius:999px;padding:5px 14px;box-shadow:0 2px 10px rgba(0,0,0,0.14);white-space:nowrap;">
        <span style="font-size:12px;font-weight:700;color:${ROUTE_VISUAL.labelText};font-family:system-ui,-apple-system,sans-serif;letter-spacing:0.02em;">${escapeHtml(spot.name)}</span>
      </div>
      ${bullets.length > 0 ? `
      <div style="background:${ROUTE_VISUAL.detailBg};border-radius:10px;padding:8px 12px;margin-top:5px;width:100%;box-shadow:0 4px 14px rgba(19,78,74,0.25);">
        <ul style="margin:0;padding-left:14px;color:${ROUTE_VISUAL.detailText};font-size:10px;line-height:1.55;font-family:system-ui,-apple-system,sans-serif;list-style:disc;">
          ${bulletItems}
        </ul>
      </div>` : ''}
    </div>`

  if (labelAbove) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:translateY(-4px);">
        ${labelBlock}
        <div style="margin-top:2px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.18));">${PIN_SVG}</div>
      </div>`
  }

  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.18));">${PIN_SVG}</div>
      <div style="margin-top:4px;">${labelBlock}</div>
    </div>`
}

type AMapPolyline = InstanceType<typeof AMap.Polyline>

/** 双层路线：白边底层 + 黄色虚线顶层（参考散人漫游地图） */
export function addStyledRoutePolylines(
  map: AMap.Map,
  path: AMap.LngLatLike[]
): AMapPolyline[] {
  if (path.length < 2 || !window.AMap) return []

  const outline = new window.AMap.Polyline({
    path,
    strokeColor: ROUTE_VISUAL.outline,
    strokeWeight: ROUTE_VISUAL.outlineWeight,
    strokeOpacity: 0.92,
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 10,
  })

  const route = new window.AMap.Polyline({
    path,
    strokeColor: ROUTE_VISUAL.stroke,
    strokeWeight: ROUTE_VISUAL.strokeWeight,
    strokeOpacity: 1,
    strokeStyle: 'dashed',
    strokeDasharray: [14, 10],
    showDir: true,
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 11,
  })

  map.add(outline)
  map.add(route)
  return [outline, route]
}
