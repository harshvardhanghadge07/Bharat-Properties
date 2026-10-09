import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareListing, typeFilter, normalizeWhatsApp } from './listingValidation.js'
import { PROPERTY_RULES, DETAIL_RULES } from './propertyRules.js'
import { PROPERTY_CONFIG, DETAIL_FIELDS, propertyPayload, normalizeWhatsApp as frontendWhatsApp } from '../../../frontend/src/utils/propertyFields.js'
import Property from '../models/Property.js'

test('frontend and backend agree on fields for every property type', () => {
  assert.deepEqual(PROPERTY_RULES, PROPERTY_CONFIG)
  assert.deepEqual(DETAIL_RULES, DETAIL_FIELDS)
})

test('changing a home into a plot removes room counts and unrelated details', () => {
  const payload = prepareListing({ type: 'PLOT', bedrooms: 3, bathrooms: 2, details: { roomCount: 3, plotLengthFt: 50, landUse: 'Residential' } }, { type: 'VILLA' })
  assert.equal(payload.bedrooms, null)
  assert.equal(payload.bathrooms, null)
  assert.deepEqual(payload.details, { plotLengthFt: 50, landUse: 'Residential' })
  assert.deepEqual(prepareListing({ type: 'PLOT' }, { type: 'APARTMENT', details: { floorNumber: 2 } }).details, {})
})

test('farmhouse has optional house area and rooms; row house needs room counts', () => {
  const farmhouse = prepareListing({ type: 'FARMHOUSE', areaSqft: 43560, details: { builtUpAreaSqft: 1200, waterSupply: 'Borewell' } })
  assert.equal(farmhouse.details.builtUpAreaSqft, 1200)
  assert.throws(() => prepareListing({ type: 'ROW_HOUSE', bedrooms: null, bathrooms: 2 }), /bedrooms/)
  assert.doesNotThrow(() => prepareListing({ type: 'ROW_HOUSE', bedrooms: 0, bathrooms: 1 }))
  assert.throws(() => prepareListing({ type: 'APARTMENT', bedrooms: 2.5, bathrooms: 1 }), /whole number/)
})

test('invalid numbers and detail choices are rejected by the server', () => {
  for (const value of [0, -1, NaN, Infinity, '20']) assert.throws(() => prepareListing({ areaSqft: value }), /greater than zero/)
  assert.throws(() => prepareListing({ type: 'PLOT', details: { landUse: 'invalid' } }), /land use/)
  assert.throws(() => prepareListing({ type: 'PLOT', details: { roadWidthFt: -10 } }), /road width/)
})

test('merged categories still find legacy listings', () => {
  assert.deepEqual(typeFilter('VILLA'), typeFilter('BUNGALOW'))
  assert.ok(typeFilter('VILLA').$in.includes('BUNGALOW'))
  assert.ok(typeFilter('APARTMENT').$in.includes('FLAT'))
  assert.ok(typeFilter('PLOT').$in.includes('LAND'))
})

test('WhatsApp numbers normalize consistently without platform fallbacks', () => {
  for (const [input, output] of [['98765 43210', '919876543210'], ['+44 7700 900123', '447700900123'], ['0091 98765 43210', '919876543210'], ['', ''], ['bad1234567890', ''], ['123', '']]) {
    assert.equal(normalizeWhatsApp(input), output)
    assert.equal(frontendWhatsApp(input), output)
  }
  assert.throws(() => prepareListing({ whatsappNumber: 'bad' }), /WhatsApp/)
  const international = prepareListing({ whatsappNumber: '+49 30123456' }).whatsappNumber
  assert.equal(international, '+4930123456')
  assert.equal(frontendWhatsApp(international), '4930123456')
  assert.equal(prepareListing({ whatsappNumber: international }).whatsappNumber, international)
})

test('form payloads preserve zero values and round-trip type-specific details through storage', async () => {
  for (const type of Object.keys(PROPERTY_CONFIG)) {
    const payload = propertyPayload({ type, title: 'Listing', description: 'Test', price: '100000', areaSqft: '1000', bedrooms: '0', bathrooms: '1', location: 'Locality', city: 'Mumbai', state: 'Maharashtra', whatsappNumber: '+91 98765 43210', details: { floorNumber: '0', builtUpAreaSqft: '500', roomCount: '10', roadWidthFt: '20' } })
    const prepared = prepareListing(payload)
    const property = new Property(prepared)
    await property.validate()
    assert.equal(property.price, 100000, `${type} must preserve its price`)
    assert.deepEqual(property.toObject().details ?? {}, prepared.details)
    assert.equal(property.whatsappNumber, '+919876543210')
    if (PROPERTY_CONFIG[type].bedrooms) assert.equal(property.bedrooms, 0)
    else assert.equal(property.bedrooms, null)
  }
})
