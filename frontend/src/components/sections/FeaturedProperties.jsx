import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2 } from 'lucide-react'
import { propertyApi } from '../../services/api'
import PropertyCard3D from '../3d/PropertyCard3D'
import Skeleton from '../ui/Skeleton'

export default function FeaturedProperties() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['featured'], queryFn: propertyApi.getFeatured })
  const properties = Array.isArray(data) ? data : []

  return (
    <section id="collection" className="estate-collection estate-container" aria-labelledby="collection-heading">
      <div className="estate-section-heading">
        <div><p className="estate-eyebrow">The curated collection</p><h2 id="collection-heading">Exceptional places to live.</h2></div>
        <Link to="/properties?featured=true" className="estate-text-link">View all properties <ArrowUpRight size={16} /></Link>
      </div>
      {isLoading ? <div className="estate-property-grid" aria-label="Loading properties" aria-busy="true">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
        : isError ? <div className="estate-empty" role="status"><Building2 size={28} strokeWidth={1.2} /><h3>Our collection will be back shortly.</h3><p>We couldn’t load the listings. Please try again in a moment.</p><button className="estate-text-link" onClick={() => refetch()}>Try again <ArrowUpRight size={15} /></button></div>
          : properties.length ? <div className="estate-property-grid">{properties.slice(0, 6).map((property) => <PropertyCard3D key={property.id} property={property} />)}</div>
            : <div className="estate-empty"><Building2 size={28} strokeWidth={1.2} /><h3>Your next chapter is out there.</h3><p>Explore all listings to find a place that feels right for you.</p><Link to="/properties" className="estate-text-link">Browse properties <ArrowUpRight size={15} /></Link></div>}
    </section>
  )
}
