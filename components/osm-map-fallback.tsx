'use client'

interface OsmMapFallbackProps {
  lat: number
  lng: number
  zoom?: number
  label?: string
}

/** 高德不可用时的 OpenStreetMap 备用地图 */
export function OsmMapFallback({ lat, lng, zoom = 13, label }: OsmMapFallbackProps) {
  const delta = 0.06
  const bbox = `${lng - delta},${lat - delta * 0.8},${lng + delta},${lat + delta * 0.8}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="relative w-full h-full min-h-[360px]">
      <iframe
        title={label || '路线地图'}
        src={src}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
      <p className="absolute bottom-2 left-2 text-[10px] bg-paper-warm/90 text-warm-gray-muted px-2 py-1 rounded-full border border-celadon-200/50">
        OpenStreetMap 备用地图
      </p>
    </div>
  )
}
