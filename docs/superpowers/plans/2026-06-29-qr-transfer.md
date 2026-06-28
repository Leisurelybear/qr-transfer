# QR Transfer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-device file transfer web app where a computer encodes files into QR frames and a phone scans them to reconstruct the files.

**Architecture:** Single React + TypeScript + Vite project with two pages (`/send` and `/receive`). Core logic lives in `src/lib/` as pure functions. Send page compresses files, chunks them, wraps in protocol packets, and renders QR frames. Receive page scans QR codes via camera, collects chunks, reassembles and decompresses files.

**Tech Stack:** React 18, TypeScript, Vite, pako (compression), html5-qrcode (scanning), qrcode (encoding), Tailwind CSS.

## Global Constraints

- TDD: write failing tests before every piece of implementation code
- DRY: extract repeated logic into shared utilities
- YAGNI: no auth, no cloud, no user accounts, no social features
- Target files: KB to ~50 MB; QR frame payload capped at ~2KB to fit Version 40 QR
- Browser support: modern Chrome/Firefox/Safari for send; Chrome/Safari for receive (camera access)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `src/index.css`, `src/App.tsx`, `src/main.tsx`
- Create: `index.html`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: none (initial scaffolding)
- Produces: runnable Vite + React + TypeScript + Tailwind project

- [ ] **Step 1: Initialize package.json with Vite + React + TypeScript + Tailwind dependencies**

Create `package.json`:
```json
{
  "name": "qr-transfer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "pako": "^2.1.0",
    "qrcode": "^1.5.4",
    "html5-qrcode": "^2.3.8",
    "gif.js": "^0.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/qrcode": "^1.5.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 2: Create Vite config**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

- [ ] **Step 3: Create tsconfig files**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "tests"]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create Tailwind + PostCSS configs**

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create index.html and entry files**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QR Transfer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

Create `src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import SendPage from './send/SendPage'
import ReceivePage from './receive/ReceivePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SendPage />} />
      <Route path="/send" element={<SendPage />} />
      <Route path="/receive" element={<ReceivePage />} />
    </Routes>
  )
}
```

Create stub pages `src/send/SendPage.tsx`:
```typescript
export default function SendPage() {
  return <div>Send Page (stub)</div>
}
```

Create stub page `src/receive/ReceivePage.tsx`:
```typescript
export default function ReceivePage() {
  return <div>Receive Page (stub)</div>
}
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Create test setup**

Create `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Create `tests/setup.test.ts`:
```typescript
import { expect, test } from 'vitest'

test('setup works', () => {
  expect(true).toBe(true)
})
```

- [ ] **Step 7: Install dependencies and verify build**

Run:
```bash
npm install
npm run build
```
Expected: successful build with no errors.

- [ ] **Step 8: Run tests to verify test infrastructure**

Run: `npx vitest run`
Expected: 1 passing test.

- [ ] **Step 9: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js index.html src/ tests/
git commit -m "chore: scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: Protocol Packet Types and Serialization

**Files:**
- Create: `src/shared/protocol.ts`
- Test: `tests/protocol.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `ProtocolPacket` type, `serializePacket(packet) -> string`, `parsePacket(raw: string) -> ProtocolPacket | null`

- [ ] **Step 1: Write failing test for protocol packet serialization**

