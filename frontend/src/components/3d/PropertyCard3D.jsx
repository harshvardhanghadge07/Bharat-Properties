import { motion } from 'framer-motion'
import { formatPrice, formatArea, TYPE_COLORS, STATUS_COLORS, TYPE_LABELS } from '../../utils/helpers'
import { BedDouble, Bath, Maximize2, MapPin, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export default function PropertyCard3D({ property }) {
  const navigate = useNavigate()
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuthStore()
  const liked = isFavorite(property.id)
  const img = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600'

  const handleLike = (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    toggleFavorite(property.id).catch(() => {})
  }

  return (
    <motion.div
      whileHover={{ y: -8, rotateY: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="card group cursor-pointer"
    >
      <Link to={`/properties/${property.id}`}>
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={img}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`badge ${TYPE_COLORS[property.type] || 'bg-gray-100 text-gray-600'}`}>
              {TYPE_LABELS[property.type] || property.type}
            </span>
            {property.featured && (
              <span className="badge bg-primary-500 text-white">Featured</span>
            )}
          </div>
          {/* Status */}
          <span className={`badge absolute top-3 right-3 ${STATUS_COLORS[property.status]}`}>
            {property.status}
          </span>
          {/* Like button */}
          <button
            onClick={handleLike}
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
          >
            <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <p className="text-xl font-bold text-primary-500 mb-1">{formatPrice(property.price)}</p>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <MapPin size={12} />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-xs text-gray-600 border-t pt-3">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble size={13} className="text-gray-400" />
                {property.bedrooms} BHK
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath size={13} className="text-gray-400" />
                {property.bathrooms} Bath
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Maximize2 size={13} className="text-gray-400" />
              {formatArea(property.areaSqft)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
