import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shippingAddressId, couponCode } = await request.json()

    if (!shippingAddressId) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: session.user.id },
    })

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    let subtotal = 0
    for (const item of cart.items) {
      const price = item.variant?.price ?? item.product.salePrice ?? item.product.basePrice
      subtotal += price * item.quantity
    }

    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
            discount = coupon.isPercent
              ? subtotal * (coupon.discount / 100)
              : coupon.discount

            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            })
          }
        }
      }
    }

    const deliveryCharge = subtotal >= 999 ? 0 : 99
    const total = Math.max(0, subtotal - discount + deliveryCharge)

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        shippingAddressId,
        subtotal,
        discount,
        deliveryCharge,
        total,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price ?? item.product.salePrice ?? item.product.basePrice,
            total: (item.variant?.price ?? item.product.salePrice ?? item.product.basePrice) * item.quantity,
          })),
        },
      },
      include: {
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
      },
    })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.delete({ where: { id: cart.id } })

    return NextResponse.json(
      {
        ...order,
        razorpayOrderId: null,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
