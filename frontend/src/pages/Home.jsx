import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2, Home as HomeIcon, Trees, Store } from 'lucide-react'
import HeroSection from '../components/sections/HeroSection'
import FeaturedProperties from '../components/sections/FeaturedProperties'
import CTABanner from '../components/sections/CTABanner'

const collections = [
  { label: 'Apartments', description: 'A life above the everyday', type: 'APARTMENT', Icon: Building2 },
  { label: 'Villas', description: 'Room to make it your own', type: 'VILLA', Icon: HomeIcon },
  { label: 'Plots & land', description: 'Build your next beginning', type: 'PLOT', Icon: Trees },
  { label: 'Commercial', description: 'Space for your ambition', type: 'COMMERCIAL', Icon: Store },
]

export default function Home() {
  return (
    <main className="estate-home">
      <HeroSection />
      <FeaturedProperties />
      <section className="estate-types estate-container" aria-labelledby="types-heading">
        <div className="estate-section-heading"><div><p className="estate-eyebrow">Different spaces. Endless possibilities.</p><h2 id="types-heading">What feels like home?</h2></div><Link to="/properties" className="estate-text-link">Explore all properties <ArrowUpRight size={16} /></Link></div>
        <div className="estate-types-grid">{collections.map(({ label, description, type, Icon }) => <Link key={type} to={`/properties?type=${type}`} className="estate-type"><Icon size={25} strokeWidth={1.2} /><h3>{label}</h3><p>{description}</p><ArrowUpRight className="estate-type-arrow" size={18} /></Link>)}</div>
      </section>
      <CTABanner />
    </main>
  )
}
