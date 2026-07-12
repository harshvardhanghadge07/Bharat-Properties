import Subscription from '../models/Subscription.js'
import User from '../models/User.js'
import { PLANS } from '../config/plans.js'
import { createOrder, verifySignature, verifyWebhookSignature } from '../services/razorpay.js'

// Get or create subscription for logged-in user
export const getMySubscription = async (req, res, next) => {
  try {
    let sub = await Subscription.findOne({ user: req.user._id })
    if (!sub) {
      sub = await Subscription.create({
        user: req.user._id,
        plan: 'FREE',
        listingLimit: PLANS.FREE.listingLimit,
        status: 'ACTIVE',
      })
    }
    // Attach the current plan's photo-per-listing limit (derived, not stored on the doc)
    const photoLimit = (PLANS[sub.plan] || PLANS.FREE).photoLimit
    res.json({ ...sub.toObject(), photoLimit })
  } catch (err) { next(err) }
}

// List all plans
export const getPlans = (req, res) => {
  res.json(Object.values(PLANS))
}

// Step 1: Create Razorpay order for a plan
export const createSubscriptionOrder = async (req, res, next) => {
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan || plan.price === 0) {
      return res.status(400).json({ error: 'Invalid plan selected' })
    }

    // notes travel with the order/payment on Razorpay's side — the webhook uses these
    // to know which user + plan a payment belongs to, without depending on the browser.
    const order = await createOrder(
      plan.price,
      `sub_${req.user._id}_${Date.now()}`,
      { userId: req.user._id.toString(), planId: plan.id }
    )

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
    })
  } catch (err) { next(err) }
}

// Shared activation logic — called from the browser-side /verify flow, the
// server-side Razorpay webhook, AND manual admin grants, so a subscription
// can activate through any of those paths with identical resulting state.
const activateSubscription = async ({
  userId, planId, razorpayOrderId, razorpayPaymentId, razorpaySignature,
  source = 'RAZORPAY', note = null,
}) => {
  const plan = PLANS[planId]
  if (!plan) throw new Error(`Unknown plan: ${planId}`)

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + plan.duration)

  let sub = await Subscription.findOne({ user: userId })
  if (!sub) sub = new Subscription({ user: userId })

  // Idempotency guard: if this exact payment was already recorded (e.g. both the
  // browser's /verify call AND the webhook fired for the same payment), don't double-apply it.
  const alreadyProcessed = sub.history.some((h) => h.paymentId === razorpayPaymentId)
  if (alreadyProcessed) return sub

  sub.plan = plan.id
  sub.listingLimit = plan.listingLimit
  sub.status = 'ACTIVE'
  sub.amount = plan.price
  sub.startDate = new Date()
  sub.expiryDate = expiryDate
  sub.razorpayOrderId = razorpayOrderId
  sub.razorpayPaymentId = razorpayPaymentId
  if (razorpaySignature) sub.razorpaySignature = razorpaySignature
  sub.history.push({
    plan: plan.id,
    amount: plan.price,
    paymentId: razorpayPaymentId,
    orderId: razorpayOrderId,
    source,
    note,
  })

  await sub.save()
  return sub
}

// Step 2: Verify payment & activate subscription (browser-side, immediately after checkout)
export const verifyAndActivate = async (req, res, next) => {
  try {
    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!valid) return res.status(400).json({ error: 'Payment verification failed' })

    const sub = await activateSubscription({
      userId: req.user._id,
      planId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    })

    res.json({ message: 'Subscription activated successfully', subscription: sub })
  } catch (err) { next(err) }
}

// Razorpay webhook — server-to-server backup confirmation, independent of the user's browser.
// Configure this URL in Razorpay Dashboard → Settings → Webhooks, subscribed to "payment.captured".
// IMPORTANT: this route must receive the RAW request body (see index.js), not JSON-parsed,
// or signature verification will always fail.
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const valid = verifyWebhookSignature(req.body, signature) // req.body is a raw Buffer here
    if (!valid) {
      console.warn('⚠️  Razorpay webhook: invalid signature — request ignored')
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const payload = JSON.parse(req.body.toString('utf8'))

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity
      const { userId, planId } = payment.notes || {}

      if (!userId || !planId) {
        console.warn('⚠️  Razorpay webhook: payment.captured with no userId/planId in notes — skipping', payment.id)
        return res.json({ received: true, skipped: true })
      }

      await activateSubscription({
        userId,
        planId,
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        razorpaySignature: null, // webhook doesn't carry the checkout signature, that's fine
      })
      console.log(`✅ Webhook activated subscription: user ${userId} → ${planId}`)
    }

    // Always 200 quickly so Razorpay doesn't retry unnecessarily for events we don't act on
    res.json({ received: true })
  } catch (err) {
    console.error('Razorpay webhook error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// Admin: get all subscriptions
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subs = await Subscription.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(subs)
  } catch (err) { next(err) }
}

// Admin: manually grant a plan outside of Razorpay — e.g. the seller paid via
// UPI/bank transfer and you've verified it yourself. Goes through the exact
// same activateSubscription() as a real payment, so listing limits, photo
// limits, and expiry all behave identically; only the `source`/`note` on the
// history entry mark it as manually granted.
export const manualActivateSubscription = async (req, res, next) => {
  try {
    const { email, planId, note } = req.body
    if (!email || !planId) return res.status(400).json({ error: 'email and planId are required' })
    if (!PLANS[planId] || PLANS[planId].price === 0) {
      return res.status(400).json({ error: 'planId must be a paid plan (STANDARD or UNLIMITED)' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) return res.status(404).json({ error: 'No user found with that email' })

    const stamp = Date.now()
    const sub = await activateSubscription({
      userId: user._id,
      planId,
      razorpayOrderId: `MANUAL-ORDER-${stamp}`,
      razorpayPaymentId: `MANUAL-${stamp}`,
      source: 'MANUAL',
      note: note?.trim() || `Manually granted by ${req.user.email || req.user.name}`,
    })

    res.json({ message: `${planId} plan granted to ${user.email}`, subscription: sub })
  } catch (err) { next(err) }
}

// Admin: revert a subscription back to Free — e.g. to undo a mistaken manual
// grant, or end a promotional plan early.
export const revertToFree = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.params.userId })
    if (!sub) return res.status(404).json({ error: 'Subscription not found' })

    sub.plan = 'FREE'
    sub.listingLimit = PLANS.FREE.listingLimit
    sub.status = 'ACTIVE'
    sub.amount = 0
    sub.expiryDate = null
    await sub.save()

    res.json({ message: 'Reverted to Free plan', subscription: sub })
  } catch (err) { next(err) }
}
