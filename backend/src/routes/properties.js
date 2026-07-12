import express from 'express'
import {
  getProperties, getProperty, getFeaturedProperties,
  getStats, getMyProperties, createProperty, updateProperty, deleteProperty,
} from '../controllers/propertyController.js'
import { authenticate, requireAdmin, attachUserIfPresent, requireVerifiedContact } from '../middleware/auth.js'
import { checkListingLimit } from '../middleware/checkListingLimit.js'

const router = express.Router()

router.get('/',          getProperties)
router.get('/featured',  getFeaturedProperties)
router.get('/stats',     getStats)
router.get('/mine',      authenticate, getMyProperties)
router.get('/:id',       attachUserIfPresent, getProperty)

// Any authenticated user can list, as long as their email/phone is verified —
// limit enforced by subscription middleware
router.post('/',         authenticate, requireVerifiedContact, checkListingLimit, createProperty)
router.put('/:id',       authenticate, updateProperty)
router.delete('/:id',    authenticate, deleteProperty)

export default router