Create `tests/protocol.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { serializePacket, parsePacket, ControlPacket, DataPacket } from '../src/shared/protocol'

describe('protocol serialization', () => {
  test('serializes a data packet', () => {
    const packet: DataPacket = {
      version: 1,
      type: 'data',
      sessionId: 'test-session-1',
      chunkIndex: 0,
      totalChunks: 5,
      originalFilename: 'test.txt',
      originalSize: 100,
      compressedSize: 80,
      checksum: 'abc123',
      payload: 'dGVzdA==',
    }
    const serialized = serializePacket(packet)
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('dGVzdA==')
  })

  test('parses a data packet back', () => {
    const packet: DataPacket = {
      version: 1,
      type: 'data',
      sessionId: 'test-session-1',
      chunkIndex: 0,
      totalChunks: 5,
      originalFilename: 'test.txt',
      originalSize: 100,
      compressedSize: 80,
      checksum: 'abc123',
      payload: 'dGVzdA==',
    }
    const serialized = serializePacket(packet)
    const parsed = parsePacket(serialized)
    expect(parsed).not.toBeNull()
    expect(parsed!.sessionId).toBe('test-session-1')
    expect(parsed!.chunkIndex).toBe(0)
    expect(parsed!.totalChunks).toBe(5)
  })

  test('serializes a control packet', () => {
    const packet: ControlPacket = {
      version: 1,
      type: 'control',
      ctrlMsg: 'ready',
    }
    const serialized = serializePacket(packet)
    const parsed = parsePacket(serialized)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('control')
    expect((parsed as ControlPacket).ctrlMsg).toBe('ready')
  })

  test('returns null for invalid JSON', () => {
    expect(parsePacket('not-json')).toBeNull()
    expect(parsePacket('')).toBeNull()
  })

  test('generates unique session IDs', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    expect(id1).not.toBe(id2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/protocol.test.ts`
Expected: FAIL with "module not found" or "functions not defined".

- [ ] **Step 3: Write protocol types and serialization**

Create `src/shared/protocol.ts`:
```typescript
export type CtrlMsg = 'ready' | 'done' | 'error' | 'missing'

export interface BasePacket {
  version: 1
  type: 'data' | 'control'
}

export interface DataPacket extends BasePacket {
  type: 'data'
  sessionId: string
  chunkIndex: number
  totalChunks: number
  originalFilename: string
  originalSize: number
  compressedSize: number
  checksum: string
  payload: string
}

export interface ControlPacket extends BasePacket {
  type: 'control'
  ctrlMsg: CtrlMsg
  sessionId?: string
  missingChunks?: number[]
}

export type ProtocolPacket = DataPacket | ControlPacket

export function serializePacket(packet: ProtocolPacket): string {
  return JSON.stringify(packet)
}

export function parsePacket(raw: string): ProtocolPacket | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.type === 'control') {
      return {
        version: parsed.version,
        type: 'control',
        ctrlMsg: parsed.ctrlMsg,
        sessionId: parsed.sessionId,
        missingChunks: parsed.missingChunks,
      } as ControlPacket
    }
    if (parsed.type === 'data') {
      return {
        version: parsed.version,
        type: 'data',
        sessionId: parsed.sessionId,
        chunkIndex: parsed.chunkIndex,
        totalChunks: parsed.totalChunks,
        originalFilename: parsed.originalFilename,
        originalSize: parsed.originalSize,
        compressedSize: parsed.compressedSize,
        checksum: parsed.checksum,
        payload: parsed.payload,
      } as DataPacket
    }
  } catch {
    // JSON parse error
  }
  return null
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/protocol.test.ts`
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/shared/protocol.ts tests/protocol.test.ts
git commit -m "feat: add protocol packet types and serialization"
```

---

### Task 3: Chunking and Compression

**Files:**
- Create: `src/lib/chunk.ts`
- Test: `tests/chunk.test.ts`

**Interfaces:**
- Consumes: `DataPacket` from `src/shared/protocol`
- Produces: `chunkFile(data: Uint8Array, sessionId: string, totalChunks: number) -> DataPacket[]`, `mergeChunks(packets: DataPacket[]) -> Uint8Array | null`

- [ ] **Step 1: Write failing test for chunking**

Create `tests/chunk.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { chunkFile, mergeChunks } from '../src/lib/chunk'
import type { DataPacket } from '../src/shared/protocol'

