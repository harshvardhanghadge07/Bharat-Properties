import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Star, Loader2, ImagePlus } from 'lucide-react'
import { propertyApi, uploadApi } from '../../services/api'
import { formatPrice, PROPERTY_TYPES, TYPE_LABELS } from '../../utils/helpers'
import { ALL_STATES, getCitiesByState } from '../../utils/indiaData'
import Skeleton from '../../components/ui/Skeleton'

// Admins bypass the plan-based photo limit (matches PLANS.UNLIMITED.photoLimit on the backend)
const ADMIN_PHOTO_LIMIT = 15

const EMPTY = {
  title:'', description:'', price:'', type:'APARTMENT', status:'ACTIVE',
  location:'', city:'', state:'', pincode:'', bedrooms:'', bathrooms:'',
  areaSqft:'', images:[], amenities:[], featured:false,
}

export default function ManageListings() {
  const qc              = useQueryClient()
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [amenityInput, setAmenityInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { data, isLoading } = useQuery({ queryKey:['properties',{}], queryFn:() => propertyApi.getAll({ limit:50 }) })

  const createMut = useMutation({
    mutationFn: (d) => propertyApi.create(d),
    onSuccess: () => { qc.invalidateQueries(['properties']); closeModal() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => propertyApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['properties']); closeModal() },
  })
  const deleteMut = useMutation({
    mutationFn: (id) => propertyApi.delete(id),
    onSuccess: () => qc.invalidateQueries(['properties']),
  })

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p) => {
    setEditing(p._id || p.id)
    setForm({ ...p, images: p.images?.length ? p.images : [], price: String(p.price), areaSqft: String(p.areaSqft), bedrooms: String(p.bedrooms||''), bathrooms: String(p.bathrooms||'') })
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY) }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: parseFloat(form.price),
      areaSqft: parseFloat(form.areaSqft),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
    }
    if (editing) updateMut.mutate({ id: editing, ...payload })
    else createMut.mutate(payload)
  }

  const addAmenity = () => {
    if (amenityInput.trim()) { setForm((f) => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] })); setAmenityInput('') }
  }
  const removeAmenity = (i) => setForm((f) => ({ ...f, amenities: f.amenities.filter((_,j) => j!==i) }))

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (form.images.length + files.length > ADMIN_PHOTO_LIMIT) {
      setUploadError(`Maximum ${ADMIN_PHOTO_LIMIT} photos per listing`)
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
      e.target.value = ''
    }
  }
  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const inp = (key, extra={}) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    className: 'input-field text-sm',
    ...extra,
  })

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
          <button onClick={openNew} className="btn-primary"><Plus size={16} /> Add Property</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Image','Title','City','Type','Price','Status','Featured','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? Array(5).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-8" /></td></tr>
                )) : data?.properties?.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <img src={p.images?.[0]} alt="" className="w-14 h-10 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3 max-w-xs"><p className="font-medium text-gray-900 truncate">{p.title}</p></td>
                    <td className="px-4 py-3 text-gray-600">{p.city}</td>
                    <td className="px-4 py-3"><span className="tag">{TYPE_LABELS[p.type] || p.type}</span></td>
                    <td className="px-4 py-3 text-primary-500 font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`tag ${p.status==='ACTIVE'?'bg-green-100 text-green-700':p.status==='SOLD'?'bg-red-100 text-red-700':'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Star size={16} className={p.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { if(window.confirm('Delete this property?')) deleteMut.mutate(p._id || p.id) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale:0.95,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.95,opacity:0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Property' : 'Add New Property'}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                    <input {...inp('title')} required placeholder="e.g. 3BHK Flat in Bandra West" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                    <textarea {...inp('description')} required rows={3} className="input-field text-sm resize-none" placeholder="Property description..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹) *</label>
                    <input {...inp('price')} type="number" required placeholder="5000000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Area (sq.ft) *</label>
                    <input {...inp('areaSqft')} type="number" required placeholder="1200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                    <select {...inp('type')} required>
                      {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select {...inp('status')}>
                      {['ACTIVE','SOLD','RENTED'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bedrooms</label>
                    <input {...inp('bedrooms')} type="number" placeholder="3" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bathrooms</label>
                    <input {...inp('bathrooms')} type="number" placeholder="2" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Location *</label>
                    <input {...inp('location')} required placeholder="Bandra West, Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                    <select {...inp('city')} required>
                      <option value="">Select City</option>
                      {(form.state ? getCitiesByState(form.state) : []).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">State *</label>
                    <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, city: '' }))} required className="input-field text-sm">
                      <option value="">Select State</option>
                      {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Property Photos {form.images.length > 0 && <span className="text-gray-400 font-normal">({form.images.length}/{ADMIN_PHOTO_LIMIT})</span>}
                    </label>

                    {uploadError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-2">{uploadError}</div>
                    )}

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                        {form.images.map((url, idx) => (
                          <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {form.images.length < ADMIN_PHOTO_LIMIT && (
                      <label
                        htmlFor="admin-photo-upload"
                        className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-4 px-3 cursor-pointer text-xs transition-colors ${
                          uploading ? 'border-gray-200 bg-gray-50 cursor-wait text-gray-400' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30 text-gray-500'
                        }`}
                      >
                        {uploading ? (
                          <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                        ) : (
                          <><ImagePlus size={15} /> Click to upload photos</>
                        )}
                        <input
                          id="admin-photo-upload"
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
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amenities</label>
                    <div className="flex gap-2 mb-2">
                      <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => e.key==='Enter' && (e.preventDefault(), addAmenity())}
                        className="input-field text-sm flex-1" placeholder="e.g. Swimming Pool" />
                      <button type="button" onClick={addAmenity} className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.amenities.map((a,i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {a} <button type="button" onClick={() => removeAmenity(i)} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-primary-500" />
                    <label htmlFor="featured" className="text-sm text-gray-700 font-medium">Mark as Featured</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending || uploading}
                    className="btn-primary flex-1 justify-center">
                    {createMut.isPending || updateMut.isPending ? 'Saving...' : editing ? 'Update Property' : 'Add Property'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
