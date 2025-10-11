"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { usePlayerStore } from "@/engine/player/PlayerStore"
import { Controller } from "@/engine/player/Controller"
import { BlockInteraction, BLOCK_BREAK_TIME_MS } from "@/engine/world/BlockInteraction"
import { BlockId } from "@/engine/blocks/BlockTypes"
import { useInventoryStore } from "@/engine/inventory/InventoryStore"
import { useWorldStore } from "@/engine/world/WorldStore"
import { raycastVoxel } from "@/lib/math/dda"

const EYE_HEIGHT = 1.6

export default function PlayerController() {
  const setKey = usePlayerStore((state) => state.setKey)
  const setRotation = usePlayerStore((state) => state.setRotation)
  const position = usePlayerStore((state) => state.position)
  const yaw = usePlayerStore((state) => state.yaw)
  const pitch = usePlayerStore((state) => state.pitch)
  const lastTime = useRef(0)

  const selectedIndex = useInventoryStore((state) => state.selectedIndex)
  const setSelectedIndex = useInventoryStore((state) => state.setSelectedIndex)
  const getSelectedItem = useInventoryStore((state) => state.getSelectedItem)
  const addItem = useInventoryStore((state) => state.addItem)
  const removeItem = useInventoryStore((state) => state.removeItem)
  const setBreakTarget = useWorldStore((state) => state.setBreakTarget)
  const setBreakProgress = useWorldStore((state) => state.setBreakProgress)

  const breaking = useRef(false)
  const breakStart = useRef(0)
  const breakTarget = useRef<{ x: number; y: number; z: number } | null>(null)

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!document.pointerLockElement) return

      const direction = {
        x: -Math.sin(yaw) * Math.cos(pitch),
        y: Math.sin(pitch),
        z: -Math.cos(yaw) * Math.cos(pitch),
      }

      const cameraPos = {
        x: position.x,
        y: position.y + EYE_HEIGHT,
        z: position.z,
      }

      if (event.button === 0) {
        event.preventDefault()
        const hit = raycastVoxel(cameraPos, direction, 5)
        if (hit.hit && hit.position) {
          breaking.current = true
          breakStart.current = performance.now()
          breakTarget.current = { ...hit.position }
          setBreakTarget(hit.position)
          setBreakProgress(0)
        }
      } else if (event.button === 2) {
        event.preventDefault()
        const selectedItem = getSelectedItem()
        if (selectedItem && selectedItem.quantity > 0) {
          const placed = BlockInteraction.placeBlock(cameraPos, direction, selectedItem.blockId)
          if (placed) {
            removeItem(selectedIndex, 1)
          }
        }
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        breaking.current = false
        breakTarget.current = null
        setBreakTarget(null)
        setBreakProgress(0)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (document.pointerLockElement) {
        event.preventDefault()
        const delta = event.deltaY > 0 ? 1 : -1
        const newIndex = (selectedIndex + delta + 9) % 9
        setSelectedIndex(newIndex)
      }
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        event.preventDefault() // Prevent right-click menu when pointer locked
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("wheel", handleWheel)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("wheel", handleWheel)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [position, yaw, pitch, selectedIndex, getSelectedItem, removeItem, setSelectedIndex, setBreakTarget, setBreakProgress])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code >= "Digit1" && event.code <= "Digit9") {
        const index = Number.parseInt(event.code.slice(-1)) - 1
        setSelectedIndex(index)
        return
      }

      switch (event.code) {
        case "KeyW":
          setKey("forward", true)
          break
        case "KeyS":
          setKey("backward", true)
          break
        case "KeyA":
          setKey("left", true)
          break
        case "KeyD":
          setKey("right", true)
          break
        case "Space":
          event.preventDefault()
          setKey("jump", true)
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          setKey("forward", false)
          break
        case "KeyS":
          setKey("backward", false)
          break
        case "KeyA":
          setKey("left", false)
          break
        case "KeyD":
          setKey("right", false)
          break
        case "Space":
          setKey("jump", false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [setKey, setSelectedIndex])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        const sensitivity = 0.002
        const deltaX = event.movementX * sensitivity
        const deltaY = event.movementY * sensitivity

        const currentState = usePlayerStore.getState()
        const newYaw = currentState.yaw - deltaX
        const newPitch = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, currentState.pitch - deltaY),
        )

        setRotation(newYaw, newPitch)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [setRotation])

  useFrame((state) => {
    if (breaking.current) {
      const direction = {
        x: -Math.sin(yaw) * Math.cos(pitch),
        y: Math.sin(pitch),
        z: -Math.cos(yaw) * Math.cos(pitch),
      }
      const cameraPos = {
        x: position.x,
        y: position.y + EYE_HEIGHT,
        z: position.z,
      }
      const hit = raycastVoxel(cameraPos, direction, 5)
      if (!hit.hit || !hit.position) {
        breaking.current = false
        breakTarget.current = null
        setBreakTarget(null)
        setBreakProgress(0)
      } else {
        const { x, y, z } = hit.position
        if (
          !breakTarget.current ||
          breakTarget.current.x !== x ||
          breakTarget.current.y !== y ||
          breakTarget.current.z !== z
        ) {
          breakTarget.current = { x, y, z }
          breakStart.current = performance.now()
          setBreakTarget(hit.position)
          setBreakProgress(0)
        } else {
          const elapsed = performance.now() - breakStart.current
          const progress = elapsed / BLOCK_BREAK_TIME_MS
          setBreakProgress(progress)
          if (elapsed >= BLOCK_BREAK_TIME_MS) {
            const brokenBlock = BlockInteraction.breakBlockAt(x, y, z)
            if (brokenBlock && brokenBlock !== BlockId.AIR) {
              addItem(brokenBlock, 1)
            }
            breaking.current = false
            breakTarget.current = null
            setBreakTarget(null)
            setBreakProgress(0)
          }
        }
      }
    }

    const currentTime = state.clock.elapsedTime
    const deltaTime = lastTime.current === 0 ? 0.016 : currentTime - lastTime.current
    lastTime.current = currentTime

    const cappedDelta = Math.min(deltaTime, 0.033) // Max 30fps equivalent

    Controller.update(cappedDelta)
  })

  return null
}
