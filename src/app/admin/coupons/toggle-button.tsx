"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function ToggleCouponButton({
  couponId,
  isActive,
}: {
  couponId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) throw new Error("Failed to toggle")
      router.refresh()
    } catch {
      alert("Failed to toggle coupon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-green-50 text-green-700 hover:bg-green-100"
      }`}
    >
      {loading ? "..." : isActive ? "Deactivate" : "Activate"}
    </button>
  )
}
