import { PrismaClient } from './src/generated/prisma/client.js'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {})
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.$queryRawUnsafe("SELECT table_name::text FROM information_schema.tables WHERE table_schema = 'public'")
  console.log(JSON.stringify(result, null, 2))
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
