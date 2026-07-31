import { Link } from 'react-router-dom'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  FileText,
  Shield,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']
const TYPES = ['Apartments', 'Villas', 'Plots', 'Commercial', 'Penthouses', 'Farmhouses']
const COMPANY = [
  { label: 'About Us', href: '/about' },
  { label: 'Help & Support', href: '/support' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'All Properties', href: '/properties' },
  { label: 'Pricing Plans', href: '/pricing' },
]

const LEGAL_POLICIES = [
  { label: 'Terms of Service', href: '/terms', icon: FileText, desc: 'Rules & user agreement' },
  { label: 'Privacy Policy', href: '/privacy', icon: Shield, desc: 'Data protection & security' },
  { label: 'Refund Policy', href: '/refund', icon: RotateCcw, desc: 'Billing & cancellation terms' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Prominent Legal & Trust Header Banner Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 border-b border-gray-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span>Transparent, Compliant & Verified Real Estate Portal</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {LEGAL_POLICIES.map((p) => {
              const Icon = p.icon
              return (
                <Link
                  key={p.label}
                  to={p.href}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-medium border border-gray-700/60 transition-all hover:border-primary-500/50"
                >
                  <Icon size={14} className="text-primary-500" />
                  <span>{p.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-lg leading-none block">Bharat</span>
              <span className="text-[10px] text-primary-500 font-semibold tracking-widest uppercase">Properties</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed max-w-sm">
            India's premier real estate portal. Discover, buy, sell, and rent properties across all major Indian cities with complete transparency and trust.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone size={14} className="text-primary-500" /> +91 9359854302</div>
            <div className="flex items-center gap-2"><Mail size={14} className="text-primary-500" /> harshvardhanghadge134@gmail.com</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-primary-500" /> Jalna - 431203, Maharashtra</div>
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Top Cities</h4>
          <ul className="space-y-2 text-xs">
            {CITIES.map((c) => (
              <li key={c}>
                <Link to={`/properties?city=${c}`} className="hover:text-primary-500 transition-colors">
                  Properties in {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Company</h4>
          <ul className="space-y-2.5 text-xs mb-6">
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="hover:text-primary-500 transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Policies Dedicated Column */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase flex items-center gap-1.5">
            <Shield size={14} className="text-primary-500" /> Legal & Policies
          </h4>
          <ul className="space-y-3 text-xs mb-6">
            {LEGAL_POLICIES.map((p) => {
              const Icon = p.icon
              return (
                <li key={p.label}>
                  <Link to={p.href} className="group block">
                    <span className="font-semibold text-gray-200 group-hover:text-primary-500 transition-colors flex items-center gap-1.5">
                      <Icon size={13} className="text-gray-400 group-hover:text-primary-500" /> {p.label}
                    </span>
                    <span className="text-[11px] text-gray-500 block pl-5 mt-0.5">{p.desc}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex gap-2">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Copyright bar */}
      <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 gap-3 text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Bharat Properties Pvt. Ltd. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-primary-500 transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/refund" className="hover:text-primary-500 transition-colors">Refunds</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-primary-500 transition-colors">Support</Link>
        </div>
      </div>
    </footer>
  )
}
