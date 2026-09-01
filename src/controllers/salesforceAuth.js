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

controller.connect = (req, res) => {
  try {
    const { verifier, challenge } = salesforceService.generateSalesforcePkcePair()
    req.session.salesforcePkceVerifier = verifier
    return res.redirect(salesforceService.getSalesforceAuthUrl({ codeChallenge: challenge }))
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message })
  }
}

controller.callback = async (req, res) => {
  try {
    const verifier = req.session.salesforcePkceVerifier
    await salesforceService.exchangeSalesforceCode(req.query.code, verifier)
    delete req.session.salesforcePkceVerifier
    return res.redirect('/past-due-payments.html?salesforce=connected')
  } catch (err) {
    return res.status(400).send(`Salesforce connection failed: ${err.message}`)
  }
}

module.exports = controller
