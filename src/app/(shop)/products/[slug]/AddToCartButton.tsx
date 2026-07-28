"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface Variant {
  id: string
  size: string
  color?: string | null
  colorHex?: string | null
  stock: number
}

interface ColorInfo {
  color: string
  colorHex: string
}

interface AddToCartButtonProps {
  productId: string
  variants: Variant[]
  sizes: string[]
  colors: ColorInfo[]
  isLoggedIn: boolean
}

export function AddToCartButton({
  productId,
  variants,
  sizes,
  colors,
  isLoggedIn,
}: AddToCartButtonProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "")
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.color ?? "")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && (!selectedColor || v.color === selectedColor)
  )

  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : variants.length > 0

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId: selectedVariant?.id ?? null,
          quantity,
        }),
      })

      if (!res.ok) throw new Error("Failed to add to cart")

      router.refresh()
    } catch {
      alert("Failed to add to cart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Size: <span className="text-gray-500">{selectedSize}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const hasStock = variants.some((v) => v.size === size && v.stock > 0)
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!hasStock}
                  className={cn(
                    "h-10 w-12 rounded-lg border text-sm font-medium transition-colors",
                    selectedSize === size
                      ? "border-primary bg-primary text-white"
                      : hasStock
                      ? "border-gray-300 text-gray-900 hover:border-gray-400"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Color: <span className="text-gray-500">{selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const hasStock = variants.some(
                (v) => v.color === c.color && v.stock > 0
              )
              return (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c.color)}
                  disabled={!hasStock}
                  title={c.color}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    selectedColor === c.color
                      ? "border-primary scale-110"
                      : "border-gray-300 hover:border-gray-400",
                    !hasStock && "opacity-30 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: c.colorHex }}
                />
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            -
          </button>
          <span className="w-8 text-center font-medium text-gray-900">
            {quantity}
          </span>
          <button
            onClick={() => {
              if (selectedVariant) {
                setQuantity(Math.min(selectedVariant.stock, quantity + 1))
              } else {
                setQuantity(quantity + 1)
              }
            }}
            disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={isOutOfStock || loading}
        loading={loading}
        onClick={handleAddToCart}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
