import type { DataPacket } from '../shared/protocol'
import { serializePacket } from '../shared/protocol'

export function packetToQrData(packet: DataPacket): string {
  return serializePacket(packet)
}

export function packetsToFrames(packets: DataPacket[]): string[] {
  return packets.map(packetToQrData)
}
