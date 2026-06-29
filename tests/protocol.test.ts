import { describe, test, expect } from 'vitest'
import { serializePacket, parsePacket, ControlPacket, DataPacket } from '../src/shared/protocol'

describe('protocol serialization', () => {
  test('serializes a data packet', () => {
    const packet: DataPacket = {
      version: 1,
      type: 'data',
      sessionId: 'test-session-1',
      chunkIndex: 0,
      totalChunks: 5,
      originalFilename: 'test.txt',
      originalSize: 100,
      compressedSize: 80,
      checksum: 'abc123',
      payload: 'dGVzdA==',
    }
    const serialized = serializePacket(packet)
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('dGVzdA==')
  })

  test('parses a data packet back', () => {
    const packet: DataPacket = {
      version: 1,
      type: 'data',
      sessionId: 'test-session-1',
      chunkIndex: 0,
      totalChunks: 5,
      originalFilename: 'test.txt',
      originalSize: 100,
      compressedSize: 80,
      checksum: 'abc123',
      payload: 'dGVzdA==',
    }
    const serialized = serializePacket(packet)
    const parsed = parsePacket(serialized)
    expect(parsed).not.toBeNull()
    expect(parsed!.sessionId).toBe('test-session-1')
    expect(parsed!.chunkIndex).toBe(0)
    expect(parsed!.totalChunks).toBe(5)
  })

  test('serializes a control packet', () => {
    const packet: ControlPacket = {
      version: 1,
      type: 'control',
      ctrlMsg: 'ready',
    }
    const serialized = serializePacket(packet)
    const parsed = parsePacket(serialized)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('control')
    expect((parsed as ControlPacket).ctrlMsg).toBe('ready')
  })

  test('returns null for invalid JSON', () => {
    expect(parsePacket('not-json')).toBeNull()
    expect(parsePacket('')).toBeNull()
  })

  test('generates unique session IDs', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    expect(id1).not.toBe(id2)
  })
})
