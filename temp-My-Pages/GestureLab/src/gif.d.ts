declare module "gif.js" {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    repeat?: number
    background?: string
    transparent?: string | null
  }

  interface GIFEventMap {
    finished: [blob: Blob]
    progress: [progress: number]
    start: []
    error: [error: Error]
  }

  class GIF {
    constructor(options?: GIFOptions)
    addFrame(
      element: CanvasImageSource | ImageData | CanvasRenderingContext2D,
      options?: { copy?: boolean; delay?: number },
    ): void
    render(): void
    on: <K extends keyof GIFEventMap>(event: K, listener: (...args: GIFEventMap[K]) => void) => void
    off: <K extends keyof GIFEventMap>(event: K, listener: (...args: GIFEventMap[K]) => void) => void
    abort(): void
  }

  export default GIF
}
