export type BlockId = number

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface RaycastHit {
  hit: boolean
  position?: Vector3
  normal?: Vector3
  distance?: number
}

export type Vec3 = Vector3

export interface VoxelHit {
  pos: [number, number, number] // targeted block coordinate
  normal: [number, number, number] // face normal of the hit
}

export interface DropStack {
  blockId: BlockId
  qty: number
}

export interface AABB {
  min: [number, number, number]
  max: [number, number, number]
}

export interface InventorySlot {
  blockId: BlockId | 0
  qty: number
}

export interface WorldConfig {
  sizeX: number
  sizeY: number
  sizeZ: number
  seed: number
}
