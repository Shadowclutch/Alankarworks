import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "5", 10) || 5, 1), 50)

    if (!q) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        salePrice: true,
        images: {
          take: 1,
          orderBy: { order: "asc" },
          select: { url: true },
        },
        category: {
          select: { name: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch {
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    )
  }
}
