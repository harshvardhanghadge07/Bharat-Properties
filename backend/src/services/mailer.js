import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// ─── Priority order ────────────────────────────────────────────────────────
// 1. Brevo HTTP API    — primary (HTTPS port 443, never blocked on any cloud host)
// 2. Brevo SMTP relay  — secondary (port 587, blocked on Render free tier)
// 3. Resend HTTP API   — tertiary (requires RESEND_FROM verified sender domain)
// 4. Gmail SMTP        — local dev only (port 465/587, blocked on cloud hosts)
// 5. Dev mode          — logs the link to console when nothing is configured

// ─── 1. Brevo HTTP REST API ───────────────────────────────────────────────
// Uses port 443 — never blocked. Get your API key from:
// Brevo Dashboard → Settings → API Keys → Create a new API key
// Add it to your Render env vars as:  BREVO_API_KEY=your_key_here
const sendViaBrevoHttp = async ({ from, to, subject, html, replyTo }) => {
  if (!process.env.BREVO_API_KEY) return null

  // Parse "Name <email>" or plain email string into Brevo sender object
  const parseSender = (str) => {
    const m = String(str).match(/^(.+?)\s*<([^>]+)>\s*$/)
    return m ? { name: m[1].trim(), email: m[2].trim() } : { email: str.trim() }
  }

  const body = {
    sender: parseSender(from),
    to: [{ email: to }],
    subject,
    htmlContent: html,
  }
  if (replyTo) body.replyTo = parseSender(replyTo)

  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Brevo API ${resp.status}: ${err}`)
  }
  return true
}

// ─── 2. Brevo SMTP relay ──────────────────────────────────────────────────
// Port 587 — works locally but Render's free tier blocks outbound SMTP.
const getBrevoSmtpTransporter = () => {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) return null
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

// ─── 3. Resend HTTP API ───────────────────────────────────────────────────
// Works on all cloud hosts. 'onboarding@resend.dev' only delivers to the
// Resend account owner — set RESEND_FROM to a verified sender domain for
// production: https://resend.com/domains
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// ─── 4. Gmail SMTP ───────────────────────────────────────────────────────
// Works locally (use an App Password). Blocked on cloud hosts.
const getGmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null
  const port = parseInt(process.env.EMAIL_PORT || '465')
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

const getFromAddress = () =>
  process.env.BREVO_FROM ||
  process.env.RESEND_FROM ||
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  'noreply@bharat-realestate.com'

// ─── Generic send helper ───────────────────────────────────────────────────
// Returns true on success, false on total failure.
const sendEmail = async ({ to, subject, html, devLog, replyTo }) => {
  const from = getFromAddress()

  // 1. Brevo HTTP REST API — primary on cloud (port 443, always reachable)
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevoHttp({ from, to, subject, html, replyTo })
      console.log(`✅ Email sent via Brevo HTTP API to: ${to}`)
      return true
    } catch (err) {
      console.error('⚠️ Brevo HTTP API failed:', err.message, '— trying fallback...')
    }
  }

  // 2. Brevo SMTP relay — works locally, blocked on Render free tier
  const brevoSmtp = getBrevoSmtpTransporter()
  if (brevoSmtp) {
    try {
      const smtpFrom = process.env.BREVO_FROM || 'Bharat Properties <bharatestates3@gmail.com>'
      await brevoSmtp.sendMail({ from: smtpFrom, to, subject, html, replyTo })
      console.log(`✅ Email sent via Brevo SMTP to: ${to}`)
      return true
    } catch (err) {
      console.error('⚠️ Brevo SMTP failed:', err.message, '— trying fallback...')
    }
  }

  // 3. Resend HTTP API — works on all cloud hosts, needs verified sender domain
  const resend = getResend()
  if (resend) {
    try {
      const resendFrom = process.env.RESEND_FROM || 'onboarding@resend.dev'
      const { error } = await resend.emails.send({ from: resendFrom, to, subject, html, replyTo })
      if (error) throw new Error(error.message)
      console.log(`✅ Email sent via Resend to: ${to}`)
      return true
    } catch (err) {
      console.error('⚠️ Resend failed:', err.message, '— trying fallback...')
    }
  }

  // 4. Gmail SMTP — local dev fallback, blocked on cloud
  const gmail = getGmailTransporter()
  if (gmail) {
    try {
      const gmailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER
      await gmail.sendMail({ from: gmailFrom, to, subject, html, replyTo })
      console.log(`✅ Email sent via Gmail SMTP to: ${to}`)
      return true
    } catch (err) {
      console.error('⚠️ Gmail SMTP failed:', err.message)
    }
  }

  // 5. Nothing worked — log the link so it isn't lost
  console.warn(`\n⛔ All email providers failed. Reset link NOT delivered to: ${to}`)
  console.log(`📧 [FALLBACK LOG] ${devLog}\n`)
  return false
}

// ─── Public helpers ────────────────────────────────────────────────────────

export const sendVerificationEmail = async (user, verifyUrl) => {
  return sendEmail({
    to: user.email,
    subject: 'Verify your Bharat Properties email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#E8532A">Verify your email</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Welcome to Bharat Properties! Please confirm this is your email address by clicking the button below. This link is valid for <b>24 hours</b>.</p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}" style="background:#E8532A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color:#888;font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br/>${verifyUrl}</p>
      </div>
    `,
    devLog: `Email verification link for ${user.email}:\n   ${verifyUrl}`,
  })
}

export const sendResetPasswordEmail = async (user, resetUrl, resetToken) => {
  const token = resetToken || (resetUrl.split('/').pop() || '')
  return sendEmail({
    to: user.email,
    subject: 'Reset your Bharat Properties password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
        <h2 style="color:#E8532A">Reset your password</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>We received a request to reset the password for your Bharat Properties account. Click the button below to choose a new password. This link and code are valid for <b>60 minutes</b>.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#E8532A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
            Reset Password
          </a>
        </p>
        ${token ? `
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:12px 16px;margin:20px 0;">
          <p style="margin:0 0 6px 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Your Reset Code</p>
          <code style="display:block;word-break:break-all;font-size:13px;color:#212529;background:#fff;padding:8px 10px;border-radius:4px;border:1px solid #dee2e6;">${token}</code>
          <p style="margin:6px 0 0 0;font-size:11px;color:#6c757d;">You can paste this code directly on the reset password page if the button does not open.</p>
        </div>` : ''}
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
        <p style="color:#888;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      </div>
    `,
    devLog: `Password reset link for ${user.email}:\n   ${resetUrl}`,
  })
}

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

export const sendInquiryEmail = async (inquiry, ownerEmail) => {
  if (!ownerEmail) throw new Error('Listing owner email is required')
  const to = ownerEmail
  return sendEmail({
    to,
    replyTo: inquiry.email,
    subject: `New Inquiry: ${inquiry.property?.title || 'Property'}`,
    html: `
      <h2 style="color:#E8532A">New Property Inquiry — Bharat Properties</h2>
      <p><b>Property:</b> ${escapeHtml(inquiry.property?.title)} (${escapeHtml(inquiry.property?.city)})</p>
      <p><b>From:</b> ${escapeHtml(inquiry.name)}</p>
      <p><b>Email:</b> ${escapeHtml(inquiry.email)}</p>
      <p><b>Phone:</b> ${escapeHtml(inquiry.phone || 'Not provided')}</p>
      <p><b>Message:</b><br/>${escapeHtml(inquiry.message)}</p>
    `,
    devLog: `Inquiry notification for: ${inquiry.property?.title}`,
  })
}
