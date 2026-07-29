import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },

  // Email is optional (mobile-only users won't have it)
  email: {
    type: String,
    unique: true,
    sparse: true,   // allows multiple docs with no email without unique conflict
    lowercase: true,
    trim: true,
    set: (v) => {
      if (v === undefined || v === null) return undefined
      const trimmed = String(v).trim().toLowerCase()
      return trimmed === '' ? undefined : trimmed
    },
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
  },

  // Password is optional now — only required for email/password accounts
  password: { type: String, minlength: 6, select: false, default: null },

  // Mobile is optional identity option.
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    set: (v) => {
      if (v === undefined || v === null) return undefined
      const trimmed = String(v).trim()
      if (trimmed === '') return undefined
      return trimmed.replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '')
    },
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
  },
  phoneVerified: { type: Boolean, default: false },

  // Email verification (only relevant for accounts that have an email)
  emailVerified:           { type: Boolean, default: false },
  emailVerificationToken:  { type: String, select: false, default: null },
  emailVerificationExpires:{ type: Date,   select: false, default: null },

  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

  // Saved/favorited property listings
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: [] }],

  // Forgot-password flow
  resetPasswordToken:   { type: String, select: false, default: null },
  resetPasswordExpires: { type: Date,   select: false, default: null },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)
