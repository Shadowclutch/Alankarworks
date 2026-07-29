"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
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
              <>
                <div className="px-4 py-2 text-sm font-medium text-charcoal">{session.user.name ?? session.user.email}</div>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Profile
                </Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  My Orders
                </Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Wishlist
                </Link>
                {(session.user as any).role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-warm-gray hover:text-primary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-3 border-gold-light/40" />
                <button onClick={() => { setMobileOpen(false); signOut() }} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-warm-gray">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </>
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
