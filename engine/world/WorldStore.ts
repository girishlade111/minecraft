import { create } from "zustand"
import { VoxelUtils, type WorldDimensions } from "./VoxelUtils"
import { BlockId } from "../blocks/BlockTypes"
import type { Vector3 } from "@/lib/types"

export interface WorldState {
  // World data
  voxels: Uint16Array
  dimensions: WorldDimensions
  utils: VoxelUtils
  revision: number

  // Block breaking
  breakTarget: Vector3 | null
  breakProgress: number

  // Actions
  getVoxel: (x: number, y: number, z: number) => BlockId
  setVoxel: (x: number, y: number, z: number, blockId: BlockId) => void
  setVoxelDirect: (x: number, y: number, z: number, blockId: BlockId) => void
  initializeWorld: () => void
  incrementRevision: () => void
  getDimensions: () => WorldDimensions
  setBreakTarget: (target: Vector3 | null) => void
  setBreakProgress: (progress: number) => void
}

const WORLD_DIMENSIONS: WorldDimensions = {
  sizeX: 128,
  sizeY: 32,
  sizeZ: 128,
}

export const useWorldStore = create<WorldState>((set, get) => {
  const utils = new VoxelUtils(WORLD_DIMENSIONS)
  const totalVoxels = utils.getTotalVoxels()

  return {
    voxels: new Uint16Array(totalVoxels),
    dimensions: WORLD_DIMENSIONS,
    utils,
    revision: 0,
    breakTarget: null,
    breakProgress: 0,

    getVoxel: (x: number, y: number, z: number) => {
      const { voxels, utils } = get()
      if (!utils.isInBounds(x, y, z)) return BlockId.AIR
      const index = utils.getIndex(x, y, z)
      return voxels[index] as BlockId
    },

    setVoxelDirect: (x: number, y: number, z: number, blockId: BlockId) => {
      const { voxels, utils } = get()
      if (!utils.isInBounds(x, y, z)) return

      const index = utils.getIndex(x, y, z)
      voxels[index] = blockId
    },

    setVoxel: (x: number, y: number, z: number, blockId: BlockId) => {
      get().setVoxelDirect(x, y, z, blockId)
      set({ revision: get().revision + 1 })
    },

    initializeWorld: () => {
      set({ revision: get().revision + 1 })
    },

    incrementRevision: () => {
      set({ revision: get().revision + 1 })
    },

    getDimensions: () => get().dimensions,
    setBreakTarget: (target) => set({ breakTarget: target, breakProgress: 0 }),
    setBreakProgress: (progress) => set({ breakProgress: progress }),
  }
})
