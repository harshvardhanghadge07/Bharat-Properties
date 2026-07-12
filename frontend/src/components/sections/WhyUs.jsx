import { motion } from 'framer-motion'
import { ShieldCheck, Search, HeartHandshake, BadgeIndianRupee, Clock, Star } from 'lucide-react'

const features = [
  { icon: ShieldCheck,       title: 'Verified Listings',   desc: 'Every property is verified by our team ensuring authenticity and accuracy.' },
  { icon: BadgeIndianRupee,  title: 'Best Price Guarantee', desc: 'We help you get the best deal with transparent pricing and no hidden fees.' },
  { icon: Search,            title: 'Smart Search',         desc: 'Advanced filters help you find exactly what you need in seconds.' },
  { icon: HeartHandshake,    title: 'Expert Guidance',      desc: 'Dedicated relationship managers guide you through every step.' },
  { icon: Clock,             title: '24/7 Support',         desc: 'Round-the-clock assistance via call, chat, and email.' },
  { icon: Star,              title: 'Premium Experience',   desc: 'Virtual tours, detailed reports, and seamless documentation.' },
]

export default function WhyUs() {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Our Advantages</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Why Choose Bharat Properties?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-primary-500/40 transition-all"
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-primary-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
