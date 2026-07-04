import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SendPage from '../../src/send/SendPage'

vi.mock('../../lib/chunk', () => ({
  chunkFile: vi.fn(() => [{
    version: 1, type: 'data', sessionId: 's1', chunkIndex: 0, totalChunks: 1,
    originalFilename: 'test.txt', originalSize: 10, compressedSize: 10,
    checksum: 'abc', payload: 'dGVzdA==',
  }]),
}))

vi.mock('../../lib/compress', () => ({
  compress: vi.fn(() => new Uint8Array([1, 2, 3])),
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,fake')),
  },
}))

describe('SendPage', () => {
  test('renders file upload button', () => {
    render(<SendPage />)
    expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument()
  })

  test('shows QR frames after file selection', async () => {
    render(<SendPage />)
    const fileInput = screen.getByLabelText(/Upload file/i)
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId(/qr-frame/i)).toBeInTheDocument()
    })
  })
})
