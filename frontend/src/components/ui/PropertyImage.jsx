import { useState } from 'react'
import { propertyImageUrl, propertyImageSources } from '../../utils/propertyImages'

const unavailable = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#e9e7e1"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#57534e" font-family="sans-serif" font-size="20">Photo unavailable</text></svg>')

function Image({ src, alt, sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', width = 640, widths, loading = 'lazy', placeholderHeight = 160, style, ...props }) {
  const [loaded, setLoaded] = useState(false)
  const [fallback, setFallback] = useState(0)
  const optimized = propertyImageUrl(src, width)
  const imageSrc = !src || fallback === 2 ? unavailable : fallback === 1 ? src : optimized
  return <img {...props} src={imageSrc} srcSet={fallback || !src ? undefined : propertyImageSources(src, widths)} sizes={sizes} alt={alt} loading={loading} decoding="async"
    style={{ ...style, minHeight: loaded ? style?.minHeight : placeholderHeight }}
    onLoad={() => setLoaded(true)}
    onError={() => { setFallback(current => current === 0 && optimized !== src ? 1 : 2); setLoaded(true) }} />
}

export default function PropertyImage(props) {
  // Changing gallery photos resets loading/error state without retaining a
  // failed source from the previous photo.
  return <Image key={props.src} {...props} />
}
