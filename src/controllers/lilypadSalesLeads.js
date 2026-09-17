/**
 * LilyPad ERP - Sales OS Leads Controller
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadSalesScrapeJob = require('../models/lilypadSalesScrapeJob')
const leadScorer = require('../services/leadScorer')
const quoteBridge = require('../services/quoteBridge')
const salesSearch = require('../services/salesSearch')
const reactivationService = require('../services/reactivationService')
const goalModePlanner = require('../services/goalModePlanner')
const waterfallScraper = require('../services/waterfallScraper')
const leadProspectorService = require('../services/leadProspectorService')
const deptContactResearchService = require('../services/deptContactResearchService')
const leadClaimEligibilityService = require('../services/leadClaimEligibilityService')

const controller = {}

const VALID_DIVISIONS = ['froggys_fog', 'training_smoke']
const VALID_STATUSES = ['unprocessed', 'scored', 'contacted', 'quoted', 'converted', 'disqualified']

/**
 * GET /api/v1/lilypad/sales-leads?division=all|froggys_fog|training_smoke&scope=available|mine&search=...
 * The Sales Command Center's data feed, highest intent score first.
 * scope=available (default): unclaimed leads, ready to work.
 * scope=mine: leads this rep has already claimed.
 * `search` narrows by company name - reused by the New Quote popup's
 * lead picker, not just the main feed.
 */
controller.list = async function (req, res) {
  try {
    const division = req.query.division
    const query = {}
    if (division && VALID_DIVISIONS.includes(division)) {
      query.division = division
    }
    if (req.query.scope === 'mine') {
      // A claimed lead's whole point-of-view: show it in every status
      // (scored through converted) so it doesn't vanish from "My Claimed
      // Leads" the moment a rep marks it contacted or quotes it.
      query['assignedRep.id'] = req.user._id
    } else if (req.query.scope !== 'all') {
      // Default "available to claim" pool - still gated to workable
      // statuses, since a disqualified or already-converted lead has no
      // business being claimable.
      query['assignedRep.id'] = null
      query.status = { $in: ['scored', 'unprocessed'] }
    }
    if (req.query.search) {
      query.companyName = new RegExp(String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    }

    const limit = Number(req.query.limit) > 0 ? Math.min(Number(req.query.limit), 100) : 50

    const leads = await LilyPadSalesLead.find(query)
      .sort({ 'aiScore.intentScore': -1, createdAt: -1 })
      .limit(limit)
      .lean()

    return res.status(200).json({ success: true, data: leads })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads
 * body: { division, companyName, phone, city, state, contactName,
 *         contactTitle, contactEmail, contactPhone }
 * Manual single-lead entry - every other LilyPadSalesLead comes from a
 * bulk harvest pipeline (USFA/Apify/Goal Mode) or a promoted staged
 * lead; this is the one hand-entry path, for a lead a rep already knows
 * about from a call/referral/trade show.
 */
controller.create = async function (req, res) {
  try {
    const division = VALID_DIVISIONS.includes(req.body.division) ? req.body.division : null
    const companyName = String(req.body.companyName || '').trim()
    if (!division || !companyName) {
      return res.status(400).json({ success: false, error: 'Division and company name are required.' })
    }

    const lead = await LilyPadSalesLead.create({
      division,
      companyName,
      phone: String(req.body.phone || '').trim(),
      address: { city: String(req.body.city || '').trim(), state: String(req.body.state || '').trim() },
      source: 'manual_import',
      contact: {
        name: String(req.body.contactName || '').trim(),
        title: String(req.body.contactTitle || '').trim(),
        email: String(req.body.contactEmail || '').trim(),
        phone: String(req.body.contactPhone || '').trim()
      },
      provenance: { sourceTier: 'manual', sourceDetails: `Manually added by ${req.user.fullname}` },
      // Manually-entered leads skip straight to claimed-by-the-adding-rep -
      // a rep hand-entering a lead they already have a relationship with
      // shouldn't have to then also claim it from the shared pool.
      assignedRep: { id: req.user._id, name: req.user.fullname, claimedAt: new Date() }
    })

    return res.status(200).json({ success: true, data: lead })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/:id/claim
 * Atomic - the filter requires assignedRep.id to still be null, so two
 * reps racing to claim the same lead can't both succeed.
 */
controller.claim = async function (req, res) {
  try {
    const result = await LilyPadSalesLead.findOneAndUpdate(
      { _id: req.params.id, 'assignedRep.id': null },
      { $set: { assignedRep: { id: req.user._id, name: req.user.fullname, claimedAt: new Date() } } },
      { new: true }
    )
    if (!result) {
      return res.status(409).json({ success: false, error: 'This lead is not available to claim (already claimed, or not found).' })
    }
    return res.status(200).json({ success: true, data: result })
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
 * POST /api/v1/lilypad/sales-leads/research-contacts
 * body: { division, limit }
 * Explicit, separately-triggered enrichment step - discovery (Goal
 * Mode's Maps harvest) never calls this on its own, so a large harvest
 * never silently turns into a burst of AI calls.
 */
controller.researchContacts = async function (req, res) {
  try {
    const division = VALID_DIVISIONS.includes(req.body.division) ? req.body.division : 'froggys_fog'
    const limit = Number(req.body.limit) > 0 ? Math.min(Number(req.body.limit), 50) : 10
    const summary = await deptContactResearchService.researchContactBatch(division, limit)
    return res.status(200).json({ success: true, data: summary })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/recheck-claims
 * body: { limit }
 * Manual trigger for the same eligibility recheck the nightly scheduler
 * runs - disqualifies any scored/unprocessed lead that turns out to
 * already be a claimed Salesforce Account.
 */
controller.recheckClaims = async function (req, res) {
  try {
    const limit = Number(req.body.limit) > 0 ? Math.min(Number(req.body.limit), 500) : 100
    const summary = await leadClaimEligibilityService.recheckClaimEligibilityBatch(limit)
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

/**
 * POST /api/v1/lilypad/sales-leads/goal-scrape
 * body: { prompt }
 * Compiles the prompt into criteria, creates a tracked job, and fires
 * the waterfall engine in the background (fire-and-forget, same
 * pattern this app already uses elsewhere for background regeneration -
 * no job queue infra exists here to reach for instead).
 */
controller.goalScrape = async function (req, res) {
  try {
    const prompt = String(req.body.prompt || '').trim()
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'A sourcing prompt is required.' })
    }

    const criteria = await goalModePlanner.compilePromptToGoalPlan(prompt)

    const job = await LilyPadSalesScrapeJob.create({
      createdByUserId: req.user._id,
      createdByName: req.user.fullname,
      rawPrompt: prompt,
      division: criteria.division,
      criteria
    })

    setImmediate(() => {
      waterfallScraper.executeWaterfallJob(job._id).catch(() => {})
    })

    return res.status(200).json({ success: true, data: { jobId: job._id, criteria } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/sales-leads/jobs/:id
 */
controller.getJob = async function (req, res) {
  try {
    const job = await LilyPadSalesScrapeJob.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found.' })
    }
    return res.status(200).json({ success: true, data: job })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/sales-leads/promote-staged/:stagedLeadId
 * Promotes a Lead Prospector staged lead into a Sales OS lead (in
 * addition to, not instead of, the existing CRM-contact promotion on
 * prospects.html) so it becomes scoreable/quotable.
 */
controller.promoteStaged = async function (req, res) {
  try {
    const salesLead = await leadProspectorService.promoteStagedLeadToSalesLead(req.params.stagedLeadId)
    return res.status(200).json({ success: true, data: salesLead })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
