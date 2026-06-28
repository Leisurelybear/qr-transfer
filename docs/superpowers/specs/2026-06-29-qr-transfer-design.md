# QR Transfer - Design Document

Cross-device file transfer via QR codes. Computer encodes files into QR frames, phone decodes them in real time.

## Overview

Two web apps in a single React + TypeScript project:
- **Send page** (`/send`): Upload files, compress, chunk into QR frames, play or generate GIF
- **Receive page** (`/receive`): Scan QR codes continuously, reassemble chunks, decompress, download

Target: small files (KB~MB), not large media.

## Custom Protocol

Each QR frame carries a JSON packet, Base64 encoded:

```json
{
  "version": 1,
  "type": "data" | "control",
  "sessionId": "uuid",
  "chunkIndex": 0,
  "totalChunks": 42,
  "originalFilename": "photo.jpg",
  "originalSize": 1234567,
  "compressedSize": 987654,
  "checksum": "sha256-hex",
  "payload": "base64compressedchunk"
}
```

Control frames: `{ "type": "control", "ctrlMsg": "ready" | "done" | "error" }`

## Data Flow

### Send
1. User selects file(s)
2. Compress with pako (deflate)
3. Split into fixed-size chunks (target ~2KB payload to fit QR capacity)
4. Wrap each chunk in a protocol packet
5. Encode each packet to a QR code (qrcode npm package)
6. Play frames in sequence (6-10 fps) OR generate GIF

### Receive
1. Load html5-qrcode in continuous scan mode
2. For each decoded frame, parse the packet
3. Validate checksum, deduplicate by (sessionId, chunkIndex)
4. Collect chunks until totalChunks reached
5. Concatenate payloads, decompress with pako
6. Offer download with original filename

## Error Handling

- Corrupted frame: discard, request retry via control frame
- Missed frame: after timeout, send "missing chunks" control message
- Sender supports re-play from any chunk index
- Session IDs prevent cross-transfer collisions

## Tech Stack

- React 18 + TypeScript + Vite
- pako for compression
- html5-qrcode for scanning
- qrcode (npm) for encoding
- gif.js for GIF generation
- Tailwind CSS for styling
