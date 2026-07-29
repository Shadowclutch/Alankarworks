import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Account</span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal">My Profile</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2 space-y-6">
          <div className="border border-gold-light/40 bg-cream p-6">
            <h2 className="text-sm font-semibold text-charcoal">Personal Information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Name</dt>
                <dd className="font-medium text-charcoal">{user.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Email</dt>
                <dd className="font-medium text-charcoal">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Phone</dt>
                <dd className="font-medium text-charcoal">{user.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Member since</dt>
                <dd className="font-medium text-charcoal">{new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/orders" className="flex items-center justify-between border border-gold-light/40 bg-cream p-5 transition-colors hover:border-primary">
            <div>
              <p className="text-xs text-charcoal/50">Orders</p>
              <p className="text-xl font-bold text-charcoal">{user._count.orders}</p>
            </div>
            <svg className="h-5 w-5 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </Link>
          <Link href="/wishlist" className="flex items-center justify-between border border-gold-light/40 bg-cream p-5 transition-colors hover:border-primary">
            <div>
              <p className="text-xs text-charcoal/50">Reviews</p>
              <p className="text-xl font-bold text-charcoal">{user._count.reviews}</p>
            </div>
            <svg className="h-5 w-5 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
