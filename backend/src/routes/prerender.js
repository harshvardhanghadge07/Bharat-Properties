import express from 'express'
import { prerenderProperty, prerenderGeneric } from '../controllers/seoController.js'

const router = express.Router()

router.get('/properties/:id', prerenderProperty)
router.get('*', prerenderGeneric)

export default router
