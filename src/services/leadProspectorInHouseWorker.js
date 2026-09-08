/**
 * LilyPad ERP - In-House Discovery Worker
 * The non-Apollo sibling of leadProspectorWorker.js's processBatch,
 * dispatched to when batch.sourceMode is 'in_house' or 'refresh'.
 * Instead of paging through a search API, it enumerates candidate
 * business URLs - from a directory source (discovery/index.js) for
 * 'in_house', or from accounts already in the CRM (existingAccountsAdapter.js)
 * for 'refresh' - crawls each one (crawlerService.js), extracts structured
 * contacts (pageExtractionService.js), and feeds the result through the
 * same normalize -> buildStagedLeadDoc -> stage pipeline the Apollo path
 * uses - so dedup, ProPublica validation, and email verification behave
 * identically regardless of which pipeline found the record. A refreshed
 * contact naturally dedupes back to its own account through the existing
 * domain-match logic, since the crawled domain IS that account's website.
 *
 * `batch.currentPage` is repurposed here as "index into the candidate
 * URL list processed so far" (Apollo uses it as an API page number) -
 * same field, same resumability contract, different unit.
 */

const LilyPadLeadBatch = require('../models/lilypadLeadBatch')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const { discoverCandidateUrls } = require('./prospecting/discovery')
const { discoverAccountsForRefresh, markAccountRefreshed } = require('./prospecting/discovery/existingAccountsAdapter')
const { discoverKeyPages } = require('./prospecting/crawl/crawlerService')
const { extractContactsFromPages, isExtractionConfigured } = require('./prospecting/crawl/pageExtractionService')
const { normalizeCrawledRecord } = require('./prospecting/normalize/crawlNormalizer')
const { buildStagedLeadDoc } = require('./leadProspectorService')
const winston = require('../logger')

const CANDIDATE_VISIT_DELAY_MS = 1500

// Gives the LLM extractor a category cue - niche verticals rarely use
// standard corporate titles like "Purchasing Manager", so this helps it
// recognize "Owner" or "Fire Chief" as the relevant role instead of
// looking for vocabulary that won't appear on these sites.
const VERTICAL_HINTS = {
  fire_department: 'municipal or county fire department',
  fire_training: 'fire training academy',
  haunted_attraction: 'haunted attraction / haunted house',
  theme_park: 'theme park',
  theater_professional: 'professional theater',
  theater_community: 'community theater',
  av_lighting_design: 'A/V and lighting design firm',
  entertainment_venue: 'entertainment venue',
  family_entertainment_center: 'family entertainment center',
  roller_rink: 'roller skating rink',
  bar_nightclub: 'bar or nightclub',
  museum: 'museum',
  childrens_museum: "children's museum"
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
 * `batch` has already been loaded and flipped to status: 'processing' by
 * the caller (leadProspectorWorker.js's processBatch) - this function
 * owns everything from discovery through completion/failure.
 */
async function processInHouseBatch (batch) {
  const batchId = batch._id

  if (!isExtractionConfigured()) {
    await saveProgress(batch, {
      status: 'failed',
      errorMessage: 'LLM extraction is not configured. Add ANTHROPIC_API_KEY to the environment.',
      statusMessage: 'Failed before starting - no ANTHROPIC_API_KEY configured.'
    })
    return
  }

  const isRefresh = batch.sourceMode === 'refresh'

  if (!isRefresh && !batch.targetVertical) {
    await saveProgress(batch, {
      status: 'failed',
      errorMessage: 'targetVertical is required for an in-house sourced batch.',
      statusMessage: 'Failed before starting - no target vertical selected.'
    })
    return
  }

  let candidates
  try {
    candidates = isRefresh
      ? await discoverAccountsForRefresh({ industryKeywords: batch.targetIndustry, limit: batch.requestedCount })
      : await discoverCandidateUrls(batch.targetVertical)
  } catch (err) {
    await saveProgress(batch, {
      status: 'failed',
      errorMessage: err.message,
      statusMessage: 'Failed during discovery.'
    })
    return
  }

  const discoveryLabel = isRefresh ? 'existing CRM accounts due for a refresh' : batch.targetVertical
  await saveProgress(batch, {
    statusMessage: `Discovered ${candidates.length} candidate businesses (${discoveryLabel}). Beginning crawl...`
  })

  const defaultHint = isRefresh ? 'existing customer' : (batch.targetVertical || '').replace(/_/g, ' ')
  const startIndex = batch.currentPage || 0

  try {
    for (let i = startIndex; i < candidates.length; i++) {
      batch = await LilyPadLeadBatch.findById(batchId)
      if (!batch) return
      if (batch.status === 'paused') {
        winston.info(`Lead Prospector in-house batch ${batchId} paused at candidate ${i} of ${candidates.length}.`)
        return
      }
      if (batch.fetchedCount >= batch.requestedCount) break

      const candidate = candidates[i]
      const hint = isRefresh ? (candidate.industry || defaultHint) : (VERTICAL_HINTS[batch.targetVertical] || defaultHint)

      try {
        const pages = await discoverKeyPages(candidate.url)
        const extraction = await extractContactsFromPages(pages, hint)

        const docs = []
        for (const person of extraction.people) {
          try {
            const normalized = normalizeCrawledRecord(person, extraction.organization, {
              sourceUrl: candidate.url,
              vertical: batch.targetVertical
            })
            docs.push(await buildStagedLeadDoc(batch, normalized))
          } catch (err) {
            winston.warn(`In-house batch ${batchId}: failed to stage a contact from ${candidate.url}: ${err.message}`)
          }
        }

        const { duplicates } = await upsertStagedLeadPage(batch._id, docs)
        if (isRefresh) await markAccountRefreshed(candidate.accountId)

        batch = await LilyPadLeadBatch.findById(batchId)
        if (!batch) return

        await saveProgress(batch, {
          fetchedCount: batch.fetchedCount + docs.length,
          duplicateCount: batch.duplicateCount + duplicates,
          currentPage: i + 1,
          statusMessage: `Crawled ${i + 1} of ${candidates.length} (${discoveryLabel}) - ${batch.fetchedCount + docs.length} contacts staged so far.`
        })
      } catch (err) {
        winston.warn(`In-house batch ${batchId}: failed to crawl ${candidate.url}: ${err.message}`)
        if (isRefresh) await markAccountRefreshed(candidate.accountId).catch(() => {})
        batch = await LilyPadLeadBatch.findById(batchId)
        if (!batch) return
        await saveProgress(batch, { currentPage: i + 1 })
      }

      await sleep(CANDIDATE_VISIT_DELAY_MS)
    }

    batch = await LilyPadLeadBatch.findById(batchId)
    if (batch && batch.status === 'processing') {
      await saveProgress(batch, {
        status: 'completed',
        completedAt: new Date(),
        statusMessage: `Finished crawling ${discoveryLabel} (${candidates.length} businesses). Staged ${batch.fetchedCount} of ${batch.requestedCount} requested contacts.`
      })
    }
  } catch (err) {
    winston.error(`Lead Prospector in-house batch ${batchId} failed: ${err.message}`)
    const failedBatch = await LilyPadLeadBatch.findById(batchId)
    if (failedBatch) {
      await saveProgress(failedBatch, {
        status: 'failed',
        errorMessage: err.message,
        statusMessage: `Failed after staging ${failedBatch.fetchedCount} of ${failedBatch.requestedCount} contacts.`
      })
    }
  }
}

module.exports = {
  processInHouseBatch,
  VERTICAL_HINTS
}
