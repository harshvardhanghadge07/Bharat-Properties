import test from 'node:test'
import assert from 'node:assert/strict'
import nodemailer from 'nodemailer'
import Property from '../models/Property.js'
import Inquiry from '../models/Inquiry.js'
import { createInquiry } from './inquiryController.js'

const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } })
const body = { propertyId: '507f1f77bcf86cd799439011', name: 'Buyer', email: 'buyer@example.com', message: '<script>test</script>', to: 'attacker@example.com' }
function mockEmail(t, sendMail) {
  const names = ['BREVO_SMTP_USER', 'BREVO_SMTP_PASS', 'EMAIL_USER', 'EMAIL_PASS', 'RESEND_API_KEY']
  const previous = Object.fromEntries(names.map((key) => [key, process.env[key]]))
  names.forEach((key) => delete process.env[key])
  process.env.EMAIL_USER = 'platform@example.com'
  process.env.EMAIL_PASS = 'test-only'
  t.after(() => names.forEach((key) => previous[key] === undefined ? delete process.env[key] : process.env[key] = previous[key]))
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail }))
}
function mockProperty(t, owner) {
  t.mock.method(Property, 'findById', () => ({ populate: async () => ({ status: 'ACTIVE', owner }) }))
}
function mockInquiry(t) {
  t.mock.method(Inquiry, 'create', async (data) => ({ ...data, async populate() { this.property = { title: 'Property', city: 'Mumbai' } } }))
}

test('inquiries go only to each listing owner login email, with buyer reply-to', async (t) => {
  const sent = []
  mockEmail(t, async (mail) => { sent.push(mail) })
  mockInquiry(t)
  const owner = { email: 'first-owner@example.com' }
  mockProperty(t, owner)
  for (const email of ['first-owner@example.com', 'second-owner@example.com']) {
    owner.email = email
    const res = response()
    await createInquiry({ body }, res, (error) => { throw error })
    assert.equal(res.statusCode, 201)
    assert.equal(res.body.emailDelivered, true)
    assert.equal(sent.at(-1).to, email)
    assert.equal(sent.at(-1).replyTo, body.email)
    assert.match(sent.at(-1).html, /&lt;script&gt;/)
    assert.doesNotMatch(sent.at(-1).html, /<script>/)
  }
})

test('ownerless listings cannot send an inquiry to the platform by mistake', async (t) => {
  mockProperty(t, null)
  t.mock.method(Inquiry, 'create', async () => { throw new Error('Must not save') })
  const res = response()
  await createInquiry({ body }, res, (error) => { throw error })
  assert.equal(res.statusCode, 409)
})

test('email failure preserves the inquiry and reports unsuccessful delivery', async (t) => {
  mockEmail(t, async () => { throw new Error('Test provider unavailable') })
  mockInquiry(t)
  mockProperty(t, { email: 'owner@example.com' })
  const res = response()
  await createInquiry({ body }, res, (error) => { throw error })
  assert.equal(res.statusCode, 201)
  assert.equal(res.body.emailDelivered, false)
  assert.equal(res.body.inquiry.email, body.email)
})
