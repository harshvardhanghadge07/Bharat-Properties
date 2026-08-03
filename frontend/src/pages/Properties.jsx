import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid3x3, List, X, ChevronDown, Map } from 'lucide-react'
import { propertyApi } from '../services/api'
import PropertyCard3D from '../components/3d/PropertyCard3D'
import PropertyListItem from '../components/ui/PropertyListItem'
import Skeleton from '../components/ui/Skeleton'
import { PROPERTY_TYPES, TYPE_LABELS } from '../utils/helpers'
import { ALL_STATES, getCitiesByState, ALL_CITIES } from '../utils/indiaData'
import CityAutocomplete from '../components/ui/CityAutocomplete'
import MapSearch from '../components/ui/MapSearch'
import AdBanner from '../components/ui/AdBanner'
import useSEO from '../hooks/useSEO'

const PRICE_RANGES = [
  { label: 'Under ₹50L',    min: 0,         max: 5000000 },
  { label: '₹50L – ₹1Cr',  min: 5000000,   max: 10000000 },
  { label: '₹1Cr – ₹2Cr',  min: 10000000,  max: 20000000 },
  { label: '₹2Cr – ₹5Cr',  min: 20000000,  max: 50000000 },
  { label: 'Above ₹5Cr',   min: 50000000,  max: 999999999 },
]

export default function Properties() {
  const [params, setParams]     = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useSEO({
    title: 'Browse Properties in India | Bharat Properties',
    description: 'Search verified apartments, villas, plots and commercial properties for sale and rent across major Indian cities. Filter by city, price, and property type.',
    url: `${window.location.origin}/properties`,
  })

  const filters = {
    search:   params.get('search') || '',
    city:     params.get('city')   || '',
    state:    params.get('state')  || '',
    type:     params.get('type')   || '',
    status:   params.get('status') || 'ACTIVE',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    bedrooms: params.get('bedrooms') || '',
    featured: params.get('featured') || '',
    page:     parseInt(params.get('page') || '1'),
    sort:     params.get('sort') || 'createdAt',
  }

  const { data, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyApi.getAll(filters),
    keepPreviousData: true,
  })

  const setFilter = (key, val) => setFilters({ [key]: val })

  // Apply multiple filter changes at once, based on a single up-to-date snapshot of params.
  // Needed because calling setFilter() twice in a row (e.g. state + city reset) would otherwise
  // have the second call overwrite the first, since React batches the state updates.
  const setFilters = (updates) => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([key, val]) => {
      if (val) next.set(key, val)
      else next.delete(key)
    })
    next.set('page', '1')
    setParams(next)
  }

  const clearAll = () => setParams(new URLSearchParams())

  const activeCount = [filters.city, filters.type, filters.minPrice, filters.bedrooms].filter(Boolean).length

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-primary-500 transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>
              )}
            </button>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-500 hover:text-primary-500 flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {!isLoading && <span>{data?.pagination?.total || 0} properties</span>}
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}>
                <Grid3x3 size={15} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}>
                <List size={15} />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}>
                <Map size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-100 p-5 w-[280px] space-y-6 sticky top-32">
                {/* State */}
                <FilterGroup title="State">
                  <select value={filters.state} onChange={(e) => setFilters({ state: e.target.value, city: '' })}
                    className="input-field text-sm">
                    <option value="">All States</option>
                    {ALL_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </FilterGroup>

                {/* City */}
                <FilterGroup title="City">
                  <div className="border border-gray-200 rounded-lg">
                    <CityAutocomplete
                      value={filters.city}
                      onChange={(c) => setFilter('city', c)}
                      cities={filters.state ? getCitiesByState(filters.state) : ALL_CITIES}
                      placeholder="All Cities"
                      showState={!filters.state}
                    />
                  </div>
                </FilterGroup>

                {/* Type */}
                <FilterGroup title="Property Type">
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((t) => (
                      <button key={t}
                        onClick={() => setFilter('type', filters.type === t ? '' : t)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          filters.type === t ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}>
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Price */}
                <FilterGroup title="Budget">
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((r) => (
                      <button key={r.label}
                        onClick={() => setFilters({ minPrice: r.min, maxPrice: r.max })}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                          filters.minPrice == r.min ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-50 text-gray-600'
                        }`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Bedrooms */}
                <FilterGroup title="Bedrooms">
                  <div className="flex gap-2 flex-wrap">
                    {['1','2','3','4','5'].map((b) => (
                      <button key={b}
                        onClick={() => setFilter('bedrooms', filters.bedrooms === b ? '' : b)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                          filters.bedrooms === b ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}>
                        {b}+
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Status */}
                <FilterGroup title="Listing Status">
                  <div className="space-y-1.5">
                    {['ACTIVE','SOLD','RENTED'].map((s) => (
                      <button key={s}
                        onClick={() => setFilter('status', s)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                          filters.status === s ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-50 text-gray-600'
                        }`}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </FilterGroup>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : !data?.properties?.length ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-lg font-medium">No properties found</p>
              <p className="text-sm">Try adjusting your filters</p>
              <button onClick={clearAll} className="mt-4 btn-primary">Clear Filters</button>
            </div>
          ) : viewMode === 'map' ? (
            <MapSearch properties={data.properties} />
          ) : (
            <>
              {/* Top Banner Ad */}
              <div className="mb-6">
                <AdBanner dataAdSlot="3333333333" className="h-24 md:h-32" />
              </div>

              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {data.properties.map((p, i) => (
                  <React.Fragment key={p._id || p.id}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.05 }}>
                      {viewMode === 'grid' ? <PropertyCard3D property={p} /> : <PropertyListItem property={p} />}
                    </motion.div>
                    
                    {/* Insert Ad every 6 properties */}
                    {(i + 1) % 6 === 0 && i !== data.properties.length - 1 && (
                      <div className={`col-span-1 ${viewMode === 'grid' ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                        <AdBanner dataAdSlot={`inline-ad-${i}`} className="h-40 my-4" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pg) => (
                    <button key={pg}
                      onClick={() => setFilter('page', pg)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        filters.page === pg ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}>
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  )
}
