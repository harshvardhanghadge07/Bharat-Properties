import { Crown } from 'lucide-react'

export default function ProSellerBadge({ size = 'sm', className = '' }) {
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
  }
  return (
    <span className={`inline-flex items-center ${sizes[size]} rounded-full bg-gold/15 text-gold font-medium ${className}`}>
      <Crown size={size === 'sm' ? 11 : 13} className="shrink-0" />
      Pro Seller
    </span>
  )
}