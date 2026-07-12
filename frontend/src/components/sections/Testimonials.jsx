import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Quote, ArrowRight } from 'lucide-react'

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Client Stories</p>
        <h2 className="section-heading mb-6">Coming Soon</h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-10"
        >
          <Quote size={28} className="text-primary-300 mx-auto mb-4" />
          <p className="text-gray-600">
            We're just getting started — as customers complete their journey with us, we'll share their real stories here.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-1.5 text-primary-500 font-medium text-sm mt-4 hover:underline">
            Found a home through us? Tell us about it <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
