/**
 * LilyPad ERP - Salesforce Accounts Controller
 */

const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { syncSalesforceAccounts } = require('../services/salesforceAccountSyncService')

const controller = {}

const SORTABLE_FIELDS = ['name', 'industry', 'type', 'ownerName', 'phone', 'annualRevenue']

/**
 * GET /api/v1/lilypad/salesforce-accounts
 */
controller.getAccounts = async function (req, res) {
  try {
    const search = String(req.query.name || req.query.search || '').trim()
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'name'
    const sortDir = req.query.sortDir === 'desc' ? -1 : 1

    const [accounts, total] = await Promise.all([
      LilyPadSalesforceAccount.find(query).sort({ [sortKey]: sortDir }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadSalesforceAccount.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: accounts,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
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
