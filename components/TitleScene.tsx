"use client"

import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { Fog } from "three"

import { WorldGen } from "@/engine/world/WorldGen"
import WorldMesh from "./WorldMesh"
import { DEFAULT_FOG_START, DEFAULT_FOG_END } from "@/engine/config"

export default function TitleScene() {
  const { camera, gl, scene } = useThree()
  const worldInitialized = useRef(false)

  useEffect(() => {
    // Enable shadows and fog to match in-game visuals
    gl.shadowMap.enabled = true
    gl.shadowMap.type = gl.PCFSoftShadowMap
    scene.fog = new Fog(0x87ceeb, DEFAULT_FOG_START, DEFAULT_FOG_END)
  }, [gl, scene])

  useEffect(() => {
    camera.fov = 60
    camera.updateProjectionMatrix()
  }, [camera])

  useEffect(() => {
    if (!worldInitialized.current) {
      WorldGen.hills()
      worldInitialized.current = true
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1
    camera.position.set(Math.sin(t) * 60, 25, Math.cos(t) * 60)
    camera.lookAt(0, 5, 0)
  })

  return (
    <>
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
