/**
 * LilyPad ERP - Opportunities Controller
 */

const LilyPadOpportunity = require('../models/lilypadOpportunity')
const { syncOpportunitiesFromSalesforce } = require('../services/opportunitySyncService')

const controller = {}

const SORTABLE_FIELDS = ['name', 'accountName', 'stageName', 'amount', 'closeDate', 'ownerName']

/**
 * GET /api/v1/lilypad/opportunities
 */
controller.getOpportunities = async function (req, res) {
  try {
    const query = {}
    if (req.query.stageName) query.stageName = req.query.stageName
    if (req.query.accountName) query.accountName = { $regex: String(req.query.accountName).trim(), $options: 'i' }
    if (req.query.search) {
      const search = String(req.query.search).trim()
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { accountName: { $regex: search, $options: 'i' } }]
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'closeDate'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1

    const [opportunities, total] = await Promise.all([
      LilyPadOpportunity.find(query).sort({ [sortKey]: sortDir }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadOpportunity.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: opportunities,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/opportunities/:id
 */
controller.getOpportunityDetail = async function (req, res) {
  try {
    const opportunity = await LilyPadOpportunity.findById(req.params.id)
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' })
    }
    return res.status(200).json({ success: true, data: opportunity })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/opportunities/sync
 */
controller.triggerOpportunitySync = async function (req, res) {
  try {
    const result = await syncOpportunitiesFromSalesforce()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} opportunities from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
