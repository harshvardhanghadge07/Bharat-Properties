import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, ShieldCheck, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('bp_cookie_consent')
    if (!consent) {
      // Small delay for smooth entry after initial render
      const timer = setTimeout(() => setIsVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('bp_cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('bp_cookie_consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9999]"
        >
          <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl p-5 md:p-6 text-gray-800 relative overflow-hidden">
            {/* Ambient accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-primary-600" />

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl flex-shrink-0 mt-0.5">
                <Cookie className="w-6 h-6 animate-bounce" style={{ animationDuration: '2.5s' }} />
              </div>

              <div className="flex-1 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-base mb-1">
                  <span>We value your privacy</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline-block" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
                  Bharat Properties uses cookies and similar technologies to enhance your browsing experience, deliver personalized property recommendations, and analyze traffic.{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-700 underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="btn-primary py-2.5 px-5 text-sm rounded-xl justify-center font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all"
                  >
                    Allow All Cookies
                  </button>

                  <button
                    onClick={handleDecline}
                    className="py-2.5 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
                  >
                    Essential Only
                  </button>
                </div>
              </div>

              <button
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close cookie consent banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
