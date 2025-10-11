"use client"

import { Canvas } from "@react-three/fiber"
import Scene from "@/components/Scene"
import Crosshair from "@/components/Crosshair"
import Hotbar from "@/components/Hotbar"
import { DEFAULT_FOV, DEFAULT_NEAR, DEFAULT_FAR } from "@/engine/config"

export default function Play() {
  return (
    <div className="w-full h-screen relative">
      {/* Full-screen Canvas */}
      <Canvas
        shadows
        camera={{
          fov: DEFAULT_FOV,
          near: DEFAULT_NEAR,
          far: DEFAULT_FAR,
          position: [0, 10, 10],
        }}
        className="w-full h-full"
        onCreated={({ gl }) => {
          const context = gl.getContext()
          if (
            !gl.capabilities.isWebGL2 &&
            !context.getExtension("OES_element_index_uint")
          ) {
            console.error(
              "32-bit index buffer support is required but not available",
            )
          }
        }}
      >
        <Scene />
      </Canvas>

      {/* HTML Overlay */}
      <Crosshair />
      <Hotbar />
    </div>
  )
}
