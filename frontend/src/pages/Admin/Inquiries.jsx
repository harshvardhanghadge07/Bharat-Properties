import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, Phone, Trash2, CheckCheck, Eye, Search } from 'lucide-react'
import { inquiryApi } from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'

export default function AdminInquiries() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['inquiries', filter],
    queryFn: () => inquiryApi.getAll({ read: filter === 'unread' ? 'false' : filter === 'read' ? 'true' : undefined, limit: 50 }),
  })

  const markReadMut = useMutation({
    mutationFn: (id) => inquiryApi.markRead(id),
    onSuccess: () => qc.invalidateQueries(['inquiries']),
  })
  const deleteMut = useMutation({
    mutationFn: (id) => inquiryApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['inquiries']); setSelected(null) },
  })

  const inquiries = (data?.inquiries || []).filter((i) =>
    search ? i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 text-sm">Manage property inquiries from potential buyers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex" style={{ minHeight: 500 }}>
          {/* List pane */}
          <div className="w-full md:w-80 border-r border-gray-100 flex flex-col shrink-0">
            {/* Search + filter */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field text-sm pl-8" placeholder="Search by name or email..." />
              </div>
              <div className="flex gap-1">
                {['all','unread','read'].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium capitalize transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiry list */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 space-y-3">{Array(6).fill(0).map((_,i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Mail size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No inquiries found</p>
                </div>
              ) : inquiries.map((inq) => (
                <button key={inq.id} onClick={() => { setSelected(inq); if (!inq.read) markReadMut.mutate(inq.id) }}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.id === inq.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!inq.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{inq.name}</p>
                        {!inq.read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{inq.property?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(inq.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail pane */}
          <div className="flex-1 hidden md:flex flex-col">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="p-8 flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">{selected.name[0]}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-gray-500 text-sm">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markReadMut.mutate(selected.id)}
                      className="p-2 rounded-lg hover:bg-green-50 text-green-500 transition-colors" title="Mark read">
                      <CheckCheck size={16} />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this inquiry?')) deleteMut.mutate(selected.id) }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Property */}
                <div className="bg-primary-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Inquiry About</p>
                  <p className="font-semibold text-gray-900">{selected.property?.title}</p>
                  <p className="text-gray-500 text-sm">{selected.property?.city}</p>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">{selected.email}</p>
                    </div>
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone size={14} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-green-600">{selected.phone}</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">{selected.message}</p>
                </div>

                {/* Quick reply */}
                <div className="mt-6">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.property?.title}`}
                    className="btn-primary w-full justify-center">
                    <Mail size={16} /> Reply via Email
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
                <Eye size={40} className="opacity-30" />
                <p className="text-sm">Select an inquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
