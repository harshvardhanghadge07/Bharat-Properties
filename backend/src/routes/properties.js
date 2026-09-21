import express from 'express'
import {
  getProperties, getProperty, getFeaturedProperties,
  getStats, getMyProperties, createProperty, updateProperty, deleteProperty,
} from '../controllers/propertyController.js'
import { authenticate, attachUserIfPresent, requireVerifiedContact } from '../middleware/auth.js'

const router = express.Router()

router.get('/',          getProperties)
router.get('/featured',  getFeaturedProperties)
router.get('/stats',     getStats)
router.get('/mine',      authenticate, getMyProperties)
router.get('/:id',       attachUserIfPresent, getProperty)

// Verified users can create unlimited free listings.
router.post('/',         authenticate, requireVerifiedContact, createProperty)
router.put('/:id',       authenticate, updateProperty)
router.delete('/:id',    authenticate, deleteProperty)

export default router
