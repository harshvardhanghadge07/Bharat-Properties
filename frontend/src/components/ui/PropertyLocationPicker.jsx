import { useEffect, useId, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed, MapPin } from 'lucide-react'

const INDIA_CENTER = [22.5, 79]
const pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:26px;height:26px;background:#a34e2f;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px #0006"></div>',
  iconSize: [26, 26], iconAnchor: [13, 26],
})
const validPoint = (lat, lng) => Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180
const normalizePoint = ({ lat, lng }) => [
  Number(lat.toFixed(6)),
  Number(((((lng + 180) % 360 + 360) % 360) - 180).toFixed(6)),
]

function MapInteraction({ point, onSelect, focus, onReady }) {
  const map = useMapEvents({ click: (event) => onSelect(normalizePoint(event.latlng)) })
  useEffect(() => {
    onReady(map)
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    map.invalidateSize()
    return () => { observer.disconnect(); onReady(null) }
  }, [map, onReady])
  useEffect(() => {
    if (focus) map.setView(focus, 16)
  }, [map, focus])
  return point ? <Marker position={point} icon={pinIcon} title="Property location" alt="Property location" draggable eventHandlers={{ dragend: (event) => onSelect(normalizePoint(event.target.getLatLng())) }} /> : null
}

export default function PropertyLocationPicker({ lat, lng, onChange }) {
  const panelId = useId()
  const hasPoint = validPoint(lat, lng)
  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState(null)
  const [focus, setFocus] = useState(null)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const mapRef = useRef(null)
  const requestId = useRef(0)
  // Stable setter prevents map listeners being torn down on each pin move.
  const [setMap] = useState(() => (map) => { mapRef.current = map })
  useEffect(() => () => { requestId.current += 1 }, [])

  const close = () => { requestId.current += 1; setLocating(false); setOpen(false); setError('') }
  const show = () => {
    setPoint(hasPoint ? [lat, lng] : null)
    setFocus(null)
    setError('')
    setOpen(true)
  }
  const locate = () => {
    if (!navigator.geolocation) { setError('Location access is unavailable. Zoom and tap the map to choose the property.'); return }
    const currentRequest = ++requestId.current
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (currentRequest !== requestId.current) return
      const location = normalizePoint({ lat: coords.latitude, lng: coords.longitude })
      setPoint(location)
      setFocus(location)
      setLocating(false)
    }, () => {
      if (currentRequest !== requestId.current) return
      setLocating(false)
      setError('Could not access your location. You can still zoom and tap the map to place the pin.')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
  }

  return (
    <div className="border border-stone-200 rounded-xl p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-medium text-gray-800">Property location on map</p><p className="text-xs text-gray-500 mt-1">Optional. Place a pin so buyers can find the exact location.</p></div>
        {!open && <button type="button" className="btn-outline text-xs px-4 py-2" onClick={show} aria-expanded={open} aria-controls={panelId}><MapPin size={15} />{hasPoint ? 'Change map location' : 'Choose on map'}</button>}
      </div>
      {!open && hasPoint && <div className="flex flex-wrap items-center gap-3 text-xs"><span role="status" className="text-green-700">Pin selected: {lat.toFixed(6)}, {lng.toFixed(6)}</span><button type="button" className="text-gray-500 underline" onClick={() => onChange({ lat: null, lng: null })}>Remove pin</button></div>}
      {open && <div id={panelId} className="space-y-3">
        <p className="text-xs text-gray-600">Zoom in and tap the property, or drag the pin. The address you entered stays unchanged.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-2 text-xs border rounded-lg px-3 py-2 disabled:opacity-50"><LocateFixed size={14} />{locating ? 'Finding location…' : 'Use my location'}</button>
          <button type="button" onClick={() => { if (mapRef.current) setPoint(normalizePoint(mapRef.current.getCenter())) }} className="text-xs border rounded-lg px-3 py-2">Place pin at map centre</button>
        </div>
        <div className="relative z-0 rounded-xl overflow-hidden border border-stone-200">
          <MapContainer center={hasPoint ? [lat, lng] : INDIA_CENTER} zoom={hasPoint ? 16 : 5} minZoom={3} maxZoom={19} maxBounds={[[-85, -180], [85, 180]]} maxBoundsViscosity={1} scrollWheelZoom={false} style={{ height: 360, minHeight: 360, width: '100%' }}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' eventHandlers={{ tileerror: () => setError('Some map tiles could not load. Check your connection or keep the address without a map pin.') }} />
            <MapInteraction point={point} onSelect={setPoint} focus={focus} onReady={setMap} />
          </MapContainer>
        </div>
        {error && <p role="alert" className="text-xs text-amber-700">{error}</p>}
        <p role="status" className="text-xs text-gray-600">{point ? `Selected: ${point[0].toFixed(6)}, ${point[1].toFixed(6)}` : 'No pin selected yet.'}</p>
        <div className="flex flex-wrap gap-2"><button type="button" disabled={!point || locating} onClick={() => { onChange({ lat: point[0], lng: point[1] }); close() }} className="btn-primary text-xs px-4 py-2 disabled:opacity-40">Use this location</button><button type="button" onClick={close} className="btn-outline text-xs px-4 py-2">Cancel</button></div>
      </div>}
    </div>
  )
}
