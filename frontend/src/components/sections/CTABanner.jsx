import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="estate-seller estate-container">
      <div><p className="estate-eyebrow">For owners & sellers</p><h2>Every property has a story.<br /><em>Let’s help you tell yours.</em></h2><p>Bring your property to people looking for a place just like it.</p></div>
      <Link to="/post-property" className="estate-button">List your property <ArrowUpRight size={18} /></Link>
    </section>
  )
}
