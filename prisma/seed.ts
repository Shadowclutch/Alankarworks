import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || ""
const adapter = new PrismaNeonHttp(connectionString, {})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@alankarworks.com" },
  })

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@alankarworks.com",
        passwordHash: bcrypt.hashSync("admin123", 12),
        role: "ADMIN",
      },
    })
    console.log("Admin user created")
  }

  const categories = [
    { name: "Men", slug: "men", image: "/placeholder.svg" },
    { name: "Women", slug: "women", image: "/placeholder.svg" },
    { name: "Kids", slug: "kids", image: "/placeholder.svg" },
  ]

  for (const cat of categories) {
    const exists = await prisma.category.findUnique({
      where: { slug: cat.slug },
    })
    if (!exists) {
      await prisma.category.create({ data: cat })
      console.log(`Category "${cat.name}" created`)
    }
  }

  const menCategory = await prisma.category.findUnique({ where: { slug: "men" } })
  const womenCategory = await prisma.category.findUnique({ where: { slug: "women" } })
  const kidsCategory = await prisma.category.findUnique({ where: { slug: "kids" } })

  const products = [
    {
      name: "Classic Cotton T-Shirt",
      slug: "classic-cotton-tshirt",
      description: "Premium quality cotton t-shirt. Comfortable and breathable fabric perfect for everyday wear.",
      basePrice: 999,
      salePrice: 599,
      categoryId: menCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/tshirt1/400/500", alt: "Classic Cotton T-Shirt Front", order: 0 },
        { url: "https://picsum.photos/seed/tshirt1b/400/500", alt: "Classic Cotton T-Shirt Back", order: 1 },
      ],
      variants: [
        { size: "S", color: "Black", colorHex: "#000000", stock: 50, price: 599 },
        { size: "M", color: "Black", colorHex: "#000000", stock: 80, price: 599 },
        { size: "L", color: "Black", colorHex: "#000000", stock: 60, price: 599 },
        { size: "XL", color: "Black", colorHex: "#000000", stock: 40, price: 599 },
        { size: "S", color: "White", colorHex: "#FFFFFF", stock: 45, price: 599 },
        { size: "M", color: "White", colorHex: "#FFFFFF", stock: 75, price: 599 },
        { size: "L", color: "White", colorHex: "#FFFFFF", stock: 55, price: 599 },
        { size: "S", color: "Navy Blue", colorHex: "#000080", stock: 30, price: 649 },
        { size: "M", color: "Navy Blue", colorHex: "#000080", stock: 50, price: 649 },
        { size: "L", color: "Navy Blue", colorHex: "#000080", stock: 40, price: 649 },
      ],
    },
    {
      name: "Slim Fit Denim Jeans",
      slug: "slim-fit-denim-jeans",
      description: "Modern slim fit jeans made from premium denim. Features stretchable fabric for maximum comfort.",
      basePrice: 1999,
      salePrice: 1499,
      categoryId: menCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/jeans1/400/500", alt: "Slim Fit Denim Jeans Front", order: 0 },
        { url: "https://picsum.photos/seed/jeans1b/400/500", alt: "Slim Fit Denim Jeans Back", order: 1 },
      ],
      variants: [
        { size: "30", color: "Dark Blue", colorHex: "#1a2744", stock: 35, price: 1499 },
        { size: "32", color: "Dark Blue", colorHex: "#1a2744", stock: 50, price: 1499 },
        { size: "34", color: "Dark Blue", colorHex: "#1a2744", stock: 45, price: 1499 },
        { size: "36", color: "Dark Blue", colorHex: "#1a2744", stock: 25, price: 1499 },
        { size: "30", color: "Light Blue", colorHex: "#6b8cbb", stock: 30, price: 1499 },
        { size: "32", color: "Light Blue", colorHex: "#6b8cbb", stock: 40, price: 1499 },
        { size: "34", color: "Light Blue", colorHex: "#6b8cbb", stock: 35, price: 1499 },
      ],
    },
    {
      name: "Formal Blazer",
      slug: "formal-blazer",
      description: "Sharp formal blazer for professional occasions. Tailored fit with premium lining.",
      basePrice: 3999,
      salePrice: 2999,
      categoryId: menCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/blazer1/400/500", alt: "Formal Blazer Front", order: 0 },
      ],
      variants: [
        { size: "M", color: "Black", colorHex: "#000000", stock: 20, price: 2999 },
        { size: "L", color: "Black", colorHex: "#000000", stock: 30, price: 2999 },
        { size: "XL", color: "Black", colorHex: "#000000", stock: 25, price: 2999 },
        { size: "M", color: "Navy", colorHex: "#000080", stock: 15, price: 2999 },
        { size: "L", color: "Navy", colorHex: "#000080", stock: 25, price: 2999 },
      ],
    },
    {
      name: "Floral Print Dress",
      slug: "floral-print-dress",
      description: "Beautiful floral print dress perfect for summer. Lightweight and flowy fabric.",
      basePrice: 2499,
      salePrice: 1799,
      categoryId: womenCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/dress1/400/500", alt: "Floral Print Dress Front", order: 0 },
        { url: "https://picsum.photos/seed/dress1b/400/500", alt: "Floral Print Dress Back", order: 1 },
      ],
      variants: [
        { size: "S", color: "Multicolor", colorHex: "#ff6b9d", stock: 25, price: 1799 },
        { size: "M", color: "Multicolor", colorHex: "#ff6b9d", stock: 40, price: 1799 },
        { size: "L", color: "Multicolor", colorHex: "#ff6b9d", stock: 35, price: 1799 },
        { size: "XL", color: "Multicolor", colorHex: "#ff6b9d", stock: 20, price: 1799 },
      ],
    },
    {
      name: "Women's Trench Coat",
      slug: "womens-trench-coat",
      description: "Elegant trench coat with belt. Water-resistant outer layer with soft inner lining.",
      basePrice: 4999,
      salePrice: 3999,
      categoryId: womenCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/coat1/400/500", alt: "Women's Trench Coat Front", order: 0 },
      ],
      variants: [
        { size: "S", color: "Beige", colorHex: "#f5f5dc", stock: 15, price: 3999 },
        { size: "M", color: "Beige", colorHex: "#f5f5dc", stock: 25, price: 3999 },
        { size: "L", color: "Beige", colorHex: "#f5f5dc", stock: 20, price: 3999 },
        { size: "M", color: "Black", colorHex: "#000000", stock: 20, price: 3999 },
        { size: "L", color: "Black", colorHex: "#000000", stock: 15, price: 3999 },
      ],
    },
    {
      name: "Kurti Set",
      slug: "kurti-set",
      description: "Traditional kurti set with intricate embroidery. Includes kurti and matching palazzo.",
      basePrice: 1999,
      salePrice: 1299,
      categoryId: womenCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/kurti1/400/500", alt: "Kurti Set Front", order: 0 },
      ],
      variants: [
        { size: "S", color: "Pink", colorHex: "#ff69b4", stock: 30, price: 1299 },
        { size: "M", color: "Pink", colorHex: "#ff69b4", stock: 45, price: 1299 },
        { size: "L", color: "Pink", colorHex: "#ff69b4", stock: 35, price: 1299 },
        { size: "S", color: "Green", colorHex: "#228B22", stock: 25, price: 1299 },
        { size: "M", color: "Green", colorHex: "#228B22", stock: 40, price: 1299 },
        { size: "L", color: "Green", colorHex: "#228B22", stock: 30, price: 1299 },
      ],
    },
    {
      name: "Kids Printed T-Shirt",
      slug: "kids-printed-tshirt",
      description: "Fun printed t-shirt for kids. Soft cotton fabric with colorful cartoon prints.",
      basePrice: 599,
      salePrice: 399,
      categoryId: kidsCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/kidst1/400/500", alt: "Kids Printed T-Shirt Front", order: 0 },
      ],
      variants: [
        { size: "4-5Y", color: "Blue", colorHex: "#4169E1", stock: 40, price: 399 },
        { size: "6-7Y", color: "Blue", colorHex: "#4169E1", stock: 50, price: 399 },
        { size: "8-9Y", color: "Blue", colorHex: "#4169E1", stock: 45, price: 399 },
        { size: "4-5Y", color: "Red", colorHex: "#FF0000", stock: 35, price: 399 },
        { size: "6-7Y", color: "Red", colorHex: "#FF0000", stock: 45, price: 399 },
        { size: "8-9Y", color: "Red", colorHex: "#FF0000", stock: 40, price: 399 },
      ],
    },
    {
      name: "Kids Party Wear",
      slug: "kids-party-wear",
      description: "Special occasion party wear for kids. Stylish and comfortable for celebrations.",
      basePrice: 1499,
      salePrice: 999,
      categoryId: kidsCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/kidsp1/400/500", alt: "Kids Party Wear Front", order: 0 },
      ],
      variants: [
        { size: "4-5Y", color: "White", colorHex: "#FFFFFF", stock: 20, price: 999 },
        { size: "6-7Y", color: "White", colorHex: "#FFFFFF", stock: 30, price: 999 },
        { size: "8-9Y", color: "White", colorHex: "#FFFFFF", stock: 25, price: 999 },
        { size: "4-5Y", color: "Gold", colorHex: "#FFD700", stock: 15, price: 1099 },
        { size: "6-7Y", color: "Gold", colorHex: "#FFD700", stock: 25, price: 1099 },
      ],
    },
    {
      name: "Girls Frock",
      slug: "girls-frock",
      description: "Beautiful frock for little girls. Lace detailing with comfortable fit.",
      basePrice: 1299,
      salePrice: 899,
      categoryId: kidsCategory!.id,
      images: [
        { url: "https://picsum.photos/seed/frock1/400/500", alt: "Girls Frock Front", order: 0 },
      ],
      variants: [
        { size: "4-5Y", color: "Pink", colorHex: "#ff69b4", stock: 30, price: 899 },
        { size: "6-7Y", color: "Pink", colorHex: "#ff69b4", stock: 40, price: 899 },
        { size: "8-9Y", color: "Pink", colorHex: "#ff69b4", stock: 35, price: 899 },
        { size: "4-5Y", color: "Purple", colorHex: "#800080", stock: 25, price: 899 },
        { size: "6-7Y", color: "Purple", colorHex: "#800080", stock: 35, price: 899 },
      ],
    },
  ]

  for (const product of products) {
    const exists = await prisma.product.findUnique({ where: { slug: product.slug } })
    if (!exists) {
      const { images, variants, ...productData } = product
      const created = await prisma.product.create({ data: productData })
      for (const img of images) {
        await prisma.productImage.create({ data: { ...img, productId: created.id } })
      }
      for (const v of variants) {
        await prisma.productVariant.create({ data: { ...v, productId: created.id } })
      }
      console.log(`Product "${product.name}" created`)
    }
  }

  const couponExists = await prisma.coupon.findUnique({ where: { code: "WELCOME50" } })
  if (!couponExists) {
    await prisma.coupon.create({
      data: {
        code: "WELCOME50",
        discount: 50,
        isPercent: true,
        minOrder: 999,
        maxUses: 100,
        isActive: true,
        expiresAt: new Date("2027-12-31"),
      },
    })
    console.log("Coupon WELCOME50 created")
  }

  const coupon2Exists = await prisma.coupon.findUnique({ where: { code: "FLAT200" } })
  if (!coupon2Exists) {
    await prisma.coupon.create({
      data: {
        code: "FLAT200",
        discount: 200,
        isPercent: false,
        minOrder: 1499,
        maxUses: 50,
        isActive: true,
        expiresAt: new Date("2027-12-31"),
      },
    })
    console.log("Coupon FLAT200 created")
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
