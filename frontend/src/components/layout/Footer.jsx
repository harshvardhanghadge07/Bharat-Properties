import { Link } from 'react-router-dom'
import { Building2, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const CITIES  = ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad']
const TYPES   = ['Apartments','Villas','Plots','Commercial','Penthouses','Farmhouses']
const COMPANY = [
  { label: 'About Us',    href: '/about' },
  { label: 'Contact',     href: '/contact' },
  { label: 'Properties',  href: '/properties' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms',       href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-lg leading-none block">Bharat</span>
              <span className="text-[10px] text-primary-500 font-semibold tracking-widest uppercase">Properties</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            India's premier real estate portal. Discover, buy, sell, and rent properties across all major Indian cities.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone size={14} className="text-primary-500" /> +918484900257</div>
            <div className="flex items-center gap-2"><Mail size={14} className="text-primary-500" /> harshvardhanghadge134@gmail.com</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-primary-500" /> Jalna - 431203</div>
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <h4 className="text-white font-semibold mb-4">Top Cities</h4>
          <ul className="space-y-2 text-sm">
            {CITIES.map((c) => (
              <li key={c}>
                <Link to={`/properties?city=${c}`} className="hover:text-primary-500 transition-colors">
                  Properties in {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Property Types */}
        <div>
          <h4 className="text-white font-semibold mb-4">Property Types</h4>
          <ul className="space-y-2 text-sm">
            {TYPES.map((t) => (
              <li key={t}>
                <Link to={`/properties?type=${t.slice(0,-1).toUpperCase()}`} className="hover:text-primary-500 transition-colors">
                  {t} for Sale
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm mb-6">
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="hover:text-primary-500 transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Bharat Properties Pvt. Ltd. All rights reserved.</span>
        <span className="hidden sm:inline">·</span>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
          <Link to="/refund" className="hover:text-primary-500 transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}
