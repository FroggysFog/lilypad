/**
 * LilyPad ERP - Goal-Mode Cascading Waterfall Engine
 * Tier 1 (free registry lookup, already-imported leads) -> Tier 2
 * (deterministic department-website scrape, best-effort) -> Tier 3
 * (real web-search-grounded AI resolution). Tier 3 is exactly
 * deptContactResearchService.js, already built and validated in a real
 * pilot (5/5 Tennessee departments) - not reimplemented here.
 */

const axios = require('axios')
const cheerio = require('cheerio')
const Anthropic = require('@anthropic-ai/sdk')
const winston = require('../logger')
const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadSalesScrapeJob = require('../models/lilypadSalesScrapeJob')
const deptContactResearchService = require('./deptContactResearchService')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const DEFAULT_MODEL = 'claude-haiku-4-5'
const DIRECTORY_PATHS = ['/staff', '/directory', '/contact', '/administration', '/personnel']

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.WATERFALL_TIER2_MODEL || DEFAULT_MODEL
  }
}

let cachedClient = null
let cachedClientKey = null

function getClient (apiKey) {
  if (!cachedClient || cachedClientKey !== apiKey) {
    cachedClient = new Anthropic({ apiKey, maxRetries: MAX_RETRIES, timeout: REQUEST_TIMEOUT_MS })
    cachedClientKey = apiKey
  }
  return cachedClient
}

const TIER2_TOOL = {
  name: 'emit_directory_contact',
  description: 'The single best contact matching a role-preference hierarchy, extracted only from the provided page text.',
  input_schema: {
    type: 'object',
    required: ['found'],
    properties: {
      found: { type: 'boolean', description: 'True only if a matching named person actually appears in the text below.' },
      name: { type: ['string', 'null'] },
      title: { type: ['string', 'null'] },
      phone: { type: ['string', 'null'] },
      email: { type: ['string', 'null'] }
    }
  }
}

