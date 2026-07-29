"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const discountLabels = [
  { value: 10, label: "10% and above" },
  { value: 20, label: "20% and above" },
  { value: 30, label: "30% and above" },
  { value: 40, label: "40% and above" },
  { value: 50, label: "50% and above" },
  { value: 60, label: "60% and above" },
]

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search)
    if (e.target.value === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", e.target.value)
    }
    const qs = params.toString()
    router.push(qs ? `/products?${qs}` : "/products")
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="discount">Discount</option>
    </select>
  )
}

interface MobileFilterDrawerProps {
  categories: { id: string; name: string; slug: string }[]
  allSizes: string[]
  allColors: { name: string; hex: string }[]
  selectedCategory?: string
  selectedSizes: string[]
  selectedColors: string[]
  selectedDiscounts: number[]
  minPrice?: string
  maxPrice?: string
  currentSort: string
  activeFilterCount: number
}

export function MobileFilterDrawer({
  categories,
  allSizes,
  allColors,
  selectedCategory: initialCategory,
  selectedSizes: initialSizes,
  selectedColors: initialColors,
  selectedDiscounts: initialDiscounts,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  currentSort,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const [localMinPrice, setLocalMinPrice] = useState(initialMinPrice ?? "")
  const [localMaxPrice, setLocalMaxPrice] = useState(initialMaxPrice ?? "")
  const [localSizes, setLocalSizes] = useState<string[]>(initialSizes)
  const [localColors, setLocalColors] = useState<string[]>(initialColors)
  const [localDiscounts, setLocalDiscounts] = useState<number[]>(initialDiscounts)
  const [localCategory, setLocalCategory] = useState(initialCategory ?? "")

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (localCategory) params.set("category", localCategory)
    if (localMinPrice) params.set("minPrice", localMinPrice)
    if (localMaxPrice) params.set("maxPrice", localMaxPrice)
    if (localSizes.length > 0) params.set("sizes", localSizes.join(","))
    if (localColors.length > 0) params.set("colors", localColors.join(","))
    if (localDiscounts.length > 0)
      params.set("discount", localDiscounts.join(","))
    if (currentSort !== "newest") params.set("sort", currentSort)
    const qs = params.toString()
    router.push(qs ? `/products?${qs}` : "/products")
    setOpen(false)
  }

  const clearAll = () => {
    router.push("/products")
    setOpen(false)
  }

  const toggleSize = (size: string) => {
    setLocalSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    )
  }

  const toggleColor = (color: string) => {
    setLocalColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    )
  }

  const toggleDiscount = (value: number) => {
    setLocalDiscounts((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value]
    )
  }

  const sectionTitle =
    "text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50"
  const checkboxClass =
    "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 focus:ring-offset-0"

  const filterText =
    activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-charcoal/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:border-charcoal/40"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        {filterText}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-charcoal">
            Filters
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-charcoal/40 transition-colors hover:bg-warm-gray hover:text-charcoal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            <div>
              <h3 className={sectionTitle}>Categories</h3>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => setLocalCategory("")}
                  className={cn(
                    "block w-full border-l-2 px-4 py-2 text-left text-sm transition-colors",
                    !localCategory
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
                  )}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setLocalCategory((prev) =>
                        prev === cat.slug ? "" : cat.slug
                      )
                    }
                    className={cn(
                      "block w-full border-l-2 px-4 py-2 text-left text-sm transition-colors",
                      localCategory === cat.slug
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={sectionTitle}>Price Range</h3>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/40">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-7 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <span className="text-charcoal/30">—</span>
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/40">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-7 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {allSizes.length > 0 && (
              <div>
                <h3 className={sectionTitle}>Size</h3>
                <div className="mt-3 space-y-2">
                  {allSizes.map((size) => (
                    <label
                      key={size}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={localSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className={checkboxClass}
                      />
                      <span className="text-sm text-charcoal/70">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {allColors.length > 0 && (
              <div>
                <h3 className={sectionTitle}>Color</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {allColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggleColor(c.name)}
                      className="flex flex-col items-center gap-1"
                      title={c.name}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition-all",
                          localColors.includes(c.name)
                            ? "border-primary scale-110"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: c.hex || "#ccc" }}
                      />
                      <span className="text-[10px] text-charcoal/60">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className={sectionTitle}>Discount</h3>
              <div className="mt-3 space-y-2">
                {discountLabels.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={localDiscounts.includes(value)}
                      onChange={() => toggleDiscount(value)}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-charcoal/70">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal/10 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="flex-1 border border-charcoal/20 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:border-charcoal/40"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 bg-primary py-3 text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-all hover:bg-primary-dark"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
