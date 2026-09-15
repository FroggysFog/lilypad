/**
 * LilyPad ERP - Read.ai Webhook Integration
 * Stage 1: capture and (once configured) verify incoming webhooks so a
 * real payload can be inspected before building the actual meeting-note/
 * suggested-task derivation - see LilyPadReadAiEvent's header comment
 * for why this starts as a raw capture rather than a strict parser.
 */

const crypto = require('crypto')
const winston = require('../logger')
const LilyPadReadAiEvent = require('../models/lilypadReadAiEvent')

function getSigningSecret () {
  return process.env.READ_AI_WEBHOOK_SECRET || ''
}

// Read.ai signs each webhook with a per-webhook HMAC key (set at
// app.read.ai/analytics/integrations/webhooks). The exact header name
// isn't confirmed against a real payload yet, so this checks the most
// likely candidates rather than committing to one - whichever header is
// actually present on a real event gets logged, so this can be
// tightened to the confirmed name in one line once we see one.
const CANDIDATE_SIGNATURE_HEADERS = ['x-read-signature', 'x-readai-signature', 'read-signature', 'x-signature']

function verifySignature (rawBody, headers) {
  const secret = getSigningSecret()
  if (!secret) return { verified: false, reason: 'READ_AI_WEBHOOK_SECRET not configured yet' }
  if (!rawBody) return { verified: false, reason: 'no raw body captured' }

  const lowerHeaders = {}
  Object.keys(headers || {}).forEach((k) => { lowerHeaders[k.toLowerCase()] = headers[k] })

  const headerUsed = CANDIDATE_SIGNATURE_HEADERS.find((h) => lowerHeaders[h])
  if (!headerUsed) return { verified: false, reason: 'no recognized signature header present' }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const provided = String(lowerHeaders[headerUsed] || '').replace(/^sha256=/, '')

  try {
    const match = expected.length === provided.length &&
      crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
    return { verified: match, reason: match ? '' : 'signature mismatch', headerUsed }
  } catch (err) {
    return { verified: false, reason: 'malformed signature header', headerUsed }
  }
}

/**
 * Every webhook gets captured regardless of verification outcome (so an
 * unverified/misconfigured test event is still visible for debugging),
 * but nothing downstream should treat an unverified event as trustworthy
 * once real processing is built here.
 */
async function handleWebhook (rawBody, headers, parsedBody) {
  const { verified, reason, headerUsed } = verifySignature(rawBody, headers)

  if (!verified) {
    winston.warn(`Read.ai webhook not signature-verified (${reason}) - captured for inspection only.`)
  } else {
    winston.info(`Read.ai webhook verified via header "${headerUsed}".`)
  }

  return LilyPadReadAiEvent.create({
    trigger: (parsedBody && parsedBody.trigger) || '',
    signatureVerified: verified,
    rawPayload: parsedBody || {},
    headers: headers || {}
  })

  // Deliberately stops here for now - once a real captured event confirms
  // the actual field names for the meeting summary, action items, and any
  // calendar-linking identifier, this is where matching to a
  // LilyPadCalendarEvent, storing the summary, and creating
  // LilyPadSuggestedTask rows from action items belongs.
}

module.exports = {
  isConfigured: () => Boolean(getSigningSecret()),
  verifySignature,
  handleWebhook
}
