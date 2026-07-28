import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Record<string, unknown> = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
