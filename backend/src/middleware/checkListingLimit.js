import Subscription from '../models/Subscription.js'
import Property from '../models/Property.js'
import { PLANS } from '../config/plans.js'

export const checkListingLimit = async (req, res, next) => {
  try {
    // Admin bypasses all limits
    if (req.user.role === 'ADMIN') return next()

    let sub = await Subscription.findOne({ user: req.user._id })
    if (!sub) {
      sub = await Subscription.create({
        user: req.user._id,
        plan: 'FREE',
        listingLimit: PLANS.FREE.listingLimit,
        status: 'ACTIVE',
      })
    }

    // Check if paid plan expired → downgrade to FREE
    if (sub.plan !== 'FREE' && sub.expiryDate && new Date() > sub.expiryDate) {
      sub.plan = 'FREE'
      sub.listingLimit = PLANS.FREE.listingLimit
      sub.status = 'EXPIRED'
      await sub.save()
    }

    // Count actual active listings owned by this user
    const activeCount = await Property.countDocuments({ owner: req.user._id })

    if (sub.plan === 'UNLIMITED') return next()

    if (activeCount >= sub.listingLimit) {
      return res.status(403).json({
        error: `You've reached your listing limit (${sub.listingLimit}). Please upgrade your plan to add more properties.`,
        currentPlan: sub.plan,
        limit: sub.listingLimit,
        used: activeCount,
        upgradeRequired: true,
      })
    }

    req.subscription = sub
    next()
  } catch (err) { next(err) }
}
