"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { formatPrice } from "@/lib/utils"

interface Address {
  id: string
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    salePrice: number | null
    images: { url: string }[]
  }
  variant: {
    id: string
    size: string
    color: string | null
    price: number | null
  } | null
}

type Step = "address" | "review" | "payment"

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("address")
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [couponCode, setCouponCode] = useState("")

  // new address form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  })

  useEffect(() => {
    Promise.all([fetchAddresses(), fetchCart()]).finally(() =>
      setLoading(false)
    )
  }, [])

  async function fetchAddresses() {
    try {
      const res = await fetch("/api/addresses")
      if (res.ok) {
        const data: Address[] = await res.json()
        setAddresses(data)
        const defaultAddr = data.find((a) => a.isDefault) ?? data[0]
        if (defaultAddr) setSelectedAddressId(defaultAddr.id)
      }
    } catch {
      // ignore
    }
  }

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.items ?? [])
      }
    } catch {
      // ignore
    }
  }

  async function handleAddAddress() {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const address: Address = await res.json()
        setAddresses((prev) => [address, ...prev])
        setSelectedAddressId(address.id)
        setShowForm(false)
        setForm({ fullName: "", phone: "", street: "", city: "", state: "", pincode: "" })
      }
    } catch {
      // ignore
    }
  }

  function getItemPrice(item: CartItem): number {
    return item.variant?.price ?? item.product.salePrice ?? item.product.basePrice
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  )

  const deliveryCharge = subtotal >= 999 ? 0 : 99
  const discount = 0
  const total = subtotal - discount + deliveryCharge

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  async function handlePlaceOrder() {
    if (!selectedAddressId) return

    setPlacing(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddressId: selectedAddressId, couponCode }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? "Failed to place order")
        return
      }

      const order = await res.json()
      router.push(`/orders/${order.id}`)
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm">
          {(["address", "review", "payment"] as Step[]).map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step === s
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={
                  step === s ? "font-medium text-gray-900" : "text-gray-500"
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 2 && <span className="text-gray-300">—</span>}
            </span>
          ))}
        </div>
      </div>

      {step === "address" && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Shipping Address
          </h2>

          {addresses.length > 0 && (
            <div className="mt-4 space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">{addr.fullName}</p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                  <p className="text-sm text-gray-500">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </label>
              ))}
            </div>
          )}

          {showForm ? (
            <div className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Street"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <Input
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <div className="flex gap-3">
                <Button onClick={handleAddAddress}>Save Address</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              + Add New Address
            </Button>
          )}

          <div className="mt-8">
            <Button
              size="lg"
              disabled={!selectedAddressId}
              onClick={() => setStep("review")}
            >
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Order Items
            </h2>
            <div className="mt-3 divide-y divide-gray-100">
              {cartItems.map((item) => {
                const price = getItemPrice(item)
                return (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="h-16 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
                      <img
                        src={item.product.images[0]?.url ?? "/api/placeholder/56/72"}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {item.variant.size}
                          {item.variant.color && ` / ${item.variant.color}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedAddress && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shipping To
              </h2>
              <div className="mt-2 rounded-lg border border-gray-200 p-4">
                <p className="font-medium text-gray-900">
                  {selectedAddress.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAddress.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAddress.street}, {selectedAddress.city},{" "}
                  {selectedAddress.state} - {selectedAddress.pincode}
                </p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Coupon</h2>
            <div className="mt-2 flex gap-3">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outline">Apply</Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("address")}>
              Back
            </Button>
            <Button size="lg" onClick={() => setStep("payment")}>
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <p className="mt-4 text-3xl font-bold text-gray-900">
              {formatPrice(total)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {cartItems.reduce((s, i) => s + i.quantity, 0)} items
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            loading={placing}
            disabled={placing}
            onClick={handlePlaceOrder}
          >
            Place Order
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep("review")}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
