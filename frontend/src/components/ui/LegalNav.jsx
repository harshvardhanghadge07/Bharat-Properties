import { Link, useLocation } from 'react-router-dom'
import { FileText, Shield, RotateCcw } from 'lucide-react'

export default function LegalNav() {
  const location = useLocation()
  const path = location.pathname

  const links = [
    { label: 'Terms of Service', href: '/terms', icon: FileText },
    { label: 'Privacy Policy', href: '/privacy', icon: Shield },
    { label: 'Refund Policy', href: '/refund', icon: RotateCcw },
  ]

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs mb-8">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center sm:justify-start gap-2 overflow-x-auto py-2.5 scrollbar-none">
        {links.map((item) => {
          const Icon = item.icon
          const isActive = path === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
