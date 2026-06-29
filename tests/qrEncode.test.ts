import { describe, test, expect } from 'vitest'
import { packetToQrData, packetsToFrames } from '../src/lib/qrEncode'
import { serializePacket } from '../src/shared/protocol'
import type { DataPacket } from '../src/shared/protocol'

describe('QR encoding', () => {
  test('converts a packet to QR-compatible data', () => {
    const packet: DataPacket = {
      version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 1,
      originalFilename: 'test.txt', originalSize: 10, compressedSize: 10,
      checksum: 'abc', payload: 'dGVzdA==',
    }
    const json = serializePacket(packet)
    const qrData = packetToQrData(packet)
    expect(qrData).toBe(json)
  })

  test('generates frames for multiple packets', () => {
    const packets: DataPacket[] = [
      { version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 2, originalFilename: '', originalSize: 0, compressedSize: 5, checksum: '', payload: 'dGVzdDE=' },
      { version: 1, type: 'data', sessionId: 's1', chunkIndex: 1, totalChunks: 2, originalFilename: '', originalSize: 0, compressedSize: 5, checksum: '', payload: 'dGVzdDI=' },
    ]
    const frames = packetsToFrames(packets)
    expect(frames.length).toBe(2)
  })
})
