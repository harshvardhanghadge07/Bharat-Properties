import Property from '../models/Property.js'
import User from '../models/User.js'
import Inquiry from '../models/Inquiry.js'
import Subscription from '../models/Subscription.js'

// GET /api/analytics/overview — admin-only dashboard summary
export const getOverview = async (req, res, next) => {
  try {
    const [
      totalProperties,
      activeProperties,
      soldProperties,
      rentedProperties,
      totalUsers,
      totalInquiries,
      unreadInquiries,
      propertiesByCity,
      propertiesByType,
      propertiesByState,
      subscriptionsByPlan,
      recentInquiries,
      listingsPerMonth,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'ACTIVE' }),
      Property.countDocuments({ status: 'SOLD' }),
      Property.countDocuments({ status: 'RENTED' }),
      User.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ read: false }),

      Property.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      Property.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Property.aggregate([
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      Subscription.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),

      Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('property', 'title city'),

      // Listings created per month, last 6 months
      Property.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ])

    res.json({
      totals: {
        properties: totalProperties,
        active: activeProperties,
        sold: soldProperties,
        rented: rentedProperties,
        users: totalUsers,
        inquiries: totalInquiries,
        unreadInquiries,
      },
      byCity: propertiesByCity.map((c) => ({ city: c._id || 'Unknown', count: c.count })),
      byType: propertiesByType.map((t) => ({ type: t._id, count: t.count })),
      byState: propertiesByState.map((s) => ({ state: s._id || 'Unknown', count: s.count })),
      byPlan: subscriptionsByPlan.map((p) => ({ plan: p._id, count: p.count })),
      recentInquiries,
      listingsPerMonth: listingsPerMonth.map((m) => ({
        label: `${m._id.month}/${m._id.year}`,
        count: m.count,
      })),
    })
  } catch (err) { next(err) }
}
