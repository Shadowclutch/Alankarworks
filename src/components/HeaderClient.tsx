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
        className="flex items-center text-charcoal/60 transition-colors hover:text-primary md:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-gold-light/40 bg-cream shadow-lg md:hidden">
          <div className="space-y-1 px-4 py-6">
            <Link
              href="/products?category=men"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Men
            </Link>
            <Link
              href="/products?category=women"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Women
            </Link>
            <Link
              href="/products?category=kids"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Kids
            </Link>
            <hr className="my-3 border-gold-light/40" />
            {session?.user ? (
              <div className="px-4 py-2 text-sm text-charcoal/60">{session.user.name ?? session.user.email}</div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary"
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
