"use client"

import { Button } from "@/components/ui/Button"

export function NewsletterForm() {
  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="h-12 flex-1 rounded-lg px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <Button
        type="submit"
        className="h-12 bg-white text-primary hover:bg-gray-100 hover:text-primary-dark px-6 font-semibold"
      >
        Subscribe
      </Button>
    </form>
  )
}
