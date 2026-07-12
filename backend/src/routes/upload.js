import express from 'express'
import multer from 'multer'
import { uploadImage } from '../services/cloudinary.js'
import { authenticate } from '../middleware/auth.js'

const router  = express.Router()
const upload  = multer({ dest: '/tmp/uploads/', limits: { fileSize: 10 * 1024 * 1024 } })

// Any authenticated user can upload images for their own property listing —
// not admin-only, since regular users create listings too (see routes/properties.js)
router.post('/', authenticate, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' })
    }
    const urls = await Promise.all(req.files.map((f) => uploadImage(f.path)))
    res.json({ urls })
  } catch (err) { next(err) }
})

export default router
