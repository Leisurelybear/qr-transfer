import { describe, test, expect } from 'vitest'
import { compress, decompress } from '../src/lib/compress'

describe('compression', () => {
  const original = new TextEncoder().encode('Hello, World! This is test data for compression. The quick brown fox jumps over the lazy dog. ' + 'Data compression works best with repetition and redundancy. '.repeat(5))

  test('compresses data', () => {
    const compressed = compress(original)
    expect(compressed.length).toBeLessThan(original.length)
  })

  test('decompresses back to original', () => {
    const compressed = compress(original)
    const decompressed = decompress(compressed)
    expect(new TextDecoder().decode(decompressed)).toBe('Hello, World! This is test data for compression. The quick brown fox jumps over the lazy dog. ' + 'Data compression works best with repetition and redundancy. '.repeat(5))
  })

  test('round-trips through chunk -> merge', async () => {
    const { chunkFile, mergeChunks } = await import('../src/lib/chunk')
    const { compress, decompress } = await import('../src/lib/compress')

    const rawData = new TextEncoder().encode('Round trip test data with some repetition repetition repetition.')
    const compressed = compress(rawData)
    const packets = chunkFile(compressed, 'rt-test', 5)
    const merged = mergeChunks(packets)

    expect(merged).not.toBeNull()
    const decompressed = decompress(merged!)
    expect(new TextDecoder().decode(decompressed)).toBe('Round trip test data with some repetition repetition repetition.')
  })
})
