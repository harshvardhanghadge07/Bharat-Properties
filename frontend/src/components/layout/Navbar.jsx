import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, User, LogOut, Building2, LayoutDashboard, Heart, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { getInitials } from '../../utils/helpers'

const navLinks = [
  { label: 'Buy',   href: '/properties?status=ACTIVE' },
  { label: 'Rent',  href: '/properties?status=RENTED' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu]     = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const navigate  = useNavigate()
  const isHome    = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled
  const bg  = transparent ? 'bg-transparent' : 'bg-white shadow-md'
  const txt = transparent ? 'text-white'      : 'text-gray-800'

  const handleLogout = () => { logout(); setUserMenu(false); navigate('/') }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <span className={`font-serif font-bold text-lg leading-none ${txt}`}>Bharat</span>
              <span className="block text-[10px] text-primary-500 font-semibold tracking-widest uppercase leading-none">Properties</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`px-4 py-2 rounded-md text-sm font-medium hover:text-primary-500 transition-colors ${txt}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/post-property" className="btn-primary text-sm py-2 px-4">Post Property</Link>
                <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:shadow-md transition-all"
                >
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/my-listings" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Building2 size={15} /> My Listings
                      </Link>
                      <Link to="/favorites" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Heart size={15} /> My Favorites
                      </Link>
                      <Link to="/terms" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Shield size={15} /> Legal & Policies
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-medium hover:text-primary-500 transition-colors ${txt}`}>Login</Link>
                <Link to="/pricing" className="btn-primary text-sm py-2 px-4">Post Property</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className={`md:hidden ${txt}`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-3 mb-3 bg-primary-50/60 hover:bg-primary-50 rounded-xl border border-primary-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User Profile'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'View account details'}</p>
                  </div>
                  <span className="text-xs text-primary-600 font-semibold bg-white px-2.5 py-1 rounded-md shadow-2xs border border-primary-100 shrink-0">
                    My Profile
                  </span>
                </Link>
              )}

              {navLinks.map((l) => (
                <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  {l.label}
                </Link>
              ))}
              <hr className="my-2" />
              {isAuthenticated ? (
                <>
                  <Link to="/post-property" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center mt-2 mb-3">
                    <Building2 size={16} /> Post Property
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    <User size={18} className="text-primary-500" /> My Profile
                  </Link>
                  <Link to="/my-listings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    <Building2 size={18} className="text-gray-500" /> My Listings
                  </Link>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    <Heart size={18} className="text-gray-500" /> My Favorites
                  </Link>
                  <Link to="/terms" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    <Shield size={18} className="text-gray-500" /> Legal & Policies
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                      <LayoutDashboard size={18} className="text-gray-500" /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-500 font-medium hover:bg-red-50 rounded-lg text-left">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                    <User size={18} className="text-gray-500" /> Login
                  </Link>
                  <Link to="/pricing" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center mt-2">
                    <Building2 size={16} /> Post Property
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
