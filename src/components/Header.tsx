import Link from "next/link"
import { auth } from "@/lib/auth"
import { HeaderClient } from "./HeaderClient"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="hidden bg-gray-900 text-gray-300 lg:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <span>Welcome to Alankar Works</span>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <span className="text-white">{session.user.name ?? session.user.email}</span>
            ) : (
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            )}
            <Link href="/register" className="hover:text-white transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">
            AlankarWorks
          </span>
        </Link>

        <div className="hidden flex-1 px-8 lg:block">
          <div className="relative mx-auto max-w-md">
            <input
              type="search"
              placeholder="Search products..."
              className="h-9 w-full rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center text-gray-700 hover:text-primary transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              0
            </span>
          </Link>

          <HeaderClient session={session} />
        </div>
      </div>

      <nav className="hidden border-t border-gray-100 bg-white lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            href="/products?category=men"
            className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Men
          </Link>
          <Link
            href="/products?category=women"
            className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Women
          </Link>
          <Link
            href="/products?category=kids"
            className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Kids
          </Link>
        </div>
      </nav>
    </header>
  )
}
