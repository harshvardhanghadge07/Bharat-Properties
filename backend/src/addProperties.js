import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Property from './models/Property.js'
import User from './models/User.js'

dotenv.config()

const properties = [
  {
    title: 'Luxury 4BHK Penthouse in Bandra West',
    description: 'Experience the pinnacle of luxury living in this stunning penthouse with panoramic views of the Arabian Sea. Features Italian marble flooring, modular kitchen, and a private terrace garden.',
    price: 45000000, type: 'PENTHOUSE', status: 'ACTIVE',
    location: 'Bandra West, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
    bedrooms: 4, bathrooms: 4, areaSqft: 4500,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    amenities: ['Swimming Pool','Gym','Concierge','Valet Parking','Spa','Rooftop Garden'],
    featured: true, lat: 19.0596, lng: 72.8295,
  },
  {
    title: 'Modern 3BHK Flat in Whitefield',
    description: 'Contemporary apartment in the IT hub of Bengaluru. Close to major tech parks, schools, and malls. Well-ventilated with modular kitchen and club house access.',
    price: 12500000, type: 'APARTMENT', status: 'ACTIVE',
    location: 'Whitefield, Bengaluru', city: 'Bengaluru', state: 'Karnataka', pincode: '560066',
    bedrooms: 3, bathrooms: 2, areaSqft: 1850,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    amenities: ['Clubhouse','Children Play Area','Jogging Track','Power Backup','Security'],
    featured: true, lat: 12.9698, lng: 77.7499,
  },
  {
    title: 'Heritage Villa in Lutyens Delhi',
    description: 'Majestic colonial-style villa spread across a sprawling estate. Featuring teak wood interiors, lush gardens, and staff quarters. A rare opportunity in prime Delhi.',
    price: 180000000, type: 'VILLA', status: 'ACTIVE',
    location: "Lutyens' Delhi, New Delhi", city: 'New Delhi', state: 'Delhi', pincode: '110003',
    bedrooms: 6, bathrooms: 6, areaSqft: 9000,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    amenities: ['Private Garden','Swimming Pool','Staff Quarters','Garage','Library','Home Theater'],
    featured: true, lat: 28.6139, lng: 77.2090,
  },
  {
    title: 'Sea-Facing 2BHK in Juhu',
    description: 'Stunning sea-facing apartment with unobstructed views of Juhu Beach. Modern interiors with premium fittings and 24/7 security.',
    price: 28000000, type: 'APARTMENT', status: 'ACTIVE',
    location: 'Juhu, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400049',
    bedrooms: 2, bathrooms: 2, areaSqft: 1400,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    amenities: ['Sea View','Gym','Security','Power Backup','Parking'],
    featured: false, lat: 19.1075, lng: 72.8263,
  },
  {
    title: 'Commercial Space in Cyber City',
    description: 'Grade-A office space in the heart of Cyber City, Gurugram. Fully fitted with modern amenities, large floor plates, and excellent connectivity.',
    price: 55000000, type: 'COMMERCIAL', status: 'ACTIVE',
    location: 'Cyber City, Gurugram', city: 'Gurugram', state: 'Haryana', pincode: '122002',
    bedrooms: null, bathrooms: 4, areaSqft: 5000,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    amenities: ['24/7 Access','Cafeteria','Conference Rooms','High-Speed Internet','Parking'],
    featured: false, lat: 28.4964, lng: 77.0885,
  },
  {
    title: 'Farmhouse Plot in Alibaug',
    description: 'Pristine 2-acre plot in the serene coastal town of Alibaug. Perfect for building your dream farmhouse. Clear title, NA converted, near the beach.',
    price: 35000000, type: 'PLOT', status: 'ACTIVE',
    location: 'Alibaug, Raigad', city: 'Alibaug', state: 'Maharashtra', pincode: '402201',
    bedrooms: null, bathrooms: null, areaSqft: 87120,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    amenities: ['Clear Title','NA Converted','Near Beach','Road Access','Borewell'],
    featured: true, lat: 18.6414, lng: 72.8722,
  },
  {
    title: 'PG for Boys Near Hinjewadi IT Park',
    description: 'Fully furnished PG accommodation near Hinjewadi Phase 1. Includes meals, WiFi, laundry, and 24/7 security. Ideal for IT professionals.',
    price: 12000, type: 'PG_HOSTEL', status: 'ACTIVE',
    location: 'Hinjewadi Phase 1, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411057',
    bedrooms: 1, bathrooms: 1, areaSqft: 150,
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
    amenities: ['WiFi', 'Meals Included', 'Laundry', 'Security', 'Power Backup'],
    featured: false,
  },
  {
    title: 'Boutique Hotel for Sale in Alibaug',
    description: '12-room boutique hotel near Alibaug beach. Running business with good occupancy. Includes furniture, fixtures, and equipment.',
    price: 85000000, type: 'HOTEL_RESORT', status: 'ACTIVE',
    location: 'Nagaon Beach Road, Alibaug', city: 'Alibaug', state: 'Maharashtra', pincode: '402201',
    bedrooms: 12, bathrooms: 14, areaSqft: 8000,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['Beach Access', 'Swimming Pool', 'Restaurant', 'Parking', 'Generator', 'Running Business'],
    featured: true,
  }
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  const owner = await User.findOne({ email: 'bharatestates3@gmail.com' })
  if (!owner) {
    console.error('Owner not found! Cannot assign properties.')
    process.exit(1)
  }

  const propsWithOwner = properties.map(p => ({ ...p, owner: owner._id }))

  await Property.insertMany(propsWithOwner)
  console.log(`🏠 ${properties.length} properties added to the database and assigned to you!`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(console.error)
