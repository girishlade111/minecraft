"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export default function PlayerArm() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const swinging = useRef(false)
  const phase = useRef(0)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    camera.add(mesh)
    return () => {
      camera.remove(mesh)
    }
  }, [camera])

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (e.button === 0) swinging.current = true
    }
    const handleUp = (e: MouseEvent) => {
      if (e.button === 0) swinging.current = false
    }
    document.addEventListener("mousedown", handleDown)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousedown", handleDown)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const maxAngle = Math.PI / 3
    if (swinging.current) {
      phase.current += delta * 8
      mesh.rotation.x = -Math.abs(Math.sin(phase.current)) * maxAngle
    } else {
      mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, 0, 10, delta)
      phase.current = 0
    }
  })

  return (
    <mesh ref={meshRef} position={[0.5, -0.5, -0.4]}>
      <boxGeometry args={[0.2, 0.2, 0.4]} />
      <meshStandardMaterial color="#c68642" />
    </mesh>
  )
}
