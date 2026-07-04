import { useEffect, useRef, useState } from 'react'
import type { DataPacket } from '../shared/protocol'

const SPEED_OPTIONS = [
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
]

interface QRDisplayProps {
  packets: DataPacket[]
  qrUrls: string[]
  sessionId: string
  fileName: string
}

export default function QRDisplay({ packets, qrUrls, sessionId, fileName }: QRDisplayProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [delay, setDelay] = useState(5000)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % packets.length)
      }, delay)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, delay, packets.length])

  const goTo = (index: number) => {
    setCurrentFrame(Math.max(0, Math.min(index, packets.length - 1)))
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-gray-400">
        {fileName} &middot; {packets.length} frames &middot; Session: {sessionId.slice(0, 8)}&hellip;
      </p>

      <div data-testid="qr-frame" className="bg-white p-4 rounded inline-block">
        {qrUrls[currentFrame] ? (
          <img src={qrUrls[currentFrame]} alt={`QR ${currentFrame + 1}`} />
        ) : (
          <p className="text-gray-400 text-sm p-4">Generating...</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => goTo(currentFrame - 1)}
          disabled={currentFrame === 0}
          className="px-3 py-1.5 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-40"
        >
          Prev
        </button>

        <button
          onClick={() => setPlaying(!playing)}
          className={`px-4 py-1.5 rounded ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {playing ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={() => goTo(currentFrame + 1)}
          disabled={currentFrame === packets.length - 1}
          className="px-3 py-1.5 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-gray-400">Speed:</span>
        {SPEED_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDelay(opt.value)}
            className={`px-2 py-1 rounded ${delay === opt.value ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-sm">
        Frame {currentFrame + 1} / {packets.length}
      </p>

      {qrUrls.length > 1 && (
        <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
          {qrUrls.map((url, i) => (
            <button key={i} onClick={() => goTo(i)}>
              <img
                src={url}
                alt={`frame ${i + 1}`}
                className={`w-12 h-12 border-2 rounded ${i === currentFrame ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
