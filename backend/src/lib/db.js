import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)

    // Clean up legacy { phone: null } or { email: null } documents that cause duplicate index errors
    try {
      const User = mongoose.model('User')
      await User.updateMany({ phone: null }, { $unset: { phone: 1 } })
      await User.updateMany({ email: null }, { $unset: { email: 1 } })
      await User.syncIndexes()
      console.log('✅ User indexes synchronized & legacy null fields cleaned up')
    } catch (indexErr) {
      console.warn('⚠️ User index sync warning:', indexErr.message)
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

export default connectDB
