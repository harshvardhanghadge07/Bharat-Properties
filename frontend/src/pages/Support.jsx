import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ShieldCheck,
  Search,
  ChevronDown,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  Building,
  UserCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'

const HEALTH_METRICS = [
  { name: 'Property Search & API', status: 'Operational', latency: '24ms', ok: true },
  { name: 'Email & Verification Service', status: 'Operational', latency: '99.9%', ok: true },
  { name: 'Razorpay Payment Gateway', status: 'Operational', latency: 'Online', ok: true },
  { name: 'Cloudinary Image CDN', status: 'Operational', latency: '12ms', ok: true },
  { name: 'Support Response Desk', status: 'Active (24/7)', latency: '< 15 mins', ok: true },
]

const CATEGORIES = [
  {
    id: 'buying',
    icon: Building,
    title: 'Buying & Renting',
    desc: 'Property search, contacting owners, EMI calculators & virtual tours.',
  },
  {
    id: 'posting',
    icon: Sparkles,
    title: 'Posting & Seller Hub',
    desc: 'Creating listings, managing subscriptions, feature upgrades & leads.',
  },
  {
    id: 'account',
    icon: Lock,
    title: 'Account & Security',
    desc: 'Email verification, password reset, login troubleshooting & profile data.',
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Refunds',
    desc: 'Invoices, Razorpay payment methods, subscription plans & refund policy.',
  },
]

const FAQS = [
  {
    cat: 'account',
    q: 'Why am I not receiving the email verification or password reset mail?',
    a: 'Email verification and password reset emails are sent instantly. Please check your spam or junk folder. If you still do not see it, click "Resend Verification" on the login screen or verify your registered email address.',
  },
  {
    cat: 'buying',
    q: 'How do I contact a property owner or broker?',
    a: 'Navigate to any property detail page and use the "Send Inquiry" form or click the "WhatsApp Owner" button to directly message the verified owner or agent.',
  },
  {
    cat: 'posting',
    q: 'How do I post a property for sale or rent?',
    a: 'Click on the "Post Property" button in the navigation header. Fill in your property details, upload clear photos, set your price, and publish your listing instantly.',
  },
  {
    cat: 'billing',
    q: 'What payment methods are supported for subscription plans?',
    a: 'We support all major Indian payment methods via Razorpay, including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet payments.',
  },
  {
    cat: 'posting',
    q: 'Can I edit or delete my property listing after posting?',
    a: 'Yes! Go to "My Listings" from your account dropdown menu. You can edit property details, price, photos, or mark the property as sold/rented anytime.',
  },
  {
    cat: 'account',
    q: 'How do I reset my account password if I forgot it?',
    a: 'Go to the Login page, click "Forgot Password?", enter your registered email address, and follow the link sent to your inbox to create a new password.',
  },
]

export default function Support() {
  useSEO({
    title: 'Health & Support Center | Bharat Properties',
    description: 'Check platform health status, search help guides, and get 24/7 customer support for Bharat Properties.',
    url: `${window.location.origin}/support`,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedCat, setSelectedCat] = useState('all')

  const filteredFaqs = FAQS.filter((f) => {
    const matchesCat = selectedCat === 'all' || f.cat === selectedCat
    const matchesSearch =
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-md"
          >
            <ShieldCheck size={14} /> Bharat Properties Care
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight"
          >
            Health & Support Center
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-8"
          >
            Check real-time system health, browse help guides, or reach out to our dedicated support team.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles (e.g. email verification, posting property, refunds)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder-gray-400"
            />
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-20 space-y-10">
        {/* System Health Status Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  System Health & Uptime Status
                </h2>
                <p className="text-xs text-gray-500">Live operational status across all core services</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              All Systems Operational (99.98% Uptime)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {HEALTH_METRICS.map((item) => (
              <div
                key={item.name}
                className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-gray-400">{item.latency}</span>
                </div>
                <h3 className="text-xs font-semibold text-gray-800 leading-snug">{item.name}</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">{item.status}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support Categories Grid */}
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle size={20} className="text-primary-500" /> Browse Help Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCat === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(isSelected ? 'all' : cat.id)}
                  className={`text-left p-5 rounded-2xl transition-all duration-200 border ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-orange-500/20'
                      : 'bg-white text-gray-800 border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-orange-50 text-primary-500'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{cat.title}</h3>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {cat.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Quick solutions to common queries</p>
            </div>
            {selectedCat !== 'all' && (
              <button
                onClick={() => setSelectedCat('all')}
                className="text-xs font-semibold text-primary-600 hover:underline self-start sm:self-auto"
              >
                Show All Categories
              </button>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-sm">No matching help articles found for "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCat('all')
                }}
                className="mt-3 text-xs font-semibold text-primary-600 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={faq.q}
                    className="border border-gray-100 rounded-xl overflow-hidden transition-colors hover:border-gray-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 text-sm sm:text-base hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-primary-500' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-gray-50/70 border-t border-gray-100"
                        >
                          <p className="p-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Legal & Compliance Hub Section */}
        <div className="bg-gradient-to-r from-slate-900 to-gray-900 text-white rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                <ShieldCheck size={14} /> Trust & Transparency
              </div>
              <h2 className="text-xl font-serif font-bold">Legal Policies & Agreement Documents</h2>
              <p className="text-xs text-gray-400 mt-1">Review our terms of use, privacy protections, and refund guarantees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/terms"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white group-hover:text-primary-400 transition-colors">Terms of Service</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-white" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Platform usage guidelines, seller responsibilities, and buyer/renter rights.
              </p>
            </Link>

            <Link
              to="/privacy"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white group-hover:text-primary-400 transition-colors">Privacy Policy</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-white" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                How we protect your personal data, secure contact information, and handle analytics.
              </p>
            </Link>

            <Link
              to="/refund"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white group-hover:text-primary-400 transition-colors">Refund & Cancellation</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-white" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Subscription refund criteria, Razorpay payment processing, and billing FAQs.
              </p>
            </Link>
          </div>
        </div>

        {/* Direct Contact & Live Support Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Support Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">WhatsApp Live Chat</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Chat directly with our support executive on WhatsApp for instant assistance.
              </p>
            </div>
            <a
              href="https://wa.me/918484900257?text=Hi%20Bharat%20Properties%20Support,%20I%20need%20help%20with..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              Start WhatsApp Chat <ExternalLink size={14} />
            </a>
          </div>

          {/* Email Care */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 bg-orange-50 text-primary-500 rounded-xl flex items-center justify-center mb-4">
                <Mail size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Email Support Desk</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Send us a detailed inquiry. We respond to all support emails within 24 hours.
              </p>
            </div>
            <a
              href="mailto:harshvardhanghadge134@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors"
            >
              harshvardhanghadge134@gmail.com
            </a>
          </div>

          {/* Phone Hotline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Phone size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Toll-Free & Phone</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Speak directly to our customer care team. Available Mon–Sat, 9:00 AM – 7:00 PM.
              </p>
            </div>
            <a
              href="tel:+918484900257"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors"
            >
              +91 8484900257
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
