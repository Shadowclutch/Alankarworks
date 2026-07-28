"use client"

import { useState } from "react"
import Link from "next/link"
import type { Session } from "next-auth"

interface HeaderClientProps {
  session: Session | null
}

export function HeaderClient({ session }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center text-gray-700 hover:text-primary transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-gray-100 bg-white shadow-lg lg:hidden">
          <div className="space-y-1 px-4 py-4">
            <div className="pb-3">
              <input
                type="search"
                placeholder="Search products..."
                className="h-9 w-full rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Link
              href="/products?category=men"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Men
            </Link>
            <Link
              href="/products?category=women"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Women
            </Link>
            <Link
              href="/products?category=kids"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Kids
            </Link>
            <hr className="my-2 border-gray-100" />
            {session?.user ? (
              <div className="px-3 py-2 text-sm text-gray-500">{session.user.name ?? session.user.email}</div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
