/**
 * LilyPad ERP - Google Maps Harvest Bridge (Goal Mode -> Apify)
 * Used by BOTH divisions now, not just Froggy's Fog - Training Smoke's
 * fire_academies/industrial_safety sub-verticals are a genuinely
 * different discovery problem than general municipal fire departments
 * (USFA has no concept of a training academy or a safety company as a
 * distinct entity), so they route here too. A general training_smoke
 * request (no matched sector) falls back to the existing USFA-based
 * cascade in waterfallScraper.js instead.
 *
 * Discovery and contact enrichment are deliberately separate actions -
 * this only ever harvests and stores leads as `unprocessed`. Contact
 * research is a distinct, explicitly-triggered step (see
 * deptContactResearchService.researchContactBatch, reachable via the
 * "Research Contacts" button) so a large harvest never silently turns
 * into a burst of AI calls on its own.
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const apifyGmapsService = require('./apifyGmapsService')
const gmapsImporter = require('./gmapsImporter')
const { getSectorConfig } = require('./leadTargetingMatrix')

function rx (term) {
  return new RegExp(term, 'i')
}

// Used only when a froggys_fog prompt doesn't match one of the curated
// sub-verticals - still routes through the Maps harvest (that's the
// only discovery mechanism this division has at all), just with the
// planner's raw extracted phrase as the one search term instead of a
// curated list. Training Smoke has no equivalent fallback here - a
// general municipal fire department request has a real, different
// baseline (USFA) that waterfallScraper.js falls through to instead.
const GENERIC_FROGGYS_FOG_TITLES = ['Owner', 'General Manager', 'Manager']

async function countExistingLocalLeads (division, state, city) {
  const salesLeadQuery = { division }
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

/**
 * Real Google Maps category tagging is inconsistent (a real escape room
 * can come back tagged "Amusement center" instead of "Escape room
 * center"), so categoryFilters are stored for reference, not enforced
 * as a hard reject - only the two unconditional quality rules below
 * actually drop a result.
 */
function passesQualityFilters (item, sectorConfig) {
  if (!item.website && !item.phone && !item.phoneUnformatted) return false
  if (sectorConfig.minReviews && Number(item.reviewsCount || 0) < sectorConfig.minReviews) return false
  return true
}

async function dispatchMapsHarvest (job) {
  const { division, criteria } = job
  const { state, city, sector, targetEntity, targetCount } = criteria

  let sectorConfig = getSectorConfig(division, sector)
  if (!sectorConfig) {
    if (division !== 'froggys_fog') {
      // Training Smoke's real fallback is a different mechanism
      // entirely (USFA) - the caller (waterfallScraper.js) handles it.
      return { handled: false }
    }
    // Froggy's Fog has no other discovery mechanism - fall back to a
    // plain single-term search rather than failing outright.
    sectorConfig = { searchTerms: [targetEntity].filter(Boolean), categoryFilters: [], titleHierarchy: GENERIC_FROGGYS_FOG_TITLES }
  }

  if (!sectorConfig.searchTerms.length) {
    job.logs.push({ message: 'No search terms available for this request - could not determine what to search for.', level: 'warn' })
    job.status = 'completed'
    await job.save()
    return { handled: true }
  }

  const existingCount = await countExistingLocalLeads(division, state, city)
  job.progress.discovered = existingCount

  if (existingCount >= targetCount) {
    job.progress.verified = existingCount
    job.provenanceSummary.tier1_registry = existingCount
    job.logs.push({ message: `Found ${existingCount} existing local lead(s)/staged lead(s) matching this request - no new search needed.`, level: 'info' })
    job.status = 'completed'
    await job.save()
    return { handled: true }
  }

  if (!apifyGmapsService.isApifyConfigured()) {
    job.logs.push({ message: 'Apify is not configured (APIFY_API_TOKEN not set) - cannot harvest new leads. Set it on the server, or import a Google Maps CSV manually.', level: 'warn' })
    job.status = 'completed'
    await job.save()
    return { handled: true }
  }

  const location = [city, state].filter(Boolean).join(', ')

  try {
    const items = await apifyGmapsService.searchGoogleMaps({
      searchTerms: sectorConfig.searchTerms,
      location,
      maxResults: targetCount
    })

    const filtered = items.filter((item) => passesQualityFilters(item, sectorConfig))

    const summary = await gmapsImporter.importFromApifyResults(filtered, division, {
      sector,
      titleHierarchy: sectorConfig.titleHierarchy
    })

    job.progress.discovered = existingCount + items.length
    job.progress.verified = existingCount + summary.inserted
    // Structured baseline discovery, same label USFA already uses -
    // both are "Tier 1: Public Registries & Map Scraping."
    job.provenanceSummary.tier1_registry = existingCount + summary.inserted
    job.logs.push({
      message: `Google Maps search ("${sectorConfig.searchTerms.join('", "')}") found ${items.length} result(s) near ${location || 'your area'} (${items.length - filtered.length} dropped by quality filters) - ${summary.inserted} new lead(s) added, ${summary.updated} refreshed, ${summary.skipped} unusable.`,
      level: 'info'
    })
    job.status = 'completed'
    await job.save()
    return { handled: true }
  } catch (err) {
    job.logs.push({ message: `Google Maps search failed: ${err.message}`, level: 'error' })
    job.status = 'failed'
    await job.save()
    return { handled: true }
  }
}

module.exports = { dispatchMapsHarvest }
