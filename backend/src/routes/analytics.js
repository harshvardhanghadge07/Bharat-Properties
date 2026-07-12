import express from 'express'
import { getOverview } from '../controllers/analyticsController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/overview', authenticate, requireAdmin, getOverview)

export default router
