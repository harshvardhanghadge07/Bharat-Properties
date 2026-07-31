import Property from '../models/Property.js'

// Smart Bharat AI Assistant Engine
export const chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' })
    }

    const query = message.trim().toLowerCase()
    let replyText = ''
    let matchedProperties = []
    let suggestions = []

    // 1. Check for EMI calculation request
    const emiMatch = query.match(/(?:emi|loan|calculate).*?(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k|thousand)?/i) || query.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\s*(?:loan|emi)/i)

    if (emiMatch || query.includes('emi') || query.includes('loan calculator')) {
      let amount = parseFloat(emiMatch ? emiMatch[1] : '50')
      const unit = (emiMatch ? emiMatch[2] : 'lakh')?.toLowerCase()

      if (unit?.startsWith('cr')) amount *= 10000000
      else if (unit?.startsWith('l') || unit?.startsWith('lac')) amount *= 100000
      else if (amount < 1000) amount *= 100000 // Default to lakhs if raw number passed like "50"

      const rate = 8.5 // Average home loan rate in India
      const years = 20
      const monthlyRate = rate / 12 / 100
      const months = years * 12
      const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      const totalPayment = emi * months
      const totalInterest = totalPayment - amount

      replyText = `🤖 **Bharat AI EMI Breakdown** for a loan of **₹${(amount / 100000).toFixed(2)} Lakhs** at **8.5% p.a.** for **20 years**:\n\n• **Monthly EMI**: ₹${Math.round(emi).toLocaleString('en-IN')}\n• **Total Interest Payable**: ₹${Math.round(totalInterest / 100000).toFixed(2)} Lakhs\n• **Total Amount**: ₹${Math.round(totalPayment / 100000).toFixed(2)} Lakhs\n\nWould you like to explore properties within this budget?`
      suggestions = ['Find properties under 50 Lakhs', 'Contact Home Loan Advisor', 'Properties in Mumbai']
      return res.json({ replyText, properties: matchedProperties, suggestions })
    }

    // 2. Help / How to post / Email verification / Support topics
    if (query.includes('post') || query.includes('sell') || query.includes('list')) {
      replyText = `🤖 **How to Post Your Property on Bharat Properties**:\n\n1️⃣ Click the **"Post Property"** button at the top header.\n2️⃣ Fill in your property details (Location, City, Price, Sqft, Amenities).\n3️⃣ Upload clear photos of your property.\n4️⃣ Click **Publish** to make it live for thousands of verified buyers!\n\nPro sellers get 5x more lead inquiries with featured badges!`
      suggestions = ['View Pricing Plans', 'How to get verified?', 'Contact Support']
      return res.json({ replyText, properties: [], suggestions })
    }

    if (query.includes('email') || query.includes('verify') || query.includes('password') || query.includes('login')) {
      replyText = `🤖 **Account & Verification Support**:\n\n• **Email Verification**: Check your inbox & spam folder for the verification link. If you didn't receive it, use the **Resend Verification** button on login.\n• **Forgot Password**: Click "Forgot Password" on login to receive a secure password reset link.\n\nNeed direct assistance? You can also contact our 24/7 Support Team.`
      suggestions = ['Go to Login page', 'Open Help & Support Center', 'WhatsApp Support']
      return res.json({ replyText, properties: [], suggestions })
    }

    // 3. Search DB for matching properties
    const searchFilter = { status: 'ACTIVE', approved: true }

    // Detect cities
    const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Thane', 'Noida', 'Gurgaon', 'Jalna']
    const matchedCity = CITIES.find((c) => query.includes(c.toLowerCase()))
    if (matchedCity) {
      searchFilter.city = new RegExp(matchedCity, 'i')
    }

    // Detect type
    if (query.includes('villa')) searchFilter.type = 'VILLA'
    else if (query.includes('plot') || query.includes('land')) searchFilter.type = 'PLOT'
    else if (query.includes('commercial') || query.includes('shop') || query.includes('office')) searchFilter.type = 'COMMERCIAL'
    else if (query.includes('apartment') || query.includes('flat') || query.includes('bhk')) searchFilter.type = 'APARTMENT'

    // Detect rent vs buy
    if (query.includes('rent') || query.includes('lease')) {
      searchFilter.status = 'RENTED'
    }

    // Find up to 4 matching properties
    matchedProperties = await Property.find(searchFilter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(4)
      .select('title price city location bedrooms bathrooms areaSqft images type status')

    if (matchedProperties.length > 0) {
      const cityText = matchedCity ? `in **${matchedCity}**` : ''
      replyText = `🤖 Here are top matching properties ${cityText} based on your request:`
      suggestions = ['Filter by Budget', 'View All Properties', 'Calculate EMI']
    } else {
      // Fallback AI conversation
      replyText = `🤖 I'm **Bharat AI Assistant**! I can help you search properties across India, calculate home loan EMIs, post property listings, or answer support questions.\n\nTry asking me:\n• *"Show 3 BHK apartments in Mumbai"*\n• *"Calculate EMI for 60 Lakhs"*\n• *"How to list my property?"*`
      suggestions = ['Properties in Mumbai', 'Properties in Pune', 'Calculate 50 Lakh EMI']
    }

    res.json({ replyText, properties: matchedProperties, suggestions })
  } catch (err) {
    next(err)
  }
}
