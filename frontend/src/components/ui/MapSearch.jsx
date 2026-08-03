import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup, ZoomControl } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/helpers'
import { Disc, Pentagon, RotateCcw, MapPin, Locate, Search, X, Loader2, Layers, Globe, Box } from 'lucide-react'
import L from 'leaflet'

// Ensure L is globally available for leaflet-draw
if (typeof window !== 'undefined') {
  window.L = L
}

// Fix Leaflet's default icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Auto-invalidate map size to prevent gray layout tile gaps
function MapResize() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

// Auto-zoom to fit bounds of properties
function MapBounds({ properties }) {
  const map = useMap()
  
  useEffect(() => {
    const validProps = properties.filter(p => p && p.lat != null && p.lng != null && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
    if (validProps.length === 0) return
    
    const bounds = L.latLngBounds(validProps.map(p => [parseFloat(p.lat), parseFloat(p.lng)]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
  }, [properties, map])
  
  return null
}

function isPointInPolygon(point, vs) {
  let x = point[0], y = point[1]
  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1]
    let xj = vs[j][0], yj = vs[j][1]
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// Interactive Map Search bar for city/locality geocoding
function MapSearchBar() {
  const map = useMap()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (queryText) => {
    if (!queryText.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&countrycodes=in&limit=5`)
      const data = await res.json()
      setResults(data)
      setDropdownOpen(true)
    } catch (err) {
      console.error('Geocoding error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (loc) => {
    const lat = parseFloat(loc.lat)
    const lon = parseFloat(loc.lon)
    if (!isNaN(lat) && !isNaN(lon)) {
      map.flyTo([lat, lon], 13, { animate: true, duration: 1.5 })
      setSearchQuery(loc.display_name.split(',')[0])
      setDropdownOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchQuery)
    }
  }

  return (
    <div ref={wrapRef} className="relative z-[1001]">
      <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 w-52 sm:w-72">
        <Search size={14} className="text-gray-400 shrink-0 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value.length > 2) {
              handleSearch(e.target.value)
            }
          }}
          onFocus={() => {
            if (results.length > 0) setDropdownOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search city, area, or pincode..."
          className="w-full bg-transparent focus:outline-none text-xs text-gray-800 placeholder-gray-400"
        />
        {isSearching && <Loader2 size={13} className="animate-spin text-primary-500 shrink-0 ml-1.5" />}
        {searchQuery && !isSearching && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setResults([])
              setDropdownOpen(false)
            }}
            className="text-gray-400 hover:text-gray-600 shrink-0 ml-1.5"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {dropdownOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl z-[1002] max-h-56 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectLocation(item)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-primary-50 text-gray-700 hover:text-primary-600 flex items-start gap-2 border-b border-gray-100 last:border-0 transition-colors"
            >
              <MapPin size={13} className="text-primary-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Interactive 3D Earth Globe Modal Component
function EarthGlobeModal({ properties, onClose }) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState({ x: 0.2, y: 1.5 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const validProps = properties.filter(p => p && p.lat != null && p.lng != null && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height
    const radius = Math.min(width, height) * 0.38
    const cx = width / 2
    const cy = height / 2

    ctx.clearRect(0, 0, width, height)

    // Deep Space Background
    const spaceGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 2.2)
    spaceGrad.addColorStop(0, 'rgba(15, 23, 42, 0.98)')
    spaceGrad.addColorStop(1, 'rgba(2, 6, 23, 1)')
    ctx.fillStyle = spaceGrad
    ctx.fillRect(0, 0, width, height)

    // Atmospheric Outer Glow
    const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.18)
    atmosGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)')
    atmosGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2)
    ctx.fillStyle = atmosGrad
    ctx.fill()

    // 3D Earth Ocean Sphere
    const oceanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius)
    oceanGrad.addColorStop(0, '#1d4ed8')
    oceanGrad.addColorStop(0.5, '#0f172a')
    oceanGrad.addColorStop(1, '#020617')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = oceanGrad
    ctx.fill()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    ctx.stroke()

    // 3D Latitude Graticules
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'
    ctx.lineWidth = 1
    for (let lat = -60; lat <= 60; lat += 20) {
      ctx.beginPath()
      const rLat = (lat * Math.PI) / 180
      const yLine = cy - Math.sin(rLat) * radius
      const rSub = Math.cos(rLat) * radius
      ctx.ellipse(cx, yLine, rSub, Math.max(2, rSub * Math.sin(rotation.x)), 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // 3D Longitude Meridian Curves
    for (let lng = 0; lng < 360; lng += 30) {
      const radLng = ((lng + rotation.y * 57.3) * Math.PI) / 180
      const xOffset = Math.sin(radLng) * radius
      ctx.beginPath()
      ctx.ellipse(cx, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Plot 3D Property Markers on Spherical Earth Surface
    validProps.forEach(p => {
      const lat = (parseFloat(p.lat) * Math.PI) / 180
      const lng = (parseFloat(p.lng) * Math.PI) / 180 + rotation.y

      // 3D Spherical Trigonometry Projection
      const x3d = Math.cos(lat) * Math.sin(lng)
      const y3d = Math.sin(lat)
      const z3d = Math.cos(lat) * Math.cos(lng)

      // Only draw markers on the front hemisphere facing user (z3d > 0)
      if (z3d > 0) {
        const px = cx + x3d * radius
        const py = cy - y3d * radius

        // 3D Glowing Marker Pin
        ctx.beginPath()
        ctx.arc(px, py, 7 + z3d * 4, 0, Math.PI * 2)
        ctx.fillStyle = '#E8532A'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Outer pulse aura
        ctx.beginPath()
        ctx.arc(px, py, 12 + z3d * 6, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(232, 83, 42, 0.6)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })
  }, [rotation, validProps])

  const onMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setRotation(prev => ({
      x: Math.max(-1.2, Math.min(1.2, prev.x + dy * 0.005)),
      y: prev.y + dx * 0.008
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const onMouseUp = () => setIsDragging(false)

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs font-semibold border border-white/20 shadow-xl flex items-center gap-2">
          <Globe size={14} className="text-sky-400 animate-spin" />
          <span>Click & Drag to rotate 3D Earth Globe</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-colors border border-white/20 shadow-lg"
          title="Close Earth Globe View"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="cursor-grab active:cursor-grabbing max-w-full max-h-full rounded-3xl"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-2xl">
          <Globe size={15} className="text-sky-400" />
          <span>Interactive 3D Earth Globe Shape ({validProps.length} properties mapped)</span>
        </div>
      </div>
    </div>
  )
}

// Map Action Controller component for triggering drawing modes programmatically
function MapControls({ fgRef, onTriggerDraw, polygon, onClearFilter, resultCount, mapType, setMapType, is3D, setIs3D, onOpenGlobe }) {
  const map = useMap()

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 13, { animate: true })
      }, () => {
        alert('Could not get your current location.')
      })
    }
  }

  const triggerCircleTool = () => {
    const circleButton = document.querySelector('.leaflet-draw-draw-circle')
    if (circleButton) {
      circleButton.click()
    } else {
      // Fallback: create circle around map center if draw button isn't clicked
      const center = map.getCenter()
      fgRef.current?.clearLayers()
      const circle = L.circle(center, { radius: 5000, color: '#E8532A', fillColor: '#E8532A', fillOpacity: 0.2 })
      fgRef.current?.addLayer(circle)
      onTriggerDraw({ type: 'circle', latlng: [center.lat, center.lng], radius: 5000 }, circle.getBounds())
    }
  }

  const triggerPolygonTool = () => {
    const polyButton = document.querySelector('.leaflet-draw-draw-polygon')
    if (polyButton) {
      polyButton.click()
    }
  }

  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 map-control-overlay">
      <MapSearchBar />

      {/* Layer Toggle: Street vs Satellite */}
      <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-200 flex items-center gap-1 text-xs font-semibold text-gray-700">
        <button
          type="button"
          onClick={() => setMapType('street')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            mapType === 'street' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Switch to Street Map view"
        >
          <Layers size={13} />
          <span>Street</span>
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            mapType === 'satellite' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Switch to High-Res Satellite View"
        >
          <Globe size={13} />
          <span>Satellite</span>
        </button>
      </div>

      {/* 3D Perspective View Toggle */}
      <button
        type="button"
        onClick={() => setIs3D(!is3D)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
          is3D 
            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-primary-500 text-white ring-2 ring-purple-300' 
            : 'bg-white/95 backdrop-blur-md text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
        title="Toggle 3D Perspective Map View"
      >
        <Box size={14} className={is3D ? 'animate-bounce' : ''} />
        <span>{is3D ? '3D Active' : '3D View'}</span>
      </button>

      {/* 3D Earth Globe Modal Trigger */}
      <button
        type="button"
        onClick={onOpenGlobe}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg hover:shadow-sky-200 transition-all hover:scale-105"
        title="Open 3D Interactive Earth Globe Shape Map"
      >
        <Globe size={14} className="animate-spin" />
        <span>Earth 3D</span>
      </button>



      <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-200 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <button
          onClick={triggerCircleTool}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all duration-200 shadow-sm"
          title="Click to draw a circle search area on map"
        >
          <Disc size={15} />
          <span>Draw Circle</span>
        </button>

        <button
          onClick={triggerPolygonTool}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200"
          title="Click to draw a custom polygon area on map"
        >
          <Pentagon size={15} />
          <span>Draw Area</span>
        </button>

        <button
          onClick={handleLocateMe}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200"
          title="Center on my location"
        >
          <Locate size={15} />
        </button>

        {polygon && (
          <button
            onClick={onClearFilter}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
            title="Clear active map filter"
          >
            <RotateCcw size={14} />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {polygon && (
        <div className={`px-3 py-1.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-1.5 ${resultCount > 0 ? 'bg-primary-600 text-white' : 'bg-amber-600 text-white animate-bounce'}`}>
          <Disc size={13} />
          {polygon.type === 'circle' ? (
            <span>
              Circle: <strong>{(polygon.radius / 1000).toFixed(1)} km</strong> radius ({resultCount} {resultCount === 1 ? 'property' : 'properties'})
            </span>
          ) : (
            <span>Custom Area ({resultCount} {resultCount === 1 ? 'property' : 'properties'})</span>
          )}
        </div>
      )}
    </div>
  )
}


export default function MapSearch({ properties, onBoundsChange }) {
  // Default to center of India if no valid properties
  const defaultCenter = [20.5937, 78.9629]
  const defaultZoom = 5
  
  const [polygon, setPolygon] = useState(null)
  const [mapType, setMapType] = useState('street')
  const [is3D, setIs3D] = useState(false)
  const [showGlobe, setShowGlobe] = useState(false)
  const fgRef = useRef()

  const validProperties = properties.filter(p => p && p.lat != null && p.lng != null && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))).filter(p => {
    if (!polygon) return true
    const pLat = parseFloat(p.lat)
    const pLng = parseFloat(p.lng)
    if (polygon.type === 'circle') {
      const center = L.latLng(polygon.latlng)
      return center.distanceTo(L.latLng(pLat, pLng)) <= polygon.radius
    } else if (polygon.type === 'polygon') {
      return isPointInPolygon([pLat, pLng], polygon.latlngs)
    } else if (polygon.type === 'rectangle') {
      const bounds = L.latLngBounds(polygon.latlngs)
      return bounds.contains(L.latLng(pLat, pLng))
    }
    return true
  })

  const handlePolygonChange = (polyData, bounds) => {
    setPolygon(polyData)
    if (onBoundsChange && bounds) {
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      })
    }
  }

  const onCreated = (e) => {
    const { layerType, layer } = e
    
    // Clear previous drawings
    fgRef.current?.clearLayers()
    fgRef.current?.addLayer(layer)
    
    let bounds
    if (layerType === 'circle') {
      const latlng = layer.getLatLng()
      const radius = layer.getRadius()
      handlePolygonChange({ type: 'circle', latlng: [latlng.lat, latlng.lng], radius }, layer.getBounds())
    } else {
      const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng])
      handlePolygonChange({ type: layerType, latlngs }, layer.getBounds())
    }
  }

  const onEdited = (e) => {
    const layers = e.layers
    layers.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        const latlng = layer.getLatLng()
        const radius = layer.getRadius()
        handlePolygonChange({ type: 'circle', latlng: [latlng.lat, latlng.lng], radius }, layer.getBounds())
      } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng])
        handlePolygonChange({ type: 'polygon', latlngs }, layer.getBounds())
      }
    })
  }

  const onDeleted = () => {
    setPolygon(null)
    if (onBoundsChange) onBoundsChange(null)
  }

  const handleClearFilter = () => {
    fgRef.current?.clearLayers()
    setPolygon(null)
    if (onBoundsChange) onBoundsChange(null)
  }

  return (
    <>
      {showGlobe && <EarthGlobeModal properties={properties} onClose={() => setShowGlobe(false)} />}

      <div className={`w-full h-[calc(100vh-140px)] min-h-[500px] rounded-xl overflow-hidden shadow-md border border-gray-200 relative z-0 ${is3D ? 'map-container-3d' : 'map-container-2d'}`}>
        <MapContainer 
          center={defaultCenter} 
          zoom={defaultZoom} 
          scrollWheelZoom={true} 
          zoomControl={false}
          className="w-full h-full"
        >
          <MapResize />
          <ZoomControl position="bottomright" />
          <TileLayer
            key={mapType}
            attribution={
              mapType === 'satellite'
                ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            url={
              mapType === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            }
            maxZoom={19}
          />

          <FeatureGroup ref={fgRef}>
            <EditControl
              position="topright"
              onCreated={onCreated}
              onEdited={onEdited}
              onDeleted={onDeleted}
              draw={{
                polyline: false,
                marker: false,
                circlemarker: false,
                polygon: {
                  allowIntersection: false,
                  drawError: { color: '#e1e100', message: "<strong>Error:</strong> shape edges cannot cross!" },
                  shapeOptions: { color: '#E8532A', fillColor: '#E8532A', fillOpacity: 0.25 }
                },
                rectangle: {
                  shapeOptions: { color: '#E8532A', fillColor: '#E8532A', fillOpacity: 0.25 }
                },
                circle: {
                  shapeOptions: { color: '#E8532A', fillColor: '#E8532A', fillOpacity: 0.25 }
                },
              }}
            />
          </FeatureGroup>

          <MapControls 
            fgRef={fgRef} 
            onTriggerDraw={handlePolygonChange} 
            polygon={polygon} 
            onClearFilter={handleClearFilter}
            resultCount={validProperties.length}
            mapType={mapType}
            setMapType={setMapType}
            is3D={is3D}
            setIs3D={setIs3D}
            onOpenGlobe={() => setShowGlobe(true)}
          />
          
          {validProperties.map(property => (
            <Marker key={property._id} position={[property.lat, property.lng]}>
              <Popup className="property-popup p-0">
                <div className="w-48 overflow-hidden rounded-lg !m-0">
                  <div className="h-28 bg-gray-100 relative">
                    <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'} alt={property.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{property.status}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="font-bold text-gray-900 text-sm truncate !m-0">{property.title}</p>
                    <p className="font-bold text-primary-500 text-sm !m-0">{formatPrice(property.price)}</p>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 truncate !m-0">
                      <MapPin size={11} className="shrink-0 text-primary-500" />
                      <span className="truncate">{property.city || property.location}</span>
                    </div>
                    <Link to={`/properties/${property._id}`} className="block text-center bg-gray-900 text-white text-xs font-semibold py-2 rounded-md hover:bg-primary-500 transition-colors mt-2">
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <MapBounds properties={validProperties} />
        </MapContainer>
      </div>
    </>
  )
}


