import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  type:        { type: String, required: true, enum: ['APARTMENT','VILLA','PLOT','COMMERCIAL','PENTHOUSE','FARMHOUSE','PG_HOSTEL','ROW_HOUSE','INDUSTRIAL_LAND','SHOP_SHOWROOM','WAREHOUSE','HOTEL_RESORT','BUNGALOW'] },
  status:      { type: String, enum: ['ACTIVE','SOLD','RENTED'], default: 'ACTIVE' },

  location:    { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },   // now covers all 28 states + 8 UTs
  pincode:     { type: String, default: '' },

  bedrooms:    { type: Number, default: null },
  bathrooms:   { type: Number, default: null },
  areaSqft:    { type: Number, required: true },
  images:      [{ type: String }],
  amenities:   [{ type: String }],
  featured:    { type: Boolean, default: false },
  lat:         { type: Number, default: null },
  lng:         { type: Number, default: null },

  // Seller-facing stat: number of times the detail page has been viewed
  // (excludes the owner's own visits — see attachUserIfPresent + getProperty)
  views:       { type: Number, default: 0 },

  // Owner tracking — for subscription/listing-limit enforcement
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Listing approval (optional moderation workflow)
  approved:    { type: Boolean, default: true },
}, { timestamps: true })

propertySchema.index({ title: 'text', location: 'text', city: 'text', state: 'text', description: 'text' })
propertySchema.index({ city: 1, state: 1, type: 1, status: 1, price: 1 })
propertySchema.index({ owner: 1 })

export default mongoose.model('Property', propertySchema)
