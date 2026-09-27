import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, Search } from 'lucide-react'
import { PROPERTY_TYPES, TYPE_LABELS } from '../../utils/helpers'

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [intent, setIntent] = useState('buy')
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (type) params.set('type', type)
    params.set('status', intent === 'rent' ? 'RENTED' : 'ACTIVE')
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <section className="estate-hero estate-container" aria-labelledby="hero-heading">
      <div className="estate-hero-copy">
        <p className="estate-eyebrow">A place to belong · Across India</p>
        <h1 id="hero-heading">Find a place<br />to call <em>your own.</em></h1>
        <p className="estate-hero-description">Thoughtfully chosen homes. Possibilities that feel like you. Explore properties across India and take the next step towards a new beginning.</p>
        <form onSubmit={handleSearch} className="estate-search-form">
          <div className="estate-intent" aria-label="Listing purpose">
            <button type="button" aria-pressed={intent === 'buy'} onClick={() => setIntent('buy')}>Buy a home</button>
            <button type="button" aria-pressed={intent === 'rent'} onClick={() => setIntent('rent')}>Rent a home</button>
          </div>
          <div className="estate-search">
            <div className="estate-search-input">
              <Search size={18} aria-hidden="true" />
              <input aria-label="Search properties" placeholder="City, locality, or keyword…" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <select aria-label="Property type" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">All types</option>
              {PROPERTY_TYPES.map((value) => <option key={value} value={value}>{TYPE_LABELS[value]}</option>)}
            </select>
            <button type="submit" className="estate-button">Explore <ArrowUpRight size={17} /></button>
          </div>
        </form>
        <div className="estate-popular"><span>Popular cities</span>{['Mumbai', 'Delhi', 'Bengaluru'].map((city) => <Link key={city} to={`/properties?city=${city}`}>{city}</Link>)}</div>
      </div>
      <Link to="/properties?type=VILLA" className="estate-hero-image" aria-label="Explore villas">
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85" alt="Contemporary villa with a sunlit terrace and swimming pool" fetchPriority="high" />
        <span className="estate-image-tag">Spaces that inspire</span>
        <div className="estate-image-caption"><div><p className="estate-eyebrow">Discover the villa collection</p><h2>A little more extraordinary.</h2></div><span className="estate-image-arrow"><ArrowUpRight size={24} /></span></div>
      </Link>
      <a className="estate-discover" href="#collection">Find your next chapter <ArrowDown size={14} /></a>
    </section>
  )
}
