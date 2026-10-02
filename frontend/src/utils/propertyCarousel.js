export function carouselMove({ scrollLeft, maxScroll, step, direction, hasMore, loadingMore, loadError }) {
  const atEnd = direction > 0 && scrollLeft >= maxScroll - 2
  const requestPage = atEnd && hasMore && !loadingMore && !loadError
  let target = scrollLeft + direction * step
  // Keep showing loaded listings while the next page is pending or unavailable.
  if (atEnd) target = 0
  else if (direction < 0 && scrollLeft <= 2) target = maxScroll
  return { target: Math.max(0, Math.min(maxScroll, target)), requestPage: Boolean(requestPage) }
}

export function shouldLoadCarouselImage(index, position, visible) {
  // Warm the first viewport for wraparound and the next few slides before entry.
  return visible && (index < 3 || (index >= position - 1 && index < position + 6))
}
