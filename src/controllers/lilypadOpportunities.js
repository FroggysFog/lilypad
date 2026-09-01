/**
 * LilyPad ERP - Opportunities Controller
 */

const LilyPadOpportunity = require('../models/lilypadOpportunity')
const { syncOpportunitiesFromSalesforce } = require('../services/opportunitySyncService')

const controller = {}

/**
 * GET /api/v1/lilypad/opportunities
 */
controller.getOpportunities = async function (req, res) {
  try {
    const query = {}
    if (req.query.stageName) query.stageName = req.query.stageName
    if (req.query.accountName) query.accountName = { $regex: String(req.query.accountName).trim(), $options: 'i' }

    const opportunities = await LilyPadOpportunity.find(query).sort('-closeDate').limit(500)
    return res.status(200).json({ success: true, data: opportunities, count: opportunities.length })
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
