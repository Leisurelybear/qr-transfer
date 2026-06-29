import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReceivePage from '../../src/receive/ReceivePage'

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
  })),
}))

describe('ReceivePage', () => {
  test('renders scanner area', () => {
    render(<ReceivePage />)
    expect(screen.getByText(/scanning QR/i)).toBeInTheDocument()
  })
})
