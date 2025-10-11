import { create } from "zustand"
import { BlockId } from "@/engine/blocks/BlockTypes"

export interface InventorySlot {
  blockId: BlockId
  quantity: number
}

interface InventoryState {
  hotbar: InventorySlot[]
  selectedIndex: number

  // Actions
  setSelectedIndex: (index: number) => void
  addItem: (blockId: BlockId, quantity?: number) => void
  removeItem: (index: number, quantity?: number) => void
  getSelectedItem: () => InventorySlot | null
  hasItem: (blockId: BlockId) => boolean
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  hotbar: Array(9)
    .fill(null)
    .map(() => ({ blockId: BlockId.AIR, quantity: 0 })),
  selectedIndex: 0,

  setSelectedIndex: (index: number) => {
    if (index >= 0 && index < 9) {
      set({ selectedIndex: index })
    }
  },

  addItem: (blockId: BlockId, quantity = 1) => {
    if (blockId === BlockId.AIR) return

    set((state) => {
      const hotbar = [...state.hotbar]

      // First try to find existing stack of same block type
      const existingIndex = hotbar.findIndex((slot) => slot.blockId === blockId && slot.quantity > 0)

      if (existingIndex !== -1) {
        // Add to existing stack (max 64 per stack)
        const currentQty = hotbar[existingIndex].quantity
        const maxAdd = Math.min(quantity, 64 - currentQty)
        hotbar[existingIndex].quantity += maxAdd
        quantity -= maxAdd
      }

      // If we still have items to add, find empty slot
      if (quantity > 0) {
        const emptyIndex = hotbar.findIndex((slot) => slot.quantity === 0)
        if (emptyIndex !== -1) {
          hotbar[emptyIndex] = { blockId, quantity: Math.min(quantity, 64) }
        }
      }

      return { hotbar }
    })
  },

  removeItem: (index: number, quantity = 1) => {
    set((state) => {
      if (index < 0 || index >= 9) return state

      const hotbar = [...state.hotbar]
      const slot = hotbar[index]

      if (slot.quantity > 0) {
        slot.quantity = Math.max(0, slot.quantity - quantity)
        if (slot.quantity === 0) {
          slot.blockId = BlockId.AIR
        }
      }

      return { hotbar }
    })
  },

  getSelectedItem: () => {
    const state = get()
    const slot = state.hotbar[state.selectedIndex]
    return slot.quantity > 0 ? slot : null
  },

  hasItem: (blockId: BlockId) => {
    const state = get()
    return state.hotbar.some((slot) => slot.blockId === blockId && slot.quantity > 0)
  },
}))
