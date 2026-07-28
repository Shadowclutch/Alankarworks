import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ui/ProductCard"

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams

  const where: Record<string, unknown> = { isActive: true }

  if (category) {
    where.category = { slug: category }
  }

  const [products, categories] = (await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ])) as any[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <nav className="mt-4 space-y-1">
            <Link
              href="/products"
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !category
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              All Products
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  category === cat.slug
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {category
              ? categories.find((c: any) => c.slug === category)?.name ?? "Products"
              : "All Products"}
          </h1>

          {products.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-gray-500">No products found.</p>
              {category && (
                <Link
                  href="/products"
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  View all products
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
