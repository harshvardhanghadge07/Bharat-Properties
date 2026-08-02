import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { propertyApi } from '../../services/api'
import PropertyCard3D from '../3d/PropertyCard3D'
import Skeleton from '../ui/Skeleton'

export default function FeaturedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: propertyApi.getFeatured,
  })

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">Handpicked for you</p>
            <h2 className="section-heading">Featured Properties</h2>
            <p className="text-gray-500 mt-2 text-sm">Curated selection of premium listings across India</p>
          </div>
          <Link to="/properties?featured=true" className="btn-outline hidden md:inline-flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            : data?.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <PropertyCard3D property={p} />
              </motion.div>
            ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link to="/properties?featured=true" className="btn-outline">View All Properties <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}
