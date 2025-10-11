import { create } from "zustand"
import { Vector3 } from "three"
import { DEFAULT_FOV } from "@/engine/config"

export interface PlayerState {
  // Position and movement
  position: Vector3
  velocity: Vector3

  // Camera rotation
  yaw: number
  pitch: number
  fov: number

  // Physics state
  onGround: boolean

  // Input state
  keys: {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    jump: boolean
  }

  // Actions
  setPosition: (position: Vector3) => void
  setVelocity: (velocity: Vector3) => void
  setRotation: (yaw: number, pitch: number) => void
  setOnGround: (onGround: boolean) => void
  setKey: (key: keyof PlayerState["keys"], pressed: boolean) => void
  setFov: (fov: number) => void
  updatePosition: (delta: Vector3) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  position: new Vector3(32, 20, 32), // Start in center of world, above ground
  velocity: new Vector3(0, 0, 0),
  yaw: 0,
  pitch: 0,
  fov: DEFAULT_FOV,
  onGround: false,

  keys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  },

  setPosition: (position) => set({ position: position.clone() }),
  setVelocity: (velocity) => set({ velocity: velocity.clone() }),
  setRotation: (yaw, pitch) => set({ yaw, pitch }),
  setOnGround: (onGround) => set({ onGround }),
  setKey: (key, pressed) =>
    set((state) => ({
      keys: { ...state.keys, [key]: pressed },
    })),
  setFov: (fov) => set({ fov }),
  updatePosition: (delta) =>
    set((state) => ({
      position: state.position.clone().add(delta),
    })),
}))
