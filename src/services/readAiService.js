/**
 * LilyPad ERP - Read.ai Webhook Integration
 * Verifies and captures every webhook (see LilyPadReadAiEvent), then for
 * a verified meeting_end event: matches it to the organizer's calendar
 * event (ERP-stored or a live Microsoft-synced one - see
 * meetingNoteService.js for why those need different matching, since
 * Microsoft events are never persisted locally), stores a
 * LilyPadMeetingNote, and turns each action item into a
 * LilyPadSuggestedTask the same way email-derived tasks already work.
 */

const crypto = require('crypto')
const winston = require('../logger')
const LilyPadReadAiEvent = require('../models/lilypadReadAiEvent')
const meetingNoteService = require('./meetingNoteService')

function getSigningSecret () {
  return process.env.READ_AI_WEBHOOK_SECRET || ''
}

// Confirmed against a real Read.ai test event's headers (x-read-signature,
// hex-encoded SHA-256 digest, 64 chars).
const SIGNATURE_HEADER = 'x-read-signature'

/**
 * Read.ai's signing key (shown once, at creation, in their webhook UI)
 * looks base64-encoded - most webhook providers that hand out a
 * base64-looking key mean for it to be decoded to raw bytes before use
 * as the HMAC key, not used as the literal string. Their docs don't say
 * explicitly, so this tries the base64-decoded interpretation first and
 * falls back to the raw string, accepting whichever one actually
 * matches rather than guessing a single interpretation and silently
 * failing verification forever if it's wrong.
 */
function candidateKeys (secret) {
  const keys = [secret]
  try {
    const decoded = Buffer.from(secret, 'base64')
    // Only worth trying as a second candidate if it round-trips cleanly
    // (a non-base64 string decodes into something re-encoding won't match).
    if (decoded.toString('base64') === secret) keys.unshift(decoded)
  } catch (err) {
    // Not valid base64 - the raw string is the only candidate.
  }
  return keys
}

function verifySignature (rawBody, headers) {
  const secret = getSigningSecret()
  if (!secret) return { verified: false, reason: 'READ_AI_WEBHOOK_SECRET not configured yet' }
  if (!rawBody) return { verified: false, reason: 'no raw body captured' }

  const lowerHeaders = {}
  Object.keys(headers || {}).forEach((k) => { lowerHeaders[k.toLowerCase()] = headers[k] })

  const provided = String(lowerHeaders[SIGNATURE_HEADER] || '').replace(/^sha256=/, '')
  if (!provided) return { verified: false, reason: `no ${SIGNATURE_HEADER} header present` }

  let providedBuf
  try {
    providedBuf = Buffer.from(provided, 'hex')
  } catch (err) {
    return { verified: false, reason: 'malformed signature header' }
  }

  const matched = candidateKeys(secret).some((key) => {
    const expected = crypto.createHmac('sha256', key).update(rawBody).digest()
    return expected.length === providedBuf.length && crypto.timingSafeEqual(expected, providedBuf)
  })

  return { verified: matched, reason: matched ? '' : 'signature mismatch' }
}

/**
 * Every webhook gets captured regardless of verification outcome (so a
 * misconfigured event is still visible for debugging), but only a
 * verified meeting_end event is actually processed into a meeting note
 * and suggested tasks.
 */
async function handleWebhook (rawBody, headers, parsedBody) {
  const { verified, reason } = verifySignature(rawBody, headers)

  if (!verified) {
    winston.warn(`Read.ai webhook not signature-verified (${reason}) - captured for inspection only.`)
  }

  const event = await LilyPadReadAiEvent.create({
    trigger: (parsedBody && parsedBody.trigger) || '',
    signatureVerified: verified,
    rawPayload: parsedBody || {},
    headers: headers || {}
  })

  if (verified && parsedBody && parsedBody.trigger === 'meeting_end') {
    try {
      await meetingNoteService.processReadAiEvent(event)
      event.processed = true
      await event.save()
    } catch (err) {
      winston.error(`Read.ai meeting processing failed for event ${event._id}: ${err.message}`)
      event.processingError = err.message
      await event.save()
    }
  }

  return event
}

module.exports = {
  isConfigured: () => Boolean(getSigningSecret()),
  verifySignature,
  handleWebhook
}
