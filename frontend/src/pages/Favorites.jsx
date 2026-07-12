import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { favoriteApi } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'
import PropertyListItem from '../components/ui/PropertyListItem'
import Skeleton from '../components/ui/Skeleton'

export default function Favorites() {
  const { isAuthenticated } = useAuthStore()

  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: favoriteApi.getAll,
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <div className="pt-32 text-center pb-20">
        <p className="text-gray-500 mb-4">Please login to view your saved properties</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-500 text-sm">Properties you've saved for later</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        ) : !properties?.length ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Heart size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't saved any properties yet.</p>
            <Link to="/properties" className="btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((p) => <PropertyListItem key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
