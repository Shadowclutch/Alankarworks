import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "./AddToCartButton"

interface ProductPageProps {
  params: Promise<{ slug: string }>
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

  const mainImage = product.images[0]?.url ?? "/api/placeholder/600/800"
  const thumbnailImages = product.images.slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
            <img
              src={mainImage}
              alt={product.images[0]?.alt ?? product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {thumbnailImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {thumbnailImages.map((img: any) => (
                <button
                  key={img.id}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <span className="text-sm font-medium text-primary">
                {product.category.name}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <AddToCartButton
            productId={product.id}
            variants={product.variants}
            sizes={sizes}
            colors={uniqueColors}
            isLoggedIn={!!session?.user?.id}
          />

          {product.variants.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-900">Stock Information</h3>
              <div className="mt-2 space-y-1">
                {product.variants.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {v.size}
                      {v.color && ` / ${v.color}`}
                    </span>
                    <span className={v.stock > 0 ? "text-green-600" : "text-red-500"}>
                      {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.reviews.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reviews ({product.reviews.length})
                </h2>
                {session?.user?.id && (
                  <Link
                    href={`/products/${slug}/review`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Write a Review
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="rounded-lg border border-gray-100 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-400" : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {review.user.name ?? "Anonymous"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
