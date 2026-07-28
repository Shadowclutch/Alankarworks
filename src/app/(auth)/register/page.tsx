"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const name = form.get("name") as string
    const email = form.get("email") as string
    const phone = form.get("phone") as string
    const password = form.get("password") as string
    const confirm = form.get("confirmPassword") as string

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/login?registered=true")
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-primary">
            AlankarWorks
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-charcoal">Create Account</h1>
          <p className="mt-1 text-sm text-charcoal/50">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">Full Name</label>
            <input name="name" required placeholder="Enter your name" className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">Email</label>
            <input name="email" type="email" required placeholder="Enter your email" className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">Phone</label>
            <input name="phone" type="tel" placeholder="Enter your phone number" className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">Password</label>
            <input name="password" type="password" required placeholder="Create a password (min 6 chars)" className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">Confirm Password</label>
            <input name="confirmPassword" type="password" required placeholder="Confirm your password" className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary" />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-charcoal/50">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
