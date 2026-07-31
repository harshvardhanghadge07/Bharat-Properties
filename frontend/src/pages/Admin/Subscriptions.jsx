import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, X, RotateCcw, Search, Check } from 'lucide-react'
import { subscriptionApi, adminApi } from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'
import AdminNav from '../../components/ui/AdminNav'

const PLAN_BADGE = {
  FREE:      'bg-gray-100 text-gray-600',
  STANDARD:  'bg-blue-100 text-blue-700',
  UNLIMITED: 'bg-primary-100 text-primary-700',
}

const PAID_PLANS = [
  { id: 'STANDARD',  name: 'Premium',      price: 1499 },
  { id: 'UNLIMITED', name: 'Unlimited Pro', price: 4999 },
]

export default function AdminSubscriptions() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)

  const { data: subs, isLoading } = useQuery({ queryKey: ['all-subscriptions'], queryFn: subscriptionApi.getAll })

  const revertMut = useMutation({
    mutationFn: (userId) => subscriptionApi.revertToFree(userId),
    onSuccess: () => qc.invalidateQueries(['all-subscriptions']),
  })

  const lastSource = (sub) => sub.history?.[sub.history.length - 1]?.source

  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Manage seller plans — including granting access manually</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-md shadow-orange-500/20">
            <Plus size={16} /> Grant Plan Manually
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Plan', 'Status', 'Expiry', 'Source', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-8" /></td></tr>
                  ))
                ) : !subs?.length ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No subscriptions yet</td></tr>
                ) : subs.map((sub) => (
                  <tr key={sub._id || sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{sub.user?.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{sub.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`tag ${PLAN_BADGE[sub.plan] || PLAN_BADGE.FREE}`}>{sub.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`tag ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{sub.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {lastSource(sub) === 'MANUAL' ? (
                        <span className="tag bg-amber-100 text-amber-700">Manual</span>
                      ) : sub.plan !== 'FREE' ? (
                        <span className="tag bg-indigo-100 text-indigo-700">Razorpay</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {sub.plan !== 'FREE' && (
                        <button
                          onClick={() => { if (confirm(`Revert ${sub.user?.email} to the Free plan?`)) revertMut.mutate(sub.user?._id || sub.user?.id) }}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <RotateCcw size={13} /> Revert to Free
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GrantPlanModal open={modal} onClose={() => setModal(false)} onGranted={() => qc.invalidateQueries(['all-subscriptions'])} />
    </div>
  )
}

function GrantPlanModal({ open, onClose, onGranted }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [planId, setPlanId] = useState('STANDARD')
  const [note, setNote] = useState('')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const grantMut = useMutation({
    mutationFn: (d) => subscriptionApi.manualActivate(d),
    onSuccess: () => { onGranted(); reset(); onClose() },
  })

  const reset = () => { setQuery(''); setResults([]); setSelectedUser(null); setPlanId('STANDARD'); setNote('') }

  useEffect(() => {
    if (!open) return
    if (!query.trim() || selectedUser) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const users = await adminApi.searchUsers(query.trim())
        setResults(users)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, selectedUser, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedUser) return
    grantMut.mutate({ email: selectedUser.email, planId, note })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-primary-500" /> Grant Plan Manually
              </h2>
              <button onClick={() => { reset(); onClose() }} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 -mt-2">
                For payments collected outside Razorpay (e.g. UPI/bank transfer) while your gateway isn't active yet.
              </p>

              {/* User search */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Seller's email</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedUser(null); setQuery('') }} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, email, or phone…"
                      className="input-field text-sm pl-9"
                      autoFocus
                    />
                    {(results.length > 0 || searching) && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searching ? (
                          <p className="px-3 py-2 text-xs text-gray-400">Searching…</p>
                        ) : (
                          results.map((u) => (
                            <button
                              type="button"
                              key={u._id || u.id}
                              onClick={() => { setSelectedUser(u); setResults([]) }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span>
                                <span className="block text-sm text-gray-900">{u.name}</span>
                                <span className="block text-xs text-gray-500">{u.email}</span>
                              </span>
                              <Check size={14} className="text-transparent" />
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Plan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAID_PLANS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPlanId(p.id)}
                      className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                        planId === p.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-medium text-gray-900">{p.name}</span>
                      <span className="block text-gray-500 text-xs">₹{p.price.toLocaleString('en-IN')}/mo</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Paid via UPI, ref #1234"
                  className="input-field text-sm resize-none"
                />
              </div>

              {grantMut.isError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {grantMut.error?.error || 'Failed to grant plan'}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { reset(); onClose() }} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={!selectedUser || grantMut.isPending} className="btn-primary flex-1 justify-center">
                  {grantMut.isPending ? 'Granting…' : 'Grant Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
