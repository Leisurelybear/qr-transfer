declare module 'pako' {
  export function deflate(data: Uint8Array, options?: { level?: number }): Uint8Array
  export function inflate(data: Uint8Array): Uint8Array
  export const compress: typeof deflate
  export const decompress: typeof inflate
}

declare module 'gif.js' {
  export default class GIF {
    constructor(options: { workers?: number; quality?: number; width?: number; height?: number })
    addFrame(img: HTMLImageElement, options?: { delay?: number }): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'error', callback: (err: Error) => void): void
    render(): void
  }
}
