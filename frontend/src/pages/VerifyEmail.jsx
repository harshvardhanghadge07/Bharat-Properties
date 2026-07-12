import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user: updated } = await authApi.verifyEmail(token)
        if (cancelled) return
        // Refresh the logged-in user's state if this is their own account
        if (isAuthenticated) useAuthStore.setState({ user: updated })
        setStatus('success')
        setTimeout(() => navigate(isAuthenticated ? '/profile' : '/login'), 2000)
      } catch (err) {
        if (cancelled) return
        setError(err.error || 'This verification link is invalid or has expired.')
        setStatus('error')
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} className="text-white" />
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 size={32} className="animate-spin text-primary-500 mx-auto" />
            <p className="text-sm text-gray-600">Verifying your email…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Email Verified!</h1>
            <p className="text-sm text-gray-600">Your email has been confirmed. Redirecting you now…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={28} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Verification Failed</h1>
            <p className="text-sm text-gray-600">{error}</p>
            <Link to={isAuthenticated ? '/profile' : '/login'} className="btn-primary inline-flex justify-center py-2.5 px-6 mt-2">
              {isAuthenticated ? 'Go to Profile' : 'Go to Login'}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
