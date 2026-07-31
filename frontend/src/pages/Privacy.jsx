import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import LegalNav from '../components/ui/LegalNav'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly, such as your name, email, phone number, and password when you register; property details and photos when you create a listing; and messages you send through our inquiry forms. We also automatically collect basic usage data (pages visited, browser type) to help us improve the Platform.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to: create and manage your account; display your listings to potential buyers/renters; process subscription payments via Razorpay; send transactional emails (inquiry notifications, password resets, subscription receipts); and respond to support requests. We do not sell your personal information to third parties.`,
  },
  {
    title: '3. Sharing of Information',
    body: `When you submit an inquiry on a property, your name, email, and phone number are shared with that property's listing owner so they can contact you. Payment information is processed directly by Razorpay under their own privacy and security policies — we do not store your card or UPI details on our servers. We may share information if required by law or to protect the safety and rights of our users.`,
  },
  {
    title: '4. Data Storage & Security',
    body: `Your account password is stored using industry-standard hashing (bcrypt) and is never stored in plain text. Property images are hosted via Cloudinary. We take reasonable technical measures (HTTPS, rate limiting, authentication tokens) to protect your data, but no online service can guarantee absolute security.`,
  },
  {
    title: '5. Cookies & Tracking',
    body: `We use essential cookies/local storage to keep you logged in and remember your session. We do not currently use third-party advertising trackers.`,
  },
  {
    title: '6. Your Rights',
    body: `You can review and update your name, phone number, email, and password at any time from your Profile page. You may request deletion of your account and associated data by contacting us at the email below; we will process such requests within a reasonable timeframe, subject to any legal obligations to retain certain records (e.g. payment history).`,
  },
  {
    title: '7. Children\'s Privacy',
    body: `The Platform is not intended for use by individuals under the age of 18, and we do not knowingly collect personal information from children.`,
  },
  {
    title: '8. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date below.`,
  },
  {
    title: '9. Contact Us',
    body: `For any privacy-related questions or data requests, please contact us at harshvardhanghadge134@gmail.com or +919359854302, or write to us at  Jalna - 431203, Maharashtra, India.`,
  },
]

export default function Privacy() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <LegalNav />
      <div className="max-w-3xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-6">Last updated: July 2026</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex gap-2 text-xs text-amber-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>This is a template Privacy Policy for Bharat Properties and has not been reviewed by a lawyer. Please have it reviewed by a qualified legal professional — including for compliance with India's Digital Personal Data Protection Act — before relying on it for a live, paying-customer business.</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-semibold text-gray-900 mb-1.5">{s.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
