import { useWorldStore } from "./WorldStore"
import { BlockId } from "../blocks/BlockTypes"
import { SimplexNoise } from "../../lib/noise"

export class WorldGen {
  static hills(): void {
    const { dimensions, setVoxelDirect, incrementRevision } = useWorldStore.getState()
    const { sizeX, sizeY, sizeZ } = dimensions

    // Initialize noise generator
    const noise = new SimplexNoise(42) // Fixed seed for consistent generation
    const scale = 0.05 // Noise scale for hills
    const baseHeight = 8
    const heightVariation = 4

    // Clear the world first
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        for (let z = 0; z < sizeZ; z++) {
          setVoxelDirect(x, y, z, BlockId.AIR)
        }
      }
    }

    // Generate heightmap and terrain
    const heightMap: number[][] = []
    for (let x = 0; x < sizeX; x++) {
      heightMap[x] = []
      for (let z = 0; z < sizeZ; z++) {
        // Generate height using simplex noise
        const noiseValue = noise.noise2D(x * scale, z * scale)
        const height = Math.floor(baseHeight + noiseValue * heightVariation)
        heightMap[x][z] = Math.max(1, Math.min(height, sizeY - 2))

        // Place terrain layers
        for (let y = 0; y <= heightMap[x][z]; y++) {
          if (y === heightMap[x][z]) {
            // Top layer - grass
            setVoxelDirect(x, y, z, BlockId.GRASS)
          } else if (y >= heightMap[x][z] - 3) {
            // Dirt layer (3 blocks deep)
            setVoxelDirect(x, y, z, BlockId.DIRT)
          } else {
            // Stone below
            setVoxelDirect(x, y, z, BlockId.STONE)
          }
        }
      }
    }

    // Place trees randomly on grass surfaces
    const treeChance = 0.05 // 5% chance per grass block
    for (let x = 1; x < sizeX - 1; x++) {
      for (let z = 1; z < sizeZ - 1; z++) {
        const surfaceHeight = heightMap[x][z]

        // Check if this is a suitable spot for a tree
        if (Math.random() < treeChance && surfaceHeight < sizeY - 6) {
          // Check if area is relatively flat (within 1 block height difference)
          let isFlat = true
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              if (Math.abs(heightMap[x + dx][z + dz] - surfaceHeight) > 1) {
                isFlat = false
                break
              }
            }
            if (!isFlat) break
          }

          if (isFlat) {
            this.placeTree(x, surfaceHeight + 1, z, setVoxelDirect, sizeY)
          }
        }
      }
    }

    // Trigger world update
    incrementRevision()
  }

  private static placeTree(
    x: number,
    y: number,
    z: number,
    setVoxelDirect: (x: number, y: number, z: number, blockId: BlockId) => void,
    maxY: number,
  ): void {
    const trunkHeight = 3 + Math.floor(Math.random() * 2) // 3-4 blocks tall

    // Place trunk
    for (let i = 0; i < trunkHeight; i++) {
      if (y + i < maxY) {
        setVoxelDirect(x, y + i, z, BlockId.LOG)
      }
    }

    // Place leaf canopy (simple 3x3x2 shape)
    const leafY = y + trunkHeight
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        for (let dy = 0; dy <= 1; dy++) {
          if (leafY + dy < maxY) {
            // Skip center column where trunk is, and add some randomness
            if (!(dx === 0 && dz === 0) && Math.random() > 0.2) {
              setVoxelDirect(x + dx, leafY + dy, z + dz, BlockId.LEAF)
            }
          }
        }
      }
    }

    // Add top leaf block
    if (leafY + 2 < maxY) {
      setVoxelDirect(x, leafY + 2, z, BlockId.LEAF)
  }
  }

  // Keep flat generation for compatibility
  static flat(): void {
    const { dimensions, utils, setVoxelDirect, incrementRevision } = useWorldStore.getState()
    const { sizeX, sizeY, sizeZ } = dimensions

    // Clear the world first
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        for (let z = 0; z < sizeZ; z++) {
          setVoxelDirect(x, y, z, BlockId.AIR)
        }
      }
    }

    // Generate flat world
    const grassLevel = 8
    const dirtDepth = 4

    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        // Place grass on top
        setVoxelDirect(x, grassLevel, z, BlockId.GRASS)

        // Place dirt below grass
        for (let y = grassLevel - 1; y >= grassLevel - dirtDepth; y--) {
          if (y >= 0) {
            setVoxelDirect(x, y, z, BlockId.DIRT)
          }
        }

        // Place stone below dirt
        for (let y = grassLevel - dirtDepth - 1; y >= 0; y--) {
          setVoxelDirect(x, y, z, BlockId.STONE)
        }
      }
    }

    // Trigger world update
    incrementRevision()
  }
}
