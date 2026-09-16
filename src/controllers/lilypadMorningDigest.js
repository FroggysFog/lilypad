/**
 * LilyPad ERP - Morning Report Controller
 */

const morningDigestService = require('../services/morningDigestService')

const controller = {}

/**
 * GET /api/v1/lilypad/morning-digest
 * Returns today's digest for req.user, generating it first if it
 * doesn't exist yet - this single endpoint implements the whole
 * "once per day, on first login" cadence, no scheduler needed.
 */
controller.get = async function (req, res) {
  try {
    const digest = await morningDigestService.generateDigestForOwner(req.user._id)
    return res.status(200).json({ success: true, data: digest })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/morning-digest/refresh
 */
controller.refresh = async function (req, res) {
  try {
    const digest = await morningDigestService.generateDigestForOwner(req.user._id, { force: true })
    return res.status(200).json({ success: true, data: digest })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
