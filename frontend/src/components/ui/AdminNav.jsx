import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  BarChart3,
  CreditCard,
  Plus,
} from 'lucide-react'

export default function AdminNav() {
  const location = useLocation()
  const path = location.pathname

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Listings', href: '/admin/listings', icon: Building2 },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  ]

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs mb-6">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto py-2.5 scrollbar-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {links.map((item) => {
            const Icon = item.icon
            const isActive =
              path === item.href ||
              (item.href !== '/admin' && path.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm shadow-orange-500/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <Link
          to="/post-property"
          className="hidden sm:inline-flex items-center gap-1.5 btn-primary py-2 px-3.5 text-xs font-semibold rounded-xl shrink-0"
        >
          <Plus size={14} /> Post Property
        </Link>
      </div>
    </div>
  )
}
