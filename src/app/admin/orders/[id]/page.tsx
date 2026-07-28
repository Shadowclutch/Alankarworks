import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { OrderStatusActions } from "./status-actions"
import { DeliveryTrackingForm } from "./tracking-form"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { order: "asc" }, take: 1 },
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      coupon: true,
      tracking: { orderBy: { timestamp: "asc" } },
    },
  })

  if (!order) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Order not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Order {order.orderNumber}
        </h2>
        <span className="text-sm text-gray-500">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Items
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt ?? item.product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                      No img
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.variant
                        ? `${item.variant.size} / ${item.variant.color ?? "N/A"}`
                        : "No variant"}
                      {" × "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delivery Tracking
              </h3>
            </div>
            <div className="px-6 py-4">
              {order.tracking.length > 0 ? (
                <div className="space-y-4">
                  {order.tracking.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="h-full w-px bg-gray-200" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.status}
                        </p>
                        {entry.location && (
                          <p className="text-xs text-gray-500">
                            {entry.location}
                          </p>
                        )}
                        {entry.description && (
                          <p className="text-xs text-gray-500">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tracking entries yet</p>
              )}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <DeliveryTrackingForm orderId={order.id} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="font-medium text-gray-900">
                {order.user.name ?? "N/A"}
              </p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-sm text-gray-500">{order.user.phone}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h3>
            </div>
            <div className="px-6 py-4 text-sm text-gray-700">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h3>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="text-gray-900">
                  {order.deliveryCharge === 0
                    ? "FREE"
                    : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            </div>
            <div className="px-6 py-4">
              <OrderStatusActions
                orderId={order.id}
                currentStatus={order.status}
                currentPaymentStatus={order.paymentStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
