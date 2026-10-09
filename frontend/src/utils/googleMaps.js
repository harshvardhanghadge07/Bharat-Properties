let mapsPromise

export function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps)
  if (mapsPromise) return mapsPromise
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key || key === 'your_google_maps_api_key' || key.includes('AIzaSyDwPxG')) return Promise.reject(new Error('Map unavailable'))
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const timer = setTimeout(() => fail(), 15000)
    const cleanup = () => { clearTimeout(timer); delete window.__bharatMapsReady }
    const fail = () => { cleanup(); script.remove(); mapsPromise = undefined; reject(new Error('Map unavailable')) }
    window.__bharatMapsReady = () => { cleanup(); resolve(window.google.maps) }
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: 'weekly', loading: 'async', libraries: 'maps,marker', callback: '__bharatMapsReady' })}`
    script.async = true
    script.onerror = fail
    document.head.appendChild(script)
  })
  return mapsPromise
}

export const validPoint = (lat, lng) => Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180

// Accept a copied coordinate pair or a full Google Maps URL with an exact pin.
export function parseMapPoint(value) {
  const coordinate = String(value).trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (coordinate) {
    const lat = Number(coordinate[1]), lng = Number(coordinate[2])
    return validPoint(lat, lng) ? { lat, lng } : null
  }
  try {
    const url = new URL(value)
    if (!/(^|\.)(google\.[a-z.]+|maps\.app\.goo\.gl)$/.test(url.hostname)) return null
    // !3d/!4d is the selected place, whereas @lat,lng is only the camera centre.
    const pin = url.pathname.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/)
    if (pin) return parseMapPoint(`${pin[1]},${pin[2]}`)
    const query = url.searchParams.get('q') || url.searchParams.get('query')
    return query ? parseMapPoint(query) : null
  } catch { return null }
}
