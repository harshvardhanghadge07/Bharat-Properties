import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'bharat-properties',
    // Store the original image. Incoming transformations permanently crop/resize
    // the stored asset, so responsive sizing belongs in the frontend instead.
  })
  return result.secure_url
}

export default cloudinary
