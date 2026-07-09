export {}

declare global {
  namespace AMap {
    type LngLatLike = [number, number] | { lng: number; lat: number }

    function plugin(plugins: string[], callback: () => void): void

    class Map {
      constructor(container: HTMLElement | string, opts?: Record<string, unknown>)
      add(overlay: Marker | Polyline): void
      setFitView(
        overlays?: unknown,
        immediately?: boolean,
        avoid?: [number, number, number, number]
      ): void
      resize(): void
      destroy(): void
    }

    class Marker {
      constructor(opts?: Record<string, unknown>)
    }

    class Polyline {
      constructor(opts?: Record<string, unknown>)
    }

    class Walking {
      constructor(opts?: Record<string, unknown>)
      search(
        origin: LngLatLike,
        destination: LngLatLike,
        callback: (status: string, result: unknown) => void
      ): void
    }

    class Driving {
      constructor(opts?: Record<string, unknown>)
      search(
        origin: LngLatLike,
        destination: LngLatLike,
        optsOrCallback?: { waypoints?: LngLatLike[] } | ((status: string, result: unknown) => void),
        callback?: (status: string, result: unknown) => void
      ): void
    }

    class Riding {
      constructor(opts?: Record<string, unknown>)
      search(
        origin: LngLatLike,
        destination: LngLatLike,
        callback: (status: string, result: unknown) => void
      ): void
    }
  }

  interface Window {
    AMap?: typeof AMap
  }
}
