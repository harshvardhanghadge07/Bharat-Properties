import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function GoogleAuthButton({ redirect = '/' }) {
  const { googleLogin } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      if (!credentialResponse.credential) {
        throw new Error('Google credential not received')
      }
      const user = await googleLogin(credentialResponse.credential)
      navigate(user.role === 'ADMIN' ? '/admin' : redirect)
    } catch (err) {
      setError(err.error || err.message || 'Google Sign-In failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      {error && <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs text-center border border-red-200">{error}</div>}
      <div className="flex justify-center w-full min-h-[40px]">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google Sign-In was cancelled or failed.')}
          useOneTap={false}
          shape="rectangular"
          theme="outline"
          size="large"
          width="320"
        />
      </div>
      {loading && <p className="text-center text-xs text-gray-500">Signing in with Google…</p>}
    </div>
  )
}
