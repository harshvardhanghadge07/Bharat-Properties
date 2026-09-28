import test from 'node:test'
import assert from 'node:assert/strict'
import cloudinary, { uploadImage } from './cloudinary.js'

test('property uploads retain the original asset without incoming resizing or cropping', async (t) => {
  const originalUrl = 'https://res.cloudinary.com/test/image/upload/v1/bharat-properties/portrait.jpg'
  const upload = t.mock.method(cloudinary.uploader, 'upload', async () => ({ secure_url: originalUrl }))

  assert.equal(await uploadImage('/tmp/portrait-9x16.jpg'), originalUrl)
  assert.deepEqual(upload.mock.calls[0].arguments, [
    '/tmp/portrait-9x16.jpg',
    { folder: 'bharat-properties' },
  ])
})
