const mongoose = require('mongoose')
const LilyPadLeadBatch = require('../models/lilypadLeadBatch')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const { enqueueBatch } = require('../services/leadProspectorWorker')
const { promoteStagedLeads } = require('../services/leadProspectorService')
const { isApolloConfigured } = require('../services/apolloService')
const { isExtractionConfigured } = require('../services/prospecting/crawl/pageExtractionService')
const { listAvailableVerticals } = require('../services/prospecting/discovery')

const lilypadProspectorController = {}

const VERTICAL_LABELS = {
  fire_department: 'Fire Departments',
  fire_training: 'Fire Training Academies',
  haunted_attraction: 'Haunted Attractions',
  theme_park: 'Theme Parks',
  theater_professional: 'Professional Theaters',
  theater_community: 'Community Theaters',
  av_lighting_design: 'A/V & Lighting Design',
  entertainment_venue: 'Entertainment Venues',
  family_entertainment_center: 'Family Entertainment Centers',
  roller_rink: 'Roller Rinks',
  bar_nightclub: 'Bars & Nightclubs',
  museum: 'Museums',
  childrens_museum: "Children's Museums"
}

/**
 * GET /api/v1/lilypad/leads/verticals
 * Only reports verticals with a real directory source wired up in
 * directoryAdapter.js - the rest of LilyPadLeadBatch.VERTICALS exist as
 * placeholders for future adapters and shouldn't be selectable yet.
 */
