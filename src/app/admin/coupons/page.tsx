import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { ToggleCouponButton } from "./toggle-button"
import { CreateCouponForm } from "./create-form"

export default async function AdminCouponsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <CreateCouponForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="px-6 py-3 font-medium">Code</th>
              <th className="px-6 py-3 font-medium">Discount</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Min Order</th>
              <th className="px-6 py-3 font-medium">Uses</th>
              <th className="px-6 py-3 font-medium">Expires</th>
              <th className="px-6 py-3 font-medium">Active</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-mono font-medium text-gray-900">
                  {coupon.code}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {coupon.isPercent
                    ? `${coupon.discount}%`
                    : formatPrice(coupon.discount)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {coupon.isPercent ? "Percentage" : "Flat"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {coupon.minOrder > 0
                    ? formatPrice(coupon.minOrder)
                    : "No min"}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ToggleCouponButton
                    couponId={coupon.id}
                    isActive={coupon.isActive}
                  />
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No coupons yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
