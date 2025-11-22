import Link from 'next/link'
import Image from 'next/image'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-marble">
      {/* Admin Navigation */}
      <nav className="bg-primary-navy text-white shadow-neo-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="2Dto3D"
                width={40}
                height={40}
                className="drop-shadow-md"
              />
              <span className="text-xl font-serif font-bold">
                2Dto3D Admin
              </span>
            </Link>

            {/* Menu */}
            <div className="flex gap-6">
              <NavLink href="/admin/prompts">프롬프트 관리</NavLink>
              <NavLink href="/admin/results">실행 결과</NavLink>
              <NavLink href="/admin/analytics">분석</NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-neo hover:bg-primary-gold/20 transition-colors"
    >
      {children}
    </Link>
  )
}