async function fetchDirectoryText (domain) {
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
  for (const path of DIRECTORY_PATHS) {
    try {
      const res = await axios.get(`${baseUrl}${path}`, { timeout: 4000 })
      if (res.status === 200 && typeof res.data === 'string' && res.data.length > 500) {
        return cheerio.load(res.data)('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000)
      }
    } catch (err) {
      // try the next path - a 404/timeout on one guessed path is
      // expected, not an error worth logging per-attempt
    }
  }
  return ''
}

/**
 * Tier 2 - cheap, deterministic: fetch a real page, extract only what's
 * actually printed on it via a forced tool call (never a freeform-JSON
 * prompt). Returns null (not a guess) if nothing usable was found.
 */
async function scrapeDirectoryPages (domain, roleHierarchy) {
  const config = getConfig()
  if (!config.apiKey) return null

  const pageText = await fetchDirectoryText(domain)
  if (!pageText) return null

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 400,
    system: [{ type: 'text', text: 'You extract one specific contact from real municipal directory page text, via the emit_directory_contact tool. Only report found:true if the exact role (or a close match from the given hierarchy) actually appears with a name in the text - never infer or guess.', cache_control: { type: 'ephemeral' } }],
    tools: [TIER2_TOOL],
    tool_choice: { type: 'tool', name: TIER2_TOOL.name },
    messages: [{ role: 'user', content: `Role hierarchy (most preferred first): ${roleHierarchy.join(', ')}\n\nPage text:\n${pageText}` }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  const result = (toolUse && toolUse.input) || {}
  return result.found ? result : null
}

function meetsRequiredFields (lead, requiredFields) {
  return requiredFields.every((field) => {
    if (field === 'contactName') return Boolean(lead.contact && lead.contact.name)
    if (field === 'phone') return Boolean(lead.contact && lead.contact.phone)
    if (field === 'email') return Boolean(lead.contact && lead.contact.email)
    return true
  })
}

async function addLog (job, message, level = 'info') {
  job.logs.push({ message, level })
  await job.save()
}

async function executeWaterfallJob (jobId) {
  const job = await LilyPadSalesScrapeJob.findById(jobId)
  if (!job) return

  job.status = 'running'
  await job.save()

  try {
    const query = { division: job.division, 'contact.name': { $in: [null, ''] } }
    if (job.criteria.state) query['address.state'] = job.criteria.state
    if (job.criteria.city) query['address.city'] = new RegExp(job.criteria.city, 'i')

    const leads = await LilyPadSalesLead.find(query).limit(job.criteria.targetCount * 2)
    job.progress.discovered = leads.length
    await job.save()

    if (!leads.length) {
      await addLog(job, 'No baseline departments found for this state/division yet - import a USFA (or Google Maps) CSV first. Goal-mode enriches existing leads with contacts; it does not discover brand-new departments on its own.', 'warn')
      job.status = 'completed'
      await job.save()
      return
    }

    for (const lead of leads) {
      if (job.progress.verified >= job.criteria.targetCount) break

      let tier = 'tier1_registry'
      let sourceDetails = 'Baseline registry data'
      let confidence = 40

      // Tier 2 - only attempted if this lead actually has a known
      // domain (USFA data has none today, so this will rarely fire
      // until a domain-enrichment step exists - it just skips cleanly).
      if (lead.domain) {
        try {
          const tier2Result = await scrapeDirectoryPages(lead.domain, job.criteria.roleHierarchy)
          if (tier2Result) {
            await LilyPadSalesLead.updateOne({ _id: lead._id }, {
              $set: {
                'contact.name': String(tier2Result.name || '').slice(0, 200),
                'contact.title': String(tier2Result.title || '').slice(0, 200),
                'contact.phone': String(tier2Result.phone || '').slice(0, 50),
                'contact.email': String(tier2Result.email || '').toLowerCase().slice(0, 200)
              }
            })
            tier = 'tier2_directory'
            sourceDetails = `Scraped from ${lead.domain}`
            confidence = 90
          }
        } catch (err) {
          winston.error(`Tier 2 scrape failed for ${lead._id}: ${err.message}`)
        }
      }

      let refreshed = await LilyPadSalesLead.findById(lead._id)

      // Tier 3 - the real, already-validated web-search-grounded path -
      // only if Tier 1/2 didn't already satisfy every required field.
      if (!meetsRequiredFields(refreshed, job.criteria.requiredFields)) {
        try {
          const tier3Result = await deptContactResearchService.researchContactForLead(lead._id)
          if (tier3Result.found) {
            tier = 'tier3_ai_search'
            confidence = tier3Result.confidence === 'high' ? 85 : tier3Result.confidence === 'medium' ? 65 : 40
            refreshed = await LilyPadSalesLead.findById(lead._id)
            sourceDetails = (refreshed.contact && refreshed.contact.sourceUrl) || 'Resolved via AI web search'
          }
        } catch (err) {
          winston.error(`Tier 3 research failed for ${lead._id}: ${err.message}`)
        }
      }

      const passed = meetsRequiredFields(refreshed, job.criteria.requiredFields)

      await LilyPadSalesLead.updateOne({ _id: lead._id }, {
        $set: {
          'provenance.sourceTier': passed ? tier : 'manual',
          'provenance.sourceDetails': passed ? sourceDetails : '',
          'provenance.verificationConfidence': passed ? confidence : 0,
          jobId: job._id
        }
      })

      if (passed) {
        job.progress.verified++
        job.provenanceSummary[tier] = (job.provenanceSummary[tier] || 0) + 1
      } else {
        job.progress.failed++
      }
      await job.save()
    }

    job.status = 'completed'
    await addLog(job, `Goal-mode run finished - ${job.progress.verified} verified, ${job.progress.failed} did not meet required fields.`)
  } catch (err) {
    job.status = 'failed'
    await addLog(job, err.message, 'error')
  }
}

module.exports = { executeWaterfallJob }
