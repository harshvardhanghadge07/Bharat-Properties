import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink, Eye, MessageCircle } from 'lucide-react'
import { propertyApi, subscriptionApi } from '../services/api'
import { formatPrice } from '../utils/helpers'
import Skeleton from '../components/ui/Skeleton'

export default function MyListings() {
  const qc = useQueryClient()
  const { data: properties, isLoading } = useQuery({ queryKey: ['my-properties'], queryFn: propertyApi.getMine })
  const { data: sub } = useQuery({ queryKey: ['my-subscription'], queryFn: subscriptionApi.getMine })

  const deleteMut = useMutation({
    mutationFn: (id) => propertyApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['my-properties']); qc.invalidateQueries(['my-subscription']) },
  })

  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Listings</h1>
            {sub && (
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {sub.listingsUsed} / {sub.listingLimit === 999999 ? '∞' : sub.listingLimit} listings used on <b>{sub.plan}</b> plan
              </p>
            )}
          </div>
          <Link to="/post-property" className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-md shadow-orange-500/20">
            <Plus size={16} /> Post New Property
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_,i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : !properties?.length ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-400 text-sm mb-4">You haven't listed any properties yet.</p>
            <Link to="/post-property" className="btn-primary text-sm py-2.5 px-5">List Your First Property</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xs border border-gray-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-20 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-gray-500 text-xs">{p.city}, {p.state}</p>
                    <p className="text-primary-600 font-bold text-xs sm:text-sm mt-0.5">{formatPrice(p.price)}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1">
                      <span className="flex items-center gap-1"><Eye size={12} /> {p.views || 0} views</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {p.inquiryCount || 0} inquiries</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto">
                  <span className={`tag text-xs font-semibold ${p.status==='ACTIVE'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link to={`/properties/${p.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="View">
                      <ExternalLink size={16} />
                    </Link>
                    <Link to={`/edit-property/${p.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => { if(confirm('Delete this listing?')) deleteMut.mutate(p.id) }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
