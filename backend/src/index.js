import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './lib/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import propertiesRouter from './routes/properties.js'
import authRouter from './routes/auth.js'
import inquiriesRouter from './routes/inquiries.js'
import uploadRouter from './routes/upload.js'
import subscriptionsRouter from './routes/subscriptions.js'
import analyticsRouter from './routes/analytics.js'
import favoritesRouter from './routes/favorites.js'
import prerenderRouter from './routes/prerender.js'
import { getSitemap } from './controllers/seoController.js'
import { handleRazorpayWebhook } from './controllers/subscriptionController.js'

connectDB()

const app = express()
const PORT = process.env.PORT || 4000

// Render (and most cloud hosts) sit behind a reverse proxy that sets
// X-Forwarded-For. Without this, express-rate-limit throws a validation
// error and can't correctly identify users by IP.
app.set('trust proxy', 1)

// --- CORS setup -------------------------------------------------------
// CLIENT_URL can hold one or more comma-separated origins, e.g.:
//   CLIENT_URL=https://bharat-properties-ten.vercel.app,http://localhost:5173
// Each entry is trimmed to strip any stray whitespace/newlines that sneak
// in via copy-paste into Render's env var dashboard — an untrimmed value
// causes Node to throw "Invalid character in header content" when it
// tries to write the Access-Control-Allow-Origin header.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

console.log('✅ CORS allowed origins:', allowedOrigins)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps, health checks)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    console.warn(`🚫 CORS blocked request from origin: ${origin}`)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Razorpay webhook MUST come before express.json() and receive the RAW body —
// signature verification hashes the exact raw bytes Razorpay sent, not a re-serialized object.
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'Bharat Properties API running', db: 'MongoDB' })
)


app.use('/api/properties', propertiesRouter)
app.use('/api/auth', authRouter)
app.use('/api/inquiries', inquiriesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/favorites', favoritesRouter)

// SEO: dynamic sitemap + crawler-only prerendered OG pages.
// nginx routes /sitemap.xml and known-bot requests here — see nginx.conf.
app.get('/sitemap.xml', getSitemap)
app.use('/prerender', prerenderRouter)

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)

app.listen(PORT, () =>
  console.log(`🚀 Bharat Properties API → http://localhost:${PORT}`)
)