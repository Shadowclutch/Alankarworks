"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

const SERVICEABLE_PINCODES = [
  "110001",
  "110002",
  "110003",
  "400001",
  "400002",
  "600001",
  "700001",
  "500001",
  "201301",
  "201302",
]

function getEstimatedDelivery(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  return date.toLocaleDateString("en-IN", options)
}

type Status = "idle" | "success" | "error"

export function PincodeChecker() {
  const [pincode, setPincode] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  function handleCheck() {
    const trimmed = pincode.trim()

    if (!trimmed) {
      setStatus("error")
      setMessage("Please enter a pincode")
      return
    }

    if (SERVICEABLE_PINCODES.includes(trimmed)) {
      setStatus("success")
      setMessage(
        `Delivery available to ${trimmed} — estimated delivery by ${getEstimatedDelivery()}`
      )
    } else {
      setStatus("error")
      setMessage(`Sorry, we don't deliver to ${trimmed} yet`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCheck()
    }
  }

  return (
    <div className="rounded-xl bg-warm-gray p-6">
      <div className="mb-1 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        <span className="text-sm font-medium text-charcoal">
          Check delivery availability
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""))
              if (status !== "idle") {
                setStatus("idle")
                setMessage("")
              }
            }}
            onKeyDown={handleKeyDown}
            error={status === "error" ? undefined : undefined}
          />
        </div>
        <Button
          type="button"
          size="md"
          className="shrink-0"
          onClick={handleCheck}
        >
          Check
        </Button>
      </div>

      {status === "success" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-success-green/10 px-4 py-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-success-green"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-success-green">
              {message}
            </p>
            <p className="mt-0.5 text-xs text-success-green/80">
              Free delivery on all orders
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-error-red/10 px-4 py-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-error-red"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm font-medium text-error-red">{message}</p>
        </div>
      )}
    </div>
  )
}
