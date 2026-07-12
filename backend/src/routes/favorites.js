import express from 'express'
import { getMyFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/',                  authenticate, getMyFavorites)
router.post('/:propertyId',      authenticate, addFavorite)
router.delete('/:propertyId',    authenticate, removeFavorite)

export default router
