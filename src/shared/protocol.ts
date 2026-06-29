export type CtrlMsg = 'ready' | 'done' | 'error' | 'missing'

export interface BasePacket {
  version: 1
  type: 'data' | 'control'
}

export interface DataPacket extends BasePacket {
  type: 'data'
  sessionId: string
  chunkIndex: number
  totalChunks: number
  originalFilename: string
  originalSize: number
  compressedSize: number
  checksum: string
  payload: string
}

export interface ControlPacket extends BasePacket {
  type: 'control'
  ctrlMsg: CtrlMsg
  sessionId?: string
  missingChunks?: number[]
}

export type ProtocolPacket = DataPacket | ControlPacket

export function serializePacket(packet: ProtocolPacket): string {
  return JSON.stringify(packet)
}

export function parsePacket(raw: string): ProtocolPacket | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.type === 'control') {
      return {
        version: parsed.version,
        type: 'control',
        ctrlMsg: parsed.ctrlMsg,
        sessionId: parsed.sessionId,
        missingChunks: parsed.missingChunks,
      } as ControlPacket
    }
    if (parsed.type === 'data') {
      return {
        version: parsed.version,
        type: 'data',
        sessionId: parsed.sessionId,
        chunkIndex: parsed.chunkIndex,
        totalChunks: parsed.totalChunks,
        originalFilename: parsed.originalFilename,
        originalSize: parsed.originalSize,
        compressedSize: parsed.compressedSize,
        checksum: parsed.checksum,
        payload: parsed.payload,
      } as DataPacket
    }
  } catch {
    // JSON parse error
  }
  return null
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}
