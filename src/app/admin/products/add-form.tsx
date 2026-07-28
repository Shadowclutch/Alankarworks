"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function AddProductForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
    categoryId: "",
  })
  const [images, setImages] = useState<{ url: string; alt: string; order: number }[]>([])
  const [variants, setVariants] = useState<
    { size: string; color: string; colorHex: string; stock: number; price: string }[]
  >([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          basePrice: parseFloat(form.basePrice),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          categoryId: form.categoryId,
          images,
          variants: variants.map((v) => ({
            ...v,
            price: v.price ? parseFloat(v.price) : null,
          })),
        }),
      })
      if (!res.ok) throw new Error("Failed to create")
      router.refresh()
      setOpen(false)
      setForm({ name: "", description: "", basePrice: "", salePrice: "", categoryId: "" })
      setImages([])
      setVariants([])
    } catch {
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  function addImage() {
    setImages([...images, { url: "", alt: "", order: images.length }])
  }

  function updateImage(index: number, field: string, value: string) {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: field === "order" ? parseInt(value) || 0 : value }
    setImages(updated)
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index))
  }

  function addVariant() {
    setVariants([
      ...variants,
      { size: "", color: "", colorHex: "", stock: 0, price: "" },
    ])
  }

  function updateVariant(index: number, field: string, value: string | number) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Add Product
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category ID</label>
              <input
                type="text"
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Base Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sale Price</label>
              <input
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Images</label>
              <button
                type="button"
                onClick={addImage}
                className="text-xs font-medium text-primary hover:text-primary-dark"
              >
                + Add Image
              </button>
            </div>
            {images.map((img, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="URL"
                  value={img.url}
                  onChange={(e) => updateImage(i, "url", e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Alt"
                  value={img.alt}
                  onChange={(e) => updateImage(i, "alt", e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={img.order}
                  onChange={(e) => updateImage(i, "order", e.target.value)}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Variants</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-medium text-primary hover:text-primary-dark"
              >
                + Add Variant
              </button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Size"
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Hex"
                  value={v.colorHex}
                  onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
