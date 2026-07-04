import { useState, useCallback, useRef } from 'react'
import QRScanner from './QRScanner'
import TransferProgress from './TransferProgress'
import { parsePacket } from '../shared/protocol'
import { mergeChunks } from '../lib/chunk'
import { decompress } from '../lib/compress'
import type { DataPacket } from '../shared/protocol'

export default function ReceivePage() {
  const [packets, setPackets] = useState<DataPacket[]>([])
  const [sessionActive, setSessionActive] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  const sessionIdRef = useRef('')
  const sessionActiveRef = useRef(false)
  const packetsRef = useRef<DataPacket[]>([])

  const handleQRScanned = useCallback((rawData: string) => {
    const packet = parsePacket(rawData)
    if (!packet) return

    if (packet.type === 'control') {
      if (packet.ctrlMsg === 'done' && packet.sessionId) {
        sessionActiveRef.current = false
        setSessionActive(false)
      }
      return
    }

    if (packet.type === 'data') {
      if (!sessionActiveRef.current) {
        sessionIdRef.current = packet.sessionId
        sessionActiveRef.current = true
        packetsRef.current = []
        setSessionActive(true)
        setPackets([])
        setDownloadUrl(null)
      }

      if (packet.sessionId !== sessionIdRef.current) return

      const existing = packetsRef.current.find(p => p.chunkIndex === packet.chunkIndex)
      if (existing) return

      const updated = [...packetsRef.current, packet]
      packetsRef.current = updated
      setPackets(updated)

      if (updated.length === packet.totalChunks) {
        const merged = mergeChunks(updated)
        if (merged) {
          const decompressed = decompress(merged)
          const blob = new Blob([decompressed.buffer as ArrayBuffer])
          const url = URL.createObjectURL(blob)
          setDownloadUrl(url)
          setFileName(packet.originalFilename || 'download')
        }
      }
    }
  }, [])

  return (
    <div className="p-4">
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
