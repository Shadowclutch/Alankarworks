import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"

const connectionString =
  process.env.ALANKARWORKS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  ""

const adapter = new PrismaNeonHttp(connectionString, {})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
