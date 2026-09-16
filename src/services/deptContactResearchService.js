/**
 * LilyPad ERP - Department Leadership Contact Research (pilot)
 * Finds a real named Training Chief (falling back to Fire Chief, then
 * Captain) for one fire department lead, via Anthropic's server-side
 * web_search tool - Claude runs its own search queries and only calls
 * the forced-shape extraction tool with what it actually found in real
 * results. Never invents a name/phone/email: `found: false` when
 * nothing turns up, not a guess.
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

const RESEARCH_TOOL = {
  name: 'emit_department_contact',
  description: 'The best available training/leadership contact found via web search for one fire department, following a strict role-priority fallback.',
  input_schema: {
    type: 'object',
    required: ['found', 'role_matched', 'confidence'],
    properties: {
      found: { type: 'boolean', description: 'True only if a named person with a phone number or email was actually found in real search results - never true on a guess or inference.' },
      contact_name: { type: ['string', 'null'] },
      role_matched: { type: 'string', enum: ['training_chief', 'fire_chief', 'captain', 'none'], description: 'training_chief is preferred - only report fire_chief or captain if a training chief genuinely could not be found. "none" if found is false.' },
      phone: { type: ['string', 'null'] },
      email: { type: ['string', 'null'] },
      source_url: { type: ['string', 'null'], description: 'The exact URL the name and contact detail were found on.' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'high = official department site/roster; medium = local news or secondary source; low = indirect/uncertain match.' }
    }
  }
}

function buildSystemPrompt () {
  return 'You research one specific fire department\'s leadership contact for an internal ERP\'s sales tool, via web search. ' +
    'Search for the department\'s Training Chief or Training Officer first. Only if you genuinely cannot find one after searching, ' +
    'fall back to the Fire Chief. Only if neither exists, fall back to a Captain. ' +
    'You MUST call the emit_department_contact tool exactly once when you are done searching. ' +
    'Set found:true ONLY if you found a real named person together with a phone number or email address in actual search results - ' +
    'never invent, infer, or guess a name or contact detail that wasn\'t actually in the results. If nothing solid turns up after searching, set found:false and role_matched:"none".'
}

async function researchContact (companyName, city, state) {
  const config = getConfig()
  const client = getClient(config.apiKey)

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 2048,
    system: buildSystemPrompt(),
    tools: [
      { type: WEB_SEARCH_TOOL_TYPE, name: 'web_search', max_uses: MAX_SEARCHES_PER_LEAD },
      RESEARCH_TOOL
    ],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: `Fire department: "${companyName}", ${city}, ${state}` }]
  })

  const toolUse = [...response.content].reverse().find((block) => block.type === 'tool_use' && block.name === 'emit_department_contact')
  if (!toolUse) return { found: false, role_matched: 'none', confidence: 'low' }
  return toolUse.input || { found: false, role_matched: 'none', confidence: 'low' }
}

/**
 * Researches and saves a contact for one lead. Atomic update, not
 * load-mutate-save - and never overwrites an existing higher-confidence
 * contact with a weaker one from a re-run.
 */
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

async function researchContactForLead (leadId) {
  const lead = await LilyPadSalesLead.findById(leadId)
  if (!lead) throw new Error('Lead not found.')

  const result = await researchContact(lead.companyName, (lead.address && lead.address.city) || '', (lead.address && lead.address.state) || '')

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
      'contact.title': result.role_matched === 'training_chief' ? 'Training Chief' : result.role_matched === 'fire_chief' ? 'Fire Chief' : result.role_matched === 'captain' ? 'Captain' : '',
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
      winston.error(`Department contact research failed for ${lead._id}: ${err.message}`)
      results.push({ companyName: lead.companyName, leadId: lead._id, found: false, error: err.message })
    }
  }

  return { researched: results.length, found: results.filter((r) => r.found).length, results }
}

module.exports = { researchContactForLead, researchContactBatch, isConfigured }
