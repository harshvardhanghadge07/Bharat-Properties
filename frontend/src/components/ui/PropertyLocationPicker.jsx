import { useEffect, useId, useRef, useState } from 'react'
import { LocateFixed, MapPin, Check, AlertCircle, Sparkles } from 'lucide-react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'

// Custom branded SVG pin for Bharat Properties
const customPinIcon = L.divIcon({
  className: 'custom-property-pin',
  html: `
    <div style="position:relative; width:36px; height:44px; transform:translate(-18px, -44px); cursor:grab;">
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-4" y="0" width="44" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/>
        </filter>
        <path g="M18 2C9.71573 2 3 8.71573 3 17C3 27.25 18 42 18 42C18 42 33 27.25 33 17C33 8.71573 26.2843 2 18 2Z" fill="#E8532A" stroke="#FFFFFF" stroke-width="2" filter="url(#shadow)"/>
        <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
        <circle cx="18" cy="17" r="3" fill="#E8532A"/>
      </svg>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

// Ensures map renders without grey tiles or sizing defects when opened
function MapResize() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 350)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [map])
  return null
}

// Handles user taps/clicks on the map to drop a pin
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      if (!e.latlng) return
      onSelect({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      })
    },
  })
  return null
}

// Smoothly re-centers and zooms the map when a new position is chosen
function MapCenterController({ center, zoom = 15 }) {
  const map = useMap()
  useEffect(() => {
    if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 })
    }
  }, [center, zoom, map])
  return null
}

const isValidCoord = (lat, lng) =>
  Number.isFinite(Number(lat)) &&
  Math.abs(Number(lat)) <= 90 &&
  Number.isFinite(Number(lng)) &&
  Math.abs(Number(lng)) <= 180

// Progressive geocoding helper for Indian addresses
async function geocodeAddress(addrStr) {
  if (!addrStr || addrStr.trim().length < 3) return null

  const rawParts = addrStr.split(',').map((s) => s.trim()).filter(Boolean)
  const queries = [rawParts.join(', ')]

  if (rawParts.length > 2) queries.push(rawParts.slice(1).join(', '))
  if (rawParts.length > 3) queries.push(rawParts.slice(2).join(', '))
  if (rawParts.length >= 2) queries.push(`${rawParts[0]}, ${rawParts[1]}`)

  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data && data[0] && data[0].lat && data[0].lon) {
        return {
          lat: Number(parseFloat(data[0].lat).toFixed(6)),
          lng: Number(parseFloat(data[0].lon).toFixed(6)),
          displayName: data[0].display_name,
        }
      }
    } catch {
      // try next query
    }
  }
  return null
}

export default function PropertyLocationPicker({ lat, lng, onChange, address = '' }) {
  const panelId = useId()
  const hasPoint = isValidCoord(lat, lng)

  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }) // Default India center
  const [mapZoom, setMapZoom] = useState(5)
  const [locating, setLocating] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [detectedAddressName, setDetectedAddressName] = useState('')
  const [error, setError] = useState('')

  const lastGeocodedRef = useRef('')
  const requestId = useRef(0)
  useEffect(() => () => { requestId.current += 1 }, [])

  // Geocode address and set map location
  const detectFromAddress = async (silent = false) => {
    const cleanAddr = (address || '').trim()
    if (!cleanAddr || cleanAddr.length < 3) {
      if (!silent) setError('Please enter an Address, City or Locality above first.')
      return
    }

    setGeocoding(true)
    if (!silent) setError('')
    try {
      const result = await geocodeAddress(cleanAddr)
      if (result) {
        const newPoint = { lat: result.lat, lng: result.lng }
        setPoint(newPoint)
        setMapCenter(newPoint)
        setMapZoom(16)
        const shortName = result.displayName.split(',').slice(0, 3).join(', ')
        setDetectedAddressName(shortName)
        onChange(newPoint)
        lastGeocodedRef.current = cleanAddr
      } else {
        if (!silent) {
          setError(`Could not automatically pinpoint "${cleanAddr}". You can choose it directly on the map.`)
        }
      }
    } catch {
      if (!silent) {
        setError('Unable to detect location automatically. Please choose on the map.')
      }
    } finally {
      setGeocoding(false)
    }
  }

  // Automatically detect location when user finishes entering address (debounced)
  useEffect(() => {
    const clean = (address || '').trim()
    if (!clean || clean.length < 3) return
    if (clean === lastGeocodedRef.current) return

    // If an initial point already exists from database, sync ref and skip first overwrite
    if (hasPoint && !lastGeocodedRef.current) {
      lastGeocodedRef.current = clean
      return
    }

    const timer = setTimeout(() => {
      detectFromAddress(true)
    }, 900)

    return () => clearTimeout(timer)
  }, [address])

  const select = (value) => {
    setPoint(value)
    setMapCenter(value)
    setMapZoom(16)
    setError('')
  }

  const close = () => {
    requestId.current += 1
    setLocating(false)
    setOpen(false)
    setError('')
  }

  const locate = (autoSave = false) => {
    if (!navigator.geolocation) {
      setError('Location access is not supported by your browser.')
      return
    }
    const request = ++requestId.current
    setLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== requestId.current) return
        const newPoint = {
          lat: Number(coords.latitude.toFixed(6)),
          lng: Number(coords.longitude.toFixed(6)),
        }
        select(newPoint)
        setLocating(false)
        if (autoSave) {
          onChange(newPoint)
        }
      },
      () => {
        if (request !== requestId.current) return
        setLocating(false)
        setError('Could not access your location. Please enable location permissions or tap on the map.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const openPicker = () => {
    const saved = hasPoint ? { lat: Number(lat), lng: Number(lng) } : null
    setPoint(saved)
    if (saved) {
      setMapCenter(saved)
      setMapZoom(16)
    } else if (address && address.trim().length >= 3) {
      detectFromAddress(true)
    }
    setError('')
    setOpen(true)
  }

  return (
    <div className="border border-stone-200 rounded-xl p-3 sm:p-4 space-y-3 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Property Location</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-detected from address, or choose on map / use current location.
          </p>
        </div>

        {!open && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-outline text-xs px-3 py-2 inline-flex items-center gap-1.5"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={openPicker}
            >
              <MapPin size={14} className="text-primary-500" />
              {hasPoint ? 'Adjust on Map' : 'Choose on Map'}
            </button>
            <button
              type="button"
              disabled={geocoding}
              className="inline-flex items-center gap-1.5 text-xs border border-stone-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-stone-50 disabled:opacity-50"
              onClick={() => detectFromAddress(false)}
              title="Detect coordinates from the entered address"
            >
              <Sparkles size={14} className={geocoding ? 'animate-spin text-primary-500' : 'text-primary-600'} />
              {geocoding ? 'Detecting…' : 'Locate from Address'}
            </button>
            <button
              type="button"
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-xs border border-stone-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-stone-50 disabled:opacity-50"
              onClick={() => {
                if (!open) openPicker()
                locate(false)
              }}
            >
              <LocateFixed size={14} className={locating ? 'animate-spin text-primary-500' : 'text-gray-500'} />
              {locating ? 'Locating…' : 'Use Current Location'}
            </button>
          </div>
        )}
      </div>

      {!open && hasPoint && (
        <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              Location set: {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </span>
            {detectedAddressName && (
              <span className="text-gray-500 text-[11px] truncate max-w-xs">
                ({detectedAddressName})
              </span>
            )}
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            onClick={() => {
              lastGeocodedRef.current = ''
              onChange({ lat: null, lng: null })
            }}
          >
            Remove location
          </button>
        </div>
      )}

      {error && !open && (
        <p role="alert" className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </p>
      )}

      {open && (
        <div id={panelId} className="space-y-3 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-600">
              Tap anywhere on the map or drag the pin to fine-tune the exact location.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => detectFromAddress(false)}
                disabled={geocoding || !address}
                className="inline-flex items-center gap-1.5 text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 hover:bg-stone-50 disabled:opacity-50"
                title="Detect from the address above"
              >
                <Sparkles size={13} className={geocoding ? 'animate-spin text-primary-500' : 'text-primary-600'} />
                {geocoding ? 'Detecting…' : 'Locate from Address'}
              </button>
              <button
                type="button"
                onClick={() => locate(false)}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 hover:bg-stone-50 disabled:opacity-50"
              >
                <LocateFixed size={13} className={locating ? 'animate-spin text-primary-500' : 'text-gray-500'} />
                {locating ? 'Locating…' : 'Use Current Location'}
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="h-[340px] w-full rounded-xl overflow-hidden border border-stone-200 relative shadow-inner">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <MapResize />
              <MapClickHandler onSelect={select} />
              <MapCenterController center={mapCenter} zoom={mapZoom} />

              {point && (
                <Marker
                  position={[point.lat, point.lng]}
                  icon={customPinIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend(e) {
                      const marker = e.target
                      const pos = marker.getLatLng()
                      select({
                        lat: Number(pos.lat.toFixed(6)),
                        lng: Number(pos.lng.toFixed(6)),
                      })
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>

          {error && (
            <p role="alert" className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p role="status" className="text-xs text-gray-600">
              {point ? (
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <Check size={14} className="text-emerald-600" />
                  Pin placed: {point.lat.toFixed(6)}, {point.lng.toFixed(6)} (drag to fine-tune)
                </span>
              ) : (
                'No pin placed yet. Tap anywhere on the map or click Locate from Address.'
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!point || locating}
                onClick={() => {
                  onChange(point)
                  close()
                }}
                className="btn-primary text-xs px-4 py-2 disabled:opacity-40"
              >
                Confirm Location
              </button>
              <button type="button" onClick={close} className="btn-outline text-xs px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
