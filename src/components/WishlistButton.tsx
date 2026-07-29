"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface WishlistItem {
  id: string
  productId: string
}

interface WishlistButtonProps {
  productId: string
}

export function WishlistButton({ productId }: WishlistButtonProps) {
  const router = useRouter()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    async function checkWishlist() {
      try {
        const res = await fetch("/api/wishlist")
        if (res.status === 401) { router.push("/login"); return }
        if (res.ok) {
          const data: WishlistItem[] = await res.json()
          setIsInWishlist(data.some((item) => item.productId === productId))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    checkWishlist()
  }, [productId, router])

  async function toggle() {
    if (toggling) return
    setToggling(true)

    try {
      if (isInWishlist) {
        const res = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        })
        if (res.status === 401) { router.push("/login"); return }
        if (res.ok) setIsInWishlist(false)
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
        if (res.status === 401) { router.push("/login"); return }
        if (res.ok) setIsInWishlist(true)
      }
    } catch {
      // ignore
    } finally {
      setToggling(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || toggling}
      className="flex items-center justify-center transition-colors hover:scale-110"
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-pulse text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ) : (
        <svg
          className={`h-5 w-5 transition-all ${
            isInWishlist
              ? "text-red-500"
              : "text-charcoal/40 hover:text-red-400"
          }`}
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  )
}
