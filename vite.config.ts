import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

let httpsConfig: object | false = false
if (process.env.HTTPS !== 'false') {
  try {
    httpsConfig = {
      key: fs.readFileSync('cert/server.key'),
      cert: fs.readFileSync('cert/server.crt'),
    }
  } catch {
    console.warn('⚠️  SSL certs not found, falling back to HTTP')
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/qr-transfer/',
  server: {
    host: '0.0.0.0',
    https: httpsConfig,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
