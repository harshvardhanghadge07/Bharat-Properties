import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Eye, EyeOff, MailCheck } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { authApi } from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Bharat Properties today</p>
        </div>

        <EmailRegisterForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

function CheckYourEmail({ email }) {
  const [resendState, setResendState] = useState('idle') // idle | sending | sent

  const handleResend = async () => {
    setResendState('sending')
    try {
      await authApi.resendVerification(email)
      setResendState('sent')
    } catch {
      setResendState('idle')
    }
  }

  return (
    <div className="text-center py-4">
      <MailCheck size={48} className="text-primary-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
      <p className="text-gray-500 text-sm mb-6">
        We've sent a verification link to <b>{email}</b>. Click it to activate your account, then sign in.
      </p>
      {resendState === 'sent' ? (
        <p className="text-green-600 text-sm font-medium">Verification email sent again — check your inbox.</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={resendState === 'sending'}
          className="text-sm text-primary-500 font-medium hover:underline"
        >
          {resendState === 'sending' ? 'Sending…' : "Didn't get it? Resend the link"}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Email Registration Form
// ─────────────────────────────────────────────────────
// Same rules as the backend (backend/src/models/User.js) — kept in sync so
// obviously-fake input is caught instantly instead of round-tripping to the server.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const normalizePhone = (v) => v.trim().replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '')

function EmailRegisterForm() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(null) // email string once shown
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!EMAIL_RE.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    const phone = form.phone.trim()
    if (phone && !PHONE_RE.test(normalizePhone(phone))) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    try {
      const email = form.email.trim().toLowerCase()
      const result = await register({ ...form, email, phone: phone || undefined })
      if (result.requiresVerification) {
        setPendingVerification(email)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return <CheckYourEmail email={pendingVerification} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {[
        { key: 'name',     label: 'Full Name *',   type: 'text',     placeholder: 'Your Name' },
        { key: 'email',    label: 'Email *',        type: 'email',    placeholder: 'Your Email' },
        { key: 'phone',    label: 'Mobile Number',  type: 'tel',      placeholder: '+91 xxxxxxxxxx' },
      ].map(({ key, label, type, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            required={key !== 'phone'}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="input-field"
            placeholder={placeholder}
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field pr-10"
            placeholder="Min. 6 characters"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
