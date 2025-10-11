"use client"

import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import TitleScene from "@/components/TitleScene"

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <Canvas
        className="absolute inset-0"
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
        <TitleScene />
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg font-sans">Minecraft Clone</h1>
        <Link
          href="/play"
          className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-md transition-colors duration-200 shadow-lg"
        >
          Play
        </Link>
      </div>
    </div>
  )
}
