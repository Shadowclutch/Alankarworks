import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "./AddToCartButton"
import { ImageGallery } from "@/components/ImageGallery"
import { SizeChart } from "@/components/SizeChart"
import { PincodeChecker } from "@/components/PincodeChecker"
import { WishlistButton } from "@/components/WishlistButton"
import { ProductCard } from "@/components/ui/ProductCard"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

function avgRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

function ratingDistribution(reviews: { rating: number }[]) {
  const dist = [0, 0, 0, 0, 0]
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++
  }
  return dist
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const session = await auth()

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      variants: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!product || !product.isActive) {
    notFound()
  }

  const sizes: string[] = Array.from(
    new Set(product.variants.map((v: any) => v.size))
  )
  const colors: { color: string; colorHex: string }[] = []
  for (const v of product.variants) {
    if (v.color) {
      colors.push({ color: v.color, colorHex: v.colorHex ?? "" })
    }
  }
  const uniqueColors = colors.filter(
    (v, i, a) => a.findIndex((c) => c.color === v.color) === i
  )

  const avg = avgRating(product.reviews as any[])
  const dist = ratingDistribution(product.reviews as any[])
  const totalReviews = product.reviews.length

  const similarProducts = product.category
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: true,
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-10 text-xs text-charcoal/50">
        <Link href="/" className="transition-colors hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="transition-colors hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="transition-colors hover:text-primary">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <ImageGallery images={product.images as any[]} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              {product.category && (
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
                  {product.category.name}
                </span>
              )}
              <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal lg:text-4xl">
                {product.name}
              </h1>
              {totalReviews > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`h-3.5 w-3.5 ${star <= Math.round(avg) ? "text-gold" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-charcoal/50">{avg.toFixed(1)} ({totalReviews})</span>
                </div>
              )}
            </div>
            <WishlistButton productId={product.id} />
          </div>

          <div className="flex items-baseline gap-3">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-stone-400 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-charcoal">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          <div className="border-t border-gold-light/30 pt-6">
            <p className="leading-relaxed text-charcoal/60">{product.description}</p>
          </div>

          <AddToCartButton
            productId={product.id}
            variants={product.variants}
            sizes={sizes}
            colors={uniqueColors}
            isLoggedIn={!!session?.user?.id}
          />

          <div className="flex items-center gap-4">
            {sizes.length > 0 && <SizeChart category={product.category?.name ?? "Men"} />}
          </div>

          <PincodeChecker />

          {product.variants.length > 0 && (
            <div className="border border-gold-light/40 bg-warm-gray p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/70">Stock Information</h3>
              <div className="mt-3 space-y-1.5">
                {product.variants.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between text-sm text-charcoal/60">
                    <span>
                      {v.size}
                      {v.color && ` / ${v.color}`}
                    </span>
                    <span className={v.stock > 0 ? "text-green-700" : "text-red-600"}>
                      {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalReviews > 0 && (
            <div className="border-t border-gold-light/30 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-charcoal">
                  Ratings & Reviews ({totalReviews})
                </h2>
                {session?.user?.id && (
                  <Link
                    href={`/products/${slug}/review`}
                    className="text-xs font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4"
                  >
                    Write a Review
                  </Link>
                )}
              </div>

              <div className="mb-6 flex items-start gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-charcoal">{avg.toFixed(1)}</div>
                  <div className="mt-1 flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`h-4 w-4 ${star <= Math.round(avg) ? "text-gold" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-charcoal/50">{totalReviews} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = dist[star - 1]
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-charcoal/60">
                        <span className="w-8 text-right">{star}</span>
                        <svg className="h-3 w-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="border border-gold-light/30 bg-cream p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-gold" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-charcoal">
                        {review.user.name ?? "Anonymous"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-charcoal/60">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-20 border-t border-gold-light/30 pt-12">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">You May Also Like</span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-charcoal">Similar Products</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
