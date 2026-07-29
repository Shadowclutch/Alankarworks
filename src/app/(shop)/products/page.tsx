import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ui/ProductCard"
import { cn } from "@/lib/utils"
import { MobileFilterDrawer, SortSelect } from "./MobileFilterDrawer"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    sizes?: string
    colors?: string
    discount?: string
    sort?: string
  }>
}

const discountLabels = [
  { value: 10, label: "10% and above" },
  { value: 20, label: "20% and above" },
  { value: 30, label: "30% and above" },
  { value: 40, label: "40% and above" },
  { value: 50, label: "50% and above" },
  { value: 60, label: "60% and above" },
]

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams
  const category = sp.category
  const minPrice = sp.minPrice
  const maxPrice = sp.maxPrice
  const sizesParam = sp.sizes ?? ""
  const colorsParam = sp.colors ?? ""
  const discountParam = sp.discount ?? ""
  const currentSort = sp.sort ?? "newest"

  const selectedSizes = sizesParam ? sizesParam.split(",").filter(Boolean) : []
  const selectedColors = colorsParam ? colorsParam.split(",").filter(Boolean) : []
  const selectedDiscounts = discountParam
    ? discountParam.split(",").map(Number).filter((n) => !isNaN(n))
    : []

  const where: Record<string, unknown> = { isActive: true }

  if (category) {
    where.category = { slug: category }
  }

  if (minPrice || maxPrice) {
    const bp: Record<string, number> = {}
    if (minPrice) bp.gte = parseFloat(minPrice)
    if (maxPrice) bp.lte = parseFloat(maxPrice)
    where.basePrice = bp
  }

  let orderBy: Record<string, string> = { createdAt: "desc" }
  if (currentSort === "price-asc") orderBy = { basePrice: "asc" }
  else if (currentSort === "price-desc") orderBy = { basePrice: "desc" }

  const [allProducts, categories, allVariants] = (await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        variants: true,
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.productVariant.findMany({
      where: {
        product: {
          isActive: true,
          ...(category ? { category: { slug: category } } : {}),
        },
      },
      select: { size: true, color: true, colorHex: true },
    }),
  ])) as any[]

  const sizeSet = new Set<string>()
  const colorMap = new Map<string, string>()
  for (const v of allVariants) {
    if (v.size) sizeSet.add(v.size)
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, v.colorHex ?? "")
    }
  }
  const allSizes = Array.from(sizeSet).sort((a, b) => {
    const ia = sizeOrder.indexOf(a)
    const ib = sizeOrder.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  const allColors = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))

  let products = [...allProducts]

  if (selectedSizes.length > 0) {
    products = products.filter((p: any) =>
      p.variants?.some((v: any) => selectedSizes.includes(v.size))
    )
  }

  if (selectedColors.length > 0) {
    products = products.filter((p: any) =>
      p.variants?.some((v: any) => selectedColors.includes(v.color))
    )
  }

  if (selectedDiscounts.length > 0) {
    products = products.filter((p: any) => {
      if (!p.salePrice) return false
      const discount = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100)
      return selectedDiscounts.some((d) => discount >= d)
    })
  }

  if (currentSort === "discount") {
    products.sort((a: any, b: any) => {
      const da = a.salePrice ? ((a.basePrice - a.salePrice) / a.basePrice) * 100 : 0
      const db = b.salePrice ? ((b.basePrice - b.salePrice) / b.basePrice) * 100 : 0
      return db - da
    })
  }

  const buildUrl = (changes: Record<string, string | null>): string => {
    const p = new URLSearchParams()
    if (category) p.set("category", category)
    if (sp.minPrice) p.set("minPrice", sp.minPrice)
    if (sp.maxPrice) p.set("maxPrice", sp.maxPrice)
    if (sp.sizes) p.set("sizes", sp.sizes)
    if (sp.colors) p.set("colors", sp.colors)
    if (sp.discount) p.set("discount", sp.discount)
    if (currentSort !== "newest") p.set("sort", currentSort)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) p.delete(key)
      else p.set(key, value)
    }
    const qs = p.toString()
    return qs ? `/products?${qs}` : "/products"
  }

  const toggleComma = (
    current: string | undefined,
    value: string
  ): string | null => {
    const list = current ? current.split(",").filter(Boolean) : []
    const idx = list.indexOf(value)
    if (idx >= 0) list.splice(idx, 1)
    else list.push(value)
    return list.length > 0 ? list.join(",") : null
  }

  const activeFilterCount =
    (category ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    selectedDiscounts.length

  const categoryName = category
    ? categories.find((c: any) => c.slug === category)?.name ?? "Products"
    : "All Products"

  const checkboxClass =
    "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 focus:ring-offset-0"

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Collection
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          {categoryName}
        </h1>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ─── Desktop Sidebar Filters ─── */}
        <aside className="hidden w-full shrink-0 lg:block lg:w-56">
          {activeFilterCount > 0 && (
            <Link
              href="/products"
              className="mb-6 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4"
            >
              Clear all filters
            </Link>
          )}

          <div className="mb-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
              Categories
            </h3>
            <nav className="space-y-1">
              <Link
                href={buildUrl({ category: null })}
                className={cn(
                  "block border-l-2 px-4 py-2 text-sm transition-colors",
                  !category
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
                )}
              >
                All Products
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug })}
                  className={cn(
                    "block border-l-2 px-4 py-2 text-sm transition-colors",
                    category === cat.slug
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
              Price Range
            </h3>
            <form method="GET" action="/products">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              {sp.sizes && (
                <input type="hidden" name="sizes" value={sp.sizes} />
              )}
              {sp.colors && (
                <input type="hidden" name="colors" value={sp.colors} />
              )}
              {sp.discount && (
                <input type="hidden" name="discount" value={sp.discount} />
              )}
              {currentSort !== "newest" && (
                <input type="hidden" name="sort" value={currentSort} />
              )}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/40">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={minPrice ?? ""}
                    placeholder="Min"
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
                    name="maxPrice"
                    defaultValue={maxPrice ?? ""}
                    placeholder="Max"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-7 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-3 w-full border border-charcoal/20 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-all hover:border-primary hover:bg-primary hover:text-cream"
              >
                Go
              </button>
            </form>
          </div>

          {allSizes.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
                Size
              </h3>
              <div className="space-y-2">
                {allSizes.map((size) => (
                  <Link
                    key={size}
                    href={buildUrl({ sizes: toggleComma(sp.sizes, size) })}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      readOnly
                      className={checkboxClass}
                    />
                    <span className="text-sm text-charcoal/70">{size}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {allColors.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
                Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {allColors.map((c) => (
                  <Link
                    key={c.name}
                    href={buildUrl({ colors: toggleComma(sp.colors, c.name) })}
                    className="flex flex-col items-center gap-1"
                    title={c.name}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-all",
                        selectedColors.includes(c.name)
                          ? "border-primary scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: c.hex || "#ccc" }}
                    />
                    <span className="text-[10px] text-charcoal/60">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/50">
              Discount
            </h3>
            <div className="space-y-2">
              {discountLabels.map(({ value, label }) => (
                <Link
                  key={value}
                  href={buildUrl({
                    discount: toggleComma(sp.discount, String(value)),
                  })}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedDiscounts.includes(value)}
                    readOnly
                    className={checkboxClass}
                  />
                  <span className="text-sm text-charcoal/70">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Product Grid ─── */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <MobileFilterDrawer
              categories={categories}
              allSizes={allSizes}
              allColors={allColors}
              selectedCategory={category}
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              selectedDiscounts={selectedDiscounts}
              minPrice={minPrice}
              maxPrice={maxPrice}
              currentSort={currentSort}
              activeFilterCount={activeFilterCount}
            />
            <div className="w-44">
              <SortSelect currentSort={currentSort} />
            </div>
          </div>

          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-charcoal/50">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            <div className="w-44">
              <SortSelect currentSort={currentSort} />
            </div>
          </div>

          <p className="mb-4 text-sm text-charcoal/50 lg:hidden">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>

          {products.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-charcoal/50">No products found.</p>
              {activeFilterCount > 0 && (
                <Link
                  href="/products"
                  className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
