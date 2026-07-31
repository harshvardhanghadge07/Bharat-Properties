import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  Mail,
  BarChart3,
  CreditCard,
} from 'lucide-react'
import { propertyApi, inquiryApi } from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'
import AdminNav from '../../components/ui/AdminNav'

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: propertyApi.getStats,
  })
  const { data: inquiries } = useQuery({
    queryKey: ['inquiries-recent'],
    queryFn: () => inquiryApi.getAll({ limit: 5 }),
  })
  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: propertyApi.getFeatured,
  })

  const cards = [
    {
      icon: Building2,
      label: 'Total Properties',
      value: stats?.total || 0,
      color: 'bg-blue-500',
      link: '/admin/listings',
    },
    {
      icon: Eye,
      label: 'Active Listings',
      value: stats?.active || 0,
      color: 'bg-green-500',
      link: '/admin/listings',
    },
    {
      icon: TrendingUp,
      label: 'Sold',
      value: stats?.sold || 0,
      color: 'bg-primary-500',
      link: '/admin/listings?status=SOLD',
    },
    {
      icon: MessageSquare,
      label: 'Inquiries',
      value: inquiries?.total || 0,
      color: 'bg-purple-500',
      link: '/admin/inquiries',
    },
  ]

  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Live overview of property listings, leads & system performance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/admin/subscriptions"
              className="btn-outline text-xs sm:text-sm py-2 px-3.5 rounded-xl inline-flex items-center gap-1.5"
            >
              <CreditCard size={15} /> Subscriptions
            </Link>
            <Link
              to="/admin/analytics"
              className="btn-outline text-xs sm:text-sm py-2 px-3.5 rounded-xl inline-flex items-center gap-1.5"
            >
              <BarChart3 size={15} /> Analytics
            </Link>
            <Link
              to="/post-property"
              className="btn-primary text-xs sm:text-sm py-2 px-3.5 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus size={15} /> Add Property
            </Link>
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
          {cards.map(({ icon: Icon, label, value, color, link }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={link}
                className="bg-white rounded-2xl p-4 sm:p-5 block border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 ${color} rounded-xl flex items-center justify-center mb-3 text-white shadow-sm`}
                >
                  <Icon size={18} className="sm:hidden" />
                  <Icon size={20} className="hidden sm:block" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-7 w-16 mb-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                )}
                <p className="text-gray-500 text-xs mt-0.5 truncate">{label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Inquiries & Featured Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Recent Inquiries</h2>
              <Link to="/admin/inquiries" className="text-xs text-primary-600 font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {inquiries?.inquiries?.map((inq) => (
                <div key={inq.id} className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={14} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">{inq.name}</p>
                    <p className="text-gray-500 text-xs truncate">{inq.property?.title || 'General Inquiry'}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {!inq.read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Featured properties */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Featured Listings</h2>
              <Link to="/admin/listings" className="text-xs text-primary-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {featured?.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                    alt={p.title}
                    className="w-12 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{p.title}</p>
                    <p className="text-primary-600 text-xs font-bold mt-0.5">
                      {p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(2)} Cr` : `₹${(p.price / 100000).toFixed(0)} Lakhs`}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
