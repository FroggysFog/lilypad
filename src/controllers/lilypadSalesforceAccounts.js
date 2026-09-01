/**
 * LilyPad ERP - Salesforce Accounts Controller
 */

const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { syncSalesforceAccounts } = require('../services/salesforceAccountSyncService')

const controller = {}

/**
 * GET /api/v1/lilypad/salesforce-accounts
 */
controller.getAccounts = async function (req, res) {
  try {
    const query = {}
    if (req.query.name) query.name = { $regex: String(req.query.name).trim(), $options: 'i' }

    const accounts = await LilyPadSalesforceAccount.find(query).sort('name').limit(500)
    return res.status(200).json({ success: true, data: accounts, count: accounts.length })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/salesforce-accounts/:id
 */
controller.getAccountDetail = async function (req, res) {
  try {
    const account = await LilyPadSalesforceAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }
    return res.status(200).json({ success: true, data: account })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/salesforce-accounts/sync
 */
controller.triggerAccountSync = async function (req, res) {
  try {
    const result = await syncSalesforceAccounts()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} accounts from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
