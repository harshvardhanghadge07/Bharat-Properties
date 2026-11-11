import { useEffect, useId, useRef, useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'
import { loadGoogleMaps, validPoint } from '../../utils/googleMaps'

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
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        maps.importLibrary('maps'),
        maps.importLibrary('marker')
      ])
      if (cancelled) return

      const map = new Map(container.current, {
        center: latestPoint.current || initialPoint || { lat: 22.5, lng: 79 },
        zoom: latestPoint.current || initialPoint ? 16 : 5,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true,
        gestureHandling: 'cooperative',
      })

      const marker = new AdvancedMarkerElement({
        map,
        position: latestPoint.current || initialPoint || undefined,
        gmpDraggable: true,
        title: 'Property location - drag to move'
      })

      mapRef.current = map
      markerRef.current = marker

      const select = (latLng) => {
        if (!latLng) return
        const p = { lat: Number(latLng.lat().toFixed(6)), lng: Number(latLng.lng().toFixed(6)) }
        marker.position = p
        onSelect(p)
      }

      listeners.push(map.addListener('click', (event) => {
        event.stop?.()
        select(event.latLng)
      }))
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

  return (
    <div
      ref={container}
      className="h-[360px] w-full rounded-xl border border-stone-200"
      aria-label="Google Maps property pin picker"
    />
  )
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
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const requestId = useRef(0)

  useEffect(() => () => { requestId.current += 1 }, [])

  const select = (value) => {
    setPoint(value)
    setError('')
    if (markerRef.current) markerRef.current.position = value
    if (mapRef.current) {
      mapRef.current.panTo(value)
      mapRef.current.setZoom(17)
    }
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
          lng: Number(coords.longitude.toFixed(6))
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
        setError('Could not access your location. Please allow location permissions in your browser or select on the map.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const openPicker = () => {
    const saved = hasPoint ? { lat, lng } : null
    setPoint(saved)
    setInitialPoint(saved)
    setMapUnavailable(false)
    setError('')
    setOpen(true)
  }

  return (
    <div className="border border-stone-200 rounded-xl p-3 sm:p-4 space-y-3 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Property Location</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose your location on the map or use your current location.
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
              {hasPoint ? 'Change Location' : 'Choose Your Location'}
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
          <span className="text-emerald-700 font-medium inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Location set ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
          <button
            type="button"
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => onChange({ lat: null, lng: null })}
          >
            Remove location
          </button>
        </div>
      )}

      {error && !open && (
        <p role="alert" className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          {error}
        </p>
      )}

      {open && (
        <div id={panelId} className="space-y-3 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-600">
              Tap anywhere on the map or drag the pin to set the property's location.
            </p>
            <button
              type="button"
              onClick={() => locate(false)}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-xs border border-stone-300 rounded-lg px-3 py-1.5 hover:bg-stone-50 disabled:opacity-50"
            >
              <LocateFixed size={13} className={locating ? 'animate-spin text-primary-500' : 'text-gray-500'} />
              {locating ? 'Locating…' : 'Use Current Location'}
            </button>
          </div>

          {!mapUnavailable && (
            <GooglePinMap
              initialPoint={initialPoint}
              point={point}
              mapRef={mapRef}
              markerRef={markerRef}
              onSelect={(selected) => {
                requestId.current += 1
                setLocating(false)
                setError('')
                setPoint(selected)
              }}
              onError={() => setMapUnavailable(true)}
            />
          )}

          {mapUnavailable && (
            <div className="space-y-2">
              <p role="status" className="text-xs text-amber-700">
                Interactive map preview:
              </p>
              <iframe
                title="Google Maps location preview"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address || 'India')}&z=15&output=embed`}
                className="w-full h-64 border-0 rounded-xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {error && <p role="alert" className="text-xs text-amber-700">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p role="status" className="text-xs text-gray-600">
              {point ? (
                <span className="text-emerald-700 font-medium">
                  Selected: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </span>
              ) : (
                'No location selected yet. Tap the map or click Use Current Location.'
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
