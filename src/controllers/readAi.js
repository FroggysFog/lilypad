/**
 * LilyPad ERP - Read.ai Webhook Controller
 */

const readAiService = require('../services/readAiService')
const LilyPadReadAiEvent = require('../models/lilypadReadAiEvent')

const readAiController = {}

/**
 * POST /api/v1/lilypad/integrations/read-ai/webhook
 * Public - called by Read.ai's servers, not a logged-in browser session.
 * Signature verification (once READ_AI_WEBHOOK_SECRET is set) is the
 * actual authentication here, not a session cookie.
 */
readAiController.webhook = async function (req, res) {
  try {
    await readAiService.handleWebhook(req.rawBody, req.headers, req.body)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/integrations/read-ai/events
 * Admin-only, temporary - lets a real captured payload be inspected
 * (field names for the summary/action items/any calendar-linking id)
 * before the actual parsing logic gets built against confirmed data
 * instead of guessed field names. Safe to remove once that's done.
 */
readAiController.listEvents = async function (req, res) {
  try {
    const events = await LilyPadReadAiEvent.find({}).sort({ createdAt: -1 }).limit(20)
    return res.status(200).json({ success: true, data: events })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = readAiController
