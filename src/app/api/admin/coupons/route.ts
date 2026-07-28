import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, discount, isPercent, minOrder, maxUses, expiresAt } = body

    if (!code || discount == null) {
      return NextResponse.json(
        { error: "code and discount are required" },
        { status: 400 }
      )
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount,
        isPercent: isPercent ?? true,
        minOrder: minOrder ?? 0,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    )
  }
}
