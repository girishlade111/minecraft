// Math utilities for the Minecraft clone

export * from "./dda"

export function worldToIndex(x: number, y: number, z: number, width: number, depth: number): number {
  return x + y * width * depth + z * width
}

export function indexToWorld(index: number, width: number, depth: number): [number, number, number] {
  const x = index % width
  const y = Math.floor(index / (width * depth))
  const z = Math.floor((index % (width * depth)) / width)
  return [x, y, z]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
