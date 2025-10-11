import { useInventoryStore } from "@/engine/inventory/InventoryStore"
import { BlockId, BLOCK_DATA } from "@/engine/blocks/BlockTypes"

const getBlockColor = (blockId: BlockId): string => {
  return BLOCK_DATA[blockId]?.color ?? "transparent"
}

const getBlockName = (blockId: BlockId): string => {
  return BLOCK_DATA[blockId]?.name ?? ""
}

export default function Hotbar() {
  const hotbar = useInventoryStore((state) => state.hotbar)
  const selectedIndex = useInventoryStore((state) => state.selectedIndex)

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-1 bg-black/50 p-2 rounded-md backdrop-blur-sm">
        {hotbar.map((slot, index) => (
          <div
            key={index}
            className={`
              w-12 h-12 border-2 rounded-md flex flex-col items-center justify-center
              ${selectedIndex === index ? "border-white bg-white/20" : "border-gray-400 bg-black/30"}
            `}
          >
            {slot.quantity > 0 && (
              <>
                <div
                  className="w-6 h-6 rounded-sm border border-gray-300"
                  style={{ backgroundColor: getBlockColor(slot.blockId) }}
                  title={getBlockName(slot.blockId)}
                />
                <span className="text-xs text-white font-mono mt-0.5">{slot.quantity}</span>
              </>
            )}
            <span className="absolute -bottom-1 text-xs text-gray-300 font-mono">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
