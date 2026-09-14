/**
 * LilyPad ERP - Opportunities Controller
 */

const xss = require('xss')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const { syncOpportunitiesFromSalesforce, pushOpportunityUpdate } = require('../services/opportunitySyncService')
const { getOpportunityOwnerFilter } = require('../services/repMatchingService')

const controller = {}

const SORTABLE_FIELDS = ['name', 'accountName', 'stageName', 'amount', 'closeDate', 'ownerName']
const ACTIVITY_TYPES = ['call', 'visit', 'email', 'follow_up', 'note']

function actorName (user) {
  return user ? (user.fullname || user.username) : 'System'
}

function pushOppHistory (opportunity, action, user, description) {
  opportunity.history.push({
    action,
    by: user ? user._id : null,
    byName: actorName(user),
    description
  })
}

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
    if (req.query.scope === 'mine') {
      const ownerFilter = getOpportunityOwnerFilter(req.user)
      // ownerFilter is itself an $or - combine via $and so it doesn't
      // clobber a search-driven $or already on the query.
      if (query.$or) {
        query.$and = [{ $or: query.$or }, ownerFilter]
        delete query.$or
      } else {
        Object.assign(query, ownerFilter)
      }
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
 * POST /api/v1/lilypad/opportunities/:id/activities
 */
controller.addActivity = async function (req, res) {
  try {
    const { type, body, followUpDate } = req.body
    if (!ACTIVITY_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: `type must be one of: ${ACTIVITY_TYPES.join(', ')}` })
    }
    if (!body || !String(body).trim()) {
      return res.status(400).json({ success: false, error: 'Activity body cannot be empty' })
    }

    const opportunity = await LilyPadOpportunity.findById(req.params.id)
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' })
    }

    opportunity.activities.push({
      type,
      author: req.user ? req.user._id : null,
      authorName: actorName(req.user),
      body: xss(String(body).trim()),
      followUpDate: followUpDate ? new Date(followUpDate) : null
    })
    pushOppHistory(opportunity, 'activity_logged', req.user, `Logged a ${type.replace('_', ' ')}`)

    const saved = await opportunity.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/opportunities/:id/activities/:activityId
 */
controller.deleteActivity = async function (req, res) {
  try {
    const opportunity = await LilyPadOpportunity.findById(req.params.id)
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' })
    }

    const activity = opportunity.activities.id(req.params.activityId)
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity entry not found' })
    }

    activity.deleteOne()
    pushOppHistory(opportunity, 'activity_removed', req.user, 'Removed an activity log entry')

    const saved = await opportunity.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/opportunities/:id/salesforce-sync
 * Pushes a stage/amount/description edit back to Salesforce. Returns 422
 * (not 500) on failure with Salesforce's own error text intact, since a
 * validation-rule rejection is an expected outcome here, not a bug.
 */
controller.pushSalesforceSync = async function (req, res) {
  try {
    const { stageName, amount, description } = req.body
    const updated = await pushOpportunityUpdate(req.params.id, { stageName, amount, description })
    return res.status(200).json({ success: true, data: updated })
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message })
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
