"use client"

import { useState, useRef, useCallback, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface GalleryImage {
  url: string
  alt?: string | null
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [showZoom, setShowZoom] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const selected = images[selectedIndex]
  const thumbnails = images.slice(0, 5)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin({ x, y })
  }, [])

  if (!images.length) {
    return (
      <div className="aspect-[3/4] flex items-center justify-center bg-warm-gray">
        <span className="text-sm text-charcoal/40">No images available</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={mainRef}
        className="relative aspect-[3/4] overflow-hidden bg-warm-gray cursor-crosshair"
        onMouseEnter={() => setShowZoom(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowZoom(false)}
      >
        <img
          src={selected.url}
          alt={selected.alt ?? ""}
          className="h-full w-full object-cover transition-opacity duration-500"
        />

        {showZoom && (
          <div
            className="absolute inset-0 hidden lg:block pointer-events-none"
            style={{
              backgroundImage: `url(${selected.url})`,
              backgroundSize: "200%",
              backgroundPosition: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          />
        )}
      </div>

      {thumbnails.length > 1 && (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden bg-warm-gray transition-all duration-200",
                i === selectedIndex
                  ? "border-2 border-primary ring-1 ring-primary/30"
                  : "border border-charcoal/10 opacity-70 hover:opacity-100 hover:border-charcoal/30"
              )}
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
