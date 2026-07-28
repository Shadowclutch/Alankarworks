import Link from "next/link"
import { auth } from "@/lib/auth"
import { HeaderClient } from "./HeaderClient"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-gold-light/40 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wide text-primary">
              AlankarWorks
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/products?category=men" className="text-sm font-medium uppercase tracking-wider text-charcoal/70 transition-colors hover:text-primary">
              Men
            </Link>
            <Link href="/products?category=women" className="text-sm font-medium uppercase tracking-wider text-charcoal/70 transition-colors hover:text-primary">
              Women
            </Link>
            <Link href="/products?category=kids" className="text-sm font-medium uppercase tracking-wider text-charcoal/70 transition-colors hover:text-primary">
              Kids
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/cart"
              className="relative flex items-center text-charcoal/60 transition-colors hover:text-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            {session?.user ? (
              <span className="hidden text-xs font-medium text-charcoal/60 md:block">{session.user.name ?? session.user.email}</span>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full border border-primary px-5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white md:inline-block"
              >
                Sign In
              </Link>
            )}

            <HeaderClient session={session} />
          </div>
        </div>
      </div>
    </header>
  )
}
