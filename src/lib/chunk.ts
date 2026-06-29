import type { DataPacket } from '../shared/protocol'

const MAX_PAYLOAD_SIZE = 2048

export function chunkFile(
  data: Uint8Array,
  sessionId: string,
  totalChunks: number,
): DataPacket[] {
  const chunks: DataPacket[] = []
  const chunkSize = Math.ceil(data.length / totalChunks)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, data.length)
    const slice = data.slice(start, end)
    const payload = btoa(String.fromCharCode(...slice))

    chunks.push({
      version: 1,
      type: 'data',
      sessionId,
      chunkIndex: i,
      totalChunks,
      originalFilename: '',
      originalSize: data.length,
      compressedSize: slice.length,
      checksum: '',
      payload,
    })
  }

  return chunks
}

export function mergeChunks(packets: DataPacket[]): Uint8Array | null {
  // Check all chunks present
  const indices = packets.map(p => p.chunkIndex).sort((a, b) => a - b)
  const expected = Array.from({ length: packets[0].totalChunks }, (_, i) => i)
  for (const exp of expected) {
    if (!indices.includes(exp)) return null
  }

  // Sort by chunkIndex
  const sorted = [...packets].sort((a, b) => a.chunkIndex - b.chunkIndex)

  // Deduplicate by chunkIndex (keep first)
  const seen = new Set<number>()
  const deduped: DataPacket[] = []
  for (const pkt of sorted) {
    if (!seen.has(pkt.chunkIndex)) {
      seen.add(pkt.chunkIndex)
      deduped.push(pkt)
    }
  }

  // Reconstruct
  const totalLength = deduped.reduce((sum, p) => sum + p.compressedSize, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const pkt of deduped) {
    const slice = Uint8Array.from(atob(pkt.payload), c => c.charCodeAt(0))
    result.set(slice, offset)
    offset += slice.length
  }

  return result
}
