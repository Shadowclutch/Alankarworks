export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex-1 bg-gray-50">{children}</div>
}
