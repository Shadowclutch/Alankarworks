import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [totalRevenue, totalOrders, totalCustomers, totalProducts, ordersByStatus, revenueByDay] =
      await Promise.all([
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.product.count(),
        prisma.order.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.$queryRawUnsafe<Array<{ date: string; revenue: number }>>(
          `SELECT DATE(createdAt) as date, SUM(total) as revenue FROM "Order" WHERE createdAt >= DATE('now', '-7 days') GROUP BY DATE(createdAt) ORDER BY date ASC`
        ),
      ])

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count.id,
      })),
      revenueByDay: (revenueByDay as Array<{ date: string; revenue: number }>).map(
        (r) => ({
          date: r.date,
          revenue: Number(r.revenue),
        })
      ),
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
