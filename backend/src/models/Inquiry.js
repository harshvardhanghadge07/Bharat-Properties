import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String, default: '' },
  message:    { type: String, required: true },
  property:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  read:       { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Inquiry', inquirySchema)
