import { motion } from 'framer-motion'
import { Shield, Award, Users, TrendingUp, Sparkles } from 'lucide-react'
import useSEO from '../hooks/useSEO'

export default function About() {
  useSEO({
    title: 'About Us | Bharat Properties',
    description: 'Learn about Bharat Properties — our mission, values, and commitment to helping Indian families find verified homes with confidence.',
    url: `${window.location.origin}/about`,
  })

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="relative py-28 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)' }}>
        <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          className="text-5xl font-serif font-bold text-white mb-4">
          About <span className="text-primary-400">Bharat Properties</span>
        </motion.h1>
        <p className="text-gray-400 max-w-xl mx-auto px-4">
          Founded in 2015, we are India's most trusted real estate platform connecting millions of buyers, sellers, and renters every day.
        </p>
      </div>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-primary-500 font-semibold uppercase tracking-wider text-sm mb-2">Our Mission</p>
          <h2 className="section-heading mb-6">Making Real Estate Simple, Transparent & Accessible</h2>
          <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
            We believe that finding a home should be exciting, not stressful. With cutting-edge technology, verified listings, and a dedicated team, we help every Indian family find their dream property with confidence and ease.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Shield, label: 'Trust & Transparency', color: 'text-blue-500' },
            { icon: Award,  label: 'Excellence',           color: 'text-yellow-500' },
            { icon: Users,  label: 'Customer First',       color: 'text-green-500' },
            { icon: TrendingUp, label: 'Innovation',       color: 'text-primary-500' },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div key={label} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
              transition={{ delay: i*0.1 }} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <Icon size={32} className={`${color} mx-auto mb-3`} />
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-primary-500 font-semibold uppercase tracking-wider text-sm mb-2">Our People</p>
          <h2 className="section-heading mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                TM
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tanuj Misal</h3>
              <p className="text-primary-600 font-medium text-sm mb-3">Real Estate & Finance</p>
              <p className="text-gray-600 text-sm">
                Bringing over 6 years of deep expertise in real estate markets and financial structuring to help you make the best property investments.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                HG
              </div>
              <h3 className="text-xl font-bold text-gray-900">Harshvardhan Ghadge</h3>
              <p className="text-primary-600 font-medium text-sm mb-3">Technology</p>
              <p className="text-gray-600 text-sm">
                With 2 years of experience building modern technology platforms, driving the digital experience and innovation behind Bharat Properties.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
