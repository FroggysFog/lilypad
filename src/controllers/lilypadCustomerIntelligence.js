const mongoose = require('mongoose')
const LilyPadCustomerProfile = require('../models/lilypadCustomerProfile')
const { rebuildCustomerProfiles } = require('../services/customerIntelligence/entityResolutionService')
const { detectSiblingGroups } = require('../services/customerIntelligence/siblingDetectionService')
const { generateRecommendations, isRecommendationConfigured } = require('../services/customerIntelligence/recommendationService')
const winston = require('../logger')

const controller = {}

// In-memory job status - a rebuild spans a full account-table scan plus
// (optionally) dozens of sequential AI calls, easily minutes for a real
// backlog, so it runs fire-and-forget rather than blocking the request
// the way the Salesforce "Sync" buttons do for their much smaller/faster jobs.
let jobState = { running: false, startedAt: null, finishedAt: null, error: null, lastResult: null }

async function runRebuildJob (options) {
  jobState = { running: true, startedAt: new Date(), finishedAt: null, error: null, lastResult: null }
  try {
    const resolutionResult = await rebuildCustomerProfiles(options.accountFilter)
    const siblingResult = await detectSiblingGroups()

    let recommendationResult = null
    if (options.includeRecommendations) {
      recommendationResult = await generateRecommendations(options.recommendationFilter)
    }

    jobState = {
      running: false,
      startedAt: jobState.startedAt,
      finishedAt: new Date(),
      error: null,
      lastResult: { resolutionResult, siblingResult, recommendationResult }
    }
  } catch (err) {
    winston.error(`Customer intelligence rebuild failed: ${err.message}`)
    jobState = { running: false, startedAt: jobState.startedAt, finishedAt: new Date(), error: err.message, lastResult: null }
  }
}

function toStringArray (value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return value.split(',').map((v) => v.trim()).filter(Boolean)
  return []
}

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * POST /api/v1/lilypad/customer-intelligence/rebuild
 * Kicks off entity resolution + sibling detection + (optionally) AI
 * recommendation scoring as a background job. Returns immediately.
 */
controller.triggerRebuild = async function (req, res) {
  try {
    if (jobState.running) {
      return res.status(409).json({ success: false, error: 'A rebuild is already running.', data: jobState })
    }

    const industryKeywords = toStringArray(req.body.industryKeywords)
    let accountFilter = {}
    if (industryKeywords.length) {
      const patterns = industryKeywords.map((k) => new RegExp(escapeRegExp(k), 'i'))
      accountFilter = { $or: [{ name: { $in: patterns } }, { industry: { $in: patterns } }, { description: { $in: patterns } }] }
    }

    const includeRecommendations = req.body.includeRecommendations !== false
    if (includeRecommendations && !isRecommendationConfigured()) {
      return res.status(503).json({ success: false, error: 'Recommendations are not configured. Set ANTHROPIC_API_KEY on the server, or pass includeRecommendations: false.' })
    }

    let recommendationFilter = {}
    if (industryKeywords.length) {
      // Score only what this run actually touched, not the whole table.
      recommendationFilter = { industry: { $in: industryKeywords.map((k) => new RegExp(escapeRegExp(k), 'i')) } }
    }

    runRebuildJob({ accountFilter, includeRecommendations, recommendationFilter }).catch((err) => {
      winston.error(`Customer intelligence rebuild job crashed: ${err.message}`)
    })

    return res.status(202).json({ success: true, data: { started: true } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/** GET /api/v1/lilypad/customer-intelligence/status */
controller.getRebuildStatus = async function (req, res) {
  return res.status(200).json({ success: true, data: jobState })
}

const SORTABLE_FIELDS = ['recommendation.score', 'daysSinceLastOrder', 'daysSinceLastContact', 'orderStats.lifetimeRevenue', 'name']

/**
 * GET /api/v1/lilypad/customer-intelligence/profiles
 * Paginated, searchable, filterable, sortable list of resolved customer
 * profiles - the main "who should we contact" view.
 */
controller.getProfiles = async function (req, res) {
  try {
    const query = {}

    const search = String(req.query.search || '').trim()
    if (search) {
      query.name = new RegExp(escapeRegExp(search), 'i')
    }
    if (req.query.engagementStatus && LilyPadCustomerProfile.ENGAGEMENT_STATUSES.includes(req.query.engagementStatus)) {
      query.engagementStatus = req.query.engagementStatus
    }
    if (req.query.siblingsOnly === 'true') {
      query.siblingGroupKey = { $ne: '' }
    }
    if (req.query.minScore) {
      query['recommendation.score'] = { $gte: Number(req.query.minScore) }
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'recommendation.score'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1

    const [profiles, total] = await Promise.all([
      LilyPadCustomerProfile.find(query)
        .sort({ [sortKey]: sortDir })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      LilyPadCustomerProfile.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: profiles,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/** GET /api/v1/lilypad/customer-intelligence/profiles/:id */
controller.getProfileDetail = async function (req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid profile id.' })
    }

    const profile = await LilyPadCustomerProfile.findById(req.params.id)
      .populate('matchedLeadIds', 'name email phone leadStatus')
      .populate('siblingProfileIds', 'name domain engagementStatus recommendation.score')

    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found.' })

    return res.status(200).json({ success: true, data: profile })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
