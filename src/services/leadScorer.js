/**
 * LilyPad ERP - Sales OS Lead Scorer
 * Same forced-tool-choice Anthropic SDK pattern used everywhere else in
 * this app (emailTriageExtractionService.js, receiptExtractionService.js) -
 * a structured tool schema instead of freeform JSON parsing, since a
 * model's plain-text JSON occasionally comes back malformed or wrapped
 * in prose, and a forced tool call can't do either.
 */

const fs = require('fs')
const path = require('path')
const Anthropic = require('@anthropic-ai/sdk')
const winston = require('../logger')
const LilyPadSalesLead = require('../models/lilypadSalesLead')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
// Cheap/fast on purpose - this is a small, mechanical per-lead scoring
// pass, the same tiering reasoning as every other per-item classifier in
// this app. "Claude 3.5 Haiku" is a stale model name; this app's actual
// convention (see emailTriageExtractionService.js) is claude-haiku-4-5,
// overridable via env var like every other AI pass here.
const DEFAULT_MODEL = 'claude-haiku-4-5'
const SALES_BRAIN_PATH = path.join(__dirname, '../../sales-brain/CLAUDE.md')

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.LEAD_SCORER_MODEL || DEFAULT_MODEL
  }
}

function isConfigured () {
  return Boolean(getConfig().apiKey)
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

// Read once per process rather than per lead - the file only changes on
// a deploy, not between scoring calls.
let cachedSalesBrain = null

function getSalesBrain () {
  if (cachedSalesBrain === null) {
    try {
      cachedSalesBrain = fs.readFileSync(SALES_BRAIN_PATH, 'utf8')
    } catch (err) {
      winston.error(`Unable to read sales-brain/CLAUDE.md: ${err.message}`)
      cachedSalesBrain = ''
    }
  }
  return cachedSalesBrain
}

const SCORE_TOOL = {
  name: 'emit_lead_score',
  description: 'Structured sales-intent scoring for one prospective lead.',
  input_schema: {
    type: 'object',
    required: ['intent_score', 'recommended_sku', 'pitch_hook', 'reasoning'],
    properties: {
      intent_score: { type: 'number', description: '0-100 - how likely this lead is to buy soon, based on the signals given (station/review count, rating, division fit).' },
      recommended_sku: { type: 'string', description: 'One specific SKU from the product guide most relevant to this lead, e.g. "Training Smoke XD 4-Gal" or "Bog Fog 4-Gal Case".' },
      pitch_hook: { type: 'string', description: 'Exactly 2 punchy, personalized sentences a salesperson could paste directly into an outreach email - tailored to this lead\'s specific use case (safety/burn drills for Training Smoke, hang time/haunt season for Froggy\'s Fog).' },
      reasoning: { type: 'string', description: 'One sentence explaining the intent score.' }
    }
  }
}

function buildSystemPrompt () {
  return 'You score inbound sales leads for an internal ERP\'s Sales OS module, via the emit_lead_score tool. ' +
    'Base every recommendation strictly on the product guide below - never recommend a SKU that isn\'t in it. ' +
    'Product guide:\n\n' + getSalesBrain()
}

function buildUserPrompt (lead) {
  const lines = [
    `Division: ${lead.division}`,
    `Company: ${lead.companyName}`,
    `Location: ${(lead.address && lead.address.city) || 'unknown city'}, ${(lead.address && lead.address.state) || 'unknown state'}`,
    `Station count: ${(lead.metadata && lead.metadata.stationCount) || 'unknown'}`,
    `Google review count: ${(lead.metadata && lead.metadata.reviewCount) || 0}`,
    `Google rating: ${(lead.metadata && lead.metadata.googleRating) || 'unknown'}`
  ]
  if (lead.contact && lead.contact.name) {
    lines.push(`Contact: ${lead.contact.name}${lead.contact.title ? ' (' + lead.contact.title + ')' : ''}`)
  }
  return lines.join('\n')
}

async function scoreOneLead (client, model, lead) {
  const response = await client.messages.create({
    model,
    max_tokens: 512,
    system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
    tools: [SCORE_TOOL],
    tool_choice: { type: 'tool', name: SCORE_TOOL.name },
    messages: [{ role: 'user', content: buildUserPrompt(lead) }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) throw new Error('Model did not return a score.')
  const result = toolUse.input || {}

  const intentScore = Math.max(0, Math.min(100, Number(result.intent_score) || 0))

  await LilyPadSalesLead.updateOne(
    { _id: lead._id },
    {
      $set: {
        'aiScore.intentScore': intentScore,
        'aiScore.recommendedSku': String(result.recommended_sku || '').slice(0, 200),
        'aiScore.pitchHook': String(result.pitch_hook || '').slice(0, 1000),
        'aiScore.reasoning': String(result.reasoning || '').slice(0, 500),
        'aiScore.scoredAt': new Date(),
        status: 'scored'
      }
    }
  )
}

/**
 * Scores up to `limit` unprocessed leads. Each lead is independent -
 * one failing (a bad API response, a transient error) is logged and
 * skipped rather than aborting the rest of the batch.
 */
async function scoreLeadBatch (limit = 15) {
  if (!isConfigured()) return { scored: 0, failed: 0, skipped: 'ANTHROPIC_API_KEY not configured' }

  const config = getConfig()
  const client = getClient(config.apiKey)

  const leads = await LilyPadSalesLead.find({ status: 'unprocessed' }).limit(limit)

  let scored = 0
  let failed = 0
  for (const lead of leads) {
    try {
      await scoreOneLead(client, config.model, lead)
      scored++
    } catch (err) {
      failed++
      winston.error(`Lead scoring failed for ${lead._id}: ${err.message}`)
    }
  }

  return { scored, failed }
}

/**
 * Nightly scoring sweep - this app has no cron dependency (node-cron
 * included) anywhere; every one of its 8 existing schedulers uses this
 * same setInterval + staggered initial setTimeout shape instead (see
 * emailTriageExtractionService.js/receiptExtractionService.js), so a
 * roughly-daily interval here rather than node-cron's exact wall-clock
 * scheduling keeps this consistent with everything else in app.js.
 */
function runScheduledScoring (winstonLogger) {
  return scoreLeadBatch(25).then((summary) => {
    if (winstonLogger) winstonLogger.info(`Sales lead scoring: scored ${summary.scored}, failed ${summary.failed}`)
  }).catch((err) => {
    if (winstonLogger) winstonLogger.error('Scheduled sales lead scoring failed: ' + err.message)
  })
}

function startLeadScoringScheduler (winstonLogger) {
  if (!isConfigured()) {
    if (winstonLogger) winstonLogger.info('Sales lead scoring scheduler not started - ANTHROPIC_API_KEY not configured.')
    return
  }

  const intervalHours = Number(process.env.SALES_LEAD_SCORING_CHECK_HOURS || 24)
  const intervalMs = Math.max(6 * 60 * 60 * 1000, intervalHours * 60 * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Sales lead scoring scheduler started (${intervalHours} hour interval).`)

  setInterval(() => {
    runScheduledScoring(winstonLogger)
  }, intervalMs)

  setTimeout(() => {
    runScheduledScoring(winstonLogger)
  }, 210000) // staggered after the other email-pipeline schedulers' own initial runs
}

module.exports = { scoreLeadBatch, isConfigured, startLeadScoringScheduler }
