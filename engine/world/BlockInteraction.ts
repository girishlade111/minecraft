import type { Vector3 } from "@/lib/types"
import { raycastVoxel } from "@/lib/math/dda"
import { useWorldStore } from "./WorldStore"
import { usePlayerStore } from "../player/PlayerStore"
import { setVoxel, getVoxel } from "./VoxelUtils"
import { BlockId } from "../blocks/BlockTypes"

export const BLOCK_BREAK_TIME_MS = 3000

export class BlockInteraction {
  static breakBlock(origin: Vector3, direction: Vector3): BlockId | null {
    const hit = raycastVoxel(origin, direction, 5) // 5 block reach
    if (!hit.hit || !hit.position) return null
    const { x, y, z } = hit.position
    return this.breakBlockAt(x, y, z)
  }

  static breakBlockAt(x: number, y: number, z: number): BlockId | null {
    const worldStore = useWorldStore.getState()
    const { sizeX, sizeY, sizeZ } = worldStore.getDimensions()

    const blockId = getVoxel(worldStore.voxels, x, y, z, sizeX, sizeY, sizeZ)
    if (blockId === BlockId.AIR) return null

    setVoxel(worldStore.voxels, x, y, z, BlockId.AIR, sizeX, sizeY, sizeZ)
    worldStore.incrementRevision()
    return blockId
  }

  static placeBlock(origin: Vector3, direction: Vector3, blockType: BlockId): boolean {
    const hit = raycastVoxel(origin, direction, 5) // 5 block reach

    if (!hit.hit) return false

    // Calculate placement position (adjacent to hit face)
    const placeX = hit.position.x + hit.normal.x
    const placeY = hit.position.y + hit.normal.y
    const placeZ = hit.position.z + hit.normal.z

    const worldStore = useWorldStore.getState()
    const playerStore = usePlayerStore.getState()
    const { sizeX, sizeY, sizeZ } = worldStore.getDimensions()

    // Check if position is within world bounds
    if (placeX < 0 || placeX >= sizeX || placeY < 0 || placeY >= sizeY || placeZ < 0 || placeZ >= sizeZ) {
      return false
    }

    // Check if position is already occupied
    const existingBlock = getVoxel(
      worldStore.voxels,
      placeX,
      placeY,
      placeZ,
      sizeX,
      sizeY,
      sizeZ,
    )
    if (existingBlock !== BlockId.AIR) return false

    // Check if placement would intersect player AABB
    if (this.wouldIntersectPlayer(placeX, placeY, placeZ, playerStore.position)) {
      return false
    }

    // Place the block
    setVoxel(worldStore.voxels, placeX, placeY, placeZ, blockType, sizeX, sizeY, sizeZ)
    worldStore.incrementRevision()

    return true
  }

  private static wouldIntersectPlayer(blockX: number, blockY: number, blockZ: number, playerPos: Vector3): boolean {
    // Player AABB: 0.8 wide, 1.8 tall, centered on position
    const playerMinX = playerPos.x - 0.4
    const playerMaxX = playerPos.x + 0.4
    const playerMinY = playerPos.y - 0.9
    const playerMaxY = playerPos.y + 0.9
    const playerMinZ = playerPos.z - 0.4
    const playerMaxZ = playerPos.z + 0.4

    // Block AABB: 1x1x1 at integer coordinates
    const blockMinX = blockX
    const blockMaxX = blockX + 1
    const blockMinY = blockY
    const blockMaxY = blockY + 1
    const blockMinZ = blockZ
    const blockMaxZ = blockZ + 1

    // Check for AABB intersection
    return !(
      playerMaxX <= blockMinX ||
      playerMinX >= blockMaxX ||
      playerMaxY <= blockMinY ||
      playerMinY >= blockMaxY ||
      playerMaxZ <= blockMinZ ||
      playerMinZ >= blockMaxZ
    )
  }
}
