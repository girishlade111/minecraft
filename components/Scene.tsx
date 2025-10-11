"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Fog } from "three"
import { DEFAULT_FOG_START, DEFAULT_FOG_END } from "@/engine/config"
import WorldMesh from "./WorldMesh"
import PlayerController from "./PlayerController"
import FirstPersonCamera from "./FirstPersonCamera"
import PlayerArm from "./PlayerArm"
import BlockDamageOverlay from "./BlockDamageOverlay"
import { WorldGen } from "@/engine/world/WorldGen"
import { Controller } from "@/engine/player/Controller"

export default function Scene() {
  const { gl, scene } = useThree()
  const worldInitialized = useRef(false)

  useEffect(() => {
    const handleClick = () => {
      // Request pointer lock on canvas click
      gl.domElement.requestPointerLock()
    }

    // Lock pointer on canvas click
    gl.domElement.addEventListener("click", handleClick)

    return () => {
      gl.domElement.removeEventListener("click", handleClick)
    }
  }, [gl])

  useEffect(() => {
    // Enable shadows
    gl.shadowMap.enabled = true
    gl.shadowMap.type = gl.PCFSoftShadowMap

    // Add subtle fog for depth
    scene.fog = new Fog(0x87ceeb, DEFAULT_FOG_START, DEFAULT_FOG_END)
  }, [gl, scene])

  // Initialize world on first render
  useEffect(() => {
    if (!worldInitialized.current) {
      if (Controller.DEBUG) {
        console.log("[v0] Initializing hills world with trees")
      }
      WorldGen.hills()
      worldInitialized.current = true
    }
  }, [])

  return (
    <>
      <FirstPersonCamera />
      <PlayerController />
      <PlayerArm />
      <BlockDamageOverlay />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />

      <WorldMesh />
    </>
  )
}
