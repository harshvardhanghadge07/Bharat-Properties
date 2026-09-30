import test from 'node:test'
import assert from 'node:assert/strict'
import { propertyImageUrl, propertyImageSources } from './propertyImages.js'

const original = 'https://res.cloudinary.com/demo/image/upload/v123/bharat-properties/portrait.jpg'
test('photo previews resize delivery width without cropping or changing the stored URL', () => {
  const preview = propertyImageUrl(original, 640)
  assert.equal(preview, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/v123/bharat-properties/portrait.jpg')
  assert.ok(!preview.includes('h_') && !preview.includes('c_fill'))
  assert.equal(propertyImageUrl(original, 1280).includes('w_1280/'), true)
  assert.equal(original, 'https://res.cloudinary.com/demo/image/upload/v123/bharat-properties/portrait.jpg')
})
test('responsive sources include small thumbnails and larger high-density previews', () => {
  const sources = propertyImageSources(original, [80, 160, 240])
  assert.equal(sources.split(', ').length, 3)
  assert.ok(sources.includes('w_80/v123/bharat-properties/portrait.jpg 80w'))
  assert.ok(sources.endsWith('240w'))
})
test('other hosts, local files, transformed and signed images remain usable as-is', () => {
  for (const src of [undefined, '', 'blob:local-upload', 'data:image/png;base64,test', 'https://images.unsplash.com/photo-1?w=600', original.replace('/v123/', '/s--signed--/v123/'), original.replace('/v123/', '/c_fill,w_1200/v123/'), original.replace('res.cloudinary.com', 'res.cloudinary.com.evil.test')]) {
    assert.equal(propertyImageUrl(src, 640), src)
    assert.equal(propertyImageSources(src), undefined)
  }
})
