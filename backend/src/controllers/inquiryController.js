import mongoose from 'mongoose'
import Inquiry from '../models/Inquiry.js'
import Property from '../models/Property.js'
import { sendInquiryEmail } from '../services/mailer.js'

export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, message, propertyId } = req.body

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })

    // Validate propertyId is a valid MongoDB ObjectId before querying
    if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Valid property ID is required' })
    }

    const property = await Property.findById(propertyId).populate('owner', 'email')
    if (!property || !['ACTIVE', 'SOLD'].includes(property.status)) return res.status(404).json({ error: 'Property not found' })

    if (!property.owner?.email) return res.status(409).json({ error: 'This listing has no contactable owner. Email inquiry is unavailable.' })

    const inquiry = await Inquiry.create({
      name, email, phone, message,
      property: propertyId,
      user: req.user?._id || null,
    })

    await inquiry.populate('property', 'title city')

    // Keep the saved inquiry even if providers fail; report delivery honestly.
    const emailDelivered = await sendInquiryEmail(inquiry, property.owner.email).catch(() => false)

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry, emailDelivered })
  } catch (err) { next(err) }
}

export const getInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query
    const filter = read !== undefined ? { read: read === 'true' } : {}

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Inquiry.countDocuments(filter)
    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit))
      .populate('property', '_id title city')
      .lean()

    res.json({ inquiries, total })
  } catch (err) { next(err) }
}

export const markRead = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid inquiry ID' })
    }
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id, { read: true }, { new: true }
    )
    res.json(inquiry)
  } catch (err) { next(err) }
}

export const deleteInquiry = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid inquiry ID' })
    }
    await Inquiry.findByIdAndDelete(req.params.id)
    res.json({ message: 'Inquiry deleted' })
  } catch (err) { next(err) }
}
