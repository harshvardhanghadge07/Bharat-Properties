import { Link, useNavigate } from 'react-router-dom'
import { BedDouble, Bath, Maximize2, MapPin, Heart } from 'lucide-react'
import { formatPrice, formatArea, TYPE_COLORS, TYPE_LABELS } from '../../utils/helpers'
import { useAuthStore } from '../../store/useAuthStore'
import VerifiedBadge from './VerifiedBadge'
import ProSellerBadge from './ProSellerBadge'

export default function PropertyListItem({ property }) {
  const navigate = useNavigate()
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuthStore()
  const liked = isFavorite(property.id)
  const img = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'

  const handleLike = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    toggleFavorite(property.id).catch(() => {})
  }

  return (
    <div className="card flex flex-col sm:flex-row group">
      <Link to={`/properties/${property.id}`} className="relative sm:w-64 h-48 sm:h-auto shrink-0">
        <img src={img} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className={`badge absolute top-3 left-3 ${TYPE_COLORS[property.type]}`}>{TYPE_LABELS[property.type] || property.type}</span>
        {property.featured && <span className="badge absolute top-3 right-3 bg-primary-500 text-white">Featured</span>}
      </Link>
      <div className="flex-1 p-5 flex flex-col justify-between">
      <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-primary-500">{formatPrice(property.price)}</p>
            {(property.owner?.emailVerified || property.owner?.phoneVerified) && <VerifiedBadge />}
            {property.owner?.plan === 'UNLIMITED' && <ProSellerBadge />}
          </div>
          <Link to={`/properties/${property.id}`}>
          
            <h3 className="font-semibold text-gray-900 text-base mb-1 hover:text-primary-500 transition-colors line-clamp-1">{property.title}</h3>
          </Link>
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <MapPin size={12} /><span>{property.location}</span>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2">{property.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-4 text-xs text-gray-500">
            {property.bedrooms && <span className="flex items-center gap-1"><BedDouble size={13} />{property.bedrooms} BHK</span>}
            {property.bathrooms && <span className="flex items-center gap-1"><Bath size={13} />{property.bathrooms} Bath</span>}
            <span className="flex items-center gap-1"><Maximize2 size={13} />{formatArea(property.areaSqft)}</span>
          </div>
          <button onClick={handleLike} className="p-2 rounded-full hover:bg-red-50 transition-colors">
            <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>
    </div>
  )
}
