import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import PropertyCard3D from '../3d/PropertyCard3D'
import { carouselMove, shouldLoadCarouselImage } from '../../utils/propertyCarousel'

export default function PropertyCarousel({ properties, total, hasMore, loadingMore, loadMore, loadError }) {
  const railRef = useRef(null)
  const sectionRef = useRef(null)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(1)
  const [canSlide, setCanSlide] = useState(false)

  const go = (direction) => {
    const rail = railRef.current
    if (!rail) return
    const maxScroll = rail.scrollWidth - rail.clientWidth
    const step = rail.children[1] ? rail.children[1].offsetLeft - rail.children[0].offsetLeft : rail.clientWidth
    const { target, requestPage } = carouselMove({ scrollLeft: rail.scrollLeft, maxScroll, step, direction, hasMore, loadingMore, loadError })
    if (requestPage) loadMore()
    rail.scrollTo({ left: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const rail = railRef.current
    const observer = new ResizeObserver(() => setCanSlide(rail.scrollWidth > rail.clientWidth + 2))
    observer.observe(rail)
    setCanSlide(rail.scrollWidth > rail.clientWidth + 2)
    return () => observer.disconnect()
  }, [properties.length])

  useEffect(() => {
    if (paused || hovered || focused || !visible || (!canSlide && (!hasMore || loadError))) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') go(1)
    }, 2000)
    return () => clearInterval(timer)
  }, [paused, hovered, focused, visible, canSlide, hasMore, loadingMore, loadError, properties.length])

  // Fetch the next API page before the carousel reaches the loaded tail.
  useEffect(() => {
    if (visible && hasMore && !loadingMore && !loadError && position + 8 >= properties.length) loadMore()
  }, [visible, hasMore, loadingMore, loadError, position, properties.length, loadMore])

  const updatePosition = () => {
    const rail = railRef.current
    const step = rail.children[1] ? rail.children[1].offsetLeft - rail.children[0].offsetLeft : rail.clientWidth
    setPosition(Math.min(properties.length, Math.round(rail.scrollLeft / step) + 1))
  }

  return (
    <div ref={sectionRef} className="estate-carousel" role="region" aria-roledescription="carousel" aria-label="All properties for sale">
      <div className="estate-carousel-controls">
        <p className="text-xs text-stone-500">{total} {total === 1 ? 'property' : 'properties'} for sale <span aria-hidden="true">·</span> Showing from {Math.min(position, properties.length)}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPaused(!paused)} disabled={!canSlide && !hasMore} className="estate-carousel-control" aria-label={paused ? 'Play property slideshow' : 'Pause property slideshow'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
          <button type="button" onClick={() => { setPaused(true); go(-1) }} disabled={!canSlide} className="estate-carousel-control" aria-label="Previous properties"><ArrowLeft size={16} /></button>
          <button type="button" onClick={() => { setPaused(true); go(1) }} disabled={!canSlide && !hasMore} className="estate-carousel-control" aria-label="Next properties"><ArrowRight size={16} /></button>
        </div>
      </div>
      <div ref={railRef} className="estate-carousel-rail" onScroll={updatePosition} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }} onTouchStart={() => setPaused(true)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setPaused(true); go(event.key === 'ArrowRight' ? 1 : -1) } }} tabIndex={0} aria-label="Swipe or use arrow keys to browse properties">
        {properties.map((property, index) => <div className="estate-carousel-slide" key={property.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${total}`}><PropertyCard3D property={property} uniform imageLoading={shouldLoadCarouselImage(index, position, visible) ? 'eager' : 'lazy'} /></div>)}
      </div>
      {loadingMore && <p role="status" className="text-xs text-stone-500 mt-3">Loading more properties…</p>}
      {loadError && <div role="status" className="text-sm text-stone-600 mt-3">Couldn’t load the next listings. <button type="button" onClick={() => loadMore()} disabled={loadingMore} className="underline">Try again</button></div>}
    </div>
  )
}
