import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Inquiry from '../models/Inquiry.js'
const PHOTO_LIMIT = 5

// Fields any listing owner may set from their own post/edit form
const OWNER_EDITABLE_FIELDS = [
  'title', 'description', 'price', 'type', 'location', 'city', 'state',
  'pincode', 'bedrooms', 'bathrooms', 'areaSqft', 'images', 'amenities', 'lat', 'lng',
]
// Additional fields only an admin may set (curation/moderation controls —
// matches what Admin/ManageListings.jsx's form actually sends).
// Deliberately excludes `owner` and `views`: nothing in the app has a
// legitimate reason to set those through this endpoint.
const ADMIN_ONLY_FIELDS = ['status', 'featured']

// Whitelists req.body down to only the fields this user is allowed to set,
// so a crafted request body (e.g. `{ featured: true }` from a non-admin)
// can't slip in fields that aren't exposed in their own form.
const pickEditableFields = (body, user) => {
  const allowed = user.role === 'ADMIN' ? [...OWNER_EDITABLE_FIELDS, ...ADMIN_ONLY_FIELDS] : OWNER_EDITABLE_FIELDS
  const picked = {}
  for (const key of allowed) {
    if (key in body) picked[key] = body[key]
  }
  return picked
}

export const getProperties = async (req, res, next) => {
  try {
    const {
      search, city, state, type, status, minPrice, maxPrice,
      featured, bedrooms, page = 1, limit = 12, sort = 'createdAt',
      minLat, maxLat, minLng, maxLng,
    } = req.query

    const filter = {}

    if (search) filter.$text = { $search: search }
    if (city)   filter.city  = { $regex: city, $options: 'i' }
    if (state)  filter.state = { $regex: state, $options: 'i' }
    if (type)   filter.type  = type
    if (status) filter.status = status
    else        filter.status = 'ACTIVE'
    if (featured !== undefined) filter.featured = featured === 'true'
    if (bedrooms) filter.bedrooms = parseInt(bedrooms)
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    // Spatial bounding box filter (from Map Draw)
    if (minLat && maxLat) {
      filter.lat = { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) }
    }
    if (minLng && maxLng) {
      filter.lng = { $gte: parseFloat(minLng), $lte: parseFloat(maxLng) }
    }

    const sortObj =
      sort === 'price_asc'  ? { price:  1 } :
      sort === 'price_desc' ? { price: -1 } :
                              { createdAt: -1 }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Property.countDocuments(filter)
    const properties = await Property.find(filter)
      .sort(sortObj).skip(skip).limit(parseInt(limit))
      .populate('owner', 'name phone emailVerified phoneVerified')
      .lean()

    res.json({
      properties,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (err) { next(err) }
}

export const getProperty = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name phone emailVerified phoneVerified createdAt')
    if (!property) return res.status(404).json({ error: 'Property not found' })

    // Track views for the seller's stats, but don't count the owner's own
    // visits (e.g. opening the edit page, or checking their own listing)
    const isOwnerViewing = req.user && String(property.owner?._id || property.owner) === String(req.user._id)
    if (!isOwnerViewing) {
      property.views = (property.views || 0) + 1
      await property.save()
    }

    res.json(property.toObject())
  } catch (err) { next(err) }
}

export const getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ featured: true, status: 'ACTIVE' })
      .sort({ createdAt: -1 }).limit(6)
      .populate('owner', 'name phone emailVerified phoneVerified')
      .lean()
    res.json(properties)
  } catch (err) { next(err) }
}

export const getStats = async (req, res, next) => {
  try {
    const [total, active, sold, cities, states] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'ACTIVE' }),
      Property.countDocuments({ status: 'SOLD' }),
      Property.distinct('city'),
      Property.distinct('state'),
    ])
    res.json({ total, active, sold, cities: cities.length, states: states.length })
  } catch (err) { next(err) }
}

// Get listings owned by the logged-in user, with seller-facing stats
// (views come straight off the Property doc; inquiry counts are aggregated)
export const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean()

    const inquiryCounts = await Inquiry.aggregate([
      { $match: { property: { $in: properties.map((p) => p._id) } } },
      { $group: { _id: '$property', count: { $sum: 1 } } },
    ])
    const countByProperty = Object.fromEntries(inquiryCounts.map((c) => [String(c._id), c.count]))

    const withStats = properties.map((p) => ({
      ...p,
      inquiryCount: countByProperty[String(p._id)] || 0,
    }))

    res.json(withStats)
  } catch (err) { next(err) }
}

export const createProperty = async (req, res, next) => {
  try {
    const photoLimit = PHOTO_LIMIT
    if (Array.isArray(req.body.images) && req.body.images.length > photoLimit) {
      return res.status(400).json({
        error: `You can upload up to ${photoLimit} photos per listing. Please remove some photos.`,
        photoLimit,
      })
    }

    const property = await Property.create({ ...pickEditableFields(req.body, req.user), owner: req.user._id })

    res.status(201).json(property)
  } catch (err) { next(err) }
}

export const updateProperty = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }
    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    // Only owner or admin can edit
    if (req.user.role !== 'ADMIN' && String(property.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to edit this listing' })
    }

    if (Array.isArray(req.body.images)) {
      const photoLimit = PHOTO_LIMIT
      if (req.body.images.length > photoLimit) {
        return res.status(400).json({
          error: `You can upload up to ${photoLimit} photos per listing. Please remove some photos.`,
          photoLimit,
        })
      }
    }

    Object.assign(property, pickEditableFields(req.body, req.user))
    await property.save()
    res.json(property)
  } catch (err) { next(err) }
}

export const deleteProperty = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }
    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    if (req.user.role !== 'ADMIN' && String(property.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' })
    }

    await property.deleteOne()

    res.json({ message: 'Property deleted successfully' })
  } catch (err) { next(err) }
}