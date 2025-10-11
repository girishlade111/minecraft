"use client"

export default function Crosshair() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute w-4 h-0.5 bg-white/80 -translate-x-1/2 -translate-y-1/2" />
        {/* Vertical line */}
        <div className="absolute w-0.5 h-4 bg-white/80 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
