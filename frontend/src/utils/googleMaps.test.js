import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMapPoint } from './googleMaps.js'

test('Google pin parsing accepts exact pins but never mistakes camera position for a pin', () => {
  assert.deepEqual(parseMapPoint('19.076090, 72.877426'), { lat: 19.07609, lng: 72.877426 })
  assert.deepEqual(parseMapPoint('0,0'), { lat: 0, lng: 0 })
  assert.deepEqual(parseMapPoint('https://www.google.com/maps?q=19,72'), { lat: 19, lng: 72 })
  assert.deepEqual(parseMapPoint('https://www.google.com/maps/place/Test/@18,71,12z/data=!3d19!4d72'), { lat: 19, lng: 72 })
  for (const value of ['91,72', '19,181', 'https://maps.app.goo.gl/short', 'https://www.google.com/maps/@19,72,15z', 'https://example.com/?q=19,72']) assert.equal(parseMapPoint(value), null)
})
