import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/helpers'
import { Disc, Pentagon, RotateCcw, MapPin, Locate, Search, X, Loader2, Layers, Globe, Box } from 'lucide-react'

export default function MapSearch({ properties = [], onBoundsChange }) {
  const mapRef = useRef(null)
  const googleMapInstance = useRef(null)
  const markersRef = useRef([])
  const drawingManagerRef = useRef(null)
  const currentShapeRef = useRef(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapType, setMapType] = useState('roadmap') // roadmap, satellite, hybrid, terrain
  const [is3D, setIs3D] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeShape, setActiveShape] = useState(null)
  const [filteredProps, setFilteredProps] = useState(properties)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Sync props change
  useEffect(() => {
    setFilteredProps(properties)
  }, [properties])

  // 1. Load Google Maps JS API script dynamically
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true)
      return
    }

    const scriptId = 'google-maps-js-sdk'
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setMapLoaded(true)
          clearInterval(checkInterval)
        }
      }, 200)
      return () => clearInterval(checkInterval)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry`
    script.async = true
    script.defer = true
    script.onload = () => {
      setMapLoaded(true)
    }
    script.onerror = () => {
      console.warn('Google Maps JS SDK load fallback triggered')
      setMapLoaded(false)
    }
    document.head.appendChild(script)
  }, [apiKey])

  // 2. Initialize Google Map instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapInstance.current) return

    try {
      const defaultCenter = { lat: 20.5937, lng: 78.9629 }
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 5,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
      googleMapInstance.current = map

      // Initialize DrawingManager for Circle & Polygon tools
      if (window.google.maps.drawing) {
        const dm = new window.google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          circleOptions: {
            fillColor: '#E8532A',
            fillOpacity: 0.25,
            strokeWeight: 2,
            strokeColor: '#E8532A',
            editable: true,
            draggable: true
          },
          polygonOptions: {
            fillColor: '#E8532A',
            fillOpacity: 0.25,
            strokeWeight: 2,
            strokeColor: '#E8532A',
            editable: true,
            draggable: true
          }
        })
        dm.setMap(map)
        drawingManagerRef.current = dm

        window.google.maps.event.addListener(dm, 'overlaycomplete', (event) => {
          if (currentShapeRef.current) {
            currentShapeRef.current.setMap(null)
          }
          currentShapeRef.current = event.overlay
          dm.setDrawingMode(null)

          if (event.type === 'circle') {
            const circle = event.overlay
            const center = circle.getCenter()
            const radius = circle.getRadius()
            setActiveShape({ type: 'circle', center, radius })

            filterPropertiesInCircle(center, radius)
          } else if (event.type === 'polygon') {
            const poly = event.overlay
            setActiveShape({ type: 'polygon', poly })
            filterPropertiesInPolygon(poly)
          }
        })
      }
    } catch (err) {
      console.error('Error initializing Google Map:', err)
    }
  }, [mapLoaded])

  // 3. Update Map Type (roadmap, satellite, hybrid, terrain)
  useEffect(() => {
    if (!googleMapInstance.current || !window.google?.maps) return
    const map = googleMapInstance.current
    if (mapType === 'satellite') map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE)
    else if (mapType === 'hybrid') map.setMapTypeId(window.google.maps.MapTypeId.HYBRID)
    else if (mapType === 'terrain') map.setMapTypeId(window.google.maps.MapTypeId.TERRAIN)
    else map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP)
  }, [mapType])

  // 4. Render Property Markers on Google Map
  useEffect(() => {
    if (!googleMapInstance.current || !window.google?.maps) return
    const map = googleMapInstance.current

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const validProps = filteredProps.filter(p => p && p.lat != null && p.lng != null && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
    if (validProps.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()

    validProps.forEach(property => {
      const position = { lat: parseFloat(property.lat), lng: parseFloat(property.lng) }
      bounds.extend(position)

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: property.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#E8532A',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      })

      const infoContent = `
        <div style="width: 200px; font-family: sans-serif; padding: 4px;">
          <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="font-size: 10px; font-weight: bold; color: #E8532A; text-transform: uppercase;">${property.status}</div>
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${property.title}</div>
          <div style="font-weight: bold; font-size: 13px; color: #E8532A; margin-top: 2px;">${formatPrice(property.price)}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📍 ${property.city || property.location}</div>
          <a href="/properties/${property._id}" style="display: block; text-align: center; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 6px; border-radius: 6px; margin-top: 8px;">View Details</a>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({ content: infoContent })
      marker.addListener('click', () => infoWindow.open(map, marker))

      markersRef.current.push(marker)
    })

    // Auto-fit bounds if no shape is active
    if (!activeShape && validProps.length > 0) {
      map.fitBounds(bounds)
    }
  }, [filteredProps, mapLoaded, activeShape])

  // Filter functions
  const filterPropertiesInCircle = (center, radiusMeters) => {
    const valid = properties.filter(p => {
      if (!p.lat || !p.lng) return false
      const pLatLng = new window.google.maps.LatLng(parseFloat(p.lat), parseFloat(p.lng))
      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(center, pLatLng)
      return dist <= radiusMeters
    })
    setFilteredProps(valid)
  }

  const filterPropertiesInPolygon = (poly) => {
    const valid = properties.filter(p => {
      if (!p.lat || !p.lng) return false
      const pLatLng = new window.google.maps.LatLng(parseFloat(p.lat), parseFloat(p.lng))
      return window.google.maps.geometry.poly.containsLocation(pLatLng, poly)
    })
    setFilteredProps(valid)
  }

  const handleClearFilter = () => {
    if (currentShapeRef.current) {
      currentShapeRef.current.setMap(null)
      currentShapeRef.current = null
    }
    setActiveShape(null)
    setFilteredProps(properties)
    if (onBoundsChange) onBoundsChange(null)
  }

  const handleTriggerCircle = () => {
    if (drawingManagerRef.current && window.google?.maps) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.CIRCLE)
    }
  }

  const handleTriggerPolygon = () => {
    if (drawingManagerRef.current && window.google?.maps) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  const handleLocateMe = () => {
    if ('geolocation' in navigator && googleMapInstance.current) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        googleMapInstance.current.panTo({ lat: latitude, lng: longitude })
        googleMapInstance.current.setZoom(14)
      })
    }
  }

  const handleSearchLocation = async (queryText) => {
    if (!queryText.trim() || !googleMapInstance.current) return
    setIsSearching(true)
    try {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: `${queryText}, India` }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location
          googleMapInstance.current.panTo(loc)
          googleMapInstance.current.setZoom(13)
        }
        setIsSearching(false)
      })
    } catch (err) {
      setIsSearching(false)
    }
  }

  return (
    <div className={`w-full h-[calc(100vh-140px)] min-h-[500px] rounded-xl overflow-hidden shadow-md border border-gray-200 relative z-0 ${is3D ? 'map-container-3d' : 'map-container-2d'}`}>
      
      {/* Top Google Maps Floating Control Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 map-control-overlay">
        
        {/* Location Search Bar */}
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 w-52 sm:w-72">
          <Search size={14} className="text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchLocation(searchQuery)
            }}
            placeholder="Search city, area, or pincode on Google Maps..."
            className="w-full bg-transparent focus:outline-none text-xs text-gray-800 placeholder-gray-400"
          />
          {isSearching && <Loader2 size={13} className="animate-spin text-primary-500 shrink-0 ml-1.5" />}
          {searchQuery && !isSearching && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 shrink-0 ml-1.5">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Google Map Mode Selector */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-200 flex items-center gap-1 text-xs font-semibold text-gray-700">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              mapType === 'roadmap' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers size={13} />
            <span>Google Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              mapType === 'satellite' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe size={13} />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              mapType === 'hybrid' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe size={13} />
            <span>Hybrid</span>
          </button>
        </div>

        {/* 3D Perspective Toggle */}
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
            is3D 
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-primary-500 text-white ring-2 ring-purple-300' 
              : 'bg-white/95 backdrop-blur-md text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Box size={14} className={is3D ? 'animate-bounce' : ''} />
          <span>{is3D ? '3D Active' : '3D View'}</span>
        </button>

        {/* Drawing Tools */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-200 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <button
            onClick={handleTriggerCircle}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all duration-200 shadow-sm"
          >
            <Disc size={15} />
            <span>Draw Circle</span>
          </button>

          <button
            onClick={handleTriggerPolygon}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200"
          >
            <Pentagon size={15} />
            <span>Draw Area</span>
          </button>

          <button
            onClick={handleLocateMe}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200"
            title="My Location"
          >
            <Locate size={15} />
          </button>

          {activeShape && (
            <button
              onClick={handleClearFilter}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <RotateCcw size={14} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {activeShape && (
          <div className="px-3 py-1.5 rounded-xl shadow-lg text-xs font-medium bg-primary-600 text-white flex items-center gap-1.5">
            <Disc size={13} />
            <span>Filter Active: ({filteredProps.length} properties found)</span>
          </div>
        )}
      </div>

      {/* Google Map Container Element */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}




