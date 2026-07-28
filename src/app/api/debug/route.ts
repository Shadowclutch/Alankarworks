import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || ""
    const host = url ? new URL(url.replace("postgresql://", "https://")).hostname : "not set"
    const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>("SELECT table_name::text FROM information_schema.tables WHERE table_schema = 'public'")
    return NextResponse.json({
      host,
      tables: tables.map(t => t.table_name),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
