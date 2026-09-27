# Minecraft — Voxel Game Prototype

A browser-based Minecraft-style voxel game prototype. Explore a procedurally generated 3D block world, place and break blocks, and manage a hotbar inventory — all rendered in real time with WebGL (three.js) inside a Next.js app.

## Features

- **Procedural voxel terrain** — chunked world generation with seeded noise (`engine/world/WorldGen.ts`)
- **Custom meshing engine** — face-culled voxel mesher for fast rendering (`engine/world/Mesher.ts`)
- **Block types & textures** — grass, dirt, stone, wood, leaves and more (`engine/blocks/`)
- **First-person controls** — pointer-lock WASD movement, jumping, mouse look (`engine/player/Controller.ts`)
- **Block interaction** — break and place blocks with raycast targeting (DDA algorithm in `lib/math/dda.ts`)
- **Inventory & hotbar** — item store with hotbar UI overlay (`engine/inventory/InventoryStore.ts`)
- **Player state** — position/velocity stores driving the camera (`engine/player/PlayerStore.ts`)
- **Crosshair + HUD overlay** — HTML overlay components (`Crosshair`, `Hotbar`)
- Fullscreen WebGL canvas via `@react-three/fiber` at `/play`

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **3D:** `three` + `@react-three/fiber` (WebGL2, 32-bit index buffers)
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix primitives), `lucide-react`
- **State:** zustand-style lightweight stores in `engine/`
- **Package manager:** pnpm (pnpm-lock.yaml included)

## Quick Start

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) and click **Play** (or go to `/play`).

Production build:

```bash
pnpm build
pnpm start
```

## Controls

- **Click the canvas** — capture the mouse (pointer lock)
- **W / A / S / D** — move
- **Space** — jump
- **Mouse** — look around
- **Left click** — break block
- **Right click** — place block
- **1–9** — select hotbar slot

## Project Structure

```
app/
  page.tsx              # Landing page
  play/page.tsx         # Game canvas + HUD overlay
engine/                 # Game engine (framework-agnostic TypeScript)
  world/                # WorldGen, WorldStore, Mesher, VoxelUtils, BlockInteraction
  blocks/               # BlockTypes, BlockTextures
  player/               # Controller (input), PlayerStore (state)
  inventory/            # InventoryStore
  config.ts             # Camera/FOV/fog defaults
components/             # Scene, Crosshair, Hotbar, shadcn/ui primitives
lib/                    # noise.ts (terrain), math/dda.ts (raycasting), utils
public/                 # Static assets
```

## Environment Variables

None required — the game is fully client-side; no API routes or backend.

## Deployment

- Works on Vercel with zero config.
- Static export is enabled (`output: 'export'`), so it also runs on GitHub Pages / Netlify / Cloudflare Pages. `basePath` is set to `/minecraft` for the GitHub Pages subpath — remove it for root-domain deploys.

## Notes

- The game requires a WebGL2-capable browser (desktop Chrome/Edge/Firefox recommended).
- World generation is client-side and deterministic per seed; worlds are not persisted between sessions.

---

Built by Girish Lade · https://ladestack.in
