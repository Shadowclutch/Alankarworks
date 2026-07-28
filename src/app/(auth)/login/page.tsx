"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-primary">
            AlankarWorks
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-charcoal">Welcome back</h1>
          <p className="mt-1 text-sm text-charcoal/50">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-primary"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-charcoal/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
