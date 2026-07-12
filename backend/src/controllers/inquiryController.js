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

    // Validate propertyId is a valid MongoDB ObjectId before querying
    if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Valid property ID is required' })
    }

    const property = await Property.findById(propertyId)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    const inquiry = await Inquiry.create({
      name, email, phone, message,
      property: propertyId,
      user: req.user?._id || null,
    })

    await inquiry.populate('property', 'title city')

    // Send email — safely, won't crash server if email not configured
    sendInquiryEmail(inquiry).catch(() => {
      console.log('ℹ️  Email not sent — check EMAIL_USER and EMAIL_PASS in .env')
    })

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry })
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
