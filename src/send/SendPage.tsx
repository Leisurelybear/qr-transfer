import { useState, useCallback, useEffect } from 'react'
import FileSelector from './FileSelector'
import QRDisplay from './QRDisplay'
import GifGenerator from './GifGenerator'
import QRCode from 'qrcode'
import { compress } from '../lib/compress'
import { chunkFile } from '../lib/chunk'
import { generateSessionId } from '../shared/protocol'
import type { DataPacket } from '../shared/protocol'

const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50 MB

export default function SendPage() {
  const [frames, setFrames] = useState<DataPacket[]>([])
  const [playing, setPlaying] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [qrUrls, setQrUrls] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (frames.length === 0) return
    let cancelled = false
    ;(async () => {
      try {
        const urls = await Promise.all(
          frames.map(async (pkt) => {
            return QRCode.toDataURL(JSON.stringify(pkt), { width: 512 })
          })
        )
        if (!cancelled) {
          setQrUrls(urls)
          setError('')
        }
      } catch {
        if (!cancelled) {
          setError('File too large: each QR code chunk exceeds capacity. Try a smaller file.')
          setQrUrls([])
        }
      }
    })()
    return () => { cancelled = true }
  }, [frames])

  const handleFileSelect = useCallback((file: File) => {
    setError('')

    if (file.size > MAX_FILE_BYTES) {
      setError(`File too large (max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB)`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer)
        const compressed = compress(data)
        const sid = generateSessionId()
        setSessionId(sid)

        const chunkSize = 1500
        const estimatedChunks = Math.max(1, Math.ceil(compressed.length / chunkSize))

        const packets = chunkFile(compressed, sid, estimatedChunks)
        setFrames(packets)
      } catch {
        setError('Failed to process file')
      }
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsArrayBuffer(file)
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">QR Transfer - Send</h1>
      <FileSelector onFileSelect={handleFileSelect} />
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
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
