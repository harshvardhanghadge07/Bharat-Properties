import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/helpers'
import L from 'leaflet'

// Fix Leaflet's default icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Auto-zoom to fit bounds of properties
function MapBounds({ properties }) {
  const map = useMap()
  
  useEffect(() => {
    const validProps = properties.filter(p => p.lat && p.lng)
    if (validProps.length === 0) return
    
    const bounds = L.latLngBounds(validProps.map(p => [p.lat, p.lng]))
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

export default function MapSearch({ properties, onBoundsChange }) {
  // Default to center of India if no valid properties
  const defaultCenter = [20.5937, 78.9629]
  const defaultZoom = 5
  
  const [polygon, setPolygon] = useState(null)
  const fgRef = useRef()
  
  const validProperties = properties.filter(p => p.lat && p.lng).filter(p => {
    if (!polygon) return true
    if (polygon.type === 'circle') {
      const center = L.latLng(polygon.latlng)
      return center.distanceTo(L.latLng(p.lat, p.lng)) <= polygon.radius
    } else if (polygon.type === 'polygon') {
      return isPointInPolygon([p.lat, p.lng], polygon.latlngs)
    } else if (polygon.type === 'rectangle') {
      const bounds = L.latLngBounds(polygon.latlngs)
      return bounds.contains(L.latLng(p.lat, p.lng))
    }
    return true
  })

  const onCreated = (e) => {
    const { layerType, layer } = e
    
    // Clear previous drawings
    fgRef.current.clearLayers()
    fgRef.current.addLayer(layer)
    
    let bounds
    if (layerType === 'circle') {
      const latlng = layer.getLatLng()
      const radius = layer.getRadius()
      setPolygon({ type: 'circle', latlng: [latlng.lat, latlng.lng], radius })
      bounds = layer.getBounds()
    } else {
      const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng])
      setPolygon({ type: layerType, latlngs })
      bounds = layer.getBounds()
    }

    if (onBoundsChange && bounds) {
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      })
    }
  }

  const onDeleted = () => {
    setPolygon(null)
    if (onBoundsChange) onBoundsChange(null)
  }

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-md border border-gray-200 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FeatureGroup ref={fgRef}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              polyline: false,
              marker: false,
              circlemarker: false,
              polygon: true,
              rectangle: true,
              circle: true,
            }}
          />
        </FeatureGroup>
        
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
  )
}
