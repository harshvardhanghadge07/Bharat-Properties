import mongoose from 'mongoose'
import { DETAIL_RULES, PROPERTY_RULES } from '../utils/propertyRules.js'

const detailsSchema = new mongoose.Schema(Object.fromEntries(Object.entries(DETAIL_RULES).map(([key, rule]) => [key, rule.type === 'number' ? { type: Number, min: rule.min } : rule.type === 'text' ? { type: String, trim: true, maxlength: rule.maxLength } : { type: String, enum: rule.options }])), { _id: false })

const propertySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  type:        { type: String, required: true, enum: [...Object.keys(PROPERTY_RULES), 'BUNGALOW'] },
  // Keep the legacy value readable for owners; API writes only allow ACTIVE/SOLD.
  status:      { type: String, enum: ['ACTIVE','SOLD','RENTED'], default: 'ACTIVE' },

  location:    { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },   // now covers all 28 states + 8 UTs
  pincode:     { type: String, default: '' },

  bedrooms:    { type: Number, default: null },
  bathrooms:   { type: Number, default: null },
  areaSqft:    { type: Number, required: true },
  whatsappNumber: { type: String, trim: true, default: '' },
  details:     { type: detailsSchema, default: () => ({}) },
  images:      [{ type: String }],
  amenities:   [{ type: String }],
  featured:    { type: Boolean, default: false },
  lat:         { type: Number, min: -90, max: 90, default: null },
  lng:         { type: Number, min: -180, max: 180, default: null },

  // Seller-facing stat: number of times the detail page has been viewed
  // (excludes the owner's own visits — see attachUserIfPresent + getProperty)
  views:       { type: Number, default: 0 },

  // Owner tracking for listing management
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Listing approval (optional moderation workflow)
  approved:    { type: Boolean, default: true },
}, { timestamps: true })

propertySchema.index({ title: 'text', location: 'text', city: 'text', state: 'text', description: 'text' })
propertySchema.index({ city: 1, state: 1, type: 1, status: 1, price: 1 })
propertySchema.index({ owner: 1 })

export default mongoose.model('Property', propertySchema)
