import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
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
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
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
        },
      })
    }

    return NextResponse.json(cart)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, variantId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "productId and quantity are required" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? "",
        },
      },
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      })
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      },
    })

    return NextResponse.json(updatedCart, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || quantity == null) {
      return NextResponse.json(
        { error: "itemId and quantity are required" },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } })
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      },
    })

    return NextResponse.json(updatedCart)
  } catch {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId query param is required" },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      },
    })

    return NextResponse.json(updatedCart)
  } catch {
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    )
  }
}
