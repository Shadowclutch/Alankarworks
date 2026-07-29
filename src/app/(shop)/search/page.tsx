import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ui/ProductCard"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  const products = query
    ? ((await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
        },
        orderBy: { createdAt: "desc" },
      })) as any[])
    : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Search
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          {query ? (
            <>Search results for &ldquo;{query}&rdquo;</>
          ) : (
            "Search"
          )}
        </h1>
      </div>

      {!query ? (
        <div className="mt-12 text-center">
          <p className="text-charcoal/50">Enter a search term to find products.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-charcoal/60">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-2 text-sm text-charcoal/40">
            Try different keywords or browse our categories.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-cream"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
