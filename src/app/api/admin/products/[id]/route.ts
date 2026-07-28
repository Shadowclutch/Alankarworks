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

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.basePrice !== undefined && { basePrice: body.basePrice }),
        ...(body.salePrice !== undefined && { salePrice: body.salePrice }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        variants: true,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Failed to update product" },
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

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: "Product deleted" })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
