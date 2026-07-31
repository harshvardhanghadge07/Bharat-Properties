import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import LegalNav from '../components/ui/LegalNav'

const SECTIONS = [
  {
    title: '1. Subscription Fees',
    body: `Bharat Properties subscription plans (Premium, Unlimited Pro) are billed in advance for a 30-day period. By subscribing, you authorize us to charge the applicable fee via Razorpay at the time of purchase.`,
  },
  {
    title: '2. General Refund Policy',
    body: `Subscription fees are generally non-refundable once a plan has been activated, since your listing limit, photo limit, and visibility benefits are made available to your account immediately upon successful payment.`,
  },
  {
    title: '3. Exceptions — When a Refund May Be Considered',
    body: `We will consider a full or partial refund in the following situations: (a) you were charged more than once for the same subscription period due to a technical error; (b) a payment was deducted from your account but the subscription was never activated due to a system failure on our end; (c) you cancel within 24 hours of purchase and have not used any of the plan's paid features (e.g. have not exceeded the Free tier's listing/photo limits). Refund requests outside these situations will be reviewed on a case-by-case basis.`,
  },
  {
    title: '4. How to Request a Refund',
    body: `To request a refund, email harshvardhanghadge134@gmail.com  within 7 days of the charge, including your registered email address and the payment ID from your Razorpay receipt. We aim to respond to all refund requests within 5 business days.`,
  },
  {
    title: '5. Refund Processing Time',
    body: `Approved refunds are processed back to your original payment method via Razorpay. Depending on your bank/UPI provider, this can take 5-10 business days to reflect in your account after approval.`,
  },
  {
    title: '6. Plan Downgrades & Cancellations',
    body: `You may choose not to renew your subscription at any time — simply let the current billing period expire. Your account will automatically move to the Free tier limits at the end of the period. Listings that exceed the Free tier's limits will remain saved but may not display publicly until you are back within your plan's limits or upgrade again.`,
  },
  {
    title: '7. Contact Us',
    body: `For any billing or refund questions, reach us at  harshvardhanghadge134@gmail.com  or +919359854302, or write to us at  Jalna - 431203, Maharashtra, India.`,
  },
]

export default function Refund() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <LegalNav />
      <div className="max-w-3xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
          <p className="text-sm text-gray-400 mb-6">Last updated: July 2026</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex gap-2 text-xs text-amber-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>This is a template Refund Policy for Bharat Properties and has not been reviewed by a lawyer. Razorpay requires a published refund policy for live merchant accounts — please have this reviewed by a qualified legal professional before going live.</span>
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
