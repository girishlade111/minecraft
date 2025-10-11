import type { Vec3 } from "@/lib/types"

export interface WorldDimensions {
  sizeX: number
  sizeY: number
  sizeZ: number
}

export function isInBounds(x: number, y: number, z: number, sizeX: number, sizeY: number, sizeZ: number): boolean {
  return x >= 0 && x < sizeX && y >= 0 && y < sizeY && z >= 0 && z < sizeZ
}

export function getVoxel(
  voxels: Uint16Array,
  x: number,
  y: number,
  z: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
): number {
  if (x < 0 || x >= sizeX || y < 0 || y >= sizeY || z < 0 || z >= sizeZ) {
    return 0 // Return air for out-of-bounds
  }
  const index = x + y * sizeX + z * sizeX * sizeY
  return voxels[index]
}

export function setVoxel(
  voxels: Uint16Array,
  x: number,
  y: number,
  z: number,
  blockId: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
): void {
  if (x < 0 || x >= sizeX || y < 0 || y >= sizeY || z < 0 || z >= sizeZ) {
    return // Ignore out-of-bounds writes
  }
  const index = x + y * sizeX + z * sizeX * sizeY
  voxels[index] = blockId
}

export function getBlock(
  voxels: Uint16Array,
  x: number,
  y: number,
  z: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
): number {
  return getVoxel(voxels, x, y, z, sizeX, sizeY, sizeZ)
}

export class VoxelUtils {
  constructor(private dimensions: WorldDimensions) {}

  // Convert (x,y,z) to flat array index
  getIndex(x: number, y: number, z: number): number {
    const { sizeX, sizeY, sizeZ } = this.dimensions
    return x + y * sizeX + z * sizeX * sizeY
  }

  // Convert flat array index to (x,y,z)
  getCoords(index: number): Vec3 {
    const { sizeX, sizeY } = this.dimensions
    const x = index % sizeX
    const y = Math.floor(index / sizeX) % sizeY
    const z = Math.floor(index / (sizeX * sizeY))
    return { x, y, z }
  }

  // Check if coordinates are within world bounds
  isInBounds(x: number, y: number, z: number): boolean {
    const { sizeX, sizeY, sizeZ } = this.dimensions
    return x >= 0 && x < sizeX && y >= 0 && y < sizeY && z >= 0 && z < sizeZ
  }

  // Get total voxel count
  getTotalVoxels(): number {
    const { sizeX, sizeY, sizeZ } = this.dimensions
    return sizeX * sizeY * sizeZ
  }

  // Get neighbors of a voxel (6-directional)
  getNeighbors(x: number, y: number, z: number): Vec3[] {
    const neighbors: Vec3[] = []
    const directions = [
      { x: 1, y: 0, z: 0 }, // +X
      { x: -1, y: 0, z: 0 }, // -X
      { x: 0, y: 1, z: 0 }, // +Y
      { x: 0, y: -1, z: 0 }, // -Y
      { x: 0, y: 0, z: 1 }, // +Z
      { x: 0, y: 0, z: -1 }, // -Z
    ]

    for (const dir of directions) {
      const nx = x + dir.x
      const ny = y + dir.y
      const nz = z + dir.z
      if (this.isInBounds(nx, ny, nz)) {
        neighbors.push({ x: nx, y: ny, z: nz })
      }
    }

    return neighbors
  }
}
