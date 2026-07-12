import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { subscriptionApi } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'

const ICONS = { FREE: Gift, STANDARD: Zap, UNLIMITED: Crown }
const COLORS = {
  FREE:      { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  STANDARD:  { bg: 'bg-blue-50',  text: 'text-blue-600',  border: 'border-blue-200' },
  UNLIMITED: { bg: 'bg-primary-50', text: 'text-primary-500', border: 'border-primary-400' },
}

export default function Pricing() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loadingPlan, setLoadingPlan] = useState(null)

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: subscriptionApi.getPlans })
  const { data: mySub }  = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMine,
    enabled: isAuthenticated,
  })

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) return navigate('/login?redirect=/pricing')
    if (planId === 'FREE') return navigate('/post-property')

    setLoadingPlan(planId)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway'); return }

      const order = await subscriptionApi.createOrder(planId)

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Bharat Properties',
        description: `${order.plan.name} Subscription`,
        order_id: order.orderId,
        handler: async (response) => {
          await subscriptionApi.verify({
            planId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          qc.invalidateQueries(['my-subscription'])
          alert('🎉 Subscription activated successfully!')
          navigate('/post-property')
        },
        theme: { color: '#E8532A' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert(err.error || 'Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-center">
        <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
          Simple, Transparent Pricing
        </motion.h1>
        <p className="text-gray-400 max-w-xl mx-auto px-4">
          Start free with 2 listings. Upgrade anytime as your portfolio grows.
        </p>
      </div>

      {/* Current plan banner */}
      {isAuthenticated && mySub && (
        <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500">Your current plan</p>
              <p className="font-bold text-gray-900">{mySub.plan} — {mySub.listingsUsed}/{mySub.listingLimit === 999999 ? '∞' : mySub.listingLimit} listings used</p>
            </div>
            {mySub.expiryDate && (
              <p className="text-xs text-gray-500">
                Renews/Expires: {new Date(mySub.expiryDate).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan, i) => {
          const Icon = ICONS[plan.id]
          const c = COLORS[plan.id]
          const isPopular = plan.id === 'STANDARD'
          const isCurrent = mySub?.plan === plan.id

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity:0, y:30 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 border-2 ${isPopular ? 'border-primary-400 shadow-xl scale-105' : c.border} ${isCurrent ? 'ring-2 ring-green-400' : ''}`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  CURRENT PLAN
                </span>
              )}

              <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} className={c.text} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                </span>
                {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
              </div>

              <p className="text-sm text-gray-500 mb-6">
                {plan.listingLimit === 999999 ? 'Unlimited' : plan.listingLimit} property listings
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className={`${c.text} shrink-0 mt-0.5`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loadingPlan === plan.id}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isCurrent
                    ? 'bg-green-50 text-green-600 cursor-default'
                    : isPopular
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isCurrent ? 'Active Plan' : loadingPlan === plan.id ? 'Processing...' : plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What happens when my free listings run out?', a: 'You\'ll need to upgrade to Standard or Unlimited plan to add more properties. Your existing 2 free listings stay live.' },
            { q: 'Can I cancel anytime?', a: 'Yes, subscriptions are monthly with no long-term commitment. Your plan remains active until the billing period ends.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.' },
            { q: 'Do unused listings roll over?', a: 'No, listing limits reset each billing cycle based on your active plan.' },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">{item.q}</p>
              <p className="text-gray-500 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
