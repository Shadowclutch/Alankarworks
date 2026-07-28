import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

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
              images: { orderBy: { order: "asc" } },
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

  if (order.userId !== session.user.id && (session.user as any).role !== "ADMIN") {
    redirect("/orders")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[order.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              paymentStatusColors[order.paymentStatus] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {order.items.map((item: any) => {
            const imageUrl =
              item.product.images[0]?.url ?? "/api/placeholder/64/80"
            return (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500">
                      {item.variant.size}
                      {item.variant.color && ` / ${item.variant.color}`}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.total)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Shipping Address
          </h2>
          <div className="mt-2 rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-900">
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

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Order Summary
          </h2>
          <div className="mt-2 space-y-2 rounded-lg border border-gray-200 p-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>
                {order.deliveryCharge === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(order.deliveryCharge)
                )}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {order.tracking.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Tracking
          </h2>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {order.tracking.map((event: any) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {event.status}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-400">
                          {event.location}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/orders"
          className="text-sm font-medium text-primary hover:underline"
        >
          &larr; Back to Orders
        </Link>
      </div>
    </div>
  )
}
