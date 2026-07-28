import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(addresses)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
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

    const { fullName, phone, street, city, state, pincode, isDefault } =
      await request.json()

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "All address fields are required" },
        { status: 400 }
      )
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: isDefault ?? false,
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    )
  }
}
