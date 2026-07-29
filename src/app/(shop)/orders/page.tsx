import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

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

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { include: { images: { take: 1, orderBy: { order: "asc" } } } }, variant: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">My Account</span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warm-gray">
            <svg className="h-7 w-7 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">No orders yet</h2>
          <p className="mt-2 text-sm text-charcoal/50">Start shopping to see your orders here.</p>
          <Link href="/products">
            <button className="mt-8 border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-cream">
              Shop Now
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items[0]
            const imageUrl = firstItem?.product.images[0]?.url ?? "/api/placeholder/64/80"
            const itemCount = order._count.items

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block border border-warm-gray bg-white p-5 transition-all hover:border-gold-light hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-warm-gray">
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-charcoal">Order {order.orderNumber}</p>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[order.status] ?? "bg-gray-100 text-gray-800"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-charcoal/50">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      {" — "}{itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-charcoal">{formatPrice(order.total)}</p>
                  </div>
                  <svg className="hidden h-5 w-5 shrink-0 text-charcoal/20 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
