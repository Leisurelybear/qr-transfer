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
