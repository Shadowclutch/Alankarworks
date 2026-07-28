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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Collection</span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          {category
            ? categories.find((c: any) => c.slug === category)?.name ?? "Products"
            : "All Products"}
        </h1>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">Categories</h2>
          <nav className="mt-4 space-y-1">
            <Link
              href="/products"
              className={`block border-l-2 px-4 py-2 text-sm transition-colors ${
                !category
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
              }`}
            >
              All Products
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`block border-l-2 px-4 py-2 text-sm transition-colors ${
                  category === cat.slug
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-charcoal/50">No products found.</p>
              {category && (
                <Link
                  href="/products"
                  className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4"
                >
                  View all products
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
