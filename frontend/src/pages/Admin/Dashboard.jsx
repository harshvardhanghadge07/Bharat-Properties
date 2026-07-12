import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, Users, MessageSquare, TrendingUp, Plus, Eye, Mail, BarChart3, CreditCard } from 'lucide-react'
import { propertyApi, inquiryApi } from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['stats'], queryFn: propertyApi.getStats })
  const { data: inquiries } = useQuery({ queryKey: ['inquiries-recent'], queryFn: () => inquiryApi.getAll({ limit: 5 }) })
  const { data: featured }  = useQuery({ queryKey: ['featured'], queryFn: propertyApi.getFeatured })

  const cards = [
    { icon: Building2,    label: 'Total Properties', value: stats?.total    || 0, color: 'bg-blue-500',    link: '/admin/listings' },
    { icon: Eye,          label: 'Active Listings',  value: stats?.active   || 0, color: 'bg-green-500',   link: '/admin/listings' },
    { icon: TrendingUp,   label: 'Sold',             value: stats?.sold     || 0, color: 'bg-primary-500', link: '/admin/listings?status=SOLD' },
    { icon: MessageSquare,label: 'Inquiries',        value: inquiries?.total|| 0, color: 'bg-purple-500',  link: '/admin/inquiries' },
  ]

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage your properties and inquiries</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/subscriptions" className="btn-outline">
              <CreditCard size={16} /> Subscriptions
            </Link>
            <Link to="/admin/analytics" className="btn-outline">
              <BarChart3 size={16} /> Analytics
            </Link>
            <Link to="/admin/listings?new=1" className="btn-primary">
              <Plus size={16} /> Add Property
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cards.map(({ icon: Icon, label, value, color, link }, i) => (
            <motion.div key={label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.1 }}>
              <Link to={link} className="bg-white rounded-2xl p-5 block hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                {statsLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
                <p className="text-gray-500 text-xs">{label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Inquiries</h2>
              <Link to="/admin/inquiries" className="text-xs text-primary-500 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {inquiries?.inquiries?.map((inq) => (
                <div key={inq.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{inq.name}</p>
                    <p className="text-gray-500 text-xs truncate">{inq.property?.title}</p>
                    <p className="text-gray-400 text-xs">{new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {!inq.read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Featured properties */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Featured Listings</h2>
              <Link to="/admin/listings" className="text-xs text-primary-500 hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
              {featured?.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images?.[0]} alt={p.title} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-primary-500 text-xs font-semibold">
                      {p.price >= 10000000 ? `₹${(p.price/10000000).toFixed(1)}Cr` : `₹${(p.price/100000).toFixed(0)}L`}
                    </p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
