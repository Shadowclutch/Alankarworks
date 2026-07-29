import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: { gt: now } },
          { expiresAt: null },
        ],
      },
      select: { code: true, discount: true, isPercent: true, minOrder: true },
      take: 5,
    })
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json([])
  }
}
