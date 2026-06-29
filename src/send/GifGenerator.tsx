import { useState, useCallback } from 'react'
import { generateGifBlob } from '../lib/gifGenerate'

interface GifGeneratorProps {
  qrUrls: string[]
  fps: number
}

export default function GifGenerator({ qrUrls, fps }: GifGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const blob = await generateGifBlob(qrUrls, fps)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      console.error('GIF generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }, [qrUrls, fps])

  return (
    <div className="mt-4">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate GIF'}
      </button>
      {downloadUrl && (
        <a href={downloadUrl} download="qrcode-transfer.gif" className="ml-2 text-blue-400 underline">
          Download GIF
        </a>
      )}
    </div>
  )
}
