"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import type { PerspectiveCamera } from "three"
import { usePlayerStore } from "@/engine/player/PlayerStore"
import { DEFAULT_NEAR, DEFAULT_FAR } from "@/engine/config"

export default function FirstPersonCamera() {
  const cameraRef = useRef<PerspectiveCamera>(null)
  const { set } = useThree()
  const fov = usePlayerStore((state) => state.fov)

  // Set this camera as the default camera
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current })
    }
  }, [set])

  // Update camera position and rotation from player store
  useFrame(() => {
    if (!cameraRef.current) return

    const { position, yaw, pitch } = usePlayerStore.getState()

    // Position camera at player eye level
    const eyeHeight = 1.6
    cameraRef.current.position.set(position.x, position.y + eyeHeight, position.z)

    // Apply rotation
    cameraRef.current.rotation.set(pitch, yaw, 0, "YXZ")
  })

  // Update camera FOV when store value changes
  useEffect(() => {
    if (!cameraRef.current) return
    cameraRef.current.fov = fov
    cameraRef.current.updateProjectionMatrix()
  }, [fov])

  return (
    <perspectiveCamera
      ref={cameraRef}
      fov={fov}
      aspect={window.innerWidth / window.innerHeight}
      near={DEFAULT_NEAR}
      far={DEFAULT_FAR}
    />
  )
}
