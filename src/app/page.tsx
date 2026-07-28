import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ProductCard } from "@/components/ui/ProductCard"

const placeholderProducts = [
  { id: "1", name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", basePrice: 1299, salePrice: 999, images: [{ url: "https://picsum.photos/seed/shirt1/300/400" }], category: { name: "Men" } },
  { id: "2", name: "Slim Fit Jeans", slug: "slim-fit-jeans", basePrice: 2499, salePrice: 1999, images: [{ url: "https://picsum.photos/seed/jeans2/300/400" }], category: { name: "Men" } },
  { id: "3", name: "Floral Maxi Dress", slug: "floral-maxi-dress", basePrice: 3499, salePrice: null, images: [{ url: "https://picsum.photos/seed/dress2/300/400" }], category: { name: "Women" } },
  { id: "4", name: "Casual Blazer", slug: "casual-blazer", basePrice: 4999, salePrice: 3999, images: [{ url: "https://picsum.photos/seed/blazer2/300/400" }], category: { name: "Women" } },
  { id: "5", name: "Kids Graphic Tee", slug: "kids-graphic-tee", basePrice: 799, salePrice: 599, images: [{ url: "https://picsum.photos/seed/kidtee1/300/400" }], category: { name: "Kids" } },
  { id: "6", name: "Denim Jacket", slug: "denim-jacket", basePrice: 3999, salePrice: null, images: [{ url: "https://picsum.photos/seed/jacket1/300/400" }], category: { name: "Men" } },
  { id: "7", name: "Summer Shorts", slug: "summer-shorts", basePrice: 999, salePrice: 749, images: [{ url: "https://picsum.photos/seed/shorts1/300/400" }], category: { name: "Kids" } },
  { id: "8", name: "Evening Gown", slug: "evening-gown", basePrice: 7999, salePrice: 5999, images: [{ url: "https://picsum.photos/seed/gown1/300/400" }], category: { name: "Women" } },
]

const categories = [
  { name: "Men", slug: "men", image: "https://picsum.photos/seed/men1/400/500", description: "Explore the latest in men's fashion" },
  { name: "Women", slug: "women", image: "https://picsum.photos/seed/women1/400/500", description: "Discover trendy women's wear" },
  { name: "Kids", slug: "kids", image: "https://picsum.photos/seed/kids1/400/500", description: "Cute and comfortable kids clothing" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Elevate Your
            <span className="block text-yellow-300">Fashion Game</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-200 sm:text-xl">
            Discover premium clothing that defines your style. From casual wear to
            elegant outfits, we have everything you need.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 hover:text-primary-dark px-8 text-base font-semibold">
                Shop Now
              </Button>
            </Link>
            <Link href="/products?category=women">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary px-8 text-base font-semibold"
              >
                View Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-gray-500">
              Find the perfect outfit for every occasion
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-100"
              >
                <div className="aspect-[4/5]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                  <p className="mt-1 text-sm text-gray-200">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-3 text-gray-500">
              Handpicked just for you
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {placeholderProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-12 sm:px-12 sm:py-16">
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Stay in the Loop
              </h2>
              <p className="mt-3 text-gray-200">
                Subscribe to our newsletter and get exclusive deals, new arrivals,
                and style tips straight to your inbox.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 flex-1 rounded-lg px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button
                  type="submit"
                  className="h-12 bg-white text-primary hover:bg-gray-100 hover:text-primary-dark px-6 font-semibold"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
