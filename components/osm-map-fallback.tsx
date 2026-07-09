'use client'

interface OsmMapFallbackProps {
  lat: number
  lng: number
  zoom?: number
  label?: string
}

/** 高德不可用时的 OpenStreetMap 备用地图 */
export function OsmMapFallback({ lat, lng, zoom = 13, label }: OsmMapFallbackProps) {
  const staticSrc = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=800x500&markers=${lat},${lng},red-pushpin`

  return (
    <div className="relative w-full h-full min-h-[360px] bg-camel-light/40">
      {/* 静态图备用：国内环境 iframe 常被拦截 */}
      <img
        src={staticSrc}
        alt={label || '路线地图'}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = 'none'
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center pointer-events-none">
        <p className="text-sm font-serif text-warm-gray">{label || '路线地图'}</p>
        <p className="text-xs text-warm-gray-muted">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
      <p className="absolute bottom-2 left-2 text-[10px] bg-paper-warm/90 text-warm-gray-muted px-2 py-1 rounded-full border border-celadon-200/50">
        OpenStreetMap 备用地图
      </p>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 text-[10px] text-celadon-600 bg-white/90 px-2 py-1 rounded-full border border-celadon-200/50 hover:bg-camel-light no-underline"
      >
        在新窗口打开 →
      </a>
    </div>
  )
}
