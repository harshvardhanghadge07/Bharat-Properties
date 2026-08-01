import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Crown, Upload, X, Loader2, ImagePlus } from 'lucide-react'
import { propertyApi, subscriptionApi, uploadApi, authApi } from '../services/api'
import { PROPERTY_TYPES, TYPE_LABELS } from '../utils/helpers'
import { ALL_STATES, getCitiesByState } from '../utils/indiaData'
import { useAuthStore } from '../store/useAuthStore'

const EMPTY = {
  title:'', description:'', price:'', type:'APARTMENT',
  location:'', city:'', state:'', pincode:'', bedrooms:'', bathrooms:'',
  areaSqft:'', images:[], amenities:[],
}

export default function PostProperty() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { isAuthenticated, user } = useAuthStore()
  const [form, setForm] = useState(EMPTY)
  const [amenityInput, setAmenityInput] = useState('')
  const [success, setSuccess] = useState(false)
  const [limitError, setLimitError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { data: mySub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMine,
    enabled: isAuthenticated,
  })

  // In edit mode, load the existing property so the form can be pre-filled
  const { data: existingProperty, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getOne(id),
    enabled: isEditMode && isAuthenticated,
  })

  useEffect(() => {
    if (!existingProperty) return
    setForm({
      title: existingProperty.title || '',
      description: existingProperty.description || '',
      price: existingProperty.price ?? '',
      type: existingProperty.type || 'APARTMENT',
      location: existingProperty.location || '',
      city: existingProperty.city || '',
      state: existingProperty.state || '',
      pincode: existingProperty.pincode || '',
      bedrooms: existingProperty.bedrooms ?? '',
      bathrooms: existingProperty.bathrooms ?? '',
      areaSqft: existingProperty.areaSqft ?? '',
      images: existingProperty.images || [],
      amenities: existingProperty.amenities || [],
    })
  }, [existingProperty])
