import test from 'node:test'
import assert from 'node:assert/strict'
import Property from '../models/Property.js'
import { createProperty, updateProperty, deleteProperty, getProperties, getProperty } from './propertyController.js'

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this },
})
const next = (error) => { throw error }
const user = { _id: '507f1f77bcf86cd799439011', role: 'USER' }

test('rental status cannot be created, updated or searched', async (t) => {
  const property = { owner: user._id, save: async () => { throw new Error('Must not save') } }
  t.mock.method(Property, 'findById', async () => property)
  t.mock.method(Property, 'create', async () => { throw new Error('Must not create') })
  for (const role of ['USER', 'ADMIN']) {
    const req = { user: { ...user, role }, params: { id: user._id }, body: { status: 'RENTED' } }
    for (const action of [createProperty, updateProperty]) {
      const res = response()
      await action(req, res, next)
      assert.equal(res.statusCode, 400)
    }
  }
  const res = response()
  await getProperties({ query: { status: 'RENTED' } }, res, next)
  assert.equal(res.statusCode, 400)
})

test('old rental detail links are hidden from public visitors', async (t) => {
  t.mock.method(Property, 'findById', () => ({ populate: async () => ({ status: 'RENTED', owner: user._id }) }))
  const res = response()
  await getProperty({ params: { id: user._id } }, res, next)
  assert.equal(res.statusCode, 404)
})

test('map coordinates persist on create/edit, including zero, and can be removed', async (t) => {
  t.mock.method(Property, 'create', async (data) => data)
  const property = { owner: user._id, lat: 19, lng: 73, save: async () => {} }
  t.mock.method(Property, 'findById', async () => property)
  for (const point of [{ lat: 19.07609, lng: 72.877426 }, { lat: 0, lng: 0 }, { lat: null, lng: null }]) {
    for (const action of [createProperty, updateProperty]) {
      const res = response()
      await action({ user, params: { id: user._id }, body: point }, res, next)
      assert.equal(res.body.lat, point.lat)
      assert.equal(res.body.lng, point.lng)
    }
  }
  property.lat = 19
  property.lng = 73
  await updateProperty({ user, params: { id: user._id }, body: { title: 'New title' } }, response(), next)
  assert.equal(property.lat, 19)
  assert.equal(property.lng, 73)
})

test('invalid or partial map coordinates do not reach storage', async (t) => {
  t.mock.method(Property, 'create', async () => { throw new Error('Must not create') })
  t.mock.method(Property, 'findById', async () => ({ owner: user._id, save: async () => { throw new Error('Must not save') } }))
  for (const point of [{ lat: 91, lng: 72 }, { lat: 19, lng: 181 }, { lat: 19 }, { lat: null, lng: 72 }, { lat: 'bad', lng: 72 }]) {
    for (const action of [createProperty, updateProperty]) {
      const res = response()
      await action({ user, params: { id: user._id }, body: point }, res, next)
      assert.equal(res.statusCode, 400)
    }
  }
})

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
