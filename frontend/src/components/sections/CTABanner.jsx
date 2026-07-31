import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, PhoneCall } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="py-20 bg-primary-500 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-serif font-bold text-white mb-4"
        >
          Ready to Find Your Dream Home?
        </motion.h2>
        <p className="text-white/80 text-lg mb-8">
          Talk to our experts today and get personalized property recommendations.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/properties" className="bg-white text-primary-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2">
            Browse Properties <ArrowRight size={18} />
          </Link>
          <a href="tel:+919359854302" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            <PhoneCall size={18} /> Call an Expert
          </a>
        </div>
      </div>
    </section>
  )
}
