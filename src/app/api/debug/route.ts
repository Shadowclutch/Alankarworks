import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || ""
    const host = url ? new URL(url.replace("postgresql://", "https://")).hostname : "not set"
    const adapter = new PrismaNeonHttp(url, {})
    const p = new PrismaClient({ adapter })
    const tables = await p.$queryRawUnsafe<{ table_name: string }[]>("SELECT table_name::text FROM information_schema.tables WHERE table_schema = 'public'")
    await p.$disconnect()
    return NextResponse.json({
      host,
      tables: tables.map(t => t.table_name),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
