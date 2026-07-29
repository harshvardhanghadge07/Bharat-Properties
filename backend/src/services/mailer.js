import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// ─── Resend (HTTP API — works on Render, never blocked) ───────────────────
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// ─── Nodemailer fallback (for local dev with Gmail) ───────────────────────
// Render and most cloud hosts block outbound SMTP, so this only works locally.
const getTransporter = () => {
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

// Resolve the FROM address:
//  - If Resend: must be a verified domain address (e.g. noreply@yourdomain.com)
//    OR use Resend's shared sandbox: "onboarding@resend.dev" (only sends to owner's email)
//  - If Nodemailer: use EMAIL_FROM / EMAIL_USER
const getFromAddress = () =>
  process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@bharatproperties.in'

// ─── Generic send helper ───────────────────────────────────────────────────
// Tries Resend first (production), falls back to Nodemailer (local dev),
// and logs to console if neither is configured.
const sendEmail = async ({ to, subject, html, devLog }) => {
  const resend = getResend()
  if (resend) {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
    })
    if (error) throw new Error(`Resend error: ${error.message}`)
    console.log(`✅ Email sent via Resend to: ${to}`)
    return
  }

  const transporter = getTransporter()
  if (transporter) {
    await transporter.sendMail({ from: getFromAddress(), to, subject, html })
    console.log(`✅ Email sent via Nodemailer to: ${to}`)
    return
  }

  // Neither configured — dev mode, just log the link
  console.log(`\n📧 [DEV MODE] ${devLog}\n   (Set RESEND_API_KEY in .env to send real emails)\n`)
}

// ─── Public helpers ────────────────────────────────────────────────────────

export const sendVerificationEmail = async (user, verifyUrl) => {
  await sendEmail({
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

export const sendResetPasswordEmail = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'Reset your Bharat Properties password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#E8532A">Reset your password</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>We received a request to reset the password for your Bharat Properties account. Click the button below to choose a new password. This link is valid for <b>30 minutes</b>.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background:#E8532A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
        <p style="color:#888;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      </div>
    `,
    devLog: `Password reset link for ${user.email}:\n   ${resetUrl}`,
  })
}

export const sendInquiryEmail = async (inquiry) => {
  await sendEmail({
    to: process.env.EMAIL_USER || process.env.RESEND_FROM,
    subject: `New Inquiry: ${inquiry.property?.title || 'Property'}`,
    html: `
      <h2 style="color:#E8532A">New Property Inquiry — Bharat Properties</h2>
      <p><b>Property:</b> ${inquiry.property?.title} (${inquiry.property?.city})</p>
      <p><b>From:</b> ${inquiry.name}</p>
      <p><b>Email:</b> ${inquiry.email}</p>
      <p><b>Phone:</b> ${inquiry.phone || 'Not provided'}</p>
      <p><b>Message:</b><br/>${inquiry.message}</p>
    `,
    devLog: `Inquiry notification for: ${inquiry.property?.title}`,
  })
}
