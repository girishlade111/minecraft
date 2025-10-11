// 3D Digital Differential Analyzer for voxel raycasting
import type { Vector3, RaycastHit } from "../types"
import { useWorldStore } from "../../engine/world/WorldStore"
import { getVoxel } from "../../engine/world/VoxelUtils"
import { BlockId } from "../../engine/blocks/BlockTypes"

export function raycastVoxel(origin: Vector3, direction: Vector3, maxDistance = 100): RaycastHit {
  // Normalize direction
  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2)
  const dir = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length,
  }

  // Current voxel position
  let x = Math.floor(origin.x)
  let y = Math.floor(origin.y)
  let z = Math.floor(origin.z)

  // Calculate step and initial tMax for each axis
  const stepX = dir.x > 0 ? 1 : -1
  const stepY = dir.y > 0 ? 1 : -1
  const stepZ = dir.z > 0 ? 1 : -1

  const tDeltaX = Math.abs(1 / dir.x)
  const tDeltaY = Math.abs(1 / dir.y)
  const tDeltaZ = Math.abs(1 / dir.z)

  let tMaxX = dir.x > 0 ? (x + 1 - origin.x) * tDeltaX : (origin.x - x) * tDeltaX
  let tMaxY = dir.y > 0 ? (y + 1 - origin.y) * tDeltaY : (origin.y - y) * tDeltaY
  let tMaxZ = dir.z > 0 ? (z + 1 - origin.z) * tDeltaZ : (origin.z - z) * tDeltaZ

  let distance = 0
  let normal = { x: 0, y: 0, z: 0 }

  const worldStore = useWorldStore.getState()
  const { sizeX, sizeY, sizeZ } = worldStore.getDimensions()

  while (distance < maxDistance) {
    const blockId = getVoxel(worldStore.voxels, x, y, z, sizeX, sizeY, sizeZ)
    if (blockId !== BlockId.AIR) {
      return {
        hit: true,
        position: { x, y, z },
        normal,
        distance,
      }
    }

    // Step to next voxel
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX
      distance = tMaxX
      tMaxX += tDeltaX
      normal = { x: -stepX, y: 0, z: 0 }
    } else if (tMaxY < tMaxZ) {
      y += stepY
      distance = tMaxY
      tMaxY += tDeltaY
      normal = { x: 0, y: -stepY, z: 0 }
    } else {
      z += stepZ
      distance = tMaxZ
      tMaxZ += tDeltaZ
      normal = { x: 0, y: 0, z: -stepZ }
    }
  }

  return { hit: false }
}

function isVoxelSolid(x: number, y: number, z: number): boolean {
  const worldStore = useWorldStore.getState()
  const { sizeX, sizeY, sizeZ } = worldStore.getDimensions()
  const blockId = getVoxel(worldStore.voxels, x, y, z, sizeX, sizeY, sizeZ)
  return blockId !== BlockId.AIR
}
