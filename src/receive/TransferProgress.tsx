interface TransferProgressProps {
  received: number
  total: number
  downloadUrl: string | null
  fileName: string
}

export default function TransferProgress({ received, total, downloadUrl, fileName }: TransferProgressProps) {
  const progress = total > 0 ? (received / total) * 100 : 0

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-700 rounded h-4">
        <div
          className="bg-green-500 h-4 rounded transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-sm">{received} / {total} chunks ({Math.round(progress)}%)</p>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={fileName}
          className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Download {fileName}
        </a>
      )}
    </div>
  )
}
