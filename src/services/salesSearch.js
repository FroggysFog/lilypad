/**
 * LilyPad ERP - Sales OS Natural Language Search
 * SECURITY NOTE: does NOT let the LLM produce an executable MongoDB
 * filter - handing a model's freeform JSON straight to .find() is a
 * real NoSQL-injection-shaped risk (nothing bounds what operators or
 * fields it could include). Same principle as reportQueryService.js:
 * a forced tool call only ever extracts a handful of validated,
 * schema-typed parameters; this file alone builds the actual query,
 * and only from values that pass a fixed allow-list/type check.
 */

const Anthropic = require('@anthropic-ai/sdk')
const LilyPadSalesLead = require('../models/lilypadSalesLead')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const DEFAULT_MODEL = 'claude-haiku-4-5'

const VALID_DIVISIONS = ['froggys_fog', 'training_smoke']
const VALID_STATUSES = ['unprocessed', 'scored', 'contacted', 'quoted', 'converted', 'disqualified']
const VALID_SOURCES = ['usfa_registry', 'manual_import', 'gmaps_csv', 'inbound']

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.SALES_SEARCH_MODEL || DEFAULT_MODEL
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

const SEARCH_TOOL = {
  name: 'emit_lead_search',
  description: 'Structured search parameters extracted from a plain-English lead search request.',
  input_schema: {
    type: 'object',
    properties: {
      division: { type: ['string', 'null'], enum: [...VALID_DIVISIONS, null] },
      state: { type: ['string', 'null'], description: 'Two-letter US state code, or null if not mentioned.' },
      city_contains: { type: ['string', 'null'], description: 'A city name mentioned in the request, or null.' },
      status: { type: ['string', 'null'], enum: [...VALID_STATUSES, null], description: '"unworked" means unprocessed.' },
      source: { type: ['string', 'null'], enum: [...VALID_SOURCES, null] },
      min_station_count: { type: ['number', 'null'], description: 'Minimum station count if a threshold like "over N stations" was mentioned.' },
      min_review_count: { type: ['number', 'null'] },
      min_intent_score: { type: ['number', 'null'] }
    }
  }
}

const SYSTEM_PROMPT = 'You extract structured search parameters from a salesperson\'s plain-English lead search request, ' +
  'via the emit_lead_search tool. Only fill in a field if the request actually implies it - leave every other field null. ' +
  'Never guess a value the request didn\'t state or clearly imply.'

async function parseSearchQuery (userQuery) {
  const config = getConfig()
  if (!config.apiKey) return {}

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 512,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [SEARCH_TOOL],
    tool_choice: { type: 'tool', name: SEARCH_TOOL.name },
    messages: [{ role: 'user', content: userQuery }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  return (toolUse && toolUse.input) || {}
}

function escapeRegex (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * The one place anything from the LLM output reaches the database -
 * every field is checked against a fixed allow-list or type before
 * being used, and free text only ever becomes a regex-escaped,
 * case-insensitive match on a single known field.
 */
function buildFilter (params) {
  const filter = {}

  if (VALID_DIVISIONS.includes(params.division)) filter.division = params.division
  if (VALID_STATUSES.includes(params.status)) filter.status = params.status
  if (VALID_SOURCES.includes(params.source)) filter.source = params.source

  if (typeof params.state === 'string' && /^[A-Za-z]{2}$/.test(params.state.trim())) {
    filter['address.state'] = params.state.trim().toUpperCase()
  }
  if (typeof params.city_contains === 'string' && params.city_contains.trim()) {
    filter['address.city'] = { $regex: escapeRegex(params.city_contains.trim()), $options: 'i' }
  }
  if (Number.isFinite(params.min_station_count)) filter['metadata.stationCount'] = { $gte: params.min_station_count }
  if (Number.isFinite(params.min_review_count)) filter['metadata.reviewCount'] = { $gte: params.min_review_count }
  if (Number.isFinite(params.min_intent_score)) filter['aiScore.intentScore'] = { $gte: params.min_intent_score }

  return filter
}

/**
 * Translates a plain-English query into validated parameters, builds
 * the real filter by hand, and runs it - returns an empty-filter (i.e.
 * "everything") result rather than throwing if AI parsing isn't
 * configured, so the search bar degrades to "show top leads" instead
 * of hard-failing.
 */
async function searchLeadsNaturalLanguage (userQuery) {
  try {
    const params = await parseSearchQuery(userQuery)
    const filter = buildFilter(params)

    const results = await LilyPadSalesLead.find(filter)
      .sort({ 'aiScore.intentScore': -1, createdAt: -1 })
      .limit(25)
      .lean()

    return { success: true, filterUsed: filter, count: results.length, results }
  } catch (err) {
    return { success: false, error: err.message, results: [] }
  }
}

module.exports = { searchLeadsNaturalLanguage }
