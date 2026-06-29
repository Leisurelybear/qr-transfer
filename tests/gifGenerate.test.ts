import { describe, test, expect, vi } from 'vitest'

// Mock Image so gifGenerate doesn't try to load real images
const mockBlob = new Blob(['fake-gif-data'], { type: 'image/gif' })

vi.mock('gif.js', () => ({
  default: vi.fn(() => ({
    addFrame: vi.fn(),
    on: vi.fn((event: string, cb: (blob: Blob) => void) => {
      if (event === 'finished') cb(mockBlob)
    }),
    render: vi.fn(),
  })),
}))

// Mock qrcode since SendPage uses it to generate QR URLs
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,fake')),
  },
}))

import { generateGifBlob } from '../src/lib/gifGenerate'

describe('GIF generation', () => {
  test('creates a blob from QR frames', async () => {
    const frames = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
    ]
    const blob = await generateGifBlob(frames, 6)
    expect(blob instanceof Blob).toBe(true)
    expect(blob.size).toBeGreaterThan(0)
  })
})
