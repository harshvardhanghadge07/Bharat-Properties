import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, Users, MessageSquare, MailWarning, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { analyticsApi } from '../../services/api'
import { TYPE_LABELS } from '../../utils/helpers'
import Skeleton from '../../components/ui/Skeleton'

const COLORS = ['#E8532A', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.getOverview,
  })

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const t = data?.totals || {}

  const cards = [
    { icon: Building2,    label: 'Total Properties', value: t.properties || 0, color: 'bg-blue-500' },
    { icon: TrendingUp,   label: 'Active Listings',  value: t.active || 0,     color: 'bg-green-500' },
    { icon: Users,        label: 'Registered Users', value: t.users || 0,      color: 'bg-purple-500' },
    { icon: MessageSquare,label: 'Total Inquiries',  value: t.inquiries || 0,  color: 'bg-primary-500' },
  ]

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of properties, users, and inquiries</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('en-IN')}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Unread inquiries banner */}
        {t.unreadInquiries > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex items-center gap-2 text-sm text-amber-700">
            <MailWarning size={16} /> You have <b>{t.unreadInquiries}</b> unread {t.unreadInquiries === 1 ? 'inquiry' : 'inquiries'}.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Listings by city */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Top Cities by Listings</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.byCity || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" fill="#E8532A" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Listings by property type */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Listings by Property Type</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={(data?.byType || []).map((d) => ({ ...d, type: TYPE_LABELS[d.type] || d.type }))}
                  dataKey="count"
                  nameKey="type"
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {(data?.byType || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Listings over time */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">New Listings (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.listingsPerMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#E8532A" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription plan breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Users by Subscription Plan</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.byPlan || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="plan" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {(data?.byPlan || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Most Recent Inquiries</h2>
          {data?.recentInquiries?.length ? (
            <div className="space-y-3">
              {data.recentInquiries.map((inq) => (
                <div key={inq._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{inq.name}</p>
                    <p className="text-gray-500 text-xs">{inq.property?.title} · {inq.property?.city}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No inquiries yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
