const mongoose = require('mongoose')
const LilyPadCustomerProfile = require('../models/lilypadCustomerProfile')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { rebuildCustomerProfiles } = require('../services/customerIntelligence/entityResolutionService')
const { detectSiblingGroups } = require('../services/customerIntelligence/siblingDetectionService')
const { generateRecommendations, isRecommendationConfigured } = require('../services/customerIntelligence/recommendationService')
const { resolveOwnedSalesforceAccountIds } = require('../services/repMatchingService')
const { updateSalesforceRecord } = require('../services/salesforceService')
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
    if (req.query.accountTier && LilyPadCustomerProfile.ACCOUNT_TIERS.includes(req.query.accountTier)) {
      query.accountTier = req.query.accountTier
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

/**
 * GET /api/v1/lilypad/customer-intelligence/my-managed
 * A rep's own qualified, worked accounts - accountTier 'managed' AND
 * owned by this rep in Salesforce (same ownership join the rest of the
 * app's "My Accounts" scoping already uses).
 */
controller.getMyManaged = async function (req, res) {
  try {
    const ownedIds = await resolveOwnedSalesforceAccountIds(req.user)
    const profiles = await LilyPadCustomerProfile.find({
      accountTier: 'managed',
      salesforceAccountId: { $in: ownedIds }
    })
      .sort({ 'qualification.isDormant': -1, 'orderStats.lifetimeRevenue': -1 })
      .populate('salesforceAccountId', 'name ownerName phone website')

    return res.status(200).json({ success: true, data: profiles })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/customer-intelligence/territory-pool
 * Qualifying accounts with no Salesforce Owner yet - open for any rep
 * to claim. No territory/state mapping exists in this app today, so
 * this is a shared pool rather than a state-filtered one.
 */
controller.getTerritoryPool = async function (req, res) {
  try {
    const profiles = await LilyPadCustomerProfile.find({ accountTier: 'available_pool' })
      .sort({ 'qualification.firstQualifiedAt': 1 })
      .populate('salesforceAccountId', 'name phone website industry')

    return res.status(200).json({ success: true, data: profiles })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/customer-intelligence/profiles/:id/claim
 * Assigns an available_pool account to the requesting rep by writing
 * Salesforce's real Account Owner field - the same field
 * repMatchingService.js already reads for every other "My Accounts"
 * view - rather than a separate LilyPad-only assignment field that
 * would compete with it. Locks the profile to 'managed' first (atomic
 * findOneAndUpdate against accountTier: 'available_pool', so two reps
 * can't both claim it), then pushes the Salesforce write; on failure,
 * the lock is rolled back so the account returns to the pool.
 */
controller.claimAccount = async function (req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid profile id.' })
    }
    if (!req.user.salesforceUserId) {
      return res.status(400).json({ success: false, error: 'Your account has no linked Salesforce User Id. An admin needs to set one on your LilyPad profile before you can claim accounts.' })
    }

    const profile = await LilyPadCustomerProfile.findOneAndUpdate(
      { _id: req.params.id, accountTier: 'available_pool' },
      { $set: { accountTier: 'managed' } }
    )
    if (!profile) {
      return res.status(409).json({ success: false, error: 'This account is not currently available to claim (already claimed, or not qualified).' })
    }

    const account = await LilyPadSalesforceAccount.findById(profile.salesforceAccountId)
    if (!account || !account.sourceRecordId) {
      await LilyPadCustomerProfile.updateOne({ _id: profile._id }, { $set: { accountTier: 'available_pool' } })
      return res.status(500).json({ success: false, error: 'This profile has no linked Salesforce account record.' })
    }

    try {
      await updateSalesforceRecord('Account', account.sourceRecordId, { OwnerId: req.user.salesforceUserId })
    } catch (sfError) {
      // Roll back the lock - the account goes back to the pool rather
      // than sitting silently as 'managed' with no real Salesforce Owner.
      await LilyPadCustomerProfile.updateOne({ _id: profile._id }, { $set: { accountTier: 'available_pool' } })
      return res.status(502).json({ success: false, error: sfError.message })
    }

    account.ownerName = req.user.fullname
    account.ownerSourceId = req.user.salesforceUserId
    await account.save()

    return res.status(200).json({ success: true, data: { profileId: profile._id, accountTier: 'managed' } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
