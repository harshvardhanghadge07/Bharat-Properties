import { motion } from 'framer-motion'

import LegalNav from '../components/ui/LegalNav'

const SECTIONS = [
  {
    title: '1. Free Listings',
    body: `Property listings are free. No payment is required to publish or maintain a listing.`,
  },
  {
    title: '2. Removing a Listing',
    body: `You can edit or delete your listings from My Listings at any time, without a cancellation fee.`,
  },
  {
    title: '3. Previous Payments',
    body: `For questions or refund requests about a previous payment, contact bharatestates3@gmail.com with your registered email address and payment reference. Previous payments remain subject to the policy applicable at the time of purchase.`,
  },
]

export default function Refund() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <LegalNav />
      <div className="max-w-3xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
          <p className="text-sm text-gray-400 mb-6">Last updated: September 2026</p>



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
