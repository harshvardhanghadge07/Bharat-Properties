// Delivery-only resizing: originals stay untouched, and width-only c_limit
// preserves portrait/landscape ratios without cropping or upscaling.
export function propertyImageUrl(src, width) {
  if (typeof src !== 'string' || !Number.isInteger(width) || width < 1) return src
  // Leave signed URLs, existing transformations and other hosts unchanged.
  if (!/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?bharat-properties\//.test(src)) return src
  return src.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

export function propertyImageSources(src, widths = [320, 640, 960, 1280]) {
  if (propertyImageUrl(src, widths[0]) === src) return undefined
  return widths.map(width => `${propertyImageUrl(src, width)} ${width}w`).join(', ')
}
