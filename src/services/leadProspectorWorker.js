/**
 * LilyPad ERP - Lead Prospector Worker
 * There's no Redis/BullMQ in this deployment (single Node process on
 * Render), so "asynchronous job queue" here is an in-memory FIFO of batch
 * IDs processed one at a time, with every bit of progress persisted to
 * the lead_batches document itself between pages. That persistence is
 * what makes a batch resumable/pause-able across pause requests and even
 * process restarts (see leadProspectorScheduler.js's recovery sweep) -
 * the in-memory queue only decides *when* the next page runs, never
 * where a batch's progress lives.
 */

const LilyPadLeadBatch = require('../models/lilypadLeadBatch')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const apolloService = require('./apolloService')
const { normalizeApolloRecord } = require('./prospecting/normalize/apolloNormalizer')
const { processInHouseBatch } = require('./leadProspectorInHouseWorker')
const {
  buildApolloFilters,
  buildStagedLeadDoc
} = require('./leadProspectorService')
const winston = require('../logger')

const DEFAULT_PER_PAGE = 100
const PAGE_DELAY_MS = 350
const MAX_CONSECUTIVE_EMPTY_PAGES = 2

const queue = []
let isDraining = false

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Persists progress after every page - this is what a poller against
 * GET /api/leads/batches/:id actually reads to render "Fetched X of Y".
 */
async function saveProgress (batch, patch) {
  Object.assign(batch, patch)
  await batch.save()
}

async function upsertStagedLeadPage (batchId, docs) {
  if (!docs.length) return { upserted: 0, duplicates: 0 }

  const bulkResult = await LilyPadStagedLead.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { batchId, externalId: doc.externalId },
        update: { $set: doc },
        upsert: true
      }
    })),
    { ordered: false }
  )

  const duplicates = docs.filter((d) => d.isDuplicate).length
  return {
    upserted: (bulkResult.upsertedCount || 0) + (bulkResult.modifiedCount || 0),
    duplicates
  }
}

/**
 * Runs one batch to completion, exhaustion, pause, or failure. Reloads
 * the batch document at the top of every page so a pause requested via
 * POST /api/leads/batches/:id/pause (which just flips the DB status) is
 * observed cooperatively between pages rather than needing to interrupt
 * an in-flight Apollo call.
 */
