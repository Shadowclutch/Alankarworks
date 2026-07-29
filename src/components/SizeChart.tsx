"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"

interface SizeRow {
  size: string
  chest: string
  waist: string
  length: string
}

const sizeData: Record<string, SizeRow[]> = {
  Men: [
    { size: "S", chest: "34–36", waist: "28–30", length: "27–28" },
    { size: "M", chest: "38–40", waist: "32–34", length: "28–29" },
    { size: "L", chest: "42–44", waist: "36–38", length: "29–30" },
    { size: "XL", chest: "46–48", waist: "40–42", length: "30–31" },
    { size: "XXL", chest: "50–52", waist: "44–46", length: "31–32" },
  ],
  Women: [
    { size: "XS", chest: "30–32", waist: "24–26", length: "26–27" },
    { size: "S", chest: "34–36", waist: "28–30", length: "27–28" },
    { size: "M", chest: "38–40", waist: "32–34", length: "28–29" },
    { size: "L", chest: "42–44", waist: "36–38", length: "29–30" },
    { size: "XL", chest: "46–48", waist: "40–42", length: "30–31" },
  ],
  Kids: [
    { size: "2–3Y", chest: "20–22", waist: "19–20", length: "15–17" },
    { size: "4–5Y", chest: "22–24", waist: "20–21", length: "17–19" },
    { size: "6–7Y", chest: "24–26", waist: "21–22", length: "19–21" },
    { size: "8–9Y", chest: "26–28", waist: "22–23", length: "21–23" },
    { size: "10–11Y", chest: "28–30", waist: "23–24", length: "23–25" },
    { size: "12–13Y", chest: "30–32", waist: "25–26", length: "25–27" },
  ],
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-gold-light/40 px-6 py-5">
          <h2 className="font-serif text-xl font-bold text-charcoal">Size Guide</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-warm-gray hover:text-charcoal"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

interface SizeChartProps {
  category: string
}

export function SizeChart({ category }: SizeChartProps) {
  const [open, setOpen] = useState(false)
  const rows = sizeData[category] ?? sizeData.Men

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4 transition-colors hover:text-primary-dark"
      >
        Size Guide
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gold-light/40">
              <th className="pb-3 pr-4 font-semibold text-charcoal">Size</th>
              <th className="pb-3 pr-4 font-semibold text-charcoal">Chest (inches)</th>
              <th className="pb-3 pr-4 font-semibold text-charcoal">Waist (inches)</th>
              <th className="pb-3 font-semibold text-charcoal">Length (inches)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-gold-light/20 last:border-0">
                <td className="py-3 pr-4 font-medium text-charcoal">{row.size}</td>
                <td className="py-3 pr-4 text-charcoal/70">{row.chest}</td>
                <td className="py-3 pr-4 text-charcoal/70">{row.waist}</td>
                <td className="py-3 text-charcoal/70">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-5 text-xs text-charcoal/50 leading-relaxed">
          Measurements are approximate and may vary by style. For the best fit, please
          refer to the individual product measurements or contact our support team.
        </p>
      </Modal>
    </>
  )
}
