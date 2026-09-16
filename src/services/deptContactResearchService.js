/**
 * LilyPad ERP - Lead Contact Research
 * Finds a real named contact for one lead, following a division-
 * specific role-priority fallback, via Anthropic's server-side
 * web_search tool - Claude runs its own search queries and only calls
 * the forced-shape extraction tool with what it actually found in real
 * results. Never invents a name/phone/email: `found: false` when
 * nothing turns up, not a guess.
 *
 * Originally built and pilot-validated (5/5 real Tennessee departments)
 * for Training Smoke's Training Chief -> Fire Chief -> Captain
 * hierarchy; generalized here to also cover Froggy's Fog's
 * Owner -> General Manager -> Manager hierarchy for leads sourced via
 * the Google Maps harvest (mapsHarvestBridge.js), which only ever
 * returns company-level data (name/phone/reviews), never a contact.
 *
 * Deliberately NOT the forced-single-tool-choice pattern used for
 * cheap classification elsewhere in this app (emailTriageExtractionService.js,
 * receiptExtractionService.js) - a search-then-extract flow needs
 * Claude to decide when to search vs. when it's done, so this uses
 * tool_choice: 'auto' with both tools available.
 */

const Anthropic = require('@anthropic-ai/sdk')
const winston = require('../logger')
const LilyPadSalesLead = require('../models/lilypadSalesLead')

// A single call can involve several real web searches plus reasoning
// over the results - 60s (this app's usual AI-call timeout) was
// confirmed too short in testing and cut off a legitimate in-progress
// lookup (Chattanooga Fire Department) with no result at all.
const REQUEST_TIMEOUT_MS = 120000
const MAX_RETRIES = 3
// Stronger model, not the Haiku tier - judging real search results for
// a specific named role is a harder task than mechanical classification.
const DEFAULT_MODEL = 'claude-sonnet-5'
const WEB_SEARCH_TOOL_TYPE = 'web_search_20260209'
const MAX_SEARCHES_PER_LEAD = 3

const CONFIDENCE_RANK = { '': 0, low: 1, medium: 2, high: 3 }

// One entry per division - roles are checked in order, most-preferred
// first, matching how each division's Goal Mode prompts already phrase
// their own fallback ("Training Chief, fallback to Fire Chief or
// Captain" / a haunt's decision-maker being whoever runs the place).
const ROLE_HIERARCHIES = {
  training_smoke: {
    entityLabel: 'fire department',
    roles: ['training_chief', 'fire_chief', 'captain'],
    titleLabels: { training_chief: 'Training Chief', fire_chief: 'Fire Chief', captain: 'Captain' }
  },
  froggys_fog: {
    entityLabel: 'business',
    roles: ['owner', 'general_manager', 'manager'],
    titleLabels: { owner: 'Owner', general_manager: 'General Manager', manager: 'Manager' }
  }
}

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.DEPT_CONTACT_RESEARCH_MODEL || DEFAULT_MODEL
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

function buildResearchTool (roleHierarchy) {
  return {
    name: 'emit_lead_contact',
    description: `The best available contact found via web search for one ${roleHierarchy.entityLabel}, following a strict role-priority fallback.`,
    input_schema: {
      type: 'object',
      required: ['found', 'role_matched', 'confidence'],
      properties: {
        found: { type: 'boolean', description: 'True only if a named person with a phone number or email was actually found in real search results - never true on a guess or inference.' },
        contact_name: { type: ['string', 'null'] },
        role_matched: { type: 'string', enum: [...roleHierarchy.roles, 'none'], description: `${roleHierarchy.roles[0]} is preferred - only report a later role in the list if an earlier one genuinely could not be found. "none" if found is false.` },
        phone: { type: ['string', 'null'] },
        email: { type: ['string', 'null'] },
        source_url: { type: ['string', 'null'], description: 'The exact URL the name and contact detail were found on.' },
        confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'high = official site/roster; medium = local news or secondary source; low = indirect/uncertain match.' }
      }
    }
  }
}

function buildSystemPrompt (roleHierarchy) {
  const roleList = roleHierarchy.roles.map((r) => roleHierarchy.titleLabels[r] || r).join(' -> ')
  return `You research one specific ${roleHierarchy.entityLabel}'s contact for an internal ERP's sales tool, via web search. ` +
    `Search in this priority order, falling back only if the earlier role genuinely cannot be found: ${roleList}. ` +
    'You MUST call the emit_lead_contact tool exactly once when you are done searching. ' +
    'Set found:true ONLY if you found a real named person together with a phone number or email address in actual search results - ' +
    'never invent, infer, or guess a name or contact detail that wasn\'t actually in the results. If nothing solid turns up after searching, set found:false and role_matched:"none".'
}

