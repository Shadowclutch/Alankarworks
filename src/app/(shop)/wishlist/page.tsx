import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ui/ProductCard"

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          My Account
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          Wishlist
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warm-gray">
            <svg className="h-7 w-7 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-charcoal/50">
            Save your favorite pieces and find them here.
          </p>
          <Link href="/products">
            <button className="mt-8 border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-cream">
              Discover Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}
