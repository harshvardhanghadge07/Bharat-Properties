import nodemailer from 'nodemailer'

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // strip any accidental spaces from App Password
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
  })
}

export const sendInquiryEmail = async (inquiry) => {
  // Skip silently if email credentials not set in .env
  const transporter = getTransporter()
  if (!transporter) {
    console.log('ℹ️  Email skipped — EMAIL_USER/EMAIL_PASS not set in .env')
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Inquiry: ${inquiry.property?.title || 'Property'}`,
    html: `
      <h2 style="color:#E8532A">New Property Inquiry — Bharat Properties</h2>
      <p><b>Property:</b> ${inquiry.property?.title} (${inquiry.property?.city})</p>
      <p><b>From:</b> ${inquiry.name}</p>
      <p><b>Email:</b> ${inquiry.email}</p>
      <p><b>Phone:</b> ${inquiry.phone || 'Not provided'}</p>
      <p><b>Message:</b><br/>${inquiry.message}</p>
    `,
  })

  console.log(`✅ Inquiry email sent for: ${inquiry.property?.title}`)
}

// Sends the "verify your email" link to the user's email
export const sendVerificationEmail = async (user, verifyUrl) => {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`\n📧 [DEV MODE] Email verification link for ${user.email}:\n   ${verifyUrl}\n   (Configure EMAIL_USER/EMAIL_PASS in .env to send real emails)\n`)
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
  })

  console.log(`✅ Verification email sent to: ${user.email}`)
}

// Sends the "reset your password" link to the user's email
export const sendResetPasswordEmail = async (user, resetUrl) => {
  const transporter = getTransporter()
  if (!transporter) {
    // Dev mode fallback — print the link to the terminal instead of emailing it
    console.log(`\n🔑 [DEV MODE] Password reset link for ${user.email}:\n   ${resetUrl}\n   (Configure EMAIL_USER/EMAIL_PASS in .env to send real emails)\n`)
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
  })

  console.log(`✅ Password reset email sent to: ${user.email}`)
}
