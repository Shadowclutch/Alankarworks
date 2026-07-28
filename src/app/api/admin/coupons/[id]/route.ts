import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code !== undefined && { code: body.code }),
        ...(body.discount !== undefined && { discount: body.discount }),
        ...(body.isPercent !== undefined && { isPercent: body.isPercent }),
        ...(body.minOrder !== undefined && { minOrder: body.minOrder }),
        ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    await prisma.coupon.delete({ where: { id } })

    return NextResponse.json({ message: "Coupon deleted" })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    )
  }
}
