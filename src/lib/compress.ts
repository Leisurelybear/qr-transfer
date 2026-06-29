import { deflate as pakoCompress, inflate as pakoDecompress } from 'pako'

export function compress(data: Uint8Array): Uint8Array {
  return pakoCompress(data, { level: 6 })
}

export function decompress(compressed: Uint8Array): Uint8Array {
  return pakoDecompress(compressed)
}
