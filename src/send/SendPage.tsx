import { useState, useCallback, useEffect } from 'react'
import FileSelector from './FileSelector'
import QRDisplay from './QRDisplay'
import GifGenerator from './GifGenerator'
import QRCode from 'qrcode'
import { compress } from '../lib/compress'
import { chunkFile } from '../lib/chunk'
import { generateSessionId } from '../shared/protocol'
import type { DataPacket } from '../shared/protocol'

export default function SendPage() {
  const [frames, setFrames] = useState<DataPacket[]>([])
  const [playing, setPlaying] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [qrUrls, setQrUrls] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      const urls = await Promise.all(
        frames.map(async (pkt) => {
          return QRCode.toDataURL(JSON.stringify(pkt), { width: 512 })
        })
      )
      setQrUrls(urls)
    })()
  }, [frames])

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer)
      const compressed = compress(data)
      const sid = generateSessionId()
      setSessionId(sid)

      // Estimate chunks based on compressed size
      const chunkSize = 2000
      const estimatedChunks = Math.max(1, Math.ceil(compressed.length / chunkSize))

      const packets = chunkFile(compressed, sid, estimatedChunks)
      setFrames(packets)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">QR Transfer - Send</h1>
      <FileSelector onFileSelect={handleFileSelect} />
      {frames.length > 0 && (
        <QRDisplay
          packets={frames}
          playing={playing}
          onTogglePlay={() => setPlaying(!playing)}
          sessionId={sessionId}
        />
      )}
      {qrUrls.length > 0 && <GifGenerator qrUrls={qrUrls} fps={6} />}
    </div>
  )
}
