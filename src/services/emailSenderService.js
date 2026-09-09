/**
 * LilyPad ERP - Reminder Email Sender
 * SMTP-only port of lilypad-hub's outlookService.js (the Graph-based
 * branch was dropped - SMTP avoids needing a new Azure app permission).
 */

const nodemailer = require('nodemailer')

function hasSmtpConfig () {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  )
}

function buildTransporter () {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    requireTLS: String(process.env.SMTP_REQUIRE_TLS || 'true').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  })
}

/**
 * Actually opens a connection and authenticates with the SMTP server
 * (nodemailer's transporter.verify()) rather than just checking that the
 * env vars are non-empty - a wrong password or unreachable host still
 * "has config" but can't send. Used by the Past Due page's readiness
 * check so launch-readiness can be confirmed without sending a real or
 * test email just to find out.
 */
async function verifySmtpConnection () {
  if (!hasSmtpConfig()) {
    return { configured: false, verified: false, error: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM must all be set.' }
  }

  try {
    await buildTransporter().verify()
    return { configured: true, verified: true, error: null }
  } catch (err) {
    return { configured: true, verified: false, error: err.message }
  }
}

async function sendReminderEmail ({ to, subject, body, senderEmail }) {
  if (!to) {
    throw new Error('Recipient email is required.')
  }

  if (!hasSmtpConfig()) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.')
  }

  const transporter = buildTransporter()

  const htmlBody = String(body || '').trim() || '<p>No message body provided.</p>'
  const result = await transporter.sendMail({
    from: senderEmail || process.env.SMTP_FROM,
    to: String(to).trim(),
    subject: String(subject || 'Reminder Notice'),
    html: htmlBody,
    text: htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  })

  return {
    success: true,
    sender: senderEmail || process.env.SMTP_FROM,
    recipient: to,
    messageId: result.messageId
  }
}

module.exports = {
  hasSmtpConfig,
  verifySmtpConnection,
  sendReminderEmail
}
