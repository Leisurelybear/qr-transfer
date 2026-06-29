import { useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanned: (data: string) => void
}

export default function QRScanner({ onScanned }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    scannerRef.current = new Html5Qrcode('qr-scanner-container', {
      verbose: false,
    })

    const config = {
      fps: 10,
      qrbox: { width: 400, height: 400 },
      aspectRatio: 1.0,
    }

    scannerRef.current.start(
      { facingMode: 'environment' },
      config,
      (decodedText: string) => {
        onScanned(decodedText)
      },
      () => { /* ignore decode failures */ },
    )

    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div>
      <p className="mb-2">Scanning QR codes...</p>
      <div ref={containerRef} id="qr-scanner-container" />
    </div>
  )
}
