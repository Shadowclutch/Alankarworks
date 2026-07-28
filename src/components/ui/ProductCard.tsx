"use client"

import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface ProductImage {
  url: string
  alt?: string | null
}

interface ProductCategory {
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  images?: ProductImage[]
  category?: ProductCategory
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.images?.[0]?.url ?? "/api/placeholder/300/400"
  const imageAlt =
    product.images?.[0]?.alt ?? product.name

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm bg-white transition-all duration-500 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="relative overflow-hidden">
        <div className="aspect-[3/4] bg-warm-gray">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
        </div>
        {product.salePrice && (
          <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            Sale
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-charcoal transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-base font-semibold text-primary">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-charcoal">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>

        <button className="mt-2 w-full border border-charcoal/20 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:border-primary hover:bg-primary hover:text-cream">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
