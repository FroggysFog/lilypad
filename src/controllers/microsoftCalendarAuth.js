/**
 * LilyPad ERP - Per-User Microsoft Calendar OAuth Controller
 * Session-based state handoff, same shape as controllers/salesforceAuth.js
 * - state lives in req.session across the redirect round-trip rather than
 * server-side global state, so concurrent connects by different users
 * (or in different tabs) can't clobber each other the way a single
 * module-level variable would (see microsoftTeams.js's simpler
 * single-shared-connection version of this same problem).
 */

const crypto = require('crypto')
const microsoftCalendarService = require('../services/microsoftCalendarService')

const controller = {}

controller.status = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftCalendarService.getStatus(req.user._id) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.connect = (req, res) => {
  try {
    const state = crypto.randomBytes(24).toString('hex')
    req.session.msCalendarState = state
    return res.redirect(microsoftCalendarService.buildAuthorizationUrl(state))
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message })
  }
}

controller.callback = async (req, res) => {
  try {
    const expectedState = req.session.msCalendarState
    delete req.session.msCalendarState

    if (!req.query.code || !req.query.state || req.query.state !== expectedState) {
      throw new Error('Invalid or expired Microsoft OAuth state - please try connecting again.')
    }

    await microsoftCalendarService.exchangeCodeForUser(req.user._id, req.query.code)
    return res.redirect('/calendar.html?microsoft=connected')
  } catch (err) {
    return res.status(400).send(`Microsoft Calendar connection failed: ${err.message}`)
  }
}

controller.disconnect = async (req, res) => {
  try {
    await microsoftCalendarService.disconnect(req.user._id)
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
