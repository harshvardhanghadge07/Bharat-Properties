import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Recursively normalize MongoDB _id → id
const normalize = (data) => {
  if (Array.isArray(data)) return data.map(normalize)
  if (data && typeof data === 'object') {
    const out = { ...data }
    if (out._id) out.id = out._id
    Object.keys(out).forEach((k) => {
      if (typeof out[k] === 'object') out[k] = normalize(out[k])
    })
    return out
  }
  return data
}

api.interceptors.response.use(
  (res) => normalize(res.data),
  (err) => Promise.reject(err.response?.data || err)
)

export const propertyApi = {
  getAll:      (params) => api.get('/properties', { params }),
  getFeatured: ()       => api.get('/properties/featured'),
  getStats:    ()       => api.get('/properties/stats'),
  getMine:     ()       => api.get('/properties/mine'),
  getOne:      (id)     => api.get(`/properties/${id}`),
  create:      (data)   => api.post('/properties', data),
  update:      (id, d)  => api.put(`/properties/${id}`, d),
  delete:      (id)     => api.delete(`/properties/${id}`),
}

export const favoriteApi = {
  getAll: ()           => api.get('/favorites'),
  add:    (propertyId) => api.post(`/favorites/${propertyId}`),
  remove: (propertyId) => api.delete(`/favorites/${propertyId}`),
}

export const authApi = {
  login:          (d) => api.post('/auth/login', d),
  register:       (d) => api.post('/auth/register', d),
  me:             ()  => api.get('/auth/me'),
  update:         (d) => api.put('/auth/me', d),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (d) => api.post('/auth/reset-password', d), // { token, password }
  verifyEmail:    (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', email ? { email } : {}),
}

export const inquiryApi = {
  create:  (d)  => api.post('/inquiries', d),
  getAll:  (p)  => api.get('/inquiries', { params: p }),
  markRead:(id) => api.put(`/inquiries/${id}/read`),
  delete:  (id) => api.delete(`/inquiries/${id}`),
}

export const subscriptionApi = {
  getPlans:    ()        => api.get('/subscriptions/plans'),
  getMine:     ()        => api.get('/subscriptions/me'),
  createOrder: (planId)  => api.post('/subscriptions/create-order', { planId }),
  verify:      (data)    => api.post('/subscriptions/verify', data),
  getAll:      ()        => api.get('/subscriptions/all'),
  manualActivate: (d)     => api.post('/subscriptions/manual-activate', d), // { email, planId, note }
  revertToFree:   (userId) => api.post(`/subscriptions/${userId}/revert-to-free`),
}

export const adminApi = {
  searchUsers: (q) => api.get('/auth/admin/search-users', { params: { q } }),
}

export const uploadApi = {
  images: (files) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('images', f))
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
}

export default api
