import express from 'express'
import { createInquiry, getInquiries, markRead, deleteInquiry } from '../controllers/inquiryController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/',              createInquiry)
router.get('/',               authenticate, requireAdmin, getInquiries)
router.put('/:id/read',       authenticate, requireAdmin, markRead)
router.delete('/:id',         authenticate, requireAdmin, deleteInquiry)

export default router
