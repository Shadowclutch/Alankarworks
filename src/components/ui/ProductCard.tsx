import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="relative overflow-hidden">
        <div className="aspect-[3/4] bg-gray-100">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
        {product.salePrice && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            Sale
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              console.log("Add to cart", product.id)
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
