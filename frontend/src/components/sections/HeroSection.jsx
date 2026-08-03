import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { Search, MapPin } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { ALL_CITIES } from '../../utils/indiaData'
import CityAutocomplete from '../ui/CityAutocomplete'

const FloatingCity = lazy(() => import('../3d/FloatingCity'))

const TABS = ['Buy', 'Rent', 'PG / Hostel', 'Commercial', 'Plot', 'Industrial']

export default function HeroSection() {
  const [tab, setTab]         = useState('Buy')
  const [query, setQuery]     = useState('')
  const [city, setCity]       = useState('')
  const [suggestions, setSug] = useState([])
  const headRef               = useRef()
  const navigate              = useNavigate()

  useEffect(() => {
    gsap.fromTo(headRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 }
    )
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (city)  params.set('city', city)
    if (tab === 'Rent') params.set('status', 'RENTED')
    const TAB_TYPE_MAP = {
      'PG / Hostel': 'PG_HOSTEL',
      'Commercial':  'COMMERCIAL',
      'Plot':        'PLOT',
      'Industrial':  'INDUSTRIAL_LAND',
    }
    if (TAB_TYPE_MAP[tab]) params.set('type', TAB_TYPE_MAP[tab])
    navigate(`/properties?${params.toString()}`)
  }

  const onQueryChange = (v) => {
    setQuery(v)
    setSug(v.length > 1 ? ALL_CITIES.filter((c) => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 8) : [])
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d14]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 hero-canvas">
        <Suspense fallback={null}>
          <FloatingCity />
        </Suspense>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(13,13,20,0.65) 0%, rgba(13,13,20,0.85) 60%, rgba(13,13,20,1) 100%)' }}
      />

      {/* Animated grid lines */}
      <div className="absolute inset-0 z-10 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(201,169,110,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/40 text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          India's #1 Real Estate Portal
        </motion.div>

        <h1 ref={headRef} className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white leading-tight mb-4">
          Find Your Dream
          <span className="block text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #d5bd89, #C9A96E)' }}>
            Property in India
          </span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="text-gray-400 text-lg mb-10">
          Over <span className="text-white font-semibold">50,000+</span> verified listings across Mumbai, Delhi, Bengaluru & more
        </motion.p>

        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Search inputs */}
          <div className="flex flex-col sm:flex-row">
            {/* City */}
            <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
              <CityAutocomplete
                value={city}
                onChange={setCity}
                placeholder="All Cities"
              />
            </div>

            {/* Keyword */}
            <div className="relative flex-[2]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by locality, project, keyword..."
                className="w-full pl-10 pr-4 py-4 text-sm text-gray-700 focus:outline-none"
              />
              {/* Autocomplete */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-lg z-30">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => { setQuery(s); setSug([]) }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                      <MapPin size={13} className="text-gray-400" /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search button */}
            <div className="p-2">
              <button onClick={handleSearch}
                className="w-full sm:w-auto h-full bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg flex items-center gap-2 justify-center">
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="flex flex-wrap justify-center gap-6 mt-10">
          {[['50,000+', 'Properties'], ['200+', 'Cities'], ['10,000+', 'Happy Clients'], ['₹500Cr+', 'Transactions']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-gray-500 text-xs">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-5 h-9 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-primary-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
