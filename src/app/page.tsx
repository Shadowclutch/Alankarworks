import Link from "next/link"
import { ProductCard } from "@/components/ui/ProductCard"

const placeholderProducts = [
  { id: "1", name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", basePrice: 1299, salePrice: 999, images: [{ url: "https://picsum.photos/seed/shirt1/600/800" }], category: { name: "Men" } },
  { id: "2", name: "Slim Fit Jeans", slug: "slim-fit-jeans", basePrice: 2499, salePrice: 1999, images: [{ url: "https://picsum.photos/seed/jeans2/600/800" }], category: { name: "Men" } },
  { id: "3", name: "Floral Maxi Dress", slug: "floral-maxi-dress", basePrice: 3499, salePrice: null, images: [{ url: "https://picsum.photos/seed/dress2/600/800" }], category: { name: "Women" } },
  { id: "4", name: "Casual Blazer", slug: "casual-blazer", basePrice: 4999, salePrice: 3999, images: [{ url: "https://picsum.photos/seed/blazer2/600/800" }], category: { name: "Women" } },
  { id: "5", name: "Kids Graphic Tee", slug: "kids-graphic-tee", basePrice: 799, salePrice: 599, images: [{ url: "https://picsum.photos/seed/kidtee1/600/800" }], category: { name: "Kids" } },
  { id: "6", name: "Denim Jacket", slug: "denim-jacket", basePrice: 3999, salePrice: null, images: [{ url: "https://picsum.photos/seed/jacket1/600/800" }], category: { name: "Men" } },
  { id: "7", name: "Summer Shorts", slug: "summer-shorts", basePrice: 999, salePrice: 749, images: [{ url: "https://picsum.photos/seed/shorts1/600/800" }], category: { name: "Kids" } },
  { id: "8", name: "Evening Gown", slug: "evening-gown", basePrice: 7999, salePrice: 5999, images: [{ url: "https://picsum.photos/seed/gown1/600/800" }], category: { name: "Women" } },
]

const categories = [
  { name: "Men", slug: "men", image: "https://picsum.photos/seed/men1/600/700", description: "Modern essentials" },
  { name: "Women", slug: "women", image: "https://picsum.photos/seed/women1/600/700", description: "Elegant designs" },
  { name: "Kids", slug: "kids", image: "https://picsum.photos/seed/kids1/600/700", description: "Playful styles" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-cream">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-warm-gray to-gold-light/30" />
        <div className="absolute right-0 top-0 h-[90vh] w-1/2 bg-gradient-to-bl from-primary/5 to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="mb-6 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            New Collection 2026
          </span>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
            Where Tradition
            <br />
            <span className="text-primary">Meets Modern</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-charcoal/60 sm:text-lg">
            Thoughtfully crafted clothing that celebrates your unique style. From timeless classics to contemporary silhouettes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex h-13 items-center justify-center bg-primary px-10 text-sm font-semibold uppercase tracking-[0.15em] text-cream transition-all hover:bg-primary-dark"
            >
              Explore Collection
            </Link>
            <Link
              href="/products?category=women"
              className="inline-flex h-13 items-center justify-center border border-charcoal/20 px-10 text-sm font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:border-primary hover:text-primary"
            >
              View Lookbook
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Categories</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Shop by Category
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden bg-warm-gray"
              >
                <div className="aspect-[4/5]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-serif text-2xl font-bold text-cream">{cat.name}</h3>
                  <p className="mt-1 text-sm text-cream/70">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-gray py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Featured</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
                Trending Now
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 transition-colors hover:text-primary sm:inline-block"
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {placeholderProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 transition-colors hover:text-primary"
            >
              View All →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-charcoal px-8 py-16 sm:px-16 sm:py-24">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10" />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Newsletter</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-cream sm:text-4xl">
                Join the Club
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">
                Be the first to know about new arrivals, exclusive drops, and special offers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 border border-cream/20 bg-transparent px-5 py-3 text-sm text-cream placeholder-cream/40 outline-none focus:border-gold"
                />
                <button className="bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:bg-gold/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gold-light/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-gray">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-charcoal">Free Shipping</h4>
              <p className="mt-1 text-xs text-charcoal/50">On orders above ₹999</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-gray">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-charcoal">Easy Returns</h4>
              <p className="mt-1 text-xs text-charcoal/50">30-day return policy</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-gray">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-charcoal">Secure Checkout</h4>
              <p className="mt-1 text-xs text-charcoal/50">100% secure payment</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-gray">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-charcoal">24/7 Support</h4>
              <p className="mt-1 text-xs text-charcoal/50">Dedicated customer care</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
