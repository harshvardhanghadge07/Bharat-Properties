import test from 'node:test'
import assert from 'node:assert/strict'
import Property from '../models/Property.js'
import { createProperty, updateProperty, deleteProperty } from './propertyController.js'

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this },
})
const next = (error) => { throw error }
const user = { _id: '507f1f77bcf86cd799439011', role: 'USER' }

test('users can create more than two listings without subscription storage', async (t) => {
  t.mock.method(Property, 'create', async (data) => data)
  for (let i = 0; i < 4; i++) {
    const res = response()
    await createProperty({ user, body: { title: `Listing ${i}`, images: [], featured: true } }, res, next)
    assert.equal(res.statusCode, 201)
    assert.equal(res.body.owner, user._id)
    assert.equal(res.body.featured, undefined)
  }
})

test('the same five-photo limit applies to all users', async (t) => {
  t.mock.method(Property, 'create', async (data) => data)
  for (const role of ['USER', 'ADMIN']) {
    for (const count of [5, 6]) {
      const res = response()
      await createProperty({ user: { ...user, role }, body: { images: Array(count).fill('photo.jpg') } }, res, next)
      assert.equal(res.statusCode, count === 5 ? 201 : 400)
    }
  }
})

test('free listings retain ownership protection and can be edited and deleted', async (t) => {
  let deleted = false
  const property = { owner: user._id, save: async () => {}, deleteOne: async () => { deleted = true } }
  t.mock.method(Property, 'findById', async () => property)
  const req = { user, params: { id: user._id }, body: { title: 'Updated', images: [] } }
  await updateProperty(req, response(), next)
  assert.equal(property.title, 'Updated')
  const denied = response()
  await deleteProperty({ ...req, user: { ...user, _id: 'other-owner' } }, denied, next)
  assert.equal(denied.statusCode, 403)
  assert.equal(deleted, false)
  await deleteProperty(req, response(), next)
  assert.equal(deleted, true)
})
