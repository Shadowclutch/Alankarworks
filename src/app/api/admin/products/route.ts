import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        variants: true,
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, basePrice, salePrice, categoryId, images, variants } = body

    if (!name || !description || !basePrice || !categoryId) {
      return NextResponse.json(
        { error: "name, description, basePrice, and categoryId are required" },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        salePrice: salePrice ?? null,
        categoryId,
        images: {
          create: (images ?? []).map(
            (img: { url: string; alt?: string; order?: number }) => ({
              url: img.url,
              alt: img.alt ?? null,
              order: img.order ?? 0,
            })
          ),
        },
        variants: {
          create: (variants ?? []).map(
            (v: {
              size: string
              color?: string
              colorHex?: string
              stock?: number
              price?: number
            }) => ({
              size: v.size,
              color: v.color ?? null,
              colorHex: v.colorHex ?? null,
              stock: v.stock ?? 0,
              price: v.price ?? null,
            })
          ),
        },
      },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        variants: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
