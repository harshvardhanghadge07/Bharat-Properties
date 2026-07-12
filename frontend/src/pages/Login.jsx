import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { authApi } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

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
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to Bharat Properties</p>
        </div>

        <EmailLoginForm redirect={redirect} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 font-medium hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ───────────────── Email Login Flow ─────────────────
function EmailLoginForm({ redirect }) {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendState, setResendState] = useState('idle') // idle | sending | sent
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'ADMIN' ? '/admin' : redirect)
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
        setResendState('idle')
      } else {
        setError(err.error || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendState('sending')
    try {
      await authApi.resendVerification(form.email.trim().toLowerCase())
      setResendState('sent')
    } catch {
      setResendState('idle')
    }
  }

  if (needsVerification) {
    return (
      <div className="text-center py-4">
        <Mail size={40} className="text-primary-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Please verify your email</h2>
        <p className="text-gray-500 text-sm mb-6">
          Check <b>{form.email}</b> for the verification link, then come back and sign in.
        </p>
        {resendState === 'sent' ? (
          <p className="text-green-600 text-sm font-medium mb-4">Verification email sent — check your inbox.</p>
        ) : (
          <button onClick={handleResend} disabled={resendState === 'sending'}
            className="text-sm text-primary-500 font-medium hover:underline mb-4 block mx-auto">
            {resendState === 'sending' ? 'Sending…' : "Didn't get it? Resend the link"}
          </button>
        )}
        <button onClick={() => setNeedsVerification(false)} className="text-sm text-gray-500 hover:underline">
          ← Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
          className="input-field" placeholder="you@example.com" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Link to="/forgot-password" className="text-xs text-primary-500 font-medium hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} required value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            className="input-field pr-10" placeholder="••••••••" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
