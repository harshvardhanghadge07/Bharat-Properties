import mongoose from 'mongoose'
import dotenv from 'dotenv'
import crypto from 'crypto'
import User from './models/User.js'
import Property from './models/Property.js'

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
    title: 'Luxury Farmhouse in Mehrauli',
    description: 'A sprawling 5BHK farmhouse in the lush greens of Mehrauli, Delhi. Complete with a private pool, manicured lawns, and premium interiors.',
    price: 95000000, type: 'FARMHOUSE', status: 'ACTIVE',
    location: 'Mehrauli, New Delhi', city: 'New Delhi', state: 'Delhi', pincode: '110030',
    bedrooms: 5, bathrooms: 5, areaSqft: 12000,
    images: ['https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800'],
    amenities: ['Private Pool','Lawn','Outdoor Kitchen','Staff Quarters','Generator','CCTV'],
    featured: false, lat: 28.5122, lng: 77.1773,
  },
  {
    title: '3BHK in Hiranandani Gardens, Powai',
    description: 'Spacious apartment in the iconic Hiranandani township. Excellent infrastructure, green surroundings, and top-tier amenities.',
    price: 22000000, type: 'APARTMENT', status: 'ACTIVE',
    location: 'Hiranandani Gardens, Powai, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076',
    bedrooms: 3, bathrooms: 2, areaSqft: 1750,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    amenities: ['Club House','Swimming Pool','Tennis Court','Mall Access','Lake View'],
    featured: false, lat: 19.1194, lng: 72.9060,
  },
]

async function seed() {
  // This script WIPES all users and properties before reseeding — guard
  // against accidentally running it against a real (non-local) database.
  const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.MONGO_URI || '')
  if (!isLocalDb && process.env.CONFIRM_SEED !== 'yes') {
    console.error('⚠️  MONGO_URI does not look like a local database.')
    console.error('   This script deletes ALL existing users and properties before reseeding.')
    console.error('   If you are certain you want to run this against this database, re-run with:')
    console.error('     CONFIRM_SEED=yes node src/seed.js')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing
  await Promise.all([User.deleteMany(), Property.deleteMany()])
  console.log('🗑️  Cleared existing data')

  // Create admin — password is randomly generated each run (or set SEED_ADMIN_PASSWORD
  // yourself) rather than a fixed, publicly-documented value, since a hardcoded
  // "admin123" in source control/README is a real account-takeover risk.
  const adminEmail    = process.env.SEED_ADMIN_EMAIL || 'admin@bharatproperties.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')

  await User.create({
    name: 'Bharat Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'ADMIN',
    emailVerified: true,
  })
  console.log('👤 Admin user created')

  // Create properties
  await Property.insertMany(properties)
  console.log(`🏠 ${properties.length} properties seeded`)

  console.log('\n✅ Database seeded successfully!')
  console.log(`📧 Admin: ${adminEmail}`)
  console.log(`🔑 Password: ${adminPassword}${process.env.SEED_ADMIN_PASSWORD ? '' : '  (auto-generated — save this now, it will not be shown again)'}`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

// Additional sample listings for new property types
const extraProperties = [
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
    title: 'Row House in Wakad, Pune',
    description: '3BHK independent row house in a gated community. Private terrace, garden, and parking. Close to schools and shopping centers.',
    price: 9500000, type: 'ROW_HOUSE', status: 'ACTIVE',
    location: 'Wakad, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411057',
    bedrooms: 3, bathrooms: 3, areaSqft: 2200,
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
    amenities: ['Private Garden', 'Parking', 'Gated Community', 'Security'],
    featured: false,
  },
  {
    title: 'Industrial Plot in Bhiwandi',
    description: 'Ready-to-use industrial land in Bhiwandi industrial area. NH highway access, clear title, MIDC approved. Suitable for warehouse or manufacturing unit.',
    price: 25000000, type: 'INDUSTRIAL_LAND', status: 'ACTIVE',
    location: 'Bhiwandi Industrial Area, Thane', city: 'Bhiwandi', state: 'Maharashtra', pincode: '421302',
    bedrooms: null, bathrooms: null, areaSqft: 20000,
    images: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800'],
    amenities: ['Highway Access', 'Clear Title', 'MIDC Approved', 'Power Connection'],
    featured: false,
  },
  {
    title: 'Shop for Sale in Linking Road, Mumbai',
    description: 'Prime ground floor shop on Linking Road, Bandra. High footfall area, ideal for retail, showroom or food outlet. Currently vacant.',
    price: 18000000, type: 'SHOP_SHOWROOM', status: 'ACTIVE',
    location: 'Linking Road, Bandra West, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
    bedrooms: null, bathrooms: 1, areaSqft: 450,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    amenities: ['Ground Floor', 'High Footfall', 'Corner Shop', 'Parking Nearby'],
    featured: true,
  },
  {
    title: 'Warehouse for Rent in Chakan',
    description: 'Large warehouse facility near Chakan industrial zone. Loading docks, high ceiling, 3-phase power. Suitable for logistics and storage.',
    price: 250000, type: 'WAREHOUSE', status: 'ACTIVE',
    location: 'Chakan MIDC, Pune', city: 'Pune', state: 'Maharashtra', pincode: '410501',
    bedrooms: null, bathrooms: 2, areaSqft: 15000,
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'],
    amenities: ['Loading Docks', 'High Ceiling', '3-Phase Power', 'Fire Safety', 'CCTV'],
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
  },
  {
    title: '4BHK Bungalow in Kalyani Nagar, Pune',
    description: 'Luxurious independent bungalow with private pool and landscaped garden. Prime location in Kalyani Nagar with all modern amenities.',
    price: 42000000, type: 'BUNGALOW', status: 'ACTIVE',
    location: 'Kalyani Nagar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411006',
    bedrooms: 4, bathrooms: 5, areaSqft: 5500,
    images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
    amenities: ['Private Pool', 'Landscaped Garden', 'Home Theater', 'Smart Home', 'Solar Power', 'EV Charging'],
    featured: true,
  },
]
