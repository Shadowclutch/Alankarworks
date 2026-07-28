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
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warm-gray">
          <svg className="h-7 w-7 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Your cart is empty</h1>
        <p className="mt-2 text-sm text-charcoal/50">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <button className="mt-8 border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-cream">
            Start Shopping
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-charcoal">Shopping Cart</h1>

      <div className="mt-10 divide-y divide-gold-light/30">
        {cart.items.map((item) => {
          const price = getItemPrice(item)
          const imageUrl = item.product.images[0]?.url ?? "/api/placeholder/80/100"

          return (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="h-28 w-24 shrink-0 overflow-hidden bg-warm-gray">
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
                    className="text-sm font-medium text-charcoal transition-colors hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="mt-0.5 text-xs text-charcoal/50">
                      {item.variant.size}
                      {item.variant.color && ` / ${item.variant.color}`}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-charcoal">
                    {formatPrice(price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center border border-charcoal/20 text-charcoal/60 transition-colors hover:border-primary hover:text-primary"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center border border-charcoal/20 text-charcoal/60 transition-colors hover:border-primary hover:text-primary"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-sm font-semibold text-charcoal">
                      {formatPrice(price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-stone-400 underline underline-offset-2 transition-colors hover:text-red-600"
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

      <div className="mt-10 ml-auto w-full max-w-sm border border-gold-light/40 bg-warm-gray p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-charcoal/60">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal/60">
            <span>Delivery</span>
            <span>
              {deliveryCharge === 0 ? (
                <span className="font-medium text-green-700">Free</span>
              ) : (
                formatPrice(deliveryCharge)
              )}
            </span>
          </div>
          {subtotal < 999 && subtotal > 0 && (
            <p className="text-xs text-charcoal/40">
              Add {formatPrice(999 - subtotal)} more for free delivery
            </p>
          )}
          <div className="border-t border-gold-light/40 pt-3">
            <div className="flex justify-between text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/checkout")}
          className="mt-5 w-full bg-primary py-3 text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-all hover:bg-primary-dark"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
