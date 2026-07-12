import express from 'express'
import {
  getMySubscription, getPlans, createSubscriptionOrder,
  verifyAndActivate, getAllSubscriptions, manualActivateSubscription, revertToFree,
} from '../controllers/subscriptionController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/plans',           getPlans)
router.get('/me',              authenticate, getMySubscription)
router.post('/create-order',   authenticate, createSubscriptionOrder)
router.post('/verify',         authenticate, verifyAndActivate)
router.get('/all',             authenticate, requireAdmin, getAllSubscriptions)
router.post('/manual-activate',        authenticate, requireAdmin, manualActivateSubscription)
router.post('/:userId/revert-to-free', authenticate, requireAdmin, revertToFree)

export default router
