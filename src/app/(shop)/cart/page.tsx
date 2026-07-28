"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"

interface CartItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    salePrice: number | null
    images: { url: string; alt: string | null }[]
  }
  variant: {
    id: string
    size: string
    color: string | null
    price: number | null
  } | null
}

interface Cart {
  id: string
  items: CartItem[]
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch {
      // ignore
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch {
      // ignore
    }
  }

  function getItemPrice(item: CartItem): number {
    return item.variant?.price ?? item.product.salePrice ?? item.product.basePrice
  }

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  ) ?? 0

  const deliveryCharge = subtotal >= 999 ? 0 : 99
  const total = subtotal + deliveryCharge

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <Button className="mt-6">Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-8 divide-y divide-gray-200">
        {cart.items.map((item) => {
          const price = getItemPrice(item)
          const imageUrl = item.product.images[0]?.url ?? "/api/placeholder/80/100"

          return (
            <div key={item.id} className="flex gap-4 py-6">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={imageUrl}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.variant.size}
                      {item.variant.color && ` / ${item.variant.color}`}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatPrice(price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span>
              {deliveryCharge === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(deliveryCharge)
              )}
            </span>
          </div>
          {subtotal < 999 && subtotal > 0 && (
            <p className="text-xs text-gray-400">
              Add {formatPrice(999 - subtotal)} more for free delivery
            </p>
          )}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={() => router.push("/checkout")}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}
