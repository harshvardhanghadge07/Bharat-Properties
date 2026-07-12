import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { propertyApi } from '../../services/api'
import { TYPE_LABELS } from '../../utils/helpers'
import PropertyCard3D from '../3d/PropertyCard3D'
import Skeleton from '../ui/Skeleton'

export default function SimilarProperties({ property }) {
  const { data, isLoading } = useQuery({
    queryKey: ['similar-properties', property.id],
    queryFn: async () => {
      // First try a tight match: same city + type, within ±30% of this listing's price
      const tight = await propertyApi.getAll({
        city: property.city,
        type: property.type,
        minPrice: Math.round(property.price * 0.7),
        maxPrice: Math.round(property.price * 1.3),
        limit: 8,
      })
      let results = (tight.properties || []).filter((p) => p.id !== property.id)

      // Not enough tight matches — broaden to same city + type, any price
      if (results.length < 3) {
        const broader = await propertyApi.getAll({ city: property.city, type: property.type, limit: 8 })
        const seen = new Set(results.map((p) => p.id))
        for (const p of broader.properties || []) {
          if (p.id !== property.id && !seen.has(p.id)) {
            results.push(p)
            seen.add(p.id)
          }
        }
      }

      return results.slice(0, 4)
    },
    enabled: !!property?.id,
  })

  const similar = data || []

  // Nothing similar to show — skip the section entirely rather than showing it empty
  if (!isLoading && similar.length === 0) return null

  return (
    <div className="mt-10">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Similar Properties</h2>
        <p className="text-gray-500 text-sm mt-1">
          More {(TYPE_LABELS[property.type] || 'properties').toLowerCase()} in {property.city} around this price range
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
          : similar.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <PropertyCard3D property={p} />
            </motion.div>
          ))}
      </div>
    </div>
  )
}