describe('chunking', () => {
  const sessionId = 'test-session-1'
  const data = new TextEncoder().encode('Hello, World! This is a test file content.')

  test('splits data into chunks of max 2KB payload', () => {
    const packets = chunkFile(data, sessionId, 3)
    expect(packets.length).toBe(3)
    packets.forEach((pkt, i) => {
      expect(pkt.sessionId).toBe(sessionId)
      expect(pkt.chunkIndex).toBe(i)
      expect(pkt.totalChunks).toBe(3)
      expect(pkt.payload.length).toBeLessThanOrEqual(2048)
    })
  })

  test('merges chunks back to original data', () => {
    const packets = chunkFile(data, sessionId, 3)
    const merged = mergeChunks(packets)
    expect(merged).not.toBeNull()
    expect(new TextDecoder().decode(merged!)).toBe('Hello, World! This is a test file content.')
  })

  test('returns null for out-of-order chunks', () => {
    const packets: DataPacket[] = [
      {
        version: 1, type: 'data', sessionId, chunkIndex: 1, totalChunks: 3,
        originalFilename: '', originalSize: 0, compressedSize: 0, checksum: '', payload: '',
      },
      {
        version: 1, type: 'data', sessionId, chunkIndex: 0, totalChunks: 3,
        originalFilename: '', originalSize: 0, compressedSize: 0, checksum: '', payload: '',
      },
    ]
    const merged = mergeChunks(packets)
    expect(merged).toBeNull()
  })

  test('deduplicates packets with same chunkIndex', () => {
    const packets = chunkFile(data, sessionId, 3)
    // Add a duplicate of chunk 1
    const withDupes = [...packets, { ...packets[1], payload: packets[1].payload }]
    const merged = mergeChunks(withDupes)
    expect(merged).not.toBeNull()
    expect(new TextDecoder().decode(merged!)).toBe(new TextDecoder().decode(data))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/chunk.test.ts`
Expected: FAIL with "module not found".

- [ ] **Step 3: Write chunking implementation**

Create `src/lib/chunk.ts`:
```typescript
import type { DataPacket } from '../shared/protocol'

const MAX_PAYLOAD_SIZE = 2048

export function chunkFile(
  data: Uint8Array,
  sessionId: string,
  totalChunks: number,
): DataPacket[] {
  const chunks: DataPacket[] = []
  const chunkSize = Math.ceil(data.length / totalChunks)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, data.length)
    const slice = data.slice(start, end)
    const payload = btoa(String.fromCharCode(...slice))

    chunks.push({
      version: 1,
      type: 'data',
      sessionId,
      chunkIndex: i,
      totalChunks,
      originalFilename: '',
      originalSize: data.length,
      compressedSize: slice.length,
      checksum: '',
      payload,
    })
  }

  return chunks
}

export function mergeChunks(packets: DataPacket[]): Uint8Array | null {
  // Check all chunks present
  const indices = packets.map(p => p.chunkIndex).sort((a, b) => a - b)
  const expected = Array.from({ length: packets[0].totalChunks }, (_, i) => i)
  for (const exp of expected) {
    if (!indices.includes(exp)) return null
  }

  // Sort by chunkIndex
  const sorted = [...packets].sort((a, b) => a.chunkIndex - b.chunkIndex)

  // Deduplicate by chunkIndex (keep first)
  const seen = new Set<number>()
  const deduped: DataPacket[] = []
  for (const pkt of sorted) {
    if (!seen.has(pkt.chunkIndex)) {
      seen.add(pkt.chunkIndex)
      deduped.push(pkt)
    }
  }

  // Reconstruct
  const totalLength = deduped.reduce((sum, p) => sum + p.compressedSize, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const pkt of deduped) {
    const slice = Uint8Array.from(atob(pkt.payload), c => c.charCodeAt(0))
    result.set(slice, offset)
    offset += slice.length
  }

  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/chunk.test.ts`
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/chunk.ts tests/chunk.test.ts
git commit -m "feat: add file chunking and reassembly logic"
```

---

### Task 4: Compression with Pako

**Files:**
- Create: `src/lib/compress.ts`
- Test: `tests/compress.test.ts`

**Interfaces:**
- Consumes: `Uint8Array` raw data
- Produces: `compress(data: Uint8Array) -> Uint8Array`, `decompress(data: Uint8Array) -> Uint8Array`

- [ ] **Step 1: Write failing test for compression**

Create `tests/compress.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { compress, decompress } from '../src/lib/compress'

describe('compression', () => {
  const original = new TextEncoder().encode('Hello, World! This is test data for compression.')

  test('compresses data', () => {
    const compressed = compress(original)
    expect(compressed.length).toBeLessThan(original.length)
  })

  test('decompresses back to original', () => {
    const compressed = compress(original)
    const decompressed = decompress(compressed)
    expect(new TextDecoder().decode(decompressed)).toBe('Hello, World! This is test data for compression.')
  })

  test('round-trips through chunk -> merge', async () => {
    const { chunkFile, mergeChunks } = await import('../lib/chunk')
    const { compress, decompress } = await import('../lib/compress')

    const rawData = new TextEncoder().encode('Round trip test data with some repetition repetition repetition.')
    const compressed = compress(rawData)
    const packets = chunkFile(compressed, 'rt-test', 5)
    const merged = mergeChunks(packets)

    expect(merged).not.toBeNull()
    const decompressed = decompress(merged!)
    expect(new TextDecoder().decode(decompressed)).toBe('Round trip test data with some repetition repetition repetition.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/compress.test.ts`
Expected: FAIL with "module not found".

- [ ] **Step 3: Write compression wrapper**

Create `src/lib/compress.ts`:
```typescript
import { compress as pakoCompress, decompress as pakoDecompress } from 'pako'

export function compress(data: Uint8Array): Uint8Array {
  return pakoCompress(data, { level: 6 })
}

export function decompress(compressed: Uint8Array): Uint8Array {
  return pakoDecompress(compressed)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/compress.test.ts`
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/compress.ts tests/compress.test.ts
git commit -m "feat: add pako compression/decompression wrapper"
```

---

### Task 5: QR Frame Encoding

**Files:**
- Create: `src/lib/qrEncode.ts`
- Test: `tests/qrEncode.test.ts`

**Interfaces:**
- Consumes: `DataPacket[]` from `src/shared/protocol`
- Produces: `packetToQrData(packet: DataPacket) -> string` (text data for qrcode lib), `packetsToFrames(packets: DataPacket[]) -> string[]`

- [ ] **Step 1: Write failing test for QR encoding**

Create `tests/qrEncode.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { packetToQrData, packetsToFrames } from '../src/lib/qrEncode'
import { serializePacket } from '../src/shared/protocol'

describe('QR encoding', () => {
  test('converts a packet to QR-compatible data', () => {
    const json = serializePacket({
      version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 1,
      originalFilename: 'test.txt', originalSize: 10, compressedSize: 10,
      checksum: 'abc', payload: 'dGVzdA==',
    })
    const qrData = packetToQrData({
      version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 1,
      originalFilename: 'test.txt', originalSize: 10, compressedSize: 10,
      checksum: 'abc', payload: 'dGVzdA==',
    })
    expect(qrData).toBe(json)
  })

  test('generates frames for multiple packets', () => {
    const packets = [
      { version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 2, originalFilename: '', originalSize: 0, compressedSize: 5, checksum: '', payload: 'dGVzdDE=' },
      { version: 1, type: 'data', sessionId: 's1', chunkIndex: 1, totalChunks: 2, originalFilename: '', originalSize: 0, compressedSize: 5, checksum: '', payload: 'dGVzdDI=' },
    ]
    const frames = packetsToFrames(packets)
    expect(frames.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/qrEncode.test.ts`
Expected: FAIL with "module not found".

- [ ] **Step 3: Write QR encoding**

Create `src/lib/qrEncode.ts`:
```typescript
import type { DataPacket } from '../shared/protocol'
import { serializePacket } from '../shared/protocol'

export function packetToQrData(packet: DataPacket): string {
  return serializePacket(packet)
}

export function packetsToFrames(packets: DataPacket[]): string[] {
  return packets.map(packetToQrData)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/qrEncode.test.ts`
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qrEncode.ts tests/qrEncode.test.ts
git commit -m "feat: add QR frame encoding from protocol packets"
```

---

### Task 6: Send Page - File Selection and QR Display

**Files:**
- Modify: `src/send/SendPage.tsx`
- Create: `src/send/FileSelector.tsx`
- Create: `src/send/QRDisplay.tsx`
- Test: `tests/send/SendPage.test.tsx`

**Interfaces:**
- Consumes: `chunkFile`, `compress`, `packetsToFrames` from lib
- Produces: Send UI with file picker, QR frame carousel, play/stop controls, GIF generation button

- [ ] **Step 1: Write failing test for SendPage**

Create `tests/send/SendPage.test.tsx`:
```typescript
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SendPage from '../../src/send/SendPage'

describe('SendPage', () => {
  test('renders file upload button', () => {
    render(<SendPage />)
    expect(screen.getByText(/upload/i)).toBeInTheDocument()
  })

  test('shows QR frames after file selection', async () => {
    const mockPackets = [{
      version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 1,
      originalFilename: 'test.txt', originalSize: 10, compressedSize: 10,
      checksum: 'abc', payload: 'dGVzdA==',
    }]
    vi.doMock('../../lib/chunk', () => ({ chunkFile: vi.fn(() => mockPackets) }))
    vi.doMock('../../lib/compress', () => ({ compress: vi.fn(() => new Uint8Array([1, 2, 3])) }))

    render(<SendPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await vi.waitFor(() => {
      expect(screen.getByTestId(/qr-frame/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/send/SendPage.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement SendPage with FileSelector and QRDisplay**

Replace `src/send/SendPage.tsx`:
```typescript
import { useState, useCallback } from 'react'
import FileSelector from './FileSelector'
import QRDisplay from './QRDisplay'
import { compress } from '../lib/compress'
import { chunkFile } from '../lib/chunk'
import { generateSessionId } from '../shared/protocol'
import type { DataPacket } from '../shared/protocol'

export default function SendPage() {
  const [frames, setFrames] = useState<DataPacket[]>([])
  const [playing, setPlaying] = useState(false)
  const [sessionId, setSessionId] = useState('')

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
    </div>
  )
}
```

Create `src/send/FileSelector.tsx`:
```typescript
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
```

Create `src/send/QRDisplay.tsx`:
```typescript
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
  const intervalRef = useRef<number | null>(null)
  const fps = 6

  const loadFrame = useCallback(async (index: number) => {
    const data = JSON.stringify(packets[index])
    const url = await QRCode.toDataURL(data, { width: 512 })
    setQrUrl(url)
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
        {qrUrl && <img src={qrUrl} alt="QR Code" />}
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/send/SendPage.test.tsx`
Expected: tests passing (may need to adjust mocking).

- [ ] **Step 5: Commit**

```bash
git add src/send/SendPage.tsx src/send/FileSelector.tsx src/send/QRDisplay.tsx tests/send/SendPage.test.tsx
git commit -m "feat: add send page with file selector and QR frame display"
```

---

### Task 7: Receive Page - QR Scanner

**Files:**
- Modify: `src/receive/ReceivePage.tsx`
- Create: `src/receive/QRScanner.tsx`
- Create: `src/receive/TransferProgress.tsx`
- Test: `tests/receive/ReceivePage.test.tsx`

**Interfaces:**
- Consumes: `parsePacket`, `mergeChunks`, `decompress` from lib
- Produces: Receive UI with camera scanner, progress indicator, download button

- [ ] **Step 1: Write failing test for ReceivePage**

Create `tests/receive/ReceivePage.test.tsx`:
```typescript
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReceivePage from '../../src/receive/ReceivePage'

describe('ReceivePage', () => {
  test('renders scanner area', () => {
    render(<ReceivePage />)
    expect(screen.getByText(/scan QR code/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/receive/ReceivePage.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement ReceivePage with QRScanner**

Replace `src/receive/ReceivePage.tsx`:
```typescript
import { useState, useCallback } from 'react'
import QRScanner from './QRScanner'
import TransferProgress from './TransferProgress'
import { parsePacket } from '../shared/protocol'
import { mergeChunks } from '../lib/chunk'
import { decompress } from '../lib/compress'
import type { DataPacket } from '../shared/protocol'

export default function ReceivePage() {
  const [packets, setPackets] = useState<DataPacket[]>([])
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  const handleQRScanned = useCallback((rawData: string) => {
    const packet = parsePacket(rawData)
    if (!packet) return

    if (packet.type === 'control') {
      if (packet.ctrlMsg === 'done' && packet.sessionId) {
        setSessionActive(false)
      }
      return
    }

    if (packet.type === 'data') {
      if (!sessionActive) {
        setSessionId(packet.sessionId)
        setSessionActive(true)
        setPackets([])
        setDownloadUrl(null)
      }

      if (packet.sessionId !== sessionId) return

      setPackets(prev => {
        const existing = prev.find(p => p.chunkIndex === packet.chunkIndex)
        if (existing) return prev

        const updated = [...prev, packet]
        if (updated.length === packet.totalChunks) {
          // All chunks received, assemble
          const merged = mergeChunks(updated)
          if (merged) {
            const decompressed = decompress(merged)
            const blob = new Blob([decompressed])
            const url = URL.createObjectURL(blob)
            setDownloadUrl(url)
            setFileName(packet.originalFilename || 'download')
          }
        }
        return updated
      })
    }
  }, [sessionActive, sessionId])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
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
```

Create `src/receive/QRScanner.tsx`:
```typescript
import { useRef, useEffect, useCallback } from 'react'
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
```

Create `src/receive/TransferProgress.tsx`:
```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/receive/ReceivePage.test.tsx`
Expected: tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/receive/ReceivePage.tsx src/receive/QRScanner.tsx src/receive/TransferProgress.tsx tests/receive/ReceivePage.test.tsx
git commit -m "feat: add receive page with QR scanner and progress tracking"
```

---

### Task 8: GIF Generation

**Files:**
- Create: `src/lib/gifGenerate.ts`
- Create: `src/send/GifGenerator.tsx`
- Test: `tests/gifGenerate.test.ts`

**Interfaces:**
- Consumes: QR data strings (base64 image URLs)
- Produces: Blob (GIF file) for download

- [ ] **Step 1: Write failing test for GIF generation**

Create `tests/gifGenerate.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { generateGifBlob } from '../src/lib/gifGenerate'

describe('GIF generation', () => {
  test('creates a blob from QR frames', async () => {
    const frames = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
    ]
    const blob = await generateGifBlob(frames, 6)
    expect(blob instanceof Blob).toBe(true)
    expect(blob.size).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/gifGenerate.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement GIF generator**

Create `src/lib/gifGenerate.ts`:
```typescript
import GIF from 'gif.js'

export function generateGifBlob(frames: string[], fps: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 512,
      height: 512,
    })

    frames.forEach(frameUrl => {
      const img = new Image()
      img.onload = () => gif.addFrame(img, { delay: 1000 / fps })
      img.onerror = () => reject(new Error(`Failed to load frame: ${frameUrl}`))
      img.src = frameUrl
    })

    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.on('error', (err: Error) => reject(err))
    gif.render()
  })
}
```

Create `src/send/GifGenerator.tsx`:
```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/gifGenerate.test.ts`
Expected: tests passing (may need mock for gif.js in test env).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gifGenerate.ts src/send/GifGenerator.tsx tests/gifGenerate.test.ts
git commit -m "feat: add GIF generation from QR frames"
```

---

### Task 9: Integration Test and Polish

**Files:**
- Create: `tests/integration.test.ts`
- Modify: `src/index.css` (add any needed styles)
- Modify: `src/send/SendPage.tsx` (integrate GIF generator)
- Modify: `src/receive/ReceivePage.tsx` (improve error handling)

**Interfaces:**
- Consumes: everything from previous tasks
- Produces: end-to-end working demo

- [ ] **Step 1: Write integration test**

Create `tests/integration.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { compress } from '../src/lib/compress'
import { decompress } from '../src/lib/compress'
import { chunkFile } from '../src/lib/chunk'
import { mergeChunks } from '../src/lib/chunk'
import { serializePacket, parsePacket, generateSessionId } from '../src/shared/protocol'

describe('full transfer pipeline', () => {
  test('compress -> chunk -> serialize -> parse -> merge -> decompress', () => {
    const originalText = 'Integration test: the quick brown fox jumps over the lazy dog.'
    const original = new TextEncoder().encode(originalText)

    const compressed = compress(original)

    const sessionId = generateSessionId()
    const totalChunks = 5
    const packets = chunkFile(compressed, sessionId, totalChunks)

    // Simulate network: serialize and parse (as QR would)
    const serialized = packets.map(p => serializePacket(p))
    const parsed = serialized.map(s => parsePacket(s)!).filter(Boolean)

    // Reassemble
    const merged = mergeChunks(parsed as typeof packets)
    expect(merged).not.toBeNull()

    // Decompress
    const decompressed = decompress(merged!)
    const result = new TextDecoder().decode(decompressed)
    expect(result).toBe(originalText)
  })
})
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/integration.test.ts`
Expected: test passing.

- [ ] **Step 3: Integrate GIF generator into SendPage**

Update `src/send/SendPage.tsx` to include GifGenerator:
```diff
+import GifGenerator from './GifGenerator'
+import QRCode from 'qrcode'

// Inside the component, after frames are set:
+const [qrUrls, setQrUrls] = useState<string[]>([])
+
+useEffect(() => {
+  ;(async () => {
+    const urls = await Promise.all(
+      frames.map(async (pkt) => {
+        return QRCode.toDataURL(JSON.stringify(pkt), { width: 512 })
+      })
+    )
+    setQrUrls(urls)
+  })()
+}, [frames])

// Add GifGenerator to the render:
+{qrUrls.length > 0 && <GifGenerator qrUrls={qrUrls} fps={6} />}
```

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add tests/integration.test.ts src/send/SendPage.tsx src/send/GifGenerator.tsx
git commit -m "feat: add integration test and polish send page with GIF generator"
```

---

### Task 10: Final Review and Documentation

**Files:**
- Create: `README.md`
- Modify: `src/index.css` (final styles)

**Interfaces:**
- Consumes: entire project
- Produces: documented, runnable project

- [ ] **Step 1: Create README**

Create `README.md`:
```markdown
# QR Transfer

Cross-device file transfer via QR codes.

## How It Works

**Send (Computer):**
1. Open `/send` page
2. Select a file
3. Choose "Play" to stream QR codes, or "Generate GIF" to create a downloadable GIF

**Receive (Phone):**
1. Open `/receive` page in browser
2. Grant camera permission
3. Point camera at the QR frames (or photograph the GIF)
4. File downloads automatically when all chunks are received

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
```

## Architecture

- `src/send/` - Send page components
- `src/receive/` - Receive page components
- `src/shared/` - Protocol definitions
- `src/lib/` - Compression, chunking, QR encoding, GIF generation
```

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: all tests passing.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: successful build.

- [ ] **Step 4: Commit**

```bash
git add README.md src/index.css
git commit -m "docs: add README and final polish"
```
