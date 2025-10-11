import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint32BufferAttribute,
} from "three";
import { useWorldStore } from "./WorldStore";
import { BlockId, BLOCK_DATA } from "../blocks/BlockTypes";

interface FaceData {
  vertices: number[];
  indices: number[];
  colors: number[];
  uvs: number[];
  vertexIndex: number;
}

export class Mesher {
  static buildGeometry(): Record<BlockId, BufferGeometry> {
    const { dimensions, getVoxel } = useWorldStore.getState();
    const { sizeX, sizeY, sizeZ } = dimensions;

    const geomData: Record<BlockId, FaceData> = {
      [BlockId.DIRT]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
      [BlockId.GRASS]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
      [BlockId.STONE]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
      [BlockId.LOG]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
      [BlockId.LEAF]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
      [BlockId.AIR]: {
        vertices: [],
        indices: [],
        colors: [],
        uvs: [],
        vertexIndex: 0,
      },
    };

    const faceData = [
      // +X face (right)
      {
        normal: [1, 0, 0],
        vertices: [
          [1, 0, 0],
          [1, 1, 0],
          [1, 1, 1],
          [1, 0, 1],
        ],
      },
      // -X face (left)
      {
        normal: [-1, 0, 0],
        vertices: [
          [0, 0, 1],
          [0, 1, 1],
          [0, 1, 0],
          [0, 0, 0],
        ],
      },
      // +Y face (top)
      {
        normal: [0, 1, 0],
        vertices: [
          [0, 1, 0],
          [0, 1, 1],
          [1, 1, 1],
          [1, 1, 0],
        ],
      },
      // -Y face (bottom)
      {
        normal: [0, -1, 0],
        vertices: [
          [0, 0, 0],
          [1, 0, 0],
          [1, 0, 1],
          [0, 0, 1],
        ],
      },
      // +Z face (front)
      {
        normal: [0, 0, 1],
        vertices: [
          [1, 0, 1],
          [1, 1, 1],
          [0, 1, 1],
          [0, 0, 1],
        ],
      },
      // -Z face (back)
      {
        normal: [0, 0, -1],
        vertices: [
          [0, 0, 0],
          [0, 1, 0],
          [1, 1, 0],
          [1, 0, 0],
        ],
      },
    ];

    const getBlockColor = (
      blockId: BlockId,
      faceNormal: number[],
      vertexIndex: number,
    ) => {
      const hex = BLOCK_DATA[blockId].color;
      const clean = hex.replace("#", "");
      const baseColor = {
        r: Number.parseInt(clean.substr(0, 2), 16) / 255,
        g: Number.parseInt(clean.substr(2, 2), 16) / 255,
        b: Number.parseInt(clean.substr(4, 2), 16) / 255,
      };

      const [nx, ny, nz] = faceNormal;
      const seed = vertexIndex * 7 + nx * 13 + ny * 17 + nz * 19;
      const variation = (Math.sin(seed) * 0.5 + 0.5) * 0.15; // 0-15% variation

      // Apply different variation patterns for different block types
      if (blockId === BlockId.GRASS) {
        // Grass: more variation on top faces, less on sides
        const isTopFace = ny > 0;
        const variationAmount = isTopFace ? 0.2 : 0.1;
        const grassVariation =
          (Math.sin(seed * 1.3) * 0.5 + 0.5) * variationAmount;

        if (isTopFace) {
          // Green top with more variation
          baseColor.r = Math.max(0.1, baseColor.r - grassVariation * 0.3);
          baseColor.g = Math.min(1.0, baseColor.g + grassVariation * 0.2);
          baseColor.b = Math.max(0.1, baseColor.b - grassVariation * 0.4);
        } else {
          // Brown sides with dirt-like variation
          baseColor.r = Math.min(1.0, baseColor.r + grassVariation);
          baseColor.g = Math.min(1.0, baseColor.g + grassVariation * 0.8);
          baseColor.b = Math.min(1.0, baseColor.b + grassVariation * 0.6);
        }
      } else if (blockId === BlockId.LOG) {
        // Log: different pattern for top/bottom vs sides
        const isEndFace = Math.abs(ny) > 0;
        const logVariation = (Math.sin(seed * 0.8) * 0.5 + 0.5) * 0.12;

        if (isEndFace) {
          // Ring pattern on ends
          baseColor.r = Math.min(1.0, baseColor.r + logVariation * 0.8);
          baseColor.g = Math.min(1.0, baseColor.g + logVariation * 0.6);
          baseColor.b = Math.min(1.0, baseColor.b + logVariation * 0.4);
        } else {
          // Bark pattern on sides
          baseColor.r = Math.max(0.2, baseColor.r - logVariation * 0.3);
          baseColor.g = Math.max(0.15, baseColor.g - logVariation * 0.4);
          baseColor.b = Math.max(0.1, baseColor.b - logVariation * 0.5);
        }
      } else if (blockId === BlockId.LEAF) {
        // Leaves: varied green tones
        const leafVariation = (Math.sin(seed * 1.1) * 0.5 + 0.5) * 0.18;
        baseColor.r = Math.max(0.1, baseColor.r - leafVariation * 0.5);
        baseColor.g = Math.min(1.0, baseColor.g + leafVariation * 0.3);
        baseColor.b = Math.max(0.1, baseColor.b - leafVariation * 0.3);
      } else {
        // Default variation for other blocks (dirt, stone, etc.)
        baseColor.r = Math.min(
          1.0,
          Math.max(0.1, baseColor.r + (variation - 0.075)),
        );
        baseColor.g = Math.min(
          1.0,
          Math.max(0.1, baseColor.g + (variation - 0.075)),
        );
        baseColor.b = Math.min(
          1.0,
          Math.max(0.1, baseColor.b + (variation - 0.075)),
        );
      }

      return baseColor;
    };

    // Check each voxel
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        for (let z = 0; z < sizeZ; z++) {
          const blockId = getVoxel(x, y, z);

          if (blockId === BlockId.AIR) continue;
          const blockData = BLOCK_DATA[blockId];
          if (!blockData.solid) continue;

          const data = geomData[blockId];

          faceData.forEach((face) => {
            const [nx, ny, nz] = face.normal;
            const neighborX = x + nx;
            const neighborY = y + ny;
            const neighborZ = z + nz;

            const neighborId = getVoxel(neighborX, neighborY, neighborZ);
            const neighborData = BLOCK_DATA[neighborId];

            if (neighborId === BlockId.AIR || !neighborData.solid) {
              face.vertices.forEach((vertex, vertexIdx) => {
                data.vertices.push(x + vertex[0], y + vertex[1], z + vertex[2]);
                const color = getBlockColor(
                  blockId,
                  face.normal,
                  data.vertexIndex + vertexIdx,
                );
                data.colors.push(color.r, color.g, color.b);
              });

              data.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

              data.indices.push(
                data.vertexIndex,
                data.vertexIndex + 1,
                data.vertexIndex + 2,
                data.vertexIndex,
                data.vertexIndex + 2,
                data.vertexIndex + 3,
              );

              data.vertexIndex += 4;
            }
          });
        }
      }
    }

    const geometries: Record<BlockId, BufferGeometry> = {} as Record<
      BlockId,
      BufferGeometry
    >;
    Object.entries(geomData).forEach(([id, d]) => {
      if (Number(id) === BlockId.AIR) return;
      if (d.vertices.length === 0) return;
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(d.vertices, 3),
      );
      geometry.setAttribute("color", new Float32BufferAttribute(d.colors, 3));
      geometry.setAttribute("uv", new Float32BufferAttribute(d.uvs, 2));
      geometry.setIndex(new Uint32BufferAttribute(d.indices, 1));
      geometry.computeVertexNormals();
      geometries[id as unknown as BlockId] = geometry;
    });

    return geometries;
  }
}
