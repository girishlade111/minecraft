import { Vector3 } from "three"
import { usePlayerStore } from "./PlayerStore"
import { useWorldStore } from "../world/WorldStore"
import { isInBounds, getBlock } from "../world/VoxelUtils"
import { BlockId } from "../blocks/BlockTypes"

export class Controller {
  private static readonly GRAVITY = -32 // blocks per second squared
  private static readonly JUMP_VELOCITY = Math.sqrt(
    2 * Math.abs(Controller.GRAVITY) * 1.75,
  ) // blocks per second (~1.75-block jump height)
  private static readonly MOVE_SPEED = 5 // blocks per second
  private static readonly PLAYER_WIDTH = 0.6 // player AABB width
  private static readonly PLAYER_HEIGHT = 1.8 // player AABB height
  static DEBUG = false

  // Reusable vectors for player AABB corners to avoid per-frame allocations
  private static readonly cornerVecs = Array.from({ length: 8 }, () => new Vector3())

  static update(deltaTime: number) {
    const playerState = usePlayerStore.getState()
    const worldState = useWorldStore.getState()
    const { sizeX, sizeY, sizeZ } = worldState.getDimensions()

    const { position, velocity, keys, onGround } = playerState
    const newVelocity = velocity.clone()
    const newPosition = position.clone()

    if (Controller.DEBUG) {
      console.log(
        "[v0] Player position:",
        position.x.toFixed(2),
        position.y.toFixed(2),
        position.z.toFixed(2),
        "onGround:",
        onGround,
      )
    }

    // Apply gravity
    if (!onGround) {
      newVelocity.y += Controller.GRAVITY * deltaTime
    }

    // Handle jump
    if (keys.jump && onGround) {
      if (Controller.DEBUG) {
        console.log(
          "[v0] Jump triggered! Setting velocity to",
          Controller.JUMP_VELOCITY,
        )
      }
      newVelocity.y = Controller.JUMP_VELOCITY
      playerState.setOnGround(false)
    } else if (keys.jump && !onGround) {
      if (Controller.DEBUG) {
        console.log("[v0] Jump key pressed but not on ground")
      }
    }

    // Handle horizontal movement
    const moveVector = new Vector3()
    if (keys.forward) moveVector.z -= 1
    if (keys.backward) moveVector.z += 1
    if (keys.left) moveVector.x -= 1
    if (keys.right) moveVector.x += 1

    if (moveVector.length() > 0) {
      moveVector.normalize()

      // Apply yaw rotation to movement
      const yaw = playerState.yaw
      const rotatedMove = new Vector3(
        moveVector.x * Math.cos(yaw) + moveVector.z * Math.sin(yaw),
        0,
        -moveVector.x * Math.sin(yaw) + moveVector.z * Math.cos(yaw),
      )

      newVelocity.x = rotatedMove.x * Controller.MOVE_SPEED
      newVelocity.z = rotatedMove.z * Controller.MOVE_SPEED
    } else {
      // Apply friction when not moving
      newVelocity.x *= 0.8
      newVelocity.z *= 0.8
    }

    // Apply velocity to position with collision detection
    const deltaPos = newVelocity.clone().multiplyScalar(deltaTime)

    // Check collisions and resolve axis-wise
    const finalPosition = Controller.resolveCollisions(
      newPosition,
      deltaPos,
      newVelocity,
      worldState.voxels,
      sizeX,
      sizeY,
      sizeZ,
    )
    const finalVelocity = newVelocity.clone()

    // Clamp final position to world bounds and zero velocity when clamped
    const minX = Controller.PLAYER_WIDTH / 2
    const maxX = sizeX - Controller.PLAYER_WIDTH / 2
    if (finalPosition.x < minX) {
      finalPosition.x = minX
      finalVelocity.x = 0
    } else if (finalPosition.x > maxX) {
      finalPosition.x = maxX
      finalVelocity.x = 0
    }

    const minZ = Controller.PLAYER_WIDTH / 2
    const maxZ = sizeZ - Controller.PLAYER_WIDTH / 2
    if (finalPosition.z < minZ) {
      finalPosition.z = minZ
      finalVelocity.z = 0
    } else if (finalPosition.z > maxZ) {
      finalPosition.z = maxZ
      finalVelocity.z = 0
    }

    const minY = 0
    const maxY = sizeY - Controller.PLAYER_HEIGHT
    if (finalPosition.y < minY) {
      finalPosition.y = minY
      finalVelocity.y = 0
    } else if (finalPosition.y > maxY) {
      finalPosition.y = maxY
      finalVelocity.y = 0
    }

    // Check if player is on ground
    const groundCheck = Controller.checkCollision(
      finalPosition.clone().add(new Vector3(0, -0.1, 0)),
      worldState.voxels,
      sizeX,
      sizeY,
      sizeZ,
    )

    if (Controller.DEBUG) {
      console.log(
        "[v0] Ground check at:",
        finalPosition.x.toFixed(2),
        (finalPosition.y - 0.1).toFixed(2),
        finalPosition.z.toFixed(2),
        "result:",
        groundCheck,
      )
    }

    if (groundCheck) {
      playerState.setOnGround(true)
      if (finalVelocity.y < 0) {
        finalVelocity.y = 0
      }
    } else {
      playerState.setOnGround(false)
    }

    playerState.setPosition(finalPosition)
    playerState.setVelocity(finalVelocity)
  }

