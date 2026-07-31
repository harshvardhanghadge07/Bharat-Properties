import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { inquiryApi } from '../services/api'
import useSEO from '../hooks/useSEO'

export default function Contact() {
  useSEO({
    title: 'Contact Us | Bharat Properties',
    description: 'Get in touch with Bharat Properties for property inquiries, support, or partnership opportunities.',
    url: `${window.location.origin}/contact`,
  })

  const [form, setForm]       = useState({ name:'', email:'', phone:'', message:'' })
  const [submitted, setSub]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // General contact (no propertyId) — just alert for demo
    setTimeout(() => { setSub(true); setLoading(false) }, 800)
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-center">
        <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="text-4xl font-serif font-bold text-white mb-3">
          Get in Touch
        </motion.h1>
        <p className="text-gray-400">Our experts are ready to help you find the perfect property</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          {[
            { icon: Phone,   title: 'Phone',   info: '+919359854302', sub: 'Mon–Sat, 9am–7pm' },
            { icon: Mail,    title: 'Email',   info: 'bharatestates3@gmail.com', sub: 'Reply within 24 hours' },
            { icon: MapPin,  title: 'Office',  info: ' Jalna - 431203', sub: 'Maharashtra, India' },
            { icon: Clock,   title: 'Hours',   info: 'Mon–Sat: 9am – 7pm', sub: 'Sun: 10am – 4pm' },
          ].map(({ icon: Icon, title, info, sub }) => (
            <motion.div key={title} initial={{ opacity:0,x:-20 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
              className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-gray-700 text-sm">{info}</p>
                <p className="text-gray-400 text-xs">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({...form,name:e.target.value})}
                    className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})}
                    className="input-field" placeholder="you@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})}
                    className="input-field" placeholder="+91 xxxxxxxxxx" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form,message:e.target.value})}
                    className="input-field resize-none" placeholder="How can we help you?" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
