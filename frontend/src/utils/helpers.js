export const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export const formatArea = (sqft) => {
  if (sqft >= 43560) return `${(sqft / 43560).toFixed(2)} Acres`
  return `${sqft.toLocaleString()} sq.ft`
}

export const PROPERTY_TYPES = [
  'APARTMENT',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'PENTHOUSE',
  'FARMHOUSE',
  'PG_HOSTEL',
  'ROW_HOUSE',
  'INDUSTRIAL_LAND',
  'SHOP_SHOWROOM',
  'WAREHOUSE',
  'HOTEL_RESORT',
  'BUNGALOW',
]

export const TYPE_LABELS = {
  APARTMENT:       'Apartment',
  VILLA:           'Villa',
  PLOT:            'Plot',
  COMMERCIAL:      'Commercial',
  PENTHOUSE:       'Penthouse',
  FARMHOUSE:       'Farmhouse',
  PG_HOSTEL:       'PG / Hostel',
  ROW_HOUSE:       'Row House',
  INDUSTRIAL_LAND: 'Industrial Land',
  SHOP_SHOWROOM:   'Shop / Showroom',
  WAREHOUSE:       'Warehouse / Godown',
  HOTEL_RESORT:    'Hotel / Resort',
  BUNGALOW:        'Bungalow',
}

export const TYPE_COLORS = {
  APARTMENT:       'bg-blue-100 text-blue-700',
  VILLA:           'bg-purple-100 text-purple-700',
  PLOT:            'bg-green-100 text-green-700',
  COMMERCIAL:      'bg-yellow-100 text-yellow-700',
  PENTHOUSE:       'bg-pink-100 text-pink-700',
  FARMHOUSE:       'bg-teal-100 text-teal-700',
  PG_HOSTEL:       'bg-orange-100 text-orange-700',
  ROW_HOUSE:       'bg-indigo-100 text-indigo-700',
  INDUSTRIAL_LAND: 'bg-gray-100 text-gray-700',
  SHOP_SHOWROOM:   'bg-red-100 text-red-700',
  WAREHOUSE:       'bg-stone-100 text-stone-700',
  HOTEL_RESORT:    'bg-rose-100 text-rose-700',
  BUNGALOW:        'bg-lime-100 text-lime-700',
}

export const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD:   'bg-red-100 text-red-700',
  RENTED: 'bg-orange-100 text-orange-700',
}

// Backward compat — full lists now come from indiaData
export { ALL_CITIES as CITIES, ALL_STATES as STATES } from './indiaData'

export const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-')

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
