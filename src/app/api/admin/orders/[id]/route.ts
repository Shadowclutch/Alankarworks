import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
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
        coupon: true,
        tracking: { orderBy: { timestamp: "asc" } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

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

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.status) updateData.status = body.status
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus

    if (body.addTracking) {
      await prisma.deliveryTracking.create({
        data: {
          orderId: id,
          status: body.addTracking.status,
          location: body.addTracking.location ?? null,
          description: body.addTracking.description ?? null,
        },
      })
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id },
        data: updateData,
      })
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
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
        coupon: true,
        tracking: { orderBy: { timestamp: "asc" } },
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