const createMut = useMutation({
    mutationFn: (data) => propertyApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['my-properties'])
      qc.invalidateQueries(['my-subscription'])
      setSuccess(true)
    },
    onError: (err) => {
      if (err.upgradeRequired) setLimitError(err)
      else alert(err.error || 'Failed to create listing')
    },
  })
  

  const updateMut = useMutation({
    mutationFn: (data) => propertyApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['my-properties'])
      qc.invalidateQueries(['property', id])
      setSuccess(true)
    },
    onError: (err) => alert(err.error || 'Failed to update listing'),
  })

  if (!isAuthenticated) {
    return (
      <div className="pt-32 text-center pb-20">
        <p className="text-gray-500 mb-4">Please login to {isEditMode ? 'edit this' : 'post a'} property</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    )
  }

  // Only the owner (or an admin) may edit a listing
  if (isEditMode && existingProperty && user?.role !== 'ADMIN' && existingProperty.owner !== user?.id && existingProperty.owner?.id !== user?.id) {
    return (
      <div className="pt-32 text-center pb-20">
        <AlertCircle size={48} className="text-primary-500 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">You're not authorized to edit this listing.</p>
        <Link to="/my-listings" className="btn-primary">Back to My Listings</Link>
      </div>
    )
  }

  if (isEditMode && loadingProperty) {
    return <div className="pt-32 text-center pb-20 text-gray-500">Loading listing…</div>
  }

  if (success) {
    return (
      <div className="pt-32 pb-20 text-center max-w-md mx-auto px-4">
        <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{isEditMode ? 'Property Updated!' : 'Property Listed!'}</h2>
        <p className="text-gray-500 mb-6">
          {isEditMode ? 'Your changes have been saved.' : 'Your property is now live on Bharat Properties.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/my-listings" className="btn-outline">My Listings</Link>
          {isEditMode ? (
            <Link to={`/properties/${id}`} className="btn-primary">View Listing</Link>
          ) : (
            <button onClick={() => { setSuccess(false); setForm(EMPTY) }} className="btn-primary">Add Another</button>
          )}
        </div>
      </div>
    )
  }

  if (limitError) {
    return (
      <div className="pt-32 pb-20 text-center max-w-md mx-auto px-4">
        <AlertCircle size={64} className="text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Limit Reached</h2>
        <p className="text-gray-500 mb-2">
          You've used {limitError.used}/{limitError.limit} listings on the <b>{limitError.currentPlan}</b> plan.
        </p>
        <p className="text-gray-500 mb-6">Upgrade your plan to list more properties.</p>
        <Link to="/pricing" className="btn-primary inline-flex items-center gap-2">
          <Crown size={16} /> View Plans
        </Link>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: parseFloat(form.price),
      areaSqft: parseFloat(form.areaSqft),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
    }
    if (isEditMode) updateMut.mutate(payload)
    else createMut.mutate(payload)
  }

  const addAmenity = () => {
    if (amenityInput.trim()) { setForm((f) => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] })); setAmenityInput('') }
  }
  const removeAmenity = (i) => setForm((f) => ({ ...f, amenities: f.amenities.filter((_,j) => j!==i) }))

  // Upload selected photo files to the server (Cloudinary) immediately, then store the
  // returned URLs — so by the time the form is submitted, `form.images` already has real URLs.
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (form.images.length + files.length > photoLimit) {
      setUploadError(`Your ${mySub?.plan || 'current'} plan allows up to ${photoLimit} photos per listing. Upgrade to add more.`)
      return
    }

    setUploadError('')
    setUploading(true)
    try {
      const { urls } = await uploadApi.images(files)
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } catch (err) {
      setUploadError(err.error || 'Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file(s) again if needed
    }
  }

  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const inp = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    className: 'input-field',
  })

  const cityOptions = form.state ? getCitiesByState(form.state) : []
  const photoLimit = mySub?.photoLimit || 5 // default to FREE tier limit until subscription loads

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Your Property' : 'Post Your Property'}</h1>
          <p className="text-gray-500 text-sm">
            {isEditMode ? 'Update your listing details below' : 'Fill in the details to list your property on Bharat Properties'}
          </p>
        </div>

        {/* Usage banner */}
        {mySub && (
          <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Plan: <span className="font-semibold text-gray-800">{mySub.plan}</span></p>
              <p className="text-sm text-gray-700">
                {mySub.listingsUsed} / {mySub.listingLimit === 999999 ? '∞' : mySub.listingLimit} listings used
              </p>
            </div>
            {mySub.plan === 'FREE' && (
              <Link to="/pricing" className="text-xs text-primary-500 font-semibold hover:underline">Upgrade →</Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input {...inp('title')} required placeholder="e.g. 3BHK Flat in Andheri West" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea {...inp('description')} required rows={4} className="input-field resize-none" placeholder="Describe your property..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input {...inp('price')} type="number" required placeholder="5000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq.ft) *</label>
              <input {...inp('areaSqft')} type="number" required placeholder="1200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...inp('type')} required>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input {...inp('bedrooms')} type="number" placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input {...inp('bathrooms')} type="number" placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input {...inp('pincode')} placeholder="400001" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Locality *</label>
            <input {...inp('location')} required placeholder="Andheri West, Mumbai" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, city: '' }))}
                required className="input-field"
              >
                <option value="">Select State</option>
                {ALL_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select {...inp('city')} required disabled={!form.state} className="input-field disabled:bg-gray-50">
                <option value="">{form.state ? 'Select City' : 'Select State First'}</option>
                {cityOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Photos {form.images.length > 0 && <span className="text-gray-400 font-normal">({form.images.length}/{photoLimit})</span>}
            </label>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-2">{uploadError}</div>
            )}

            {/* Thumbnail previews */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {form.images.map((url, idx) => (
                  <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} alt={`Property photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload dropzone */}
            {form.images.length < photoLimit && (
              <label
                htmlFor="photo-upload"
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors ${
                  uploading ? 'border-gray-200 bg-gray-50 cursor-wait' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={22} className="text-primary-500 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading photos…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus size={22} className="text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">Click to upload photos</span>
                    <span className="text-xs text-gray-400">JPG, PNG — up to 10MB each, max {photoLimit} photos on your {mySub?.plan || 'Free'} plan</span>
                  </>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="flex gap-2 mb-2">
              <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => e.key==='Enter' && (e.preventDefault(), addAmenity())}
                className="input-field flex-1" placeholder="e.g. Swimming Pool" />
              <button type="button" onClick={addAmenity} className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.amenities.map((a,i) => (
                <span key={i} className="tag">{a} <button type="button" onClick={() => removeAmenity(i)} className="ml-1 text-gray-400">×</button></span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={createMut.isPending || updateMut.isPending || uploading} className="btn-primary w-full justify-center py-3">
            {createMut.isPending || updateMut.isPending
              ? (isEditMode ? 'Saving...' : 'Submitting...')
              : uploading ? 'Uploading photos…' : (isEditMode ? 'Save Changes' : 'List Property')}
          </button>
        </form>
      </div>
    </div>
  )
}
