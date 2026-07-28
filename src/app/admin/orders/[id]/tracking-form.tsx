"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeliveryTrackingForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!status.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addTracking: { status, location, description },
        }),
      })
      if (!res.ok) throw new Error("Failed to add tracking")
      setStatus("")
      setLocation("")
      setDescription("")
      router.refresh()
    } catch {
      alert("Failed to add tracking entry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Add Tracking Entry</p>
      <input
        type="text"
        placeholder="Status (e.g. Picked Up)"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <input
        type="text"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Entry"}
      </button>
    </form>
  )
}