// Free-text titles from leadTargetingMatrix.js ("Technical Director")
// need an enum-safe key for the tool schema's role_matched field -
// "Technical Director" -> "technical_director".
function slugify (title) {
  return String(title || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

/**
 * Prefers a lead's OWN saved title hierarchy (set per-sector by
 * mapsHarvestBridge.js, e.g. "Technical Director" for haunts vs.
 * "Production Director" for worship) over the division-wide default -
 * falls back to the default for leads with none saved (manually-added,
 * USFA-sourced, etc.).
 */
function resolveRoleHierarchy (lead) {
  const fallback = ROLE_HIERARCHIES[lead.division] || ROLE_HIERARCHIES.training_smoke
  const titles = lead.metadata && lead.metadata.titleHierarchy
  if (!titles || !titles.length) return fallback

  const roles = titles.map(slugify).filter(Boolean)
  const titleLabels = {}
  titles.forEach((title, i) => { titleLabels[roles[i]] = title })

  return { entityLabel: fallback.entityLabel, roles, titleLabels }
}

async function researchContact (companyName, city, state, roleHierarchy) {
  const config = getConfig()
  const client = getClient(config.apiKey)

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 2048,
    system: buildSystemPrompt(roleHierarchy),
    tools: [
      { type: WEB_SEARCH_TOOL_TYPE, name: 'web_search', max_uses: MAX_SEARCHES_PER_LEAD },
      buildResearchTool(roleHierarchy)
    ],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: `${roleHierarchy.entityLabel[0].toUpperCase()}${roleHierarchy.entityLabel.slice(1)}: "${companyName}", ${city}, ${state}` }]
  })

  const toolUse = [...response.content].reverse().find((block) => block.type === 'tool_use' && block.name === 'emit_lead_contact')
  if (!toolUse) return { found: false, role_matched: 'none', confidence: 'low' }
  return toolUse.input || { found: false, role_matched: 'none', confidence: 'low' }
}

// Confirmed in pilot testing: a real result (Nashville Fire Dept) came
// back with the literal placeholder text "[email protected]" - some
// sites render that string as a fallback when their JS-based email
// obfuscation doesn't execute, and the model mistook the placeholder
// itself for a real address. A normal-looking email regex wouldn't
// catch this (it IS shaped like an email); block the known placeholder
// literally instead of trusting shape alone.
const PLACEHOLDER_EMAILS = new Set(['[email protected]', 'email@protected', 'noreply@example.com'])

function sanitizeEmail (rawEmail) {
  const email = String(rawEmail || '').trim().toLowerCase()
  if (!email || PLACEHOLDER_EMAILS.has(email)) return ''
  return email
}

/**
 * Researches and saves a contact for one lead. Atomic update, not
 * load-mutate-save - and never overwrites an existing higher-confidence
 * contact with a weaker one from a re-run.
 */
async function researchContactForLead (leadId) {
  const lead = await LilyPadSalesLead.findById(leadId)
  if (!lead) throw new Error('Lead not found.')

  const roleHierarchy = resolveRoleHierarchy(lead)
  const result = await researchContact(lead.companyName, (lead.address && lead.address.city) || '', (lead.address && lead.address.state) || '', roleHierarchy)

  if (!result.found) {
    await LilyPadSalesLead.updateOne({ _id: leadId }, { $set: { 'contact.researchedAt': new Date() } })
    return { leadId, found: false }
  }

  const existingRank = CONFIDENCE_RANK[(lead.contact && lead.contact.confidence) || '']
  const newRank = CONFIDENCE_RANK[result.confidence] || 0
  if (existingRank > newRank) {
    return { leadId, found: false, skipped: 'existing contact has higher confidence' }
  }

  await LilyPadSalesLead.updateOne({ _id: leadId }, {
    $set: {
      'contact.name': String(result.contact_name || '').slice(0, 200),
      'contact.title': roleHierarchy.titleLabels[result.role_matched] || '',
      'contact.phone': String(result.phone || '').slice(0, 50),
      'contact.email': sanitizeEmail(result.email).slice(0, 200),
      'contact.roleMatched': result.role_matched,
      'contact.sourceUrl': String(result.source_url || '').slice(0, 500),
      'contact.confidence': result.confidence,
      'contact.researchedAt': new Date()
    }
  })

  return { leadId, found: true, roleMatched: result.role_matched, confidence: result.confidence, contactName: result.contact_name }
}

/**
 * Runs research for up to `limit` leads in `division` that don't have a
 * contact yet. Sequential, not parallel - each call is a real,
 * potentially multi-search web lookup, not a cheap classification, so
 * bursting several at once risks rate limits for no real speed benefit.
 */
async function researchContactBatch (division, limit = 10) {
  if (!isConfigured()) return { researched: 0, found: 0, skipped: 'ANTHROPIC_API_KEY not configured' }

  const leads = await LilyPadSalesLead.find({ division, 'contact.name': { $in: [null, ''] } }).limit(limit)

  const results = []
  for (const lead of leads) {
    try {
      const result = await researchContactForLead(lead._id)
      results.push({ companyName: lead.companyName, ...result })
    } catch (err) {
      winston.error(`Lead contact research failed for ${lead._id}: ${err.message}`)
      results.push({ companyName: lead.companyName, leadId: lead._id, found: false, error: err.message })
    }
  }

  return { researched: results.length, found: results.filter((r) => r.found).length, results }
}

module.exports = { researchContactForLead, researchContactBatch, isConfigured }
