"use client"

import { useEffect, useRef } from "react"
import { DoubleSide } from "three"
import { useWorldStore } from "@/engine/world/WorldStore"

const FACE_DATA = [
  {
    pos: [0.5, 0, 0],
    rot: [0, Math.PI / 2, 0],
    axes: [
      [0, 0, 1],
      [0, 1, 0],
    ],
  }, // +X
  {
    pos: [-0.5, 0, 0],
    rot: [0, -Math.PI / 2, 0],
    axes: [
      [0, 0, 1],
      [0, 1, 0],
    ],
  }, // -X
  {
    pos: [0, 0.5, 0],
    rot: [-Math.PI / 2, 0, 0],
    axes: [
      [1, 0, 0],
      [0, 0, 1],
    ],
  }, // +Y
  {
    pos: [0, -0.5, 0],
    rot: [Math.PI / 2, 0, 0],
    axes: [
      [1, 0, 0],
      [0, 0, 1],
    ],
  }, // -Y
  {
    pos: [0, 0, 0.5],
    rot: [0, 0, 0],
    axes: [
      [1, 0, 0],
      [0, 1, 0],
    ],
  }, // +Z
  {
    pos: [0, 0, -0.5],
    rot: [0, Math.PI, 0],
    axes: [
      [1, 0, 0],
      [0, 1, 0],
    ],
  }, // -Z
]

const NUM_SQUARES = 300

export default function BlockDamageOverlay() {
  const breakTarget = useWorldStore((s) => s.breakTarget)
  const breakProgress = useWorldStore((s) => s.breakProgress)
  const squaresRef = useRef<
    { face: number; x: number; y: number; r: number }[]
  >([])

  useEffect(() => {
    if (breakTarget) {
      const arr = []
      for (let i = 0; i < NUM_SQUARES; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * 0.45
        arr.push({
          face: Math.floor(Math.random() * 6),
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          r: radius,
        })
      }
      arr.sort((a, b) => a.r - b.r)
      squaresRef.current = arr
    } else {
      squaresRef.current = []
    }
  }, [breakTarget])

  if (!breakTarget) return null

  const count = Math.floor(
    Math.pow(breakProgress, 1.2) * squaresRef.current.length
  )

  return (
    <group position={[breakTarget.x + 0.5, breakTarget.y + 0.5, breakTarget.z + 0.5]}>
      {squaresRef.current.slice(0, count).map((s, i) => {
        const face = FACE_DATA[s.face]
        const worldPos = [
          face.pos[0] + s.x * face.axes[0][0] + s.y * face.axes[1][0],
          face.pos[1] + s.x * face.axes[0][1] + s.y * face.axes[1][1],
          face.pos[2] + s.x * face.axes[0][2] + s.y * face.axes[1][2],
        ]
        return (
          <mesh key={i} position={worldPos} rotation={face.rot as any}>
            <planeGeometry args={[0.05, 0.05]} />
            <meshBasicMaterial color="black" side={DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}
