import { useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanned: (data: string) => void
}

export default function QRScanner({ onScanned }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onScannedRef = useRef(onScanned)

  useEffect(() => {
    onScannedRef.current = onScanned
  })

  useEffect(() => {
    if (!containerRef.current) return

    scannerRef.current = new Html5Qrcode('qr-scanner-container', {
      verbose: false,
    })

    scannerRef.current.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 400, height: 400 },
        aspectRatio: 1.0,
      },
      (decodedText: string) => {
        onScannedRef.current(decodedText)
      },
      () => {},
    ).catch((err: Error) => {
      console.error('QR Scanner failed to start:', err)
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-4 bg-red-900/50 rounded-lg text-center">
            <p class="text-red-300 mb-2">Camera access failed</p>
            <p class="text-sm text-red-400">
              Make sure you're using HTTPS or localhost,
              and have granted camera permissions.
            </p>
          </div>`
      }
    })

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
