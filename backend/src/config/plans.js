// Single source of truth for subscription plans
export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free Starter',
    price: 0,
    listingLimit: 2,
    photoLimit: 5,
    duration: null, // no expiry
    features: [
      '2 property listings free',
      'Standard listing visibility in search',
      'Up to 5 photos per listing',
      'Email support',
    ],
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'Premium',
    price: 1499,
    listingLimit: 20,
    photoLimit: 10,
    duration: 30, // days
    features: [
      'Up to 20 active listings',
      'Highlighted listing card — stands out in search results',
      'Priority placement above Free listings',
      '2 featured homepage slots',
      'Up to 10 photos per listing',
      'WhatsApp inquiry button enabled',
      'Basic performance analytics (views & inquiries)',
      'Priority email support',
    ],
  },
  UNLIMITED: {
    id: 'UNLIMITED',
    name: 'Unlimited Pro',
    price: 4999,
    listingLimit: 999999,
    photoLimit: 15,
    duration: 30, // days
    features: [
      'Unlimited active listings',
      'Top-of-search placement — above Premium & Free listings',
      'Pro Seller badge on all listings',
      'Unlimited featured homepage slots',
      'Up to 15 photos per listing',
      'Full analytics dashboard access',
      'Bulk upload via CSV',
      'Dedicated relationship manager support',
    ],
  },
}

export const PLAN_LIST = Object.values(PLANS)