async function processBatch (batchId) {
  let batch = await LilyPadLeadBatch.findById(batchId)
  if (!batch) return
  if (!['queued', 'processing', 'paused'].includes(batch.status)) return

  if (batch.sourceMode === 'in_house' || batch.sourceMode === 'refresh') {
    await saveProgress(batch, {
      status: 'processing',
      startedAt: batch.startedAt || new Date(),
      errorMessage: null,
      statusMessage: batch.statusMessage || (batch.sourceMode === 'refresh'
        ? 'Starting CRM account refresh...'
        : 'Starting in-house directory discovery...')
    })
    return processInHouseBatch(batch)
  }

  await saveProgress(batch, {
    status: 'processing',
    startedAt: batch.startedAt || new Date(),
    errorMessage: null,
    statusMessage: 'Starting Apollo.io search...'
  })

  const filters = buildApolloFilters(batch)
  if (filters.unresolvedZips && filters.unresolvedZips.length) {
    winston.warn(`Lead Prospector batch ${batchId}: could not resolve ZIP code(s) ${filters.unresolvedZips.join(', ')} - skipped, search continued with the rest.`)
    await saveProgress(batch, {
      statusMessage: `Starting Apollo.io search... (could not resolve ZIP code(s): ${filters.unresolvedZips.join(', ')} - double-check them or try a nearby ZIP)`
    })
  }
  const perPage = batch.perPage || DEFAULT_PER_PAGE
  let page = (batch.currentPage || 0) + 1
  let consecutiveEmptyPages = 0

  try {
    while (batch.fetchedCount < batch.requestedCount) {
      batch = await LilyPadLeadBatch.findById(batchId)
      if (!batch) return
      if (batch.status === 'paused') {
        winston.info(`Lead Prospector batch ${batchId} paused at page ${page}.`)
        return
      }

      const remaining = batch.requestedCount - batch.fetchedCount
      const pageSize = Math.min(perPage, remaining)

      const { people, pagination } = await apolloService.searchPeople(filters, page, pageSize)

      if (!people.length) {
        consecutiveEmptyPages++
        if (consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY_PAGES || page >= pagination.totalPages) {
          await saveProgress(batch, {
            status: 'completed',
            completedAt: new Date(),
            statusMessage: `Apollo.io returned no more matching records. Fetched ${batch.fetchedCount} of ${batch.requestedCount} requested.`
          })
          return
        }
        page++
        continue
      }
      consecutiveEmptyPages = 0

      let enrichedMatches = []
      try {
        enrichedMatches = await apolloService.bulkEnrichPeople(people)
      } catch (err) {
        winston.warn(`Lead Prospector batch ${batchId}: bulk enrichment failed for page ${page}, continuing with search-only data: ${err.message}`)
      }
      const enrichedById = new Map(enrichedMatches.map((m) => [String(m.id), m]))

      const docs = []
      for (const person of people) {
        const enriched = enrichedById.get(String(person.id)) || null
        try {
          const normalized = normalizeApolloRecord(person, enriched)
          docs.push(await buildStagedLeadDoc(batch, normalized))
        } catch (err) {
          winston.warn(`Lead Prospector batch ${batchId}: failed to stage person ${person.id}: ${err.message}`)
        }
      }

      const { duplicates } = await upsertStagedLeadPage(batch._id, docs)

      batch = await LilyPadLeadBatch.findById(batchId)
      if (!batch) return

      await saveProgress(batch, {
        fetchedCount: batch.fetchedCount + docs.length,
        duplicateCount: batch.duplicateCount + duplicates,
        currentPage: page,
        statusMessage: `Fetched ${batch.fetchedCount + docs.length} of ${batch.requestedCount} requested leads (page ${page}).`
      })

      if (page >= pagination.totalPages) {
        await saveProgress(batch, {
          status: 'completed',
          completedAt: new Date(),
          statusMessage: `Apollo.io search exhausted. Fetched ${batch.fetchedCount} of ${batch.requestedCount} requested.`
        })
        return
      }

      page++
      await sleep(PAGE_DELAY_MS)
    }

    batch = await LilyPadLeadBatch.findById(batchId)
    if (batch && batch.status === 'processing') {
      await saveProgress(batch, {
        status: 'completed',
        completedAt: new Date(),
        statusMessage: `Reached requested count: ${batch.fetchedCount} of ${batch.requestedCount} leads fetched.`
      })
    }
  } catch (err) {
    winston.error(`Lead Prospector batch ${batchId} failed: ${err.message}`)
    const failedBatch = await LilyPadLeadBatch.findById(batchId)
    if (failedBatch) {
      await saveProgress(failedBatch, {
        status: 'failed',
        errorMessage: err.message,
        statusMessage: `Failed after fetching ${failedBatch.fetchedCount} of ${failedBatch.requestedCount} leads.`
      })
    }
  }
}

/**
 * Drains the in-memory queue one batch at a time. Concurrency is
 * deliberately capped at 1: Apollo's per-minute rate limit is shared
 * across every concurrent search, and one deep run can already involve
 * hundreds of paginated requests.
 */
async function drainQueue () {
  if (isDraining) return
  isDraining = true
  try {
    while (queue.length) {
      const batchId = queue.shift()
      await processBatch(batchId).catch((err) => {
        winston.error(`Lead Prospector queue drain error for batch ${batchId}: ${err.message}`)
      })
    }
  } finally {
    isDraining = false
  }
}

function enqueueBatch (batchId) {
  const id = String(batchId)
  if (queue.includes(id)) return
  queue.push(id)
  drainQueue()
}

module.exports = {
  enqueueBatch,
  processBatch
}
