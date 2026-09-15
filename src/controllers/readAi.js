/**
 * LilyPad ERP - Read.ai Webhook Controller
 */

const readAiService = require('../services/readAiService')

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

module.exports = readAiController
