export {}

declare global {
  namespace AMap {
    type LngLatLike = [number, number] | { lng: number; lat: number }

    class Map {
      constructor(container: HTMLElement | string, opts?: Record<string, unknown>)
      add(overlay: Marker | Polyline): void
      setFitView(
        overlays?: unknown,
        immediately?: boolean,
        avoid?: [number, number, number, number]
      ): void
      destroy(): void
    }

    class Marker {
      constructor(opts?: Record<string, unknown>)
    }

    class Polyline {
      constructor(opts?: Record<string, unknown>)
    }
  }

  interface Window {
    AMap?: typeof AMap
  }
}
