import { useState, useCallback } from 'react'
import QRScanner from './QRScanner'
import TransferProgress from './TransferProgress'
import { parsePacket } from '../shared/protocol'
import { mergeChunks } from '../lib/chunk'
import { decompress } from '../lib/compress'
import type { DataPacket } from '../shared/protocol'

export default function ReceivePage() {
  const [packets, setPackets] = useState<DataPacket[]>([])
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  const handleQRScanned = useCallback((rawData: string) => {
    const packet = parsePacket(rawData)
    if (!packet) return

    if (packet.type === 'control') {
      if (packet.ctrlMsg === 'done' && packet.sessionId) {
        setSessionActive(false)
      }
      return
    }

    if (packet.type === 'data') {
      if (!sessionActive) {
        setSessionId(packet.sessionId)
        setSessionActive(true)
        setPackets([])
        setDownloadUrl(null)
      }

      if (packet.sessionId !== sessionId) return

      setPackets(prev => {
        const existing = prev.find(p => p.chunkIndex === packet.chunkIndex)
        if (existing) return prev

        const updated = [...prev, packet]
        if (updated.length === packet.totalChunks) {
          // All chunks received, assemble
          const merged = mergeChunks(updated)
          if (merged) {
            const decompressed = decompress(merged)
            const blob = new Blob([decompressed as unknown as BlobPart])
            const url = URL.createObjectURL(blob)
            setDownloadUrl(url)
            setFileName(packet.originalFilename || 'download')
          }
        }
        return updated
      })
    }
  }, [sessionActive, sessionId])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">QR Transfer - Receive</h1>
      <QRScanner onScanned={handleQRScanned} />
      {sessionActive && (
        <TransferProgress
          received={packets.length}
          total={packets[0]?.totalChunks ?? 0}
          downloadUrl={downloadUrl}
          fileName={fileName}
        />
      )}
    </div>
  )
}
