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
const winston = require('../logger')
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
  const expectedState = req.session.msCalendarState
  delete req.session.msCalendarState

  try {
    // Microsoft redirects back with `error`/`error_description` instead of
    // `code` on anything from "user clicked cancel" to "admin consent
    // required" - surfacing it here instead of falling through to the
    // generic state-mismatch message below, which used to fire for this
    // case too (no `code` present) and hid what Microsoft actually said.
    if (req.query.error) {
      throw new Error(req.query.error_description || req.query.error)
    }

    if (!expectedState || !req.query.state || req.query.state !== expectedState) {
      throw new Error('Invalid or expired Microsoft OAuth state - please try connecting again.')
    }
    if (!req.query.code) {
      throw new Error('Microsoft did not return an authorization code - please try connecting again.')
    }

    await microsoftCalendarService.exchangeCodeForUser(req.user._id, req.query.code)
    return res.redirect('/calendar.html?microsoft=connected')
  } catch (err) {
    // req.query.code is deliberately omitted - it's a live, single-use
    // authorization code and shouldn't end up in logs or the response.
    const diagnostics = {
      hadSessionState: Boolean(expectedState),
      hasQueryState: Boolean(req.query.state),
      statesMatch: req.query.state === expectedState,
      msError: req.query.error || 'none',
      callbackHost: req.get('host'),
      configuredRedirectUri: process.env.MICROSOFT_CALENDAR_REDIRECT_URI || '(unset - defaulting to localhost)'
    }
    winston.error(`Microsoft Calendar OAuth callback failed for user ${req.user && req.user._id}: ${err.message} ${JSON.stringify(diagnostics)}`)
    // Plain JSON, not an HTML string built with template interpolation -
    // err.message can contain Microsoft's error_description, which is
    // attacker-controllable query-string content (anyone can craft a link
    // to this callback URL with their own error/error_description values),
    // so it must never be concatenated into an HTML response. Still fully
    // readable in a browser without needing log access - just not styled -
    // so whoever hits this can compare callbackHost against
    // configuredRedirectUri themselves: a mismatch there (e.g. one is the
    // custom domain, the other still the raw Render URL) means the browser
    // landed on a different origin than the one that set the session's
    // expected state, which always looks like hadSessionState: false here
    // even though nothing is actually wrong with the session itself.
    return res.status(400).json({ success: false, error: err.message, diagnostics })
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
