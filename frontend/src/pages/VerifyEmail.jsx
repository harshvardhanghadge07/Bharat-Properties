import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2 } from 'lucide-react'

export default function VerifyEmail() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

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
        <div className="space-y-4">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Email Verification Not Required</h1>
          <p className="text-sm text-gray-600">
            Email verification is no longer required on Bharat Properties. Redirecting you to home page…
          </p>
          <Link to="/" className="btn-primary inline-flex justify-center py-2.5 px-6 mt-2">
            Go to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
