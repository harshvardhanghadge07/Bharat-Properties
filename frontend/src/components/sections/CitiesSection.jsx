import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const CITIES = [
  {
    name: 'Mumbai',
    img: 'https://images.unsplash.com/photo-1679249010086-b8a932c8cafc?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1662509418097-956310de88f0?w=600&auto=format',
    count: '12,400+',
  },
  {
    name: 'Delhi',
    img: 'https://images.unsplash.com/photo-1523962543648-07f19c5590ee?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format',
    count: '9,800+',
  },
  {
    name: 'Bengaluru',
    img: 'https://images.unsplash.com/photo-1687158266872-fd2773fa76c6?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=600&auto=format',
    count: '8,200+',
  },
  {
    name: 'Hyderabad',
    img: 'https://images.unsplash.com/photo-1741545979534-02f59c742730?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1670765321291-86f365e02462?w=600&auto=format',
    count: '6,100+',
  },
  {
    name: 'Chennai',
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format',
    count: '5,400+',
  },
  {
    name: 'Pune',
    img: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&auto=format',
    fallback: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format',
    count: '4,700+',
  },
]

function CityCard({ city, index }) {
  const [src, setSrc] = useState(city.img)
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    if (!failed) {
      setSrc(city.fallback)
      setFailed(true)
    }
  }

  return (
    <motion.div
      key={city.name}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/properties?city=${city.name}`}
        className="group relative h-44 rounded-2xl overflow-hidden block"
      >
        {/* Fallback gradient background in case both images fail */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-500 to-gray-800"
          style={{ zIndex: 0 }}
        />

        <img
          src={src}
          alt={city.name}
          onError={handleError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative"
          style={{ zIndex: 1 }}
          loading="lazy"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" style={{ zIndex: 2 }} />

        {/* Text */}
        <div className="absolute bottom-4 left-4" style={{ zIndex: 3 }}>
          <h3 className="text-white font-bold text-lg drop-shadow">{city.name}</h3>
          <p className="text-gray-300 text-xs">{city.count} Properties</p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function CitiesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">
            Explore by Location
          </p>
          <h2 className="section-heading">Properties by City</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CITIES.map((city, i) => (
            <CityCard key={city.name} city={city} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
