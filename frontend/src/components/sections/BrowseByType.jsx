import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, Home, MapPin, Briefcase, Crown, Trees, Users, Factory, Store, Warehouse, Hotel, Building } from 'lucide-react'

const TYPES = [
  { label: 'Apartment',        type: 'APARTMENT',       icon: Building2, color: 'bg-blue-50 text-blue-600',    border: 'hover:border-blue-300' },
  { label: 'Villa',            type: 'VILLA',            icon: Home,      color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300' },
  { label: 'Plot',             type: 'PLOT',             icon: MapPin,    color: 'bg-green-50 text-green-600',   border: 'hover:border-green-300' },
  { label: 'Commercial',       type: 'COMMERCIAL',       icon: Briefcase, color: 'bg-yellow-50 text-yellow-600', border: 'hover:border-yellow-300' },
  { label: 'Penthouse',        type: 'PENTHOUSE',        icon: Crown,     color: 'bg-pink-50 text-pink-600',     border: 'hover:border-pink-300' },
  { label: 'Farmhouse',        type: 'FARMHOUSE',        icon: Trees,     color: 'bg-teal-50 text-teal-600',     border: 'hover:border-teal-300' },
  { label: 'PG / Hostel',      type: 'PG_HOSTEL',        icon: Users,     color: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-300' },
  { label: 'Row House',        type: 'ROW_HOUSE',        icon: Building,  color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-300' },
  { label: 'Industrial Land',  type: 'INDUSTRIAL_LAND',  icon: Factory,   color: 'bg-gray-50 text-gray-600',     border: 'hover:border-gray-300' },
  { label: 'Shop / Showroom',  type: 'SHOP_SHOWROOM',    icon: Store,     color: 'bg-red-50 text-red-600',       border: 'hover:border-red-300' },
  { label: 'Warehouse',        type: 'WAREHOUSE',        icon: Warehouse, color: 'bg-stone-50 text-stone-600',   border: 'hover:border-stone-300' },
  { label: 'Hotel / Resort',   type: 'HOTEL_RESORT',     icon: Hotel,     color: 'bg-rose-50 text-rose-600',     border: 'hover:border-rose-300' },
  { label: 'Bungalow',         type: 'BUNGALOW',         icon: Home,      color: 'bg-lime-50 text-lime-600',     border: 'hover:border-lime-300' },
]

export default function BrowseByType() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">
            What are you looking for?
          </p>
          <h2 className="section-heading">Browse by Property Type</h2>
          <p className="text-gray-500 mt-2 text-sm">Find exactly what you need from our wide range of property categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {TYPES.map((t, i) => {
            const Icon = t.icon
            return (
              <motion.div
                key={t.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/properties?type=${t.type}`}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent ${t.border} transition-all duration-200 group bg-gray-50 hover:bg-white hover:shadow-md`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                    {t.label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
