import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Users, MapPin, TrendingUp } from 'lucide-react'

const stats = [
  { icon: Building2, value: 50000, suffix: '+', label: 'Properties Listed', color: 'text-primary-500' },
  { icon: Users,     value: 10000, suffix: '+', label: 'Happy Customers',   color: 'text-blue-500' },
  { icon: MapPin,    value: 200,   suffix: '+', label: 'Cities Covered',    color: 'text-green-500' },
  { icon: TrendingUp,value: 500,   suffix: 'Cr+',label: '₹ Transactions',  color: 'text-purple-500' },
]

function Counter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref               = useRef()
  const inView            = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, suffix, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 ${color}`}>
                <Icon size={26} />
              </div>
              <div className={`text-3xl md:text-4xl font-bold ${color} mb-1`}>
                <Counter target={value} suffix={suffix} />
              </div>
              <p className="text-gray-500 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
