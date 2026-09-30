import { useState } from 'react'
import { formatPrice, formatArea, TYPE_LABELS } from '../../utils/helpers'
import { BedDouble, Bath, Maximize2, MapPin, Heart, ArrowUpRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import PropertyImage from '../ui/PropertyImage'

export default function PropertyCard3D({ property }) {
  const navigate = useNavigate()
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuthStore()
  const [favoriteError, setFavoriteError] = useState('')
  const [saving, setSaving] = useState(false)
  const liked = isFavorite(property.id)
  const img = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format'

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setSaving(true)
    setFavoriteError('')
    try { await toggleFavorite(property.id) } catch { setFavoriteError('Could not update your favorites. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <article className="estate-property-card">
      <div className="estate-property-image">
        <Link to={`/properties/${property.id}`} aria-label={`View ${property.title}`}><PropertyImage src={img} alt={property.title} /></Link>
        <div className="estate-property-badges"><span>{TYPE_LABELS[property.type] || property.type}</span>{property.featured && <span className="estate-featured-badge">Featured</span>}</div>
        <button onClick={handleLike} disabled={saving} className="estate-favorite" aria-label={`${liked ? 'Remove from' : 'Add to'} favorites: ${property.title}`} aria-pressed={liked}><Heart size={17} className={liked ? 'fill-primary-500 text-primary-500' : ''} /></button>
      </div>
      <div className="estate-property-content">
        <div className="estate-property-location"><MapPin size={12} /><span>{property.location || property.city}</span><span className="estate-property-status">{property.status === 'ACTIVE' ? 'For sale' : property.status === 'SOLD' ? 'Sold' : 'Archived'}</span></div>
        <Link to={`/properties/${property.id}`} className="estate-property-title"><h3>{property.title}</h3><ArrowUpRight size={19} /></Link>
        <p className="estate-property-price">{formatPrice(property.price)}</p>
        <div className="estate-property-specs">
          {property.bedrooms > 0 && <span><BedDouble size={14} />{property.bedrooms} Beds</span>}
          {property.bathrooms > 0 && <span><Bath size={14} />{property.bathrooms} Baths</span>}
          <span><Maximize2 size={13} />{formatArea(property.areaSqft)}</span>
        </div>
        {favoriteError && <p role="alert" className="mt-3 text-xs text-red-700">{favoriteError}</p>}
      </div>
    </article>
  )
}
