import { useEffect, useId, useRef, useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'
import { loadGoogleMaps, parseMapPoint, validPoint } from '../../utils/googleMaps'

function GooglePinMap({ initialPoint, point, mapRef, markerRef, onSelect, onError }) {
  const container = useRef(null)
  const latestPoint = useRef(point)
  useEffect(() => {
    latestPoint.current = point
    if (markerRef.current && point) markerRef.current.position = point
  }, [point, markerRef])
  useEffect(() => {
    let cancelled = false
    const listeners = []
    const previousAuthFailure = window.gm_authFailure
    const authFailure = () => { if (!cancelled) onError(); previousAuthFailure?.() }
    window.gm_authFailure = authFailure
    loadGoogleMaps().then(async (maps) => {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([maps.importLibrary('maps'), maps.importLibrary('marker')])
      if (cancelled) return
      const map = new Map(container.current, {
        center: latestPoint.current || initialPoint || { lat: 22.5, lng: 79 }, zoom: latestPoint.current || initialPoint ? 16 : 5,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        streetViewControl: false, fullscreenControl: false, mapTypeControl: true,
        gestureHandling: 'cooperative',
      })
      const marker = new AdvancedMarkerElement({ map, position: latestPoint.current || initialPoint || undefined, gmpDraggable: true, title: 'Property location - drag to move' })
      mapRef.current = map
      markerRef.current = marker
      const select = (latLng) => {
        if (!latLng) return
        const point = { lat: Number(latLng.lat().toFixed(6)), lng: Number(latLng.lng().toFixed(6)) }
        marker.position = point
        onSelect(point)
      }
      listeners.push(map.addListener('click', (event) => { event.stop?.(); select(event.latLng) }))
      listeners.push(marker.addListener('dragend', (event) => select(event.latLng)))
    }).catch(() => { if (!cancelled) onError() })
    return () => {
      cancelled = true
      listeners.forEach((listener) => listener.remove())
      if (markerRef.current) markerRef.current.map = null
      mapRef.current = null
      markerRef.current = null
      if (window.gm_authFailure === authFailure) window.gm_authFailure = previousAuthFailure
    }
  }, [])
  return <div ref={container} className="h-[360px] w-full rounded-xl border border-stone-200" aria-label="Google Maps property pin picker" />
}

export default function PropertyLocationPicker({ lat, lng, onChange, address = '' }) {
  const panelId = useId()
  const hasPoint = validPoint(lat, lng)
  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState(null)
  const [initialPoint, setInitialPoint] = useState(null)
  const [mapUnavailable, setMapUnavailable] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const requestId = useRef(0)
  useEffect(() => () => { requestId.current += 1 }, [])
  const select = (value) => {
    setPoint(value)
    setError('')
    if (markerRef.current) markerRef.current.position = value
    if (mapRef.current) { mapRef.current.panTo(value); mapRef.current.setZoom(17) }
  }
  const close = () => { requestId.current += 1; setLocating(false); setOpen(false); setError('') }
  const locate = () => {
    if (!navigator.geolocation) { setError('Location access is unavailable. Choose the property on Google Maps instead.'); return }
    const request = ++requestId.current
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (request !== requestId.current) return
      select({ lat: Number(coords.latitude.toFixed(6)), lng: Number(coords.longitude.toFixed(6)) })
      setLocating(false)
    }, () => {
      if (request !== requestId.current) return
      setLocating(false)
      setError('Could not access your location. Choose the property on Google Maps instead.')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
  }
  const query = point ? `${point.lat},${point.lng}` : address || 'India'
  return <div className="border border-stone-200 rounded-xl p-3 sm:p-4 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-medium text-gray-800">Property location on Google Maps</p><p className="text-xs text-gray-500 mt-1">Optional. Place a pin so buyers can find the exact location.</p></div>
      {!open && <button type="button" className="btn-outline text-xs px-4 py-2" aria-expanded={open} aria-controls={panelId} onClick={() => {
        const saved = hasPoint ? { lat, lng } : null
        setPoint(saved); setInitialPoint(saved); setCoordinates(''); setMapUnavailable(false); setError(''); setOpen(true)
      }}><MapPin size={15} />{hasPoint ? 'Change Google Maps pin' : 'Choose on Google Maps'}</button>}
    </div>
    {!open && hasPoint && <div className="flex flex-wrap items-center gap-3 text-xs"><span role="status" className="text-green-700">Pin selected: {lat.toFixed(6)}, {lng.toFixed(6)}</span><button type="button" className="text-gray-500 underline" onClick={() => onChange({ lat: null, lng: null })}>Remove pin</button></div>}
    {open && <div id={panelId} className="space-y-3">
      <p className="text-xs text-gray-600">Tap the property on Google Maps or drag the pin to its exact location.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-2 text-xs border rounded-lg px-3 py-2 disabled:opacity-50"><LocateFixed size={14} />{locating ? 'Finding location…' : 'Use my location'}</button>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="text-xs border rounded-lg px-3 py-2">Open Google Maps</a>
      </div>
      {!mapUnavailable && <GooglePinMap initialPoint={initialPoint} point={point} mapRef={mapRef} markerRef={markerRef} onSelect={(selected) => { requestId.current += 1; setLocating(false); setError(''); setPoint(selected) }} onError={() => setMapUnavailable(true)} />}
      {mapUnavailable && <><p role="status" className="text-xs text-amber-700">The interactive map is unavailable. Open Google Maps, drop a pin, then copy its latitude and longitude below.</p><iframe title="Google Maps location preview" src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`} className="w-full h-64 border-0 rounded-xl" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></>}
      <label className="block text-xs text-gray-600">Paste Google Maps pin coordinates or a full place link
        <input className="input-field mt-1" value={coordinates} onChange={(event) => setCoordinates(event.target.value)} placeholder="e.g. 19.076090, 72.877426" />
      </label>
      <button type="button" className="text-xs border rounded-lg px-3 py-2" onClick={() => {
        const parsed = parseMapPoint(coordinates)
        if (parsed) select(parsed)
        else setError('Paste a latitude, longitude pair or a full Google Maps link containing the pin coordinates. Short share links cannot be read here.')
      }}>Apply coordinates</button>
      {error && <p role="alert" className="text-xs text-amber-700">{error}</p>}
      <p role="status" className="text-xs text-gray-600">{point ? `Selected: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` : 'No pin selected yet.'}</p>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={!point || locating} onClick={() => { onChange(point); close() }} className="btn-primary text-xs px-4 py-2 disabled:opacity-40">Use this location</button><button type="button" onClick={close} className="btn-outline text-xs px-4 py-2">Cancel</button></div>
    </div>}
  </div>
}
