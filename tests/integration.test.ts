import { describe, test, expect } from 'vitest'
import { compress } from '../src/lib/compress'
import { decompress } from '../src/lib/compress'
import { chunkFile } from '../src/lib/chunk'
import { mergeChunks } from '../src/lib/chunk'
import { serializePacket, parsePacket, generateSessionId } from '../src/shared/protocol'

describe('full transfer pipeline', () => {
  test('compress -> chunk -> serialize -> parse -> merge -> decompress', () => {
    const originalText = 'Integration test: the quick brown fox jumps over the lazy dog.'
    const original = new TextEncoder().encode(originalText)

    const compressed = compress(original)

    const sessionId = generateSessionId()
    const totalChunks = 5
    const packets = chunkFile(compressed, sessionId, totalChunks)

    // Simulate network: serialize and parse (as QR would)
    const serialized = packets.map(p => serializePacket(p))
    const parsed = serialized.map(s => parsePacket(s)!).filter(Boolean)

    // Reassemble
    const merged = mergeChunks(parsed as typeof packets)
    expect(merged).not.toBeNull()

    // Decompress
    const decompressed = decompress(merged!)
    const result = new TextDecoder().decode(decompressed)
    expect(result).toBe(originalText)
  })
})
