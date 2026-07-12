import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  plan: {
    type: String,
    enum: ['FREE', 'STANDARD', 'UNLIMITED'],
    default: 'FREE',
  },

  // Listing limits
  listingLimit: { type: Number, default: 2 },   // FREE = 2, STANDARD = 20, UNLIMITED = 999999
  listingsUsed: { type: Number, default: 0 },

  // Billing
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIAL'],
    default: 'TRIAL',
  },
  amount:      { type: Number, default: 0 },
  startDate:   { type: Date, default: Date.now },
  expiryDate:  { type: Date, default: null },

  // Razorpay tracking
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  // Payment history
  history: [{
    plan:      String,
    amount:    Number,
    paymentId: String,
    orderId:   String,
    date:      { type: Date, default: Date.now },
    // Where this activation came from — lets admins tell manually-granted
    // access apart from real Razorpay payments in the subscriptions list.
    source:    { type: String, enum: ['RAZORPAY', 'MANUAL'], default: 'RAZORPAY' },
    note:      { type: String, default: null }, // e.g. "Paid via UPI, ref #1234 — granted by admin@..."
  }],
}, { timestamps: true })

// Auto-expire check
subscriptionSchema.methods.isActive = function () {
  if (this.plan === 'FREE') return true
  if (!this.expiryDate) return false
  return this.status === 'ACTIVE' && new Date() < this.expiryDate
}

subscriptionSchema.methods.canAddListing = function () {
  if (this.plan === 'UNLIMITED' && this.isActive()) return true
  return this.listingsUsed < this.listingLimit
}

export default mongoose.model('Subscription', subscriptionSchema)
