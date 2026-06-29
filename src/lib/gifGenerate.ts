import GIF from 'gif.js'

export function generateGifBlob(frames: string[], fps: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 512,
      height: 512,
    })

    frames.forEach(frameUrl => {
      const img = new Image()
      img.onload = () => gif.addFrame(img, { delay: 1000 / fps })
      img.onerror = () => reject(new Error(`Failed to load frame: ${frameUrl}`))
      img.src = frameUrl
    })

    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.on('error', (err: Error) => reject(err))
    gif.render()
  })
}
