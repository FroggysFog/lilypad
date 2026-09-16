/**
 * LilyPad ERP - Sales OS Leads Controller
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const leadScorer = require('../services/leadScorer')
const quoteBridge = require('../services/quoteBridge')
const salesSearch = require('../services/salesSearch')
const reactivationService = require('../services/reactivationService')

const controller = {}

const VALID_DIVISIONS = ['froggys_fog', 'training_smoke']
const VALID_STATUSES = ['unprocessed', 'scored', 'contacted', 'quoted', 'converted', 'disqualified']

/**
 * GET /api/v1/lilypad/sales-leads?division=all|froggys_fog|training_smoke
 * The Sales Battle Plan's data feed - top 25 workable leads, highest
 * intent score first.
 */
controller.list = async function (req, res) {
  try {
    const division = req.query.division
    const query = { status: { $in: ['scored', 'unprocessed'] } }
    if (division && VALID_DIVISIONS.includes(division)) {
      query.division = division
    }

    const leads = await LilyPadSalesLead.find(query)
      .sort({ 'aiScore.intentScore': -1, createdAt: -1 })
      .limit(25)
      .lean()

    return res.status(200).json({ success: true, data: leads })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/score-now
 */
controller.scoreNow = async function (req, res) {
  try {
    const summary = await leadScorer.scoreLeadBatch(10)
    return res.status(200).json({ success: true, data: summary })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/:id/create-quote
 */
controller.createQuote = async function (req, res) {
  try {
    const quote = await quoteBridge.createTrialQuote(req.params.id)
    return res.status(200).json({ success: true, data: quote })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/:id/status
 * body: { status, reason }
 */
controller.updateStatus = async function (req, res) {
  try {
    const { status, reason } = req.body
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' })
    }

    const update = { $set: { status } }
    if (status === 'disqualified' && reason) {
      update.$set.disqualificationReason = reason
    } else if (reason) {
      // Any other status change with a reason gets logged as a note
      // instead - disqualificationReason is specifically for why a lead
      // was dropped, not a general changelog.
      update.$push = { notes: { body: `Status changed to ${status}: ${reason}`, createdAt: new Date() } }
    }

    const result = await LilyPadSalesLead.updateOne({ _id: req.params.id }, update)
    if (!result.matchedCount) {
      return res.status(404).json({ success: false, error: 'Lead not found.' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/search
 * body: { query }
 */
controller.search = async function (req, res) {
  try {
    const query = String(req.body.query || '').trim()
    if (!query) {
      return res.status(400).json({ success: false, error: 'A search query is required.' })
    }

    const result = await salesSearch.searchLeadsNaturalLanguage(query)
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error })
    }

    return res.status(200).json({ success: true, data: result.results, filterUsed: result.filterUsed })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/sales-leads/reactivation/:division
 */
controller.reactivation = async function (req, res) {
  try {
    const division = req.params.division
    if (!VALID_DIVISIONS.includes(division)) {
      return res.status(400).json({ success: false, error: 'Invalid division.' })
    }

    const result = await reactivationService.getSeasonalReactivationLeads(division)
    return res.status(200).json({
      success: true,
      data: result.leads,
      inSeasonalWindow: result.inSeasonalWindow,
      currentWindowName: result.currentWindowName
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
