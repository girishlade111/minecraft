"use client";

import { useRef, useEffect, useMemo } from "react";
import type { Mesh } from "three";
import { useWorldStore } from "@/engine/world/WorldStore";
import { Mesher } from "@/engine/world/Mesher";
import { BlockId } from "@/engine/blocks/BlockTypes";
import { createBlockTextures } from "@/engine/blocks/BlockTextures";
import { Controller } from "@/engine/player/Controller";

export default function WorldMesh() {
  const meshRefs = useRef<Record<BlockId, Mesh | null>>(
    {} as Record<BlockId, Mesh | null>,
  );
  const revision = useWorldStore((state) => state.revision);
  const textures = useMemo(() => createBlockTextures(), []);
  const blockIds = useMemo(
    () =>
      Object.values(BlockId).filter(
        (v) => typeof v === "number" && v !== BlockId.AIR,
      ) as BlockId[],
    [],
  );

  useEffect(() => {
    if (Controller.DEBUG) {
      console.log("[v0] Building world geometry, revision:", revision);
    }

    const geometries = Mesher.buildGeometry();

    blockIds.forEach((id) => {
      const mesh = meshRefs.current[id];
      const newGeometry = geometries[id];
      if (!mesh || !newGeometry) return;
      const oldGeometry = mesh.geometry;
      mesh.geometry = newGeometry;
      if (oldGeometry) oldGeometry.dispose();
    });
  }, [revision, blockIds]);

  return (
    <group>
      {blockIds.map((id) => (
        <mesh
          key={id}
          ref={(el) => {
            meshRefs.current[id] = el;
          }}
          receiveShadow
          castShadow
        >
          <bufferGeometry />
          <meshLambertMaterial
            vertexColors
            map={textures[id]}
            emissive={0x111111}
          />
        </mesh>
      ))}
    </group>
  );
}
