import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, BedDouble, Bath, Maximize2, Phone, Mail, Share2, Heart, ChevronLeft, ChevronRight, CheckCircle2, MessageCircle } from 'lucide-react'
import { propertyApi, inquiryApi } from '../services/api'
import { formatPrice, formatArea, TYPE_COLORS, STATUS_COLORS, TYPE_LABELS } from '../utils/helpers'
import Skeleton from '../components/ui/Skeleton'
import EMICalculator from '../components/ui/EMICalculator'
import SimilarProperties from '../components/ui/SimilarProperties'
import useSEO from '../hooks/useSEO'
import { useAuthStore } from '../store/useAuthStore'
import VerifiedBadge from '../components/ui/VerifiedBadge'
import ProSellerBadge from '../components/ui/ProSellerBadge'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuthStore()
  const [imgIdx, setImgIdx]     = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', phone: '', message: 'I am interested in this property. Please contact me.' })

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getOne(id),
  })

  useSEO({
    title: property ? `${property.title} — ${formatPrice(property.price)} | Bharat Properties` : undefined,
    description: property
      ? `${property.bedrooms ? property.bedrooms + ' BHK ' : ''}${(TYPE_LABELS[property.type] || 'Property')} in ${property.location}, ${property.city}. ${formatArea(property.areaSqft)} — ${formatPrice(property.price)}.`
      : undefined,
    image: property?.images?.[0],
    url: property ? `${window.location.origin}/properties/${property.id}` : undefined,
  })

  const inquiryMutation = useMutation({
    mutationFn: (data) => inquiryApi.create(data),
    onSuccess: () => setSubmitted(true),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    inquiryMutation.mutate({ ...form, propertyId: id })
  }

  if (isLoading) return (
    <div className="pt-16 max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )

  if (!property) return <div className="pt-24 text-center text-gray-500">Property not found</div>

  const liked = isFavorite(property.id)
  const handleLike = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    toggleFavorite(property.id).catch(() => {})
  }

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']

  // WhatsApp inquiry — prefilled with property details, opens a chat with the agent number
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919359854302'
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in "${property.title}" (${property.location}, ${property.city}) listed at ${formatPrice(property.price)}. Is it still available?`
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  // Google Maps embed — uses exact lat/lng if the listing has them, otherwise falls back to the address text
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const mapQuery = property.lat && property.lng
    ? `${property.lat},${property.lng}`
    : encodeURIComponent(`${property.location}, ${property.city}, ${property.state}`)
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${mapQuery}`
  const mapDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary-500">Home</Link> /
          <Link to="/properties" className="hover:text-primary-500">Properties</Link> /
          <span className="text-gray-800 font-medium truncate">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-80 md:h-[450px] bg-gray-100">
                <img src={images[imgIdx]} alt={property.title} className="w-full h-full object-cover" />
                {/* Controls */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`badge ${TYPE_COLORS[property.type]}`}>{TYPE_LABELS[property.type] || property.type}</span>
                  {property.featured && <span className="badge bg-primary-500 text-white">Featured</span>}
                  <span className={`badge ${STATUS_COLORS[property.status]}`}>{property.status}</span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={handleLike} className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow">
                    <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
                  </button>
                  <button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
                    className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow">
                    <Share2 size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary-500' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-3xl font-bold text-primary-500">{formatPrice(property.price)}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    ₹{Math.round(property.price / property.areaSqft).toLocaleString('en-IN')} /sq.ft
                  </p>
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-5">
                <MapPin size={14} className="text-primary-500" />{property.location}, {property.city}, {property.state}
              </div>

              {/* Specs row */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100 mb-5">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <BedDouble size={20} className="text-primary-500" />
                    <div><div className="font-semibold text-gray-900">{property.bedrooms}</div><div className="text-xs text-gray-400">Bedrooms</div></div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath size={20} className="text-primary-500" />
                    <div><div className="font-semibold text-gray-900">{property.bathrooms}</div><div className="text-xs text-gray-400">Bathrooms</div></div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Maximize2 size={20} className="text-primary-500" />
                  <div><div className="font-semibold text-gray-900">{formatArea(property.areaSqft)}</div><div className="text-xs text-gray-400">Area</div></div>
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
            </div>

            {/* EMI Calculator */}
            <EMICalculator price={property.price} />

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-primary-500 shrink-0" />{a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location — Google Map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Location</h2>
                <a
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1"
                >
                  Get Directions <MapPin size={12} />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-100 h-72">
                {mapsApiKey ? (
                  <iframe
                    title="Property location map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={mapEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-sm gap-2">
                    <MapPin size={20} />
                    Map unavailable — VITE_GOOGLE_MAPS_API_KEY is not configured
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <MapPin size={12} /> {property.location}, {property.city}, {property.state}
              </p>
            </div>
          </div>

        {/* Right: Contact form */}
          <div className="space-y-4">
            {property.owner?.name && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Listed by</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{property.owner.name}</p>
                  {(property.owner.emailVerified || property.owner.phoneVerified) && <VerifiedBadge size="md" />}
                  {property.owner.plan === 'UNLIMITED' && <ProSellerBadge size="md" />}
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Contact Agent</h3>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Inquiry Sent!</p>
                  <p className="text-sm text-gray-500 mt-1">Our agent will call you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    className="input-field" placeholder="Your Name" />
                  <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                    className="input-field" placeholder="Email Address" />
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="input-field" placeholder="Phone Number" />
                  <textarea rows={3} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})}
                    className="input-field resize-none" />
                  <button type="submit" disabled={inquiryMutation.isPending}
                    className="btn-primary w-full justify-center">
                    {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}

              {/* WhatsApp inquiry */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <MessageCircle size={17} /> Chat on WhatsApp
              </a>

              {/* Phone */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <a href="tel:+919359854302" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 transition-colors">
                  <Phone size={15} className="text-primary-500" /> +919359854302
                </a>
                <a href="mailto:bharatestates3@gmail.com" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 transition-colors">
                  <Mail size={15} className="text-primary-500" /> bharatestates3@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <SimilarProperties property={property} />
      </div>
    </div>
  )
}
