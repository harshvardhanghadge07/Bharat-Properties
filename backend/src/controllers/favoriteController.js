import mongoose from 'mongoose'
import User from '../models/User.js'
import Property from '../models/Property.js'

// Get the logged-in user's favorited properties (full property docs)
export const getMyFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites')
    res.json(user.favorites || [])
  } catch (err) { next(err) }
}

export const addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }
    const property = await Property.findById(propertyId)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: propertyId } })
    const user = await User.findById(req.user._id)
    res.json({ favorites: user.favorites })
  } catch (err) { next(err) }
}

export const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: propertyId } })
    const user = await User.findById(req.user._id)
    res.json({ favorites: user.favorites })
  } catch (err) { next(err) }
}
