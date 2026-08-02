// One-time script to set up YOUR admin/owner account
// Run with: node src/updateOwner.js
// This does NOT delete any existing properties or data — it only updates/creates the admin user.

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const OWNER = {
  name: 'Tanuj Misal',
  email: 'bharatestates3@gmail.com',
  password: 'kedarnath3',
  phone: '',
  role: 'ADMIN',
}

async function updateOwner() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // Remove old default admin if it exists (admin@bharat-realestate.com)
  const oldAdmin = await User.findOne({ email: 'admin@bharat-realestate.com' })
  if (oldAdmin) {
    await User.deleteOne({ email: 'admin@bharat-realestate.com' })
    console.log('🗑️  Removed old default admin (admin@bharat-realestate.com)')
  }

  // Check if your email already exists
  let user = await User.findOne({ email: OWNER.email })

  if (user) {
    // Update existing user to admin with new password
    user.name = OWNER.name
    user.password = OWNER.password // will be hashed by pre-save hook
    user.role = 'ADMIN'
    await user.save()
    console.log('✅ Existing user updated to ADMIN owner')
  } else {
    // Create fresh owner account
    user = await User.create(OWNER)
    console.log('✅ New owner/admin account created')
  }

  console.log('\n🎉 Owner account ready!')
  console.log('📧 Email:', OWNER.email)
  console.log('🔑 Password:', OWNER.password)
  console.log('👤 Name:', OWNER.name)
  console.log('🛡️  Role: ADMIN')

  await mongoose.disconnect()
  process.exit(0)
}

updateOwner().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
