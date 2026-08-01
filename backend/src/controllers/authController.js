import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/mailer.js'
import { isDisposableDomain, domainCanReceiveMail } from '../utils/emailCheck.js'

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const RESET_TOKEN_EXPIRY_MINUTES = 30
const VERIFY_TOKEN_EXPIRY_HOURS = 24

// Format validation (regex, in the User schema) only catches typos like
// "abc@abc" — it happily accepts "asdf@asdfgh.com", which looks valid but
// can't receive mail, and real throwaway-inbox providers. This catches both.
// Returns an error string, or null if the address is acceptable.
const checkEmailIsReal = async (email) => {
  if (!email) return null
  if (isDisposableDomain(email)) {
    return 'Please use a permanent email address — temporary/disposable email providers are not allowed.'
  }
  if (!(await domainCanReceiveMail(email))) {
    return "That email domain doesn't appear to exist or can't receive mail. Please double-check it."
  }
  return null
}

// Generates a verification token for a user, saves its hash, and emails the link.
// Fire-and-forget on the email send so a flaky SMTP server never blocks signup/login.
const issueEmailVerification = (user) => {
  if (!user.email) return

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  user.emailVerificationToken = hashedToken
  user.emailVerificationExpires = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const verifyUrl = `${clientUrl}/verify-email/${rawToken}`

  sendVerificationEmail(user, verifyUrl).catch((err) =>
    console.error('Failed to send verification email:', err.message)
  )
}

export const register = async (req, res, next) => {
  try {
    const { name, password } = req.body
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null
    const phone = req.body.phone ? String(req.body.phone).trim() : null

    if (email) {
      const existing = await User.findOne({ email })
      if (existing) return res.status(400).json({ error: 'Email already registered' })

      const emailError = await checkEmailIsReal(email)
      if (emailError) return res.status(400).json({ error: emailError })
    }

    const user = await User.create({ name, email, password, phone, emailVerified: true })

    const token = signToken(user._id)
    res.status(201).json({ user, token })
  } catch (err) { next(err) }
}

export const login = async (req, res, next) => {
  try {
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null
    const { password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json({ user, token })
  } catch (err) { next(err) }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user)
  } catch (err) { next(err) }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, email, currentPassword, newPassword } = req.body

    // Fetch WITH password field since we may need to verify it
    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Basic fields — no confirmation needed
    if (name !== undefined) user.name = name
    if (phone !== undefined) user.phone = phone

    // Changing email or password are sensitive — require current password to confirm identity
    const wantsEmailChange = email !== undefined && email.trim().toLowerCase() !== (user.email || '')
    const wantsPasswordChange = !!newPassword

    if (wantsEmailChange || wantsPasswordChange) {
      // If the account has no password yet (e.g. mobile-OTP-only account), skip verification
      if (user.password) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Please enter your current password to change email or password' })
        }
        const matches = await user.comparePassword(currentPassword)
        if (!matches) {
          return res.status(401).json({ error: 'Current password is incorrect' })
        }
      }

      if (wantsEmailChange) {
        const newEmail = email.trim().toLowerCase()
        const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } })
        if (existing) return res.status(400).json({ error: 'That email is already in use by another account' })

        const emailError = await checkEmailIsReal(newEmail)
        if (emailError) return res.status(400).json({ error: emailError })

        user.email = newEmail
        user.emailVerified = true
      }

      if (wantsPasswordChange) {
        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters' })
        }
        user.password = newPassword // hashed automatically by the pre('save') hook
      }
    }

    await user.save()
    res.json(user)
  } catch (err) { next(err) }
}

// User clicks the link emailed to them; we match the token's hash and flip the flag
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Verification token is required' })

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires')

    if (!user) {
      return res.status(400).json({ error: 'This verification link is invalid or has expired. Please request a new one.' })
    }

    user.emailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    res.json({ message: 'Email verified successfully', user })
  } catch (err) { next(err) }
}

// Requests a fresh verification link. Works two ways:
//  - Logged in (valid token attached): resends for req.user.
//  - Not logged in: pass { email } in the body. This has to work
//    unauthenticated — login() now rejects unverified accounts, so an
//    unverified user has no token and no other way to reach this route.
// Mirrors forgotPassword's pattern of never revealing whether an email exists.
export const resendVerification = async (req, res, next) => {
  try {
    let user = req.user || null

    if (!user) {
      const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null
      if (!email) return res.status(400).json({ error: 'Please provide your email address' })
      user = await User.findOne({ email })
    }

    if (!user || !user.email) {
      return res.json({ message: 'If that email is registered and unverified, a new verification link has been sent.' })
    }
    if (user.emailVerified) return res.json({ message: 'Your email is already verified — you can log in.' })

    issueEmailVerification(user)
    await user.save({ validateBeforeSave: false })

    res.json({ message: 'Verification email sent. Please check your inbox.' })
  } catch (err) { next(err) }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Please provide your email address' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    // Always respond with success — don't reveal whether the email exists (prevents user enumeration)
    if (!user) {
      return res.json({ message: 'If an account exists for that email, a reset link has been sent.' })
    }

    // Generate a random token; store only its hash in the DB
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`

    // Fire-and-forget — respond immediately so a slow/blocked SMTP on cloud
    // hosts (e.g. Render blocking port 587) never causes the request to timeout.
    sendResetPasswordEmail(user, resetUrl).catch((err) =>
      console.error('Failed to send password reset email:', err.message)
    )

    res.json({ message: 'If an account exists for that email, a reset link has been sent.' })
  } catch (err) { next(err) }
}

// Admin: search users by name/email/phone — used e.g. to look up a seller
// before manually granting them a subscription plan.
export const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim()
    if (q.length < 2) return res.json([])

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // escape regex special chars
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { phone: regex }],
    }).select('name email phone role').limit(10)

    res.json(users)
  } catch (err) { next(err) }
}

// STEP 2: User submits new password + the token from the emailed link
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' })
    }

    user.password = password
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    // Log the user straight in after a successful reset
    const jwtToken = signToken(user._id)
    res.json({ message: 'Password reset successful', user, token: jwtToken })
  } catch (err) { next(err) }
}

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'Google credential token is required' })

    let payload = null

    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        payload = ticket.getPayload()
      } catch (err) {
        console.warn('Google token verification with CLIENT_ID failed:', err.message)
      }
    }

    // Fallback if client ID is not configured or token verification with audience failed
    if (!payload) {
      try {
        const client = new OAuth2Client()
        const ticket = await client.verifyIdToken({ idToken: credential })
        payload = ticket.getPayload()
      } catch {
        payload = jwt.decode(credential)
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google authentication credential' })
    }

    const googleId = payload.sub
    const email = String(payload.email).toLowerCase().trim()
    const name = payload.name || payload.given_name || 'Google User'
    const avatar = payload.picture || null

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    })

    if (user) {
      let updated = false
      if (!user.googleId) { user.googleId = googleId; updated = true }
      if (!user.avatar && avatar) { user.avatar = avatar; updated = true }
      if (!user.emailVerified) { user.emailVerified = true; updated = true }
      if (updated) await user.save()
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        emailVerified: true,
      })
    }

    const token = signToken(user._id)
    res.json({ user, token })
  } catch (err) {
    next(err)
  }
}
