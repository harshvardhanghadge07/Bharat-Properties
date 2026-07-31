import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import LegalNav from '../components/ui/LegalNav'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the Bharat Properties website and services ("Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Platform.`,
  },
  {
    title: '2. Who Can Use the Platform',
    body: `You must be at least 18 years old and capable of entering into a legally binding agreement to create an account, list a property, or make a purchase on the Platform. By registering, you confirm that the information you provide is accurate and current.`,
  },
  {
    title: '3. Property Listings',
    body: `Property owners, agents, and brokers ("Sellers") are solely responsible for the accuracy of the information, photos, and pricing in their listings. Bharat Properties does not independently verify listing details, ownership, or the legal status of any property, and does not act as a real estate broker or agent in any transaction between users. We reserve the right to remove any listing that appears fraudulent, misleading, or in violation of these Terms.`,
  },
  {
    title: '4. Subscription Plans & Payments',
    body: `Bharat Properties offers Free, Premium, and Unlimited Pro subscription plans with different listing limits, photo limits, and visibility features, as described on our Pricing page. Payments are processed securely through Razorpay. Subscription fees are charged in advance for the selected billing period and, unless otherwise stated, are non-refundable except as described in our Refund Policy. Plans automatically expire at the end of the billing period and listings revert to the Free tier limits unless renewed.`,
  },
  {
    title: '5. User Conduct',
    body: `You agree not to: post false, misleading, or duplicate listings; use the Platform for any unlawful purpose; upload content that infringes on the rights of others; attempt to gain unauthorized access to other accounts or our systems; or use automated tools (bots, scrapers) to access the Platform without our written permission.`,
  },
  {
    title: '6. Inquiries & Communication',
    body: `When you submit an inquiry about a listing, your contact details (name, email, phone) are shared with the listing owner so they can respond to you directly. Bharat Properties is not a party to, and holds no responsibility for, any communication, negotiation, or transaction that follows between buyers/renters and sellers/owners.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `Bharat Properties provides the Platform on an "as is" and "as available" basis. We do not guarantee the accuracy of listings, the conduct of users, or the successful completion of any transaction. To the maximum extent permitted by law, Bharat Properties shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.`,
  },
  {
    title: '8. Account Termination',
    body: `We reserve the right to suspend or terminate any account that violates these Terms, posts fraudulent content, or engages in abusive behavior toward other users or our team, without prior notice.`,
  },
  {
    title: '9. Changes to These Terms',
    body: `We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.`,
  },
  {
    title: '10. Contact Us',
    body: `For any questions about these Terms, please reach us at  harshvardhanghadge134@gmail.com  or +919359854302, or write to us at  Jalna - 431203, Maharashtra, India.`,
  },
]

export default function Terms() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <LegalNav />
      <div className="max-w-3xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-6">Last updated: July 2026</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex gap-2 text-xs text-amber-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>This is a template Terms of Service for Bharat Properties and has not been reviewed by a lawyer. Please have it reviewed by a qualified legal professional before relying on it for a live, paying-customer business.</span>
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
