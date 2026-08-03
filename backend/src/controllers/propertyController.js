import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Subscription from '../models/Subscription.js'
import Inquiry from '../models/Inquiry.js'
import { PLANS } from '../config/plans.js'

// Get the photo limit for a user's current plan (admins get the highest tier's limit)
const getPhotoLimit = async (user) => {
  if (user.role === 'ADMIN') return PLANS.UNLIMITED.photoLimit
  const sub = await Subscription.findOne({ user: user._id })
  const plan = PLANS[sub?.plan] || PLANS.FREE
  return plan.photoLimit
}

// A stored sub.plan can lag reality until the owner's next listing action
// re-triggers checkListingLimit's downgrade check — so for *display* purposes
// (the Pro Seller badge) we treat an expired paid plan as FREE immediately,
// without writing that downgrade to the DB here.
const getEffectivePlan = (sub) => {
  if (!sub) return 'FREE'
  if (sub.plan !== 'FREE' && sub.expiryDate && new Date() > sub.expiryDate) return 'FREE'
  return sub.plan
}

// Batch-attaches each property's owner's current plan (for the Pro Seller
// badge) in a single query, rather than one Subscription lookup per property.
const attachOwnerPlans = async (properties) => {
  const ownerIds = [...new Set(properties.map((p) => p.owner?._id?.toString()).filter(Boolean))]
  if (!ownerIds.length) return properties

  const subs = await Subscription.find({ user: { $in: ownerIds } }).select('user plan expiryDate').lean()
  const planByUser = Object.fromEntries(subs.map((s) => [String(s.user), getEffectivePlan(s)]))

  for (const p of properties) {
    if (p.owner) p.owner.plan = planByUser[String(p.owner._id)] || 'FREE'
  }
  return properties
}

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
    await attachOwnerPlans(properties)

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

    // Attach the owner's current plan for the Pro Seller badge. Kept as a
    // plain-object mutation after the save above, rather than lean(), since
    // the view-count increment needs a real mongoose doc to call .save() on.
    const propertyObj = property.toObject()
    if (propertyObj.owner) {
      const sub = await Subscription.findOne({ user: propertyObj.owner._id }).select('plan expiryDate').lean()
      propertyObj.owner.plan = getEffectivePlan(sub)
    }

    res.json(propertyObj)
  } catch (err) { next(err) }
}

export const getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ featured: true, status: 'ACTIVE' })
      .sort({ createdAt: -1 }).limit(6)
      .populate('owner', 'name phone emailVerified phoneVerified')
      .lean()
    await attachOwnerPlans(properties)
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
    const photoLimit = await getPhotoLimit(req.user)
    if (Array.isArray(req.body.images) && req.body.images.length > photoLimit) {
      return res.status(400).json({
        error: `Your current plan allows up to ${photoLimit} photos per listing. Please remove some photos or upgrade your plan.`,
        photoLimit,
      })
    }

    const property = await Property.create({ ...pickEditableFields(req.body, req.user), owner: req.user._id })

    // Increment listing usage count (skip for admin / unlimited plan)
    if (req.user.role !== 'ADMIN') {
      await Subscription.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { listingsUsed: 1 } }
      )
    }

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
      const photoLimit = await getPhotoLimit(req.user)
      if (req.body.images.length > photoLimit) {
        return res.status(400).json({
          error: `Your current plan allows up to ${photoLimit} photos per listing. Please remove some photos or upgrade your plan.`,
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

    // Decrement listing usage count
    if (req.user.role !== 'ADMIN' && property.owner) {
      await Subscription.findOneAndUpdate(
        { user: property.owner },
        { $inc: { listingsUsed: -1 } }
      )
    }

    res.json({ message: 'Property deleted successfully' })
  } catch (err) { next(err) }
}