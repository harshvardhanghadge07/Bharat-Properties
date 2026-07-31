import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Save, CheckCircle2, ShieldCheck, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { authApi } from '../services/api'

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  // Resend verification email
  const [resending, setResending] = useState(false)
  const [resent, setResent]       = useState(false)

  // Security section (only shown/required when changing email or password)
  const [showSecurity, setShowSecurity] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', email: user.email || '' })
  }, [user])

  if (!isAuthenticated) return <Navigate to="/login?redirect=/profile" replace />

  const emailChanged = form.email.trim().toLowerCase() !== (user?.email || '').toLowerCase()
  const wantsPasswordChange = newPassword.length > 0

  const handleResendVerification = async () => {
    setResending(true)
    try {
      await authApi.resendVerification()
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (err) {
      setError(err.error || 'Failed to send verification email.')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (wantsPasswordChange) {
      if (newPassword.length < 6) return setError('New password must be at least 6 characters')
      if (newPassword !== confirmPassword) return setError('New passwords do not match')
    }
    if ((emailChanged || wantsPasswordChange) && user?.password !== null && !currentPassword) {
      return setError('Please enter your current password to change email or password')
    }

    setSaving(true)
    try {
      const payload = { name: form.name, phone: form.phone }
      if (emailChanged) payload.email = form.email
      if (wantsPasswordChange) payload.newPassword = newPassword
      if (emailChanged || wantsPasswordChange) payload.currentPassword = currentPassword

      const updated = await authApi.update(payload)
      useAuthStore.setState({ user: updated })
      setSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowSecurity(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.error || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50/50 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage your account details and security</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8"
        >
          {/* Avatar + summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-md shadow-orange-500/20">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {user?.role === 'ADMIN' ? (
                  <><ShieldCheck size={13} className="text-primary-500" /> Administrator</>
                ) : (
                  'Member'
                )}
                {user?.createdAt && ` · Joined ${new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={15} /> Profile updated successfully
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-field pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field pl-10"
                  placeholder="10-digit mobile number"
                />
              </div>
              {user?.phoneVerified && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> Verified
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {emailChanged && (
                <p className="text-xs text-amber-600 mt-1">Changing your email requires your current password below.</p>
              )}
              {!emailChanged && user?.email && (
                user?.emailVerified ? (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 size={12} /> Verified
                  </p>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-amber-600">Not verified yet</p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="text-xs text-primary-500 font-medium hover:underline disabled:opacity-50"
                    >
                      {resending ? 'Sending…' : resent ? 'Sent!' : 'Resend verification email'}
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Security section — expandable, for changing password */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSecurity(!showSecurity)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700"
              >
                <span className="flex items-center gap-2"><Lock size={14} /> Change Password</span>
                <ChevronDown size={14} className={`transition-transform ${showSecurity ? 'rotate-180' : ''}`} />
              </button>

              {showSecurity && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pr-10"
                        placeholder="At least 6 characters"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current password — only required when changing email or password */}
            {(emailChanged || wantsPasswordChange) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm it's you"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Required to confirm changes to email or password.</p>
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3 text-base">
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link to="/my-listings" className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium text-gray-700 hover:border-primary-300 transition-colors flex items-center gap-2 justify-center">
            <Building2 size={16} /> View My Listings
          </Link>
          <Link to="/forgot-password" className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium text-gray-700 hover:border-primary-300 transition-colors flex items-center gap-2 justify-center">
            <ShieldCheck size={16} /> Forgot Password Instead
          </Link>
        </div>
      </div>
    </div>
  )
}
