import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import type { DataPacket } from '../shared/protocol'

interface QRDisplayProps {
  packets: DataPacket[]
  playing: boolean
  onTogglePlay: () => void
  sessionId: string
}

export default function QRDisplay({ packets, playing, onTogglePlay, sessionId }: QRDisplayProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [qrUrl, setQrUrl] = useState('')
  const [qrError, setQrError] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const fps = 6

  const loadFrame = useCallback(async (index: number) => {
    try {
      const data = JSON.stringify(packets[index])
      const url = await QRCode.toDataURL(data, { width: 512 })
      setQrUrl(url)
      setQrError(false)
    } catch {
      setQrError(true)
    }
  }, [packets])

  useEffect(() => {
    loadFrame(currentFrame)
  }, [currentFrame, loadFrame])

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % packets.length)
      }, 1000 / fps)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, packets.length])

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-gray-400">Session: {sessionId}</p>
      <div data-testid="qr-frame" className="bg-white p-4 rounded inline-block">
        {qrError ? (
          <p className="text-red-500 text-sm p-4">QR code data too large for this chunk</p>
        ) : qrUrl ? (
          <img src={qrUrl} alt="QR Code" />
        ) : (
          <p className="text-gray-400 text-sm p-4">Generating...</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onTogglePlay}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          {playing ? 'Stop' : 'Play'}
        </button>
      </div>
      <p className="mt-2 text-sm">Frame {currentFrame + 1} / {packets.length}</p>
    </div>
  )
}
