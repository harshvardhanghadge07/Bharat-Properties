import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Authentication required' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) return res.status(401).json({ error: 'User not found' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Blocks actions that matter (posting a listing) until the account has a
// verified way to be reached. Format/MX checks at signup only catch
// obviously-fake addresses — someone can still type a real person's inbox
// they don't control, or a valid domain they don't actually receive mail
// at. This is the actual backstop: that link/OTP simply never gets used,
// so the account stays unverified and stays blocked from posting.
export const requireVerifiedContact = (req, res, next) => {
  const user = req.user
  if (!user.email && !user.phone) {
    return res.status(403).json({
      error: 'Please add contact information to your profile before posting a listing.',
      code: 'VERIFICATION_REQUIRED',
    })
  }
  next()
}

// Like `authenticate`, but never blocks the request — just attaches req.user
// when a valid token is present. Used on public routes that behave slightly
// differently for a logged-in viewer (e.g. not counting the owner's own visits
// as a "view" on their property).
export const attachUserIfPresent = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return next()

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (user) req.user = user
    next()
  } catch {
    next()
  }
}
