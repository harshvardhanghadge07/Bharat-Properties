import { Link } from 'react-router-dom'
import { Building2, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="estate-footer">
      <div className="estate-container">
        <div className="estate-footer-main">
          <div><Link to="/" className="estate-footer-brand"><Building2 size={24} strokeWidth={1.2} /><span>BHARAT <small>PROPERTIES</small></span></Link><p>Good spaces. New beginnings.</p><a className="estate-footer-contact" href="mailto:bharatestates3@gmail.com">bharatestates3@gmail.com <ArrowUpRight size={13} /></a><a className="estate-footer-contact" href="tel:+919359854302">+91 9359854302</a></div>
          <div className="estate-footer-links"><Link to="/properties">Explore properties</Link><Link to="/post-property">List your property</Link><Link to="/about">Our story</Link><Link to="/contact">Get in touch</Link><Link to="/support">Help & support</Link></div>
          <div className="estate-footer-links"><span className="estate-eyebrow">Find your city</span>{['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad'].map((city) => <Link key={city} to={`/properties?city=${city}`}>{city}</Link>)}</div>
        </div>
        <div className="estate-footer-bottom"><span>© {new Date().getFullYear()} Bharat Properties. All rights reserved.</span><div><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refund">Refunds</Link></div><span className="estate-footer-signoff">Made for your next chapter.</span></div>
      </div>
    </footer>
  )
}
