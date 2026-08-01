import express from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, googleAuth, getMe, updateProfile, forgotPassword, resetPassword, verifyEmail, resendVerification, searchUsers } from '../controllers/authController.js'
import { authenticate, requireAdmin, attachUserIfPresent } from '../middleware/auth.js'

const router = express.Router()

// Prevent abuse of the forgot-password endpoint (email bombing)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,                    // max 5 requests per IP per 15 min
  message: { error: 'Too many password reset requests. Please try again later.' },
})

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many verification requests. Please try again later.' },
})

router.post('/register', register)
router.post('/login',    login)
router.post('/google',   googleAuth)
router.get('/me',        authenticate, getMe)
router.put('/me',        authenticate, updateProfile)

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password',  resetPassword)

router.post('/verify-email',        verifyEmail)
router.post('/resend-verification', attachUserIfPresent, verificationLimiter, resendVerification)

router.get('/admin/search-users', authenticate, requireAdmin, searchUsers)

export default router
