import { useRef } from 'react'

interface FileSelectorProps {
  onFileSelect: (file: File) => void
}

export default function FileSelector({ onFileSelect }: FileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload file"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        Select File
      </button>
    </div>
  )
}
