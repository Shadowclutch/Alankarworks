"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

interface SearchSuggestion {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  images: { url: string }[]
  category: { name: string } | null
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([])
      setIsOpen(false)
      return
    }
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
        setIsOpen(true)
      }
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setIsOpen(false)
      inputRef.current?.blur()
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  function handleSelect() {
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
    setFocused(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
          focused
            ? "border-primary bg-white"
            : "border-charcoal/10 bg-warm-gray hover:border-charcoal/20"
        }`}
      >
        <svg
          className={`h-4 w-4 shrink-0 ${focused ? "text-primary" : "text-charcoal/40"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (suggestions.length > 0) setIsOpen(true) }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-36 bg-transparent text-sm text-charcoal placeholder-charcoal/40 outline-none lg:w-44"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gold-light/40 bg-white shadow-xl"
        >
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={handleSelect}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-warm-gray"
              >
                <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-warm-gray">
                  <img
                    src={product.images[0]?.url ?? "/api/placeholder/40/48"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-charcoal">
                    {product.name}
                  </p>
                  {product.category && (
                    <p className="text-[10px] uppercase tracking-wider text-gold">
                      {product.category.name}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {product.salePrice ? (
                    <>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(product.salePrice)}
                      </p>
                      <p className="text-[11px] text-charcoal/40 line-through">
                        {formatPrice(product.basePrice)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-charcoal">
                      {formatPrice(product.basePrice)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={handleSelect}
            className="block border-t border-gold-light/40 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-warm-gray"
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  )
}
