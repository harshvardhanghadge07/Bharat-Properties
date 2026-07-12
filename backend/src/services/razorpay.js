import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const createOrder = async (amount, receipt, notes = {}) => {
  // amount in paise (₹1 = 100 paise)
  // `notes` (e.g. userId, planId) get echoed back on the payment entity in webhook events —
  // this is how we identify which user/plan a webhook payment belongs to, independent of the browser.
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt,
    notes,
  })
  return order
}

export const verifySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expected === signature
}

// Verifies the `X-Razorpay-Signature` header on incoming webhook requests.
// `rawBody` MUST be the exact raw request bytes (not re-serialized JSON), or this will always fail.
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

export default razorpay
