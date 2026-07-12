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

const app  = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))

// Razorpay webhook MUST come before express.json() and receive the RAW body —
// signature verification hashes the exact raw bytes Razorpay sent, not a re-serialized object.
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'Bharat Properties API running', db: 'MongoDB' })
)

app.use('/api/properties',    propertiesRouter)
app.use('/api/auth',          authRouter)
app.use('/api/inquiries',     inquiriesRouter)
app.use('/api/upload',        uploadRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/analytics',     analyticsRouter)
app.use('/api/favorites',     favoritesRouter)

// SEO: dynamic sitemap + crawler-only prerendered OG pages.
// nginx routes /sitemap.xml and known-bot requests here — see nginx.conf.
app.get('/sitemap.xml', getSitemap)
app.use('/prerender', prerenderRouter)

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)

app.listen(PORT, () =>
  console.log(`🚀 Bharat Properties API → http://localhost:${PORT}`)
)