lilypadProspectorController.getVerticals = async function (req, res) {
  try {
    const available = listAvailableVerticals().map((value) => ({ value, label: VERTICAL_LABELS[value] || value }))
    return res.status(200).json({ success: true, data: available })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

function toStringArray (value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return value.split(',').map((v) => v.trim()).filter(Boolean)
  return []
}

/**
 * POST /api/v1/lilypad/leads/prospect
 * Validates the search-builder inputs, creates the lead_batches record,
 * and enqueues the async worker - returns immediately with the batch id
 * so the HTTP request never blocks on the deep run itself.
 */
lilypadProspectorController.prospectLeads = async function (req, res) {
  try {
    const sourceMode = LilyPadLeadBatch.SOURCE_MODES.includes(req.body.sourceMode) ? req.body.sourceMode : 'apollo'

    if (sourceMode === 'apollo' && !isApolloConfigured()) {
      return res.status(503).json({ success: false, error: 'Apollo.io is not configured. Set APOLLO_API_KEY on the server.' })
    }
    if ((sourceMode === 'in_house' || sourceMode === 'refresh') && !isExtractionConfigured()) {
      return res.status(503).json({ success: false, error: 'In-house extraction is not configured. Set ANTHROPIC_API_KEY on the server.' })
    }

    const targetVertical = String(req.body.targetVertical || '').trim()
    if (sourceMode === 'in_house' && !LilyPadLeadBatch.VERTICALS.includes(targetVertical)) {
      return res.status(400).json({
        success: false,
        error: `targetVertical must be one of: ${listAvailableVerticals().join(', ')} (directory source not yet built for the rest of ${LilyPadLeadBatch.VERTICALS.join(', ')})`
      })
    }

    const sector = LilyPadLeadBatch.SECTORS.includes(req.body.sector) ? req.body.sector : 'all'
    const requestedCount = Math.min(50000, Math.max(1, Number(req.body.requestedCount) || 0))
    if (!requestedCount) {
      return res.status(400).json({ success: false, error: 'requestedCount must be a positive integer.' })
    }

    const batch = await LilyPadLeadBatch.create({
      createdByUserId: req.user._id,
      createdByName: req.user.fullname || req.user.username || '',
      sector,
      sourceMode,
      targetVertical: sourceMode === 'in_house' ? targetVertical : '',
      targetIndustry: toStringArray(req.body.targetIndustry),
      targetLocations: toStringArray(req.body.targetLocations),
      targetTitles: toStringArray(req.body.targetTitles),
      requestedCount,
      perPage: Math.min(100, Math.max(25, Number(req.body.perPage) || 100)),
      status: 'queued',
      statusMessage: 'Queued for processing.'
    })

    enqueueBatch(batch._id)

    return res.status(201).json({ success: true, data: batch })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/leads/batches
 * Batch history list, newest first, for the dashboard's run history table.
 */
lilypadProspectorController.getBatches = async function (req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))

    const [batches, total] = await Promise.all([
      LilyPadLeadBatch.find({}).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadLeadBatch.countDocuments({})
    ])

    return res.status(200).json({
      success: true,
      data: batches,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/leads/batches/:id
 * Live status/progress for the polling progress bar.
 */
lilypadProspectorController.getBatchStatus = async function (req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid batch id.' })
    }

    const batch = await LilyPadLeadBatch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found.' })
    }

    const progressPercent = batch.requestedCount
      ? Math.min(100, Math.round((batch.fetchedCount / batch.requestedCount) * 100))
      : 0

    return res.status(200).json({ success: true, data: { ...batch.toObject(), progressPercent } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/leads/batches/:id/leads
 * Paginated, searchable/filterable staged leads table for one batch.
 */
lilypadProspectorController.getBatchLeads = async function (req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid batch id.' })
    }

    const query = { batchId: req.params.id }

    const search = String(req.query.search || '').trim()
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { companyName: regex },
        { email: regex },
        { jobTitle: regex }
      ]
    }

    if (req.query.sector && LilyPadStagedLead.SECTORS.includes(req.query.sector)) {
      query.sector = req.query.sector
    }
    if (req.query.status && LilyPadStagedLead.STATUSES.includes(req.query.status)) {
      query.status = req.query.status
    }
    if (req.query.emailStatus && LilyPadStagedLead.EMAIL_STATUSES.includes(req.query.emailStatus)) {
      query.emailStatus = req.query.emailStatus
    }
    if (req.query.isDuplicate === 'true') query.isDuplicate = true
    if (req.query.isDuplicate === 'false') query.isDuplicate = false

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(500, Math.max(1, Number(req.query.pageSize) || 50))

    const [leads, total] = await Promise.all([
      LilyPadStagedLead.find(query).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadStagedLead.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/leads/batches/:id/pause
 * Cooperative pause - the worker checks batch.status between pages.
 */
lilypadProspectorController.pauseBatch = async function (req, res) {
  try {
    const batch = await LilyPadLeadBatch.findById(req.params.id)
    if (!batch) return res.status(404).json({ success: false, error: 'Batch not found.' })
    if (!['queued', 'processing'].includes(batch.status)) {
      return res.status(400).json({ success: false, error: `Cannot pause a batch with status "${batch.status}".` })
    }

    batch.status = 'paused'
    batch.statusMessage = `Paused by user at ${batch.fetchedCount} of ${batch.requestedCount} leads.`
    await batch.save()

    return res.status(200).json({ success: true, data: batch })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/leads/batches/:id/resume
 */
lilypadProspectorController.resumeBatch = async function (req, res) {
  try {
    const batch = await LilyPadLeadBatch.findById(req.params.id)
    if (!batch) return res.status(404).json({ success: false, error: 'Batch not found.' })
    if (batch.status !== 'paused') {
      return res.status(400).json({ success: false, error: `Cannot resume a batch with status "${batch.status}".` })
    }

    batch.status = 'queued'
    batch.statusMessage = 'Resuming...'
    await batch.save()
    enqueueBatch(batch._id)

    return res.status(200).json({ success: true, data: batch })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/leads/promote
 * Bulk-approves staged leads and commits them into LilyPadCustomer /
 * LilyPadSalesforceAccount.
 */
lilypadProspectorController.promoteLeads = async function (req, res) {
  try {
    const leadIds = toStringArray(req.body.leadIds).filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (!leadIds.length) {
      return res.status(400).json({ success: false, error: 'leadIds must be a non-empty array of staged lead ids.' })
    }

    const results = await promoteStagedLeads(leadIds)
    const succeeded = results.filter((r) => r.success).length
    const failed = results.length - succeeded

    return res.status(200).json({
      success: true,
      data: { results, succeeded, failed }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadProspectorController
