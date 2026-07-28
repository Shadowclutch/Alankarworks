"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const

export function OrderStatusActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string
  currentStatus: string
  currentPaymentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(field: string, value: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error("Failed to update")
      if (field === "status") setStatus(value)
      if (field === "paymentStatus") setPaymentStatus(value)
      router.refresh()
    } catch {
      alert("Failed to update order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Order Status
        </label>
        <select
          value={status}
          onChange={(e) => handleUpdate("status", e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => handleUpdate("paymentStatus", e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
