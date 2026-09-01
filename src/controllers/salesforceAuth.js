/**
 * LilyPad ERP - Salesforce OAuth Controller
 * Same shape as controllers/microsoftTeams.js's connect/callback.
 */

const salesforceService = require('../services/salesforceService')

const controller = {}

controller.status = async (req, res) => {
  try {
    return res.json({ success: true, data: await salesforceService.getSalesforceOAuthStatus() })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

const DEFAULT_RETURN_TO = '/past-due-payments.html'

// Only allow same-site, path-only redirect targets (blocks open-redirect via returnTo=//evil.com or returnTo=https://evil.com).
function sanitizeReturnTo (value) {
  if (typeof value === 'string' && /^\/[^/\\]/.test(value)) return value
  return DEFAULT_RETURN_TO
}

controller.connect = (req, res) => {
  try {
    const { verifier, challenge } = salesforceService.generateSalesforcePkcePair()
    req.session.salesforcePkceVerifier = verifier
    req.session.salesforceReturnTo = sanitizeReturnTo(req.query.returnTo)
    return res.redirect(salesforceService.getSalesforceAuthUrl({ codeChallenge: challenge }))
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message })
  }
}

controller.callback = async (req, res) => {
  const returnTo = req.session.salesforceReturnTo || DEFAULT_RETURN_TO
  try {
    const verifier = req.session.salesforcePkceVerifier
    await salesforceService.exchangeSalesforceCode(req.query.code, verifier)
    delete req.session.salesforcePkceVerifier
    delete req.session.salesforceReturnTo
    return res.redirect(`${returnTo}?salesforce=connected`)
  } catch (err) {
    return res.status(400).send(`Salesforce connection failed: ${err.message}`)
  }
}

module.exports = controller
