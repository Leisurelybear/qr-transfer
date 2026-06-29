import { describe, test, expect } from 'vitest'
import { chunkFile, mergeChunks } from '../src/lib/chunk'
import type { DataPacket } from '../src/shared/protocol'

describe('chunking', () => {
  const sessionId = 'test-session-1'
  const data = new TextEncoder().encode('Hello, World! This is a test file content.')

  test('splits data into chunks of max 2KB payload', () => {
    const packets = chunkFile(data, sessionId, 3)
    expect(packets.length).toBe(3)
    packets.forEach((pkt, i) => {
      expect(pkt.sessionId).toBe(sessionId)
      expect(pkt.chunkIndex).toBe(i)
      expect(pkt.totalChunks).toBe(3)
      expect(pkt.payload.length).toBeLessThanOrEqual(2048)
    })
  })

  test('merges chunks back to original data', () => {
    const packets = chunkFile(data, sessionId, 3)
    const merged = mergeChunks(packets)
    expect(merged).not.toBeNull()
    expect(new TextDecoder().decode(merged!)).toBe('Hello, World! This is a test file content.')
  })

  test('returns null for out-of-order chunks', () => {
    const packets: DataPacket[] = [
      {
        version: 1, type: 'data', sessionId, chunkIndex: 1, totalChunks: 3,
        originalFilename: '', originalSize: 0, compressedSize: 0, checksum: '', payload: '',
      },
      {
        version: 1, type: 'data', sessionId, chunkIndex: 0, totalChunks: 3,
        originalFilename: '', originalSize: 0, compressedSize: 0, checksum: '', payload: '',
      },
    ]
    const merged = mergeChunks(packets)
    expect(merged).toBeNull()
  })

  test('deduplicates packets with same chunkIndex', () => {
    const packets = chunkFile(data, sessionId, 3)
    // Add a duplicate of chunk 1
    const withDupes = [...packets, { ...packets[1], payload: packets[1].payload }]
    const merged = mergeChunks(withDupes)
    expect(merged).not.toBeNull()
    expect(new TextDecoder().decode(merged!)).toBe(new TextDecoder().decode(data))
  })
})
