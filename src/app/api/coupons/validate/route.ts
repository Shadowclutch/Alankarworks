import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, subtotal } = body

    if (!code || subtotal == null) {
      return NextResponse.json(
        { error: "code and subtotal are required" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      )
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      )
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      )
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${coupon.minOrder} required`,
        },
        { status: 400 }
      )
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "This coupon has reached its maximum uses" },
        { status: 400 }
      )
    }

    let discountAmount: number
    if (coupon.isPercent) {
      discountAmount = (subtotal * coupon.discount) / 100
    } else {
      discountAmount = Math.min(coupon.discount, subtotal)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        isPercent: coupon.isPercent,
      },
      discountAmount,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