  private static resolveCollisions(
    position: Vector3,
    deltaPos: Vector3,
    velocity: Vector3,
    voxels: Uint16Array,
    sizeX: number,
    sizeY: number,
    sizeZ: number,
  ): Vector3 {
    const newPos = position.clone()

    // Test X axis
    const testX = newPos.clone()
    testX.x += deltaPos.x
    if (!Controller.checkCollision(testX, voxels, sizeX, sizeY, sizeZ)) {
      newPos.x = testX.x
    }

    // Test Y axis
    const testY = newPos.clone()
    testY.y += deltaPos.y
    if (!Controller.checkCollision(testY, voxels, sizeX, sizeY, sizeZ)) {
      newPos.y = testY.y
    } else {
      if (deltaPos.y < 0) {
        newPos.y = Math.floor(testY.y) + 1 + 1e-3
      } else if (deltaPos.y > 0) {
        newPos.y =
          Math.floor(testY.y + Controller.PLAYER_HEIGHT) -
          Controller.PLAYER_HEIGHT -
          1e-3
      }
      deltaPos.y = 0
      velocity.y = 0
    }

    // Test Z axis
    const testZ = newPos.clone()
    testZ.z += deltaPos.z
    if (!Controller.checkCollision(testZ, voxels, sizeX, sizeY, sizeZ)) {
      newPos.z = testZ.z
    }

    return newPos
  }

  private static checkCollision(
    position: Vector3,
    voxels: Uint16Array,
    sizeX: number,
    sizeY: number,
    sizeZ: number,
  ): boolean {
    const halfWidth = Controller.PLAYER_WIDTH / 2
    const height = Controller.PLAYER_HEIGHT

    if (Controller.DEBUG) {
      console.log("[v0] Checking collision at:", position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2))
    }

    // Update reusable corner vectors with current position
    const corners = Controller.cornerVecs
    corners[0].set(position.x - halfWidth, position.y, position.z - halfWidth)
    corners[1].set(position.x + halfWidth, position.y, position.z - halfWidth)
    corners[2].set(position.x - halfWidth, position.y, position.z + halfWidth)
    corners[3].set(position.x + halfWidth, position.y, position.z + halfWidth)
    corners[4].set(position.x - halfWidth, position.y + height, position.z - halfWidth)
    corners[5].set(position.x + halfWidth, position.y + height, position.z - halfWidth)
    corners[6].set(position.x - halfWidth, position.y + height, position.z + halfWidth)
    corners[7].set(position.x + halfWidth, position.y + height, position.z + halfWidth)

    for (const corner of corners) {
      const blockX = Math.floor(corner.x)
      const blockY = Math.floor(corner.y)
      const blockZ = Math.floor(corner.z)
      if (!isInBounds(blockX, blockY, blockZ, sizeX, sizeY, sizeZ)) {
        return true // Treat out-of-bounds as collision
      }

      const blockType = getBlock(voxels, blockX, blockY, blockZ, sizeX, sizeY, sizeZ)
      if (Controller.DEBUG) {
        console.log(
          "[v0] Block at",
          blockX,
          blockY,
          blockZ,
          "type:",
          blockType,
          "isAir:",
          blockType === BlockId.AIR,
        )
      }
      if (blockType !== BlockId.AIR) {
        if (Controller.DEBUG) {
          console.log("[v0] Collision detected with block type:", blockType)
        }
        return true // Collision detected
      }
    }

    return false // No collision
  }
}
