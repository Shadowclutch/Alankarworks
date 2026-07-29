import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

const ORDER_STAGES = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const

const TERMINAL_STAGES = ["CANCELLED", "RETURNED"]

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
}

interface Stage {
  status: string
  label: string
  timestamp: Date | null
  location: string | null
  description: string | null
}

function buildStages(order: any): Stage[] {
  if (order.tracking.length > 0) {
    return order.tracking.map((t: any) => ({
      status: t.status,
      label: t.status.replace(/_/g, " "),
      timestamp: t.timestamp,
      location: t.location,
      description: t.description,
    }))
  }

  if (TERMINAL_STAGES.includes(order.status)) {
    const label = order.status === "CANCELLED" ? "Cancelled" : "Returned"
    return [
      {
        status: order.status,
        label,
        timestamp: order.updatedAt,
        location: null,
        description: null,
      },
    ]
  }

  const idx = ORDER_STAGES.findIndex((s) => s.key === order.status)
  if (idx === -1) return []

  return ORDER_STAGES.slice(0, idx + 1).map((s, i) => ({
    status: s.key,
    label: s.label,
    timestamp: i === idx ? order.updatedAt : null,
    location: null,
    description: null,
  }))
}

function getStageState(
  stageStatus: string,
  orderStatus: string,
): "completed" | "active" | "future" | "terminal" {
  if (TERMINAL_STAGES.includes(stageStatus)) return "terminal"
  const si = ORDER_STAGES.findIndex((s) => s.key === stageStatus)
  const oi = ORDER_STAGES.findIndex((s) => s.key === orderStatus)
  if (si === -1 || oi === -1) return "future"
  if (si < oi) return "completed"
  if (si === oi) return "active"
  return "future"
}

function TimelineIcon({ state }: { state: "completed" | "active" | "future" | "terminal" }) {
  if (state === "terminal") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-50">
        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  if (state === "completed") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  if (state === "active") {
    return (
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white shadow-sm ring-2 ring-primary/20">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30 opacity-75" />
        <div className="relative h-3 w-3 rounded-full bg-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
      <div className="h-3 w-3 rounded-full bg-gray-200" />
    </div>
  )
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { order: "asc" } },
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      tracking: { orderBy: { timestamp: "asc" } },
    },
  })

  if (!order) {
    notFound()
  }

  if (
    order.userId !== session.user.id &&
    (session.user as any).role !== "ADMIN"
  ) {
    redirect("/orders")
  }

  const stages = buildStages(order)
  const isTerminal = TERMINAL_STAGES.includes(order.status)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-warm-gray">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                statusColors[order.status] ?? "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                paymentStatusColors[order.paymentStatus] ??
                "bg-gray-100 text-gray-800"
              }`}
            >
              {order.paymentStatus === "PAID"
                ? "Paid"
                : order.paymentStatus === "PENDING"
                  ? "Payment Pending"
                  : order.paymentStatus === "REFUNDED"
                    ? "Refunded"
                    : order.paymentStatus === "FAILED"
                      ? "Payment Failed"
                      : order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {stages.length > 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-warm-gray">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            {isTerminal
              ? order.status === "CANCELLED"
                ? "Order Cancelled"
                : "Order Returned"
              : "Delivery Timeline"}
          </h2>
          <div className="relative mt-6">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-100" />
            <div className="relative space-y-0">
              {stages.map((stage: Stage, i: number) => {
                const state = getStageState(stage.status, order.status)
                const isLast = i === stages.length - 1

                return (
                  <div key={i} className="relative flex gap-5 pb-8 last:pb-0">
                    <div className="relative z-10 flex flex-col items-center">
                      <TimelineIcon state={state} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p
                        className={`text-sm font-semibold ${
                          state === "future"
                            ? "text-gray-300"
                            : state === "terminal"
                              ? "text-red-600"
                              : state === "completed"
                                ? "text-emerald-700"
                                : "text-primary"
                        }`}
                      >
                        {stage.label}
                      </p>
                      {stage.description && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {stage.description}
                        </p>
                      )}
                      {stage.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {stage.location}
                        </p>
                      )}
                      {stage.timestamp && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {state === "active" ? "Expected by " : ""}
                          {new Date(stage.timestamp).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    {state === "active" && !isTerminal && (
                      <div className="shrink-0 self-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          In Progress
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-warm-gray">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          Order Items
        </h2>
        <div className="mt-4 divide-y divide-warm-gray">
          {order.items.map((item: any) => {
            const imageUrl =
              item.product.images[0]?.url ?? "/api/placeholder/64/80"
            return (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-warm-gray">
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {item.variant.size}
                      {item.variant.color && ` / ${item.variant.color}`}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-charcoal">
                  {formatPrice(item.total)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shipping & Summary Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Shipping Address */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-warm-gray">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Shipping Address
          </h2>
          <div className="mt-3 space-y-1">
            <p className="font-medium text-charcoal">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress.phone}
            </p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-warm-gray">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Price Summary
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>
                {order.deliveryCharge === 0 ? (
                  <span className="text-emerald-600 font-medium">Free</span>
                ) : (
                  formatPrice(order.deliveryCharge)
                )}
              </span>
            </div>
            <div className="border-t border-warm-gray pt-2">
              <div className="flex justify-between font-semibold text-charcoal">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Orders
        </Link>
      </div>
    </div>
  )
}
