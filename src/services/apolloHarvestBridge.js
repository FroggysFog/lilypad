/**
 * LilyPad ERP - Apollo Harvest Bridge (Goal Mode -> Lead Prospector)
 * waterfallScraper.js only ever enriches leads that already exist - it
 * has no way to find a brand-new company. The only thing in this app
 * that does that is Lead Prospector's Apollo integration. This bridges
 * a Froggy's Fog Goal Mode prompt into a REAL LilyPadLeadBatch, using
 * the exact same enqueueBatch mechanism prospects.html's own form uses -
 * not a parallel/duplicate discovery system.
 *
 * This is a DISPATCH, not a wait: Apollo batches can take minutes and
 * already have their own progress tracking (LilyPadLeadBatch, visible
 * in prospects.html and in the All Leads view) - duplicating that
 * inside the Goal Mode job would just be two progress bars for the same
 * underlying work. The Goal Mode job completes once the batch is
 * queued; the real harvesting proceeds on its own from there.
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const LilyPadLeadBatch = require('../models/lilypadLeadBatch')
const { isApolloConfigured } = require('./apolloService')
const { enqueueBatch } = require('./leadProspectorWorker')

function rx (term) {
  return new RegExp(term, 'i')
}

async function countExistingLocalLeads (state, city) {
  const salesLeadQuery = { division: 'froggys_fog' }
  const stagedLeadQuery = { status: { $ne: 'imported' } }
  if (state) {
    salesLeadQuery['address.state'] = state
    stagedLeadQuery.state = state
  }
  if (city) {
    salesLeadQuery['address.city'] = rx(city)
    stagedLeadQuery.city = rx(city)
  }

  const [salesLeadCount, stagedLeadCount] = await Promise.all([
    LilyPadSalesLead.countDocuments(salesLeadQuery),
    LilyPadStagedLead.countDocuments(stagedLeadQuery)
  ])

  return salesLeadCount + stagedLeadCount
}

async function dispatchApolloHarvest (job) {
  const { state, city, targetEntity, targetCount } = job.criteria

  const existingCount = await countExistingLocalLeads(state, city)
  job.progress.discovered = existingCount

  if (existingCount >= targetCount) {
    job.progress.verified = existingCount
    job.provenanceSummary.tier1_registry = existingCount
    job.logs.push({ message: `Found ${existingCount} existing local lead(s)/staged lead(s) matching this request - no new Apollo search needed.`, level: 'info' })
    job.status = 'completed'
    await job.save()
    return
  }

  if (!isApolloConfigured()) {
    job.logs.push({ message: 'Apollo.io is not configured (APOLLO_API_KEY not set) - cannot harvest new leads. Set it on the server, or add leads manually.', level: 'warn' })
    job.status = 'completed'
    await job.save()
    return
  }

  if (!job.createdByUserId) {
    job.logs.push({ message: 'This job has no owning user recorded - cannot dispatch an Apollo batch, which requires one.', level: 'error' })
    job.status = 'failed'
    await job.save()
    return
  }

  const batch = await LilyPadLeadBatch.create({
    createdByUserId: job.createdByUserId,
    createdByName: job.createdByName,
    sector: 'commercial',
    sourceMode: 'apollo',
    targetVertical: '',
    targetIndustry: [targetEntity].filter(Boolean),
    targetLocations: [city, state].filter(Boolean),
    targetZipCodes: [],
    zipRadiusMiles: 25,
    // Left empty on purpose - buildApolloFilters already applies
    // sensible commercial-sector default titles when none are given.
    targetTitles: [],
    requestedCount: targetCount,
    perPage: 100,
    status: 'queued',
    statusMessage: 'Queued for processing.'
  })

  enqueueBatch(batch._id)

  job.apolloBatchId = batch._id
  job.logs.push({ message: `Apollo search dispatched (batch ${batch._id}) - check All Leads or Lead Prospector shortly for results.`, level: 'info' })
  job.status = 'completed'
  await job.save()
}

module.exports = { dispatchApolloHarvest }
